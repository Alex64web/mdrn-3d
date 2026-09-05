"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  createModel3D, 
  submitMakerOffer,
  acceptMakerOffer,
  submitOrderQCCheck, 
  confirmOrderDelivery, 
  updateMakerProfile,
  submitOrderReview
} from '@/app/actions'
import * as Tabs from '@radix-ui/react-tabs'
import { 
  ShoppingCart, 
  Palette, 
  Printer, 
  Plus, 
  Settings, 
  Briefcase, 
  CheckCircle2, 
  Package, 
  Coins, 
  MapPin, 
  Check, 
  AlertCircle,
  Truck,
  Star,
  Layers,
  Clock,
  User,
  Send,
  Sparkles
} from 'lucide-react'

const MOCK_QC_PHOTO = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="

interface UnifiedDashboardProps {
  activeUser: any
  allOrders: any[]
  allModels: any[]
}

export default function UnifiedDashboard({ activeUser, allOrders, allModels }: UnifiedDashboardProps) {
  const router = useRouter()
  
  const defaultTab = activeUser?.role === 'MAKER' ? 'maker' : activeUser?.role === 'DESIGNER' ? 'designer' : 'client'
  const [activeTab, setActiveTab] = useState<string>(defaultTab)

  // 1. Designer State: upload with fixed model price
  const [newModel, setNewModel] = useState({
    title: '',
    description: '',
    filePath: '/sample-models/xyz_calibration_cube.stl',
    price: 300,
    tags: 'Калибровка,Тест',
    sizeX: 20,
    sizeY: 20,
    sizeZ: 20,
    volume: 8.0
  })
  const [modelSubmitting, setModelSubmitting] = useState(false)

  // 2. Maker State: profile
  const [makerForm, setMakerForm] = useState({
    printerName: activeUser?.makerProfile?.printerName || 'Creality Ender 3 V2',
    bedSizeX: activeUser?.makerProfile?.bedSizeX || 220,
    bedSizeY: activeUser?.makerProfile?.bedSizeY || 220,
    bedSizeZ: activeUser?.makerProfile?.bedSizeZ || 250,
    materials: activeUser?.makerProfile?.materials || 'PLA,PETG,ABS',
    colors: activeUser?.makerProfile?.colors || 'Signal Orange,Stealth Black,Pure White',
    location: activeUser?.makerProfile?.location || 'Москва'
  })
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileSavedMsg, setProfileSavedMsg] = useState(false)

  // 3. Maker Bidding States: { [orderId]: { price: number, estimatedDays: number, comment: string } }
  const [bidForms, setBidForms] = useState<Record<string, { price: number; estimatedDays: number; comment: string }>>({})
  const [bidSubmittingId, setBidSubmittingId] = useState<string | null>(null)

  // 4. QC & Review Forms
  const [qcForms, setQcForms] = useState<Record<string, { weight: number; trackingNumber: string; fileBase64: string }>>({})
  const [reviewForms, setReviewForms] = useState<Record<string, { rating: number; comment: string }>>({})
  const [acceptingOfferId, setAcceptingOfferId] = useState<string | null>(null)

  const handleModelFileChange = (path: string) => {
    let sizes = { sizeX: 20, sizeY: 20, sizeZ: 20, volume: 8.0, price: 200 }
    if (path.includes('benchy')) {
      sizes = { sizeX: 60, sizeY: 31, sizeZ: 48, volume: 15.5, price: 350 }
    } else if (path.includes('stand')) {
      sizes = { sizeX: 220, sizeY: 30, sizeZ: 110, volume: 48.0, price: 600 }
    }
    setNewModel(prev => ({
      ...prev,
      filePath: path,
      ...sizes
    }))
  }

  const handleModelSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setModelSubmitting(true)
    try {
      await createModel3D({
        ...newModel,
        designerId: activeUser.id
      })
      alert('Модель с вашей ценой успешно опубликована в каталоге!')
      setNewModel({
        title: '',
        description: '',
        filePath: '/sample-models/xyz_calibration_cube.stl',
        price: 300,
        tags: 'Калибровка,Тест',
        sizeX: 20,
        sizeY: 20,
        sizeZ: 20,
        volume: 8.0
      })
      router.refresh()
    } catch (err: any) {
      alert('Ошибка добавления модели: ' + err.message)
    } finally {
      setModelSubmitting(false)
    }
  }

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setProfileSaving(true)
    setProfileSavedMsg(false)
    try {
      await updateMakerProfile(activeUser.id, makerForm)
      setProfileSavedMsg(true)
      setTimeout(() => setProfileSavedMsg(false), 3000)
      router.refresh()
    } catch (err: any) {
      alert('Ошибка сохранения профиля: ' + err.message)
    } finally {
      setProfileSaving(false)
    }
  }

  // Maker sends a quote/bid
  const handleSendBid = async (e: React.FormEvent, orderId: string) => {
    e.preventDefault()
    const form = bidForms[orderId]
    if (!form || !form.price || form.price <= 0) {
      alert('Пожалуйста, укажите вашу цену за печать детали.')
      return
    }

    setBidSubmittingId(orderId)
    try {
      await submitMakerOffer({
        orderId,
        makerId: activeUser.id,
        price: Number(form.price),
        estimatedDays: Number(form.estimatedDays || 2),
        comment: form.comment || ''
      })
      alert('Ваше предложение успешно отправлено клиенту!')
      router.refresh()
    } catch (err: any) {
      alert('Ошибка отправки предложения: ' + err.message)
    } finally {
      setBidSubmittingId(null)
    }
  }

  // Client accepts winning maker offer
  const handleAcceptOffer = async (offerId: string) => {
    if (!confirm('Принять предложение этого мастера? Средства будут заморожены в Escrow и мастер приступит к печати.')) return
    
    setAcceptingOfferId(offerId)
    try {
      await acceptMakerOffer(offerId, activeUser.id)
      alert('Предложение принято! Оплата депонирована в Escrow, заказ переведен в статус печати.')
      router.refresh()
    } catch (err: any) {
      alert('Не удалось принять предложение: ' + err.message)
    } finally {
      setAcceptingOfferId(null)
    }
  }

  // Maker submits QC check
  const handleQcSubmit = async (e: React.FormEvent, orderId: string) => {
    e.preventDefault()
    const form = qcForms[orderId]
    if (!form || !form.weight || !form.trackingNumber) {
      alert('Пожалуйста, введите вес детали и трек-номер посылки.')
      return
    }
    try {
      await submitOrderQCCheck({
        orderId,
        weight: Number(form.weight),
        trackingNumber: form.trackingNumber,
        qcPhoto: form.fileBase64 || MOCK_QC_PHOTO
      })
      alert('QC-отчет сохранен! Заказ переведен в статус доставки.')
      router.refresh()
    } catch (err: any) {
      alert('Ошибка сдачи QC: ' + err.message)
    }
  }

  // Client confirms delivery
  const handleConfirmDelivery = async (orderId: string) => {
    if (!confirm('Подтверждаете получение детали? Деньги из Escrow будут выплачены мастеру и автору модели.')) return
    try {
      await confirmOrderDelivery(orderId)
      alert('Сделка успешно завершена! Выплаты зачислены мастеру и дизайнеру.')
      router.refresh()
    } catch (err: any) {
      alert('Ошибка завершения: ' + err.message)
    }
  }

  // Client submits review
  const handleReviewSubmit = async (e: React.FormEvent, orderId: string, makerId: string) => {
    e.preventDefault()
    const form = reviewForms[orderId]
    if (!form || !form.rating) {
      alert('Выберите оценку.')
      return
    }
    try {
      await submitOrderReview({
        orderId,
        makerId,
        rating: Number(form.rating),
        comment: form.comment || ''
      })
      alert('Отзыв успешно опубликован!')
      router.refresh()
    } catch (err: any) {
      alert('Ошибка отправки отзыва: ' + err.message)
    }
  }

  // Role data filters
  const clientOrders = allOrders.filter(o => o.clientId === activeUser?.id)
  const makerJobs = allOrders.filter(o => o.makerId === activeUser?.id)
  const openRequests = allOrders.filter(o => o.status === 'REQUEST')

  const designerModels = allModels.filter(m => m.designerId === activeUser?.id)
  const designerModelIds = designerModels.map(m => m.id)
  const designerSales = allOrders.filter(o => designerModelIds.includes(o.modelId) && o.status === 'COMPLETED')
  const totalEarnedRoyalties = designerSales.reduce((sum, o) => sum + o.modelPrice, 0)

  return (
    <div className="flex flex-col gap-8">
      {/* Operator Status Header */}
      <div className="p-6 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-3xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-orange-100 dark:bg-orange-950/80 text-orange-600 dark:text-orange-400 flex items-center justify-center font-bold">
            <User className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-slate-900 dark:text-white">{activeUser?.name}</span>
              <span className="text-xs font-semibold text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/60 px-2 py-0.5 rounded-lg border border-orange-200 dark:border-orange-800">
                {activeUser?.role === 'CLIENT' ? 'Клиент' : activeUser?.role === 'DESIGNER' ? 'Дизайнер' : 'Мастер'}
              </span>
            </div>
            <span className="text-slate-500 text-xs">{activeUser?.email}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 px-5 py-2.5 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800">
          <span className="text-xs text-slate-500 font-medium">Баланс счета:</span>
          <span className="font-extrabold text-lg text-emerald-600 dark:text-emerald-400">
            {Math.round(activeUser?.balance || 0).toLocaleString('ru-RU')} ₽
          </span>
        </div>
      </div>

      {/* Tabs Switcher */}
      <Tabs.Root value={activeTab} onValueChange={setActiveTab} className="flex flex-col gap-6">
        <Tabs.List className="flex bg-slate-100 dark:bg-slate-950 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-md w-full">
          <Tabs.Trigger 
            value="client"
            className={`flex-1 py-2.5 px-3 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition ${
              activeTab === 'client' 
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm font-bold' 
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <ShoppingCart className="w-4 h-4 text-orange-500" /> Клиент
          </Tabs.Trigger>

          <Tabs.Trigger 
            value="designer"
            className={`flex-1 py-2.5 px-3 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition ${
              activeTab === 'designer' 
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm font-bold' 
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Palette className="w-4 h-4 text-purple-500" /> Дизайнер
          </Tabs.Trigger>

          <Tabs.Trigger 
            value="maker"
            className={`flex-1 py-2.5 px-3 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition ${
              activeTab === 'maker' 
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm font-bold' 
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Printer className="w-4 h-4 text-emerald-500" /> Мастер (Maker)
          </Tabs.Trigger>
        </Tabs.List>

        {/* 1. CLIENT TAB */}
        <Tabs.Content value="client" className="flex flex-col gap-6 outline-none">
          <div className="p-6 md:p-8 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-3xl flex flex-col gap-5 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Ваши заявки и заказы
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Здесь отображаются отправленные вами заявки и отклики мастеров с ценами.
                </p>
              </div>
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-850 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800">
                Заказов: {clientOrders.length}
              </span>
            </div>

            {clientOrders.length === 0 ? (
              <div className="text-center py-16 text-slate-500 text-sm border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                У вас пока нет активных заявок. Перейдите в <a href="/catalog" className="text-orange-500 hover:underline font-semibold">Каталог моделей</a> для выбора детали.
              </div>
            ) : (
              <div className="flex flex-col gap-5">
                {clientOrders.map((order) => {
                  const isRequest = order.status === 'REQUEST'
                  const offersCount = order.offers?.length || 0

                  return (
                    <div 
                      key={order.id} 
                      className="p-6 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col gap-4"
                    >
                      {/* Top bar */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-850 pb-3">
                        <div className="flex flex-col">
                          <span className="font-bold text-base text-slate-900 dark:text-white">
                            {order.model.title}
                          </span>
                          <span className="text-xs text-slate-500">
                            Материал: {order.material} ({order.color}) • Заполнение: {order.infill}% • Точность: {order.layerHeight}мм
                          </span>
                        </div>

                        {/* Status Badge */}
                        <div>
                          {isRequest && (
                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border border-amber-200 dark:border-amber-800 inline-flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
                              Ожидает предложений ({offersCount})
                            </span>
                          )}
                          {order.status === 'PRINTING' && (
                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-950/70 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                              В печати у мастера
                            </span>
                          )}
                          {order.status === 'SHIPPED' && (
                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-800 dark:bg-orange-950/70 dark:text-orange-300 border border-orange-200 dark:border-orange-800">
                              Посылка в пути
                            </span>
                          )}
                          {order.status === 'COMPLETED' && (
                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                              Сделка завершена
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Details & Offers */}
                      {isRequest && (
                        <div className="flex flex-col gap-3">
                          <div className="flex items-center justify-between text-xs text-slate-500">
                            <span>Авторская цена модели: <strong className="text-slate-800 dark:text-slate-200">{order.modelPrice} ₽</strong></span>
                            <span>Адрес: {order.deliveryAddress}</span>
                          </div>

                          {offersCount === 0 ? (
                            <p className="text-xs text-slate-500 italic py-2">
                              Пока мастера не прислали предложений. Мастера уведомлены о вашей заявке.
                            </p>
                          ) : (
                            <div className="flex flex-col gap-2.5 mt-1">
                              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                Доступные предложения от мастеров (выберите лучшее):
                              </span>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {order.offers.map((offer: any) => {
                                  const subtotal = order.modelPrice + offer.price
                                  const platformFee = Math.round(subtotal * 0.05)
                                  const grandTotal = subtotal + platformFee

                                  return (
                                    <div 
                                      key={offer.id} 
                                      className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between gap-3 shadow-sm hover:border-orange-400 transition"
                                    >
                                      <div className="flex flex-col gap-1">
                                        <div className="flex justify-between items-start">
                                          <div>
                                            <span className="font-bold text-sm text-slate-900 dark:text-white">
                                              {offer.maker.name}
                                            </span>
                                            <span className="text-xs text-amber-500 font-semibold block">
                                              ★ {offer.maker.makerProfile?.rating || 5.0} • {offer.maker.makerProfile?.location || 'Локальный мастер'}
                                            </span>
                                          </div>
                                          <div className="text-right">
                                            <span className="text-base font-extrabold text-orange-500">
                                              {offer.price} ₽
                                            </span>
                                            <span className="text-[10px] text-slate-400 block">за печать</span>
                                          </div>
                                        </div>

                                        {offer.comment && (
                                          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 bg-slate-50 dark:bg-slate-950 p-2 rounded-lg border border-slate-100 dark:border-slate-850">
                                            «{offer.comment}»
                                          </p>
                                        )}

                                        <div className="text-[11px] text-slate-500 mt-1 flex justify-between border-t border-slate-100 dark:border-slate-800 pt-1.5">
                                          <span>Срок: {offer.estimatedDays} дн.</span>
                                          <span>Итого к оплате с Escrow: <strong className="text-slate-800 dark:text-slate-200">{grandTotal} ₽</strong></span>
                                        </div>
                                      </div>

                                      <button
                                        type="button"
                                        disabled={acceptingOfferId === offer.id}
                                        onClick={() => handleAcceptOffer(offer.id)}
                                        className="w-full py-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold text-xs rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm"
                                      >
                                        <Check className="w-3.5 h-3.5" />
                                        <span>{acceptingOfferId === offer.id ? 'Обработка...' : `Принять за ${grandTotal} ₽`}</span>
                                      </button>
                                    </div>
                                  )
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* In Progress */}
                      {order.status === 'PRINTING' && (
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-2 text-xs">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-slate-600 dark:text-slate-300">
                              Исполнитель: <strong>{order.maker?.name}</strong> ({order.maker?.makerProfile?.printerName})
                            </span>
                            <span className="text-slate-500">Сумма в Escrow: {order.totalPrice} ₽</span>
                          </div>
                          <span className="text-blue-500 font-medium animate-pulse">Мастер выполняет печать изделия...</span>
                        </div>
                      )}

                      {/* Shipped - Client can confirm */}
                      {order.status === 'SHIPPED' && (
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-2 border-t border-slate-200 dark:border-slate-850">
                          <div className="flex flex-col gap-0.5 text-xs">
                            <span className="text-slate-600 dark:text-slate-300">
                              Трек-номер: <strong className="text-slate-900 dark:text-white">{order.trackingNumber}</strong>
                            </span>
                            <span className="text-slate-500">Фактический вес: {order.weight} г</span>
                          </div>

                          <button
                            onClick={() => handleConfirmDelivery(order.id)}
                            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl transition shadow-sm"
                          >
                            Подтвердить получение и закрыть сделку
                          </button>
                        </div>
                      )}

                      {/* Completed */}
                      {order.status === 'COMPLETED' && (
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-2 border-t border-slate-200 dark:border-slate-850 text-xs">
                          <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4" /> Заказ успешно выполнен и доставлен!
                          </span>

                          {!order.review && (
                            <form 
                              onSubmit={(e) => handleReviewSubmit(e, order.id, order.makerId)}
                              className="flex items-center gap-2"
                            >
                              <select
                                required
                                onChange={(e) => setReviewForms(prev => ({
                                  ...prev,
                                  [order.id]: { rating: Number(e.target.value), comment: prev[order.id]?.comment || '' }
                                }))}
                                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs p-1.5"
                              >
                                <option value="">Оценка</option>
                                <option value="5">5 ★ (Отлично)</option>
                                <option value="4">4 ★ (Хорошо)</option>
                                <option value="3">3 ★ (Нормально)</option>
                              </select>
                              <input
                                type="text"
                                placeholder="Отзыв..."
                                onChange={(e) => setReviewForms(prev => ({
                                  ...prev,
                                  [order.id]: { rating: prev[order.id]?.rating || 5, comment: e.target.value }
                                }))}
                                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs px-2 py-1.5 w-28"
                              />
                              <button
                                type="submit"
                                className="px-3 py-1.5 bg-orange-500 text-white font-bold rounded-lg"
                              >
                                Ок
                              </button>
                            </form>
                          )}

                          {order.review && (
                            <span className="text-slate-500 font-medium">
                              Ваш отзыв: {order.review.rating}★ ({order.review.comment})
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </Tabs.Content>

        {/* 2. DESIGNER TAB */}
        <Tabs.Content value="designer" className="flex flex-col gap-6 outline-none">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Sales Stats */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              <div className="p-6 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-3xl flex flex-col gap-4 shadow-sm">
                <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <Coins className="w-4 h-4 text-purple-500" /> Доходы автора
                </h3>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col">
                    <span className="text-[11px] text-slate-500">Загружено моделей</span>
                    <span className="text-xl font-bold text-slate-900 dark:text-white mt-1">{designerModels.length}</span>
                  </div>
                  <div className="p-3.5 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col">
                    <span className="text-[11px] text-slate-500">Физических продаж</span>
                    <span className="text-xl font-bold text-slate-900 dark:text-white mt-1">{designerSales.length}</span>
                  </div>
                </div>

                <div className="p-4 bg-purple-50 dark:bg-purple-950/40 rounded-2xl border border-purple-200 dark:border-purple-900/40 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-purple-700 dark:text-purple-300 block">Заработано на моделях:</span>
                    <span className="text-[11px] text-slate-500">Фиксированные выплаты</span>
                  </div>
                  <span className="text-2xl font-black text-purple-600 dark:text-purple-400">{Math.round(totalEarnedRoyalties)} ₽</span>
                </div>
              </div>

              {/* Models List */}
              <div className="p-6 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-3xl flex flex-col gap-3 shadow-sm">
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Ваши модели и цены
                </h4>
                {designerModels.length === 0 ? (
                  <p className="text-xs text-slate-500 py-6 text-center italic">Вы еще не загрузили ни одной модели.</p>
                ) : (
                  <div className="flex flex-col gap-2 max-h-64 overflow-y-auto pr-1">
                    {designerModels.map(m => (
                      <div key={m.id} className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 flex justify-between items-center text-xs">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-800 dark:text-slate-200 truncate max-w-[150px]">{m.title}</span>
                          <span className="text-[11px] text-slate-500">{m.volume} см³</span>
                        </div>
                        <span className="font-bold text-orange-500 text-sm">
                          {m.price} ₽
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Model Upload Form */}
            <div className="lg:col-span-8 p-6 md:p-8 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-3xl flex flex-col gap-5 shadow-sm">
              <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Plus className="w-5 h-5 text-orange-500" /> Добавить новую 3D-модель
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Укажите характеристики и установите желаемую стоимость своей CAD-модели.
                </p>
              </div>

              <form onSubmit={handleModelSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Название 3D-модели</label>
                  <input
                    type="text"
                    required
                    value={newModel.title}
                    onChange={(e) => setNewModel(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Например: Эргономичная ручка для инструмента"
                    className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Описание детали</label>
                  <textarea
                    required
                    rows={3}
                    value={newModel.description}
                    onChange={(e) => setNewModel(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Расскажите о назначении детали и особенностях печати"
                    className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-orange-500 resize-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Файл STL</label>
                  <select
                    value={newModel.filePath}
                    onChange={(e) => handleModelFileChange(e.target.value)}
                    className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-orange-500 cursor-pointer"
                  >
                    <option value="/sample-models/xyz_calibration_cube.stl">xyz_calibration_cube.stl (Кубик 20мм)</option>
                    <option value="/sample-models/3dbenchy.stl">3dbenchy.stl (Лодочка 3DBenchy)</option>
                    <option value="/sample-models/laptop_stand.stl">laptop_stand.stl (Подставка ноутбука)</option>
                  </select>
                </div>

                {/* Fixed Designer Price Input */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Ваша цена за модель (₽)
                  </label>
                  <input
                    type="number"
                    min="50"
                    step="50"
                    required
                    value={newModel.price}
                    onChange={(e) => setNewModel(prev => ({ ...prev, price: Number(e.target.value) }))}
                    className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-slate-900 dark:text-slate-100 font-bold text-orange-500 focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Теги (через запятую)</label>
                  <input
                    type="text"
                    required
                    value={newModel.tags}
                    onChange={(e) => setNewModel(prev => ({ ...prev, tags: e.target.value }))}
                    placeholder="Офис,Гаджеты,Утилиты"
                    className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div className="md:col-span-2 mt-2">
                  <button
                    type="submit"
                    disabled={modelSubmitting}
                    className="w-full py-3.5 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-xl transition shadow-sm cursor-pointer"
                  >
                    {modelSubmitting ? 'Публикация...' : 'Опубликовать модель с моей ценой'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </Tabs.Content>

        {/* 3. MAKER TAB (MAKER HUB) */}
        <Tabs.Content value="maker" className="flex flex-col gap-6 outline-none">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Equipment Profile */}
            <div className="lg:col-span-4 p-6 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-3xl flex flex-col gap-4 shadow-sm text-xs">
              <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <Settings className="w-4 h-4 text-orange-500" /> Профиль оборудования
                </h3>
              </div>

              <form onSubmit={handleProfileSubmit} className="flex flex-col gap-3.5">
                <div className="flex flex-col gap-1">
                  <label className="text-slate-500">Модель принтера</label>
                  <input
                    type="text"
                    required
                    value={makerForm.printerName}
                    onChange={(e) => setMakerForm(prev => ({ ...prev, printerName: e.target.value }))}
                    className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-slate-500">Размер стола X × Y × Z (мм)</label>
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="number"
                      required
                      value={makerForm.bedSizeX}
                      onChange={(e) => setMakerForm(prev => ({ ...prev, bedSizeX: Number(e.target.value) }))}
                      className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2 text-center"
                      placeholder="X"
                    />
                    <input
                      type="number"
                      required
                      value={makerForm.bedSizeY}
                      onChange={(e) => setMakerForm(prev => ({ ...prev, bedSizeY: Number(e.target.value) }))}
                      className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2 text-center"
                      placeholder="Y"
                    />
                    <input
                      type="number"
                      required
                      value={makerForm.bedSizeZ}
                      onChange={(e) => setMakerForm(prev => ({ ...prev, bedSizeZ: Number(e.target.value) }))}
                      className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2 text-center"
                      placeholder="Z"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-slate-500">Пластик в наличии</label>
                  <input
                    type="text"
                    required
                    value={makerForm.materials}
                    onChange={(e) => setMakerForm(prev => ({ ...prev, materials: e.target.value }))}
                    className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-slate-500">Цвета в наличии</label>
                  <input
                    type="text"
                    required
                    value={makerForm.colors}
                    onChange={(e) => setMakerForm(prev => ({ ...prev, colors: e.target.value }))}
                    className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-slate-500">Город / Локация</label>
                  <input
                    type="text"
                    required
                    value={makerForm.location}
                    onChange={(e) => setMakerForm(prev => ({ ...prev, location: e.target.value }))}
                    className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100"
                  />
                </div>

                {profileSavedMsg && (
                  <div className="p-2 bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-lg text-center text-xs">
                    Профиль сохранен!
                  </div>
                )}

                <button
                  type="submit"
                  disabled={profileSaving}
                  className="w-full py-2.5 bg-slate-900 hover:bg-orange-500 text-white font-semibold rounded-xl transition"
                >
                  {profileSaving ? 'Сохранение...' : 'Обновить профиль'}
                </button>
              </form>
            </div>

            {/* Bidding Requests Feed & Active Jobs */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              {/* 1. Open Client Requests (Аукцион заявок) */}
              <div className="p-6 md:p-7 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-3xl flex flex-col gap-4 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                  <div>
                    <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-orange-500" /> Открытые заявки клиентов ({openRequests.length})
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Клиенты ищут исполнителей. Предложите свою цену за печать, чтобы получить заказ.
                    </p>
                  </div>
                </div>

                {openRequests.length === 0 ? (
                  <p className="text-xs text-slate-500 py-8 text-center italic">
                    Сейчас нет новых открытых заявок на печать.
                  </p>
                ) : (
                  <div className="flex flex-col gap-4">
                    {openRequests.map((req) => {
                      const myOffer = req.offers?.find((o: any) => o.makerId === activeUser.id)
                      const form = bidForms[req.id] || { price: myOffer?.price || '', estimatedDays: myOffer?.estimatedDays || 2, comment: myOffer?.comment || '' }

                      return (
                        <div key={req.id} className="p-5 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col gap-3">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                            <span className="font-bold text-sm text-slate-900 dark:text-white">
                              {req.model.title}
                            </span>
                            <span className="text-xs text-slate-500">
                              Авторская цена модели: <strong>{req.modelPrice} ₽</strong>
                            </span>
                          </div>

                          <div className="text-xs text-slate-600 dark:text-slate-400 grid grid-cols-2 sm:grid-cols-4 gap-2 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                            <div>Пластик: <strong>{req.material} ({req.color})</strong></div>
                            <div>Заполнение: <strong>{req.infill}%</strong></div>
                            <div>Слой: <strong>{req.layerHeight}мм</strong></div>
                            <div>Доставка: <strong className="truncate block">{req.deliveryAddress}</strong></div>
                          </div>

                          {/* Bid submission form */}
                          <form 
                            onSubmit={(e) => handleSendBid(e, req.id)}
                            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-2"
                          >
                            <div className="flex items-center gap-2 flex-1">
                              <input
                                type="number"
                                required
                                placeholder="Ваша цена (₽)"
                                value={form.price}
                                onChange={(e) => setBidForms(prev => ({
                                  ...prev,
                                  [req.id]: { ...form, price: Number(e.target.value) }
                                }))}
                                className="w-32 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-orange-500 focus:outline-none"
                              />

                              <input
                                type="number"
                                min="1"
                                placeholder="Срок (дни)"
                                value={form.estimatedDays}
                                onChange={(e) => setBidForms(prev => ({
                                  ...prev,
                                  [req.id]: { ...form, estimatedDays: Number(e.target.value) }
                                }))}
                                className="w-24 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-center focus:outline-none"
                              />

                              <input
                                type="text"
                                placeholder="Комментарий (принтер, сопло...)"
                                value={form.comment}
                                onChange={(e) => setBidForms(prev => ({
                                  ...prev,
                                  [req.id]: { ...form, comment: e.target.value }
                                }))}
                                className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs focus:outline-none"
                              />
                            </div>

                            <button
                              type="submit"
                              disabled={bidSubmittingId === req.id}
                              className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm"
                            >
                              <Send className="w-3.5 h-3.5" />
                              <span>{myOffer ? 'Обновить цену' : 'Предложить цену'}</span>
                            </button>
                          </form>

                          {myOffer && (
                            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                              ✓ Вы уже предложили {myOffer.price} ₽ ({myOffer.estimatedDays} дн.). Клиент рассматривает предложение.
                            </span>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* 2. Maker's Active Jobs */}
              <div className="p-6 md:p-7 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-3xl flex flex-col gap-4 shadow-sm">
                <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
                  <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-emerald-500" /> Заказы в работе ({makerJobs.length})
                  </h3>
                </div>

                {makerJobs.length === 0 ? (
                  <p className="text-xs text-slate-500 py-6 text-center italic">
                    У вас пока нет заказов в работе. Отправляйте предложения в ленте заявок выше.
                  </p>
                ) : (
                  <div className="flex flex-col gap-4">
                    {makerJobs.map((job) => (
                      <div key={job.id} className="p-5 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col gap-4">
                        <div className="flex justify-between items-start border-b border-slate-200 dark:border-slate-850 pb-2">
                          <div className="flex flex-col">
                            <span className="font-bold text-sm text-slate-900 dark:text-white">{job.model.title}</span>
                            <span className="text-xs text-slate-500">Ваша согласованная цена: <strong className="text-emerald-500">{job.makerPrice} ₽</strong></span>
                          </div>

                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            job.status === 'PRINTING' ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/70 dark:text-blue-300' :
                            job.status === 'SHIPPED' ? 'bg-orange-100 text-orange-800 dark:bg-orange-950/70 dark:text-orange-300' :
                            'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300'
                          }`}>
                            {job.status === 'PRINTING' ? 'Печатается' : job.status === 'SHIPPED' ? 'Отправлен' : 'Завершен'}
                          </span>
                        </div>

                        {/* QC Check Form when PRINTING */}
                        {job.status === 'PRINTING' && (
                          <form 
                            onSubmit={(e) => handleQcSubmit(e, job.id)}
                            className="flex flex-col gap-3 text-xs"
                          >
                            <span className="font-bold text-slate-700 dark:text-slate-300">
                              Контроль качества (QC) и сдача заказа:
                            </span>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div className="flex flex-col gap-1">
                                <label className="text-slate-500">Фактический вес (г)</label>
                                <input
                                  type="number"
                                  step="0.1"
                                  required
                                  placeholder="Например: 16.5"
                                  onChange={(e) => setQcForms(prev => ({
                                    ...prev,
                                    [job.id]: { 
                                      weight: Number(e.target.value), 
                                      trackingNumber: prev[job.id]?.trackingNumber || '',
                                      fileBase64: prev[job.id]?.fileBase64 || ''
                                    }
                                  }))}
                                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                                />
                              </div>

                              <div className="flex flex-col gap-1">
                                <label className="text-slate-500">Почтовый трек-номер</label>
                                <input
                                  type="text"
                                  required
                                  placeholder="Например: RU781290314CN"
                                  onChange={(e) => setQcForms(prev => ({
                                    ...prev,
                                    [job.id]: { 
                                      weight: prev[job.id]?.weight || 0, 
                                      trackingNumber: e.target.value,
                                      fileBase64: prev[job.id]?.fileBase64 || ''
                                    }
                                  }))}
                                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                                />
                              </div>
                            </div>

                            <button
                              type="submit"
                              className="mt-1 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-xl transition shadow-sm cursor-pointer"
                            >
                              Отправить заказ клиенту
                            </button>
                          </form>
                        )}

                        {job.status === 'SHIPPED' && (
                          <div className="text-xs text-slate-500 flex items-center gap-2">
                            <Truck className="w-4 h-4 text-orange-500" />
                            <span>Посылка отправлена (Трек: {job.trackingNumber}). Ожидание подтверждения от клиента.</span>
                          </div>
                        )}

                        {job.status === 'COMPLETED' && (
                          <div className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-2 font-medium">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Заказ выполнен! Оплата ({job.makerPrice} ₽) перечислена на ваш баланс.</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </Tabs.Content>
      </Tabs.Root>
    </div>
  )
}
