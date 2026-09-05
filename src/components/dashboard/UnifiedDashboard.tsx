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

function OrderPipelineStepper({ status, escrowStatus }: { status: string; escrowStatus: string }) {
  const getStepIndex = () => {
    if (status === 'COMPLETED') return 6
    if (status === 'SHIPPED') return 5
    if (status === 'PRINTING') return 3
    if (escrowStatus === 'HELD') return 2
    if (status === 'REQUEST') return 1
    return 0
  }

  const currentStep = getStepIndex()
  const steps = [
    { label: 'Заявка', code: '01' },
    { label: 'Аукцион', code: '02' },
    { label: 'Escrow', code: '03' },
    { label: 'Печать', code: '04' },
    { label: 'QC', code: '05' },
    { label: 'Доставка', code: '06' },
    { label: 'Готово', code: '07' },
  ]

  return (
    <div className="w-full py-2 px-3 bg-slate-100/60 dark:bg-[#07090e] rounded-xl border border-slate-200/60 dark:border-white/[0.04] overflow-x-auto">
      <div className="flex items-center justify-between min-w-[500px] gap-1">
        {steps.map((s, idx) => {
          const isPassed = idx < currentStep
          const isCurrent = idx === currentStep
          return (
            <div key={s.code} className="flex items-center gap-1.5 shrink-0">
              <div className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono transition ${
                isPassed 
                  ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30' 
                  : isCurrent 
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-glow-emerald' 
                  : 'text-slate-400 dark:text-slate-600'
              }`}>
                <span>{s.code}.</span>
                <span>{s.label}</span>
              </div>
              {idx < steps.length - 1 && (
                <div className={`w-3 h-px ${isPassed ? 'bg-emerald-500/50' : 'bg-slate-300 dark:bg-slate-800'}`} />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
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
      <div className="p-6 md:p-8 glass-panel hud-grid rounded-3xl border border-slate-200/80 dark:border-white/[0.08] flex flex-col md:flex-row justify-between items-start md:items-center gap-5 shadow-hud-card transition-colors relative overflow-hidden">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-slate-950 flex items-center justify-center font-bold shadow-glow-emerald">
            <User className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-slate-900 dark:text-white tracking-tight">{activeUser?.name}</span>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400">
                {activeUser?.role === 'CLIENT' ? 'Заказчик' : activeUser?.role === 'DESIGNER' ? '3D-Дизайнер' : 'Мастер печати'}
              </span>
            </div>
            <span className="text-slate-500 font-mono text-xs">{activeUser?.email}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 px-5 py-3 glass-panel rounded-2xl border border-slate-200 dark:border-white/[0.08] shadow-sm">
          <div className="flex flex-col">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Депозит кошелька</span>
            <span className="font-extrabold font-mono text-xl text-emerald-600 dark:text-emerald-400">
              {Math.round(activeUser?.balance || 0).toLocaleString('ru-RU')} ₽
            </span>
          </div>
        </div>
      </div>

      {/* Tabs Switcher */}
      <Tabs.Root value={activeTab} onValueChange={setActiveTab} className="flex flex-col gap-6">
        <Tabs.List className="flex glass-panel p-1.5 rounded-2xl border border-slate-200 dark:border-white/[0.08] max-w-md w-full shadow-sm">
          <Tabs.Trigger 
            value="client"
            className={`flex-1 py-2.5 px-3 text-xs font-mono font-semibold rounded-xl flex items-center justify-center gap-2 transition ${
              activeTab === 'client' 
                ? 'bg-emerald-500 text-slate-950 shadow-glow-emerald font-bold' 
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <ShoppingCart className="w-3.5 h-3.5" /> 
            <span>Клиент</span>
            {clientOrders.length > 0 && (
              <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-full bg-black/10 dark:bg-white/20">
                {clientOrders.length}
              </span>
            )}
          </Tabs.Trigger>

          <Tabs.Trigger 
            value="designer"
            className={`flex-1 py-2.5 px-3 text-xs font-mono font-semibold rounded-xl flex items-center justify-center gap-2 transition ${
              activeTab === 'designer' 
                ? 'bg-emerald-500 text-slate-950 shadow-glow-emerald font-bold' 
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Palette className="w-3.5 h-3.5" /> 
            <span>Дизайнер</span>
          </Tabs.Trigger>

          <Tabs.Trigger 
            value="maker"
            className={`flex-1 py-2.5 px-3 text-xs font-mono font-semibold rounded-xl flex items-center justify-center gap-2 transition ${
              activeTab === 'maker' 
                ? 'bg-emerald-500 text-slate-950 shadow-glow-emerald font-bold' 
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Printer className="w-3.5 h-3.5" /> 
            <span>Мастер</span>
            {openRequests.length > 0 && (
              <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-full bg-black/10 dark:bg-white/20">
                {openRequests.length}
              </span>
            )}
          </Tabs.Trigger>
        </Tabs.List>

        {/* 1. CLIENT TAB */}
        <Tabs.Content value="client" className="flex flex-col gap-6 outline-none">
          <div className="p-6 md:p-8 glass-panel rounded-3xl border border-slate-200/80 dark:border-white/[0.08] flex flex-col gap-6 shadow-hud-card">
            <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-white/[0.08] pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                  <span>Мои заявки и заказы</span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    LIVE
                  </span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Мониторинг прогресса изготовления, Escrow-депозита и откликов распределенной сети мейкеров.
                </p>
              </div>
              <span className="text-xs font-mono font-semibold text-slate-600 dark:text-slate-300 glass-panel px-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/[0.08]">
                АКТИВНЫХ: {clientOrders.length}
              </span>
            </div>

            {clientOrders.length === 0 ? (
              <div className="text-center py-16 text-slate-500 text-sm border border-dashed border-slate-200 dark:border-white/[0.08] rounded-2xl">
                У вас пока нет активных заявок. Перейдите в <a href="/catalog" className="text-emerald-500 hover:underline font-semibold font-mono">Каталог моделей</a> для выбора детали.
              </div>
            ) : (
              <div className="flex flex-col gap-5">
                {clientOrders.map((order) => {
                  const isRequest = order.status === 'REQUEST'
                  const offersCount = order.offers?.length || 0

                  return (
                    <div 
                      key={order.id} 
                      className="p-6 glass-panel rounded-2xl border border-slate-200/80 dark:border-white/[0.08] flex flex-col gap-5 hover:border-emerald-500/30 transition shadow-sm"
                    >
                      {/* Top bar */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 dark:border-white/[0.06] pb-3">
                        <div className="flex flex-col gap-1">
                          <span className="font-bold text-base text-slate-900 dark:text-white tracking-tight">
                            {order.model.title}
                          </span>
                          <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-slate-500">
                            <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.06]">
                              {order.material} • {order.color}
                            </span>
                            <span>Заполнение: <strong className="text-slate-700 dark:text-slate-300">{order.infill}%</strong></span>
                            <span>•</span>
                            <span>Слой: <strong className="text-slate-700 dark:text-slate-300">{order.layerHeight}мм</strong></span>
                          </div>
                        </div>

                        {/* Status Badge */}
                        <div className="shrink-0">
                          {isRequest && (
                            <span className="px-3 py-1 rounded-full text-xs font-mono font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 inline-flex items-center gap-1.5 shadow-glow-orange">
                              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
                              АУКЦИОН ({offersCount} предл.)
                            </span>
                          )}
                          {order.status === 'PRINTING' && (
                            <span className="px-3 py-1 rounded-full text-xs font-mono font-semibold bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30 inline-flex items-center gap-1.5 shadow-glow-cyan">
                              <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></span>
                              В ПЕЧАТИ
                            </span>
                          )}
                          {order.status === 'SHIPPED' && (
                            <span className="px-3 py-1 rounded-full text-xs font-mono font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/30 inline-flex items-center gap-1.5">
                              ДОСТАВКА В ПУТИ
                            </span>
                          )}
                          {order.status === 'COMPLETED' && (
                            <span className="px-3 py-1 rounded-full text-xs font-mono font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 inline-flex items-center gap-1.5 shadow-glow-emerald">
                              ЗАВЕРШЕНО
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Interactive Stepper */}
                      <OrderPipelineStepper status={order.status} escrowStatus={order.escrowStatus} />

                      {/* Details & Offers */}
                      {isRequest && (
                        <div className="flex flex-col gap-4">
                          <div className="flex flex-wrap items-center justify-between text-xs font-mono text-slate-500 glass-panel p-3 rounded-xl border border-slate-200/60 dark:border-white/[0.04]">
                            <span>АВТОРСКИЙ РОЯЛТИ: <strong className="text-emerald-600 dark:text-emerald-400">{order.modelPrice} ₽</strong></span>
                            <span>АДРЕС ДОСТАВКИ: <strong className="text-slate-800 dark:text-slate-200">{order.deliveryAddress}</strong></span>
                          </div>

                          {offersCount === 0 ? (
                            <div className="p-4 text-xs font-mono text-slate-500 italic text-center glass-panel rounded-xl border border-dashed border-slate-200 dark:border-white/[0.06]">
                              [ОЖИДАНИЕ СТАВОК] Мастера сети уведомлены о вашей заявке и рассчитывают стоимость на своих станках...
                            </div>
                          ) : (
                            <div className="flex flex-col gap-3 mt-1">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                                  ДОСТУПНЫЕ ПРЕДЛОЖЕНИЯ ИСПОЛНИТЕЛЕЙ:
                                </span>
                                <span className="text-[11px] font-mono text-emerald-500">
                                  ESCROW GUARANTEE
                                </span>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                                {order.offers.map((offer: any) => {
                                  const subtotal = order.modelPrice + offer.price
                                  const platformFee = Math.round(subtotal * 0.05)
                                  const grandTotal = subtotal + platformFee

                                  return (
                                    <div 
                                      key={offer.id} 
                                      className="p-4 glass-panel rounded-xl border border-slate-200/80 dark:border-white/[0.08] flex flex-col justify-between gap-3.5 hover:border-emerald-500/50 hover:shadow-glow-emerald transition-all duration-200"
                                    >
                                      <div className="flex flex-col gap-2">
                                        <div className="flex justify-between items-start">
                                          <div>
                                            <span className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                                              {offer.maker.name}
                                            </span>
                                            <span className="text-xs text-amber-500 font-mono font-semibold flex items-center gap-1 mt-0.5">
                                              ★ {offer.maker.makerProfile?.rating || 5.0} • {offer.maker.makerProfile?.location || 'Локальный мастер'}
                                            </span>
                                          </div>
                                          <div className="text-right">
                                            <span className="text-base font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
                                              {offer.price} ₽
                                            </span>
                                            <span className="text-[10px] font-mono text-slate-400 block">за печать</span>
                                          </div>
                                        </div>

                                        {offer.comment && (
                                          <p className="text-xs text-slate-600 dark:text-slate-400 bg-slate-100/70 dark:bg-[#07090e] p-2.5 rounded-lg border border-slate-200/60 dark:border-white/[0.04] font-mono">
                                            «{offer.comment}»
                                          </p>
                                        )}

                                        <div className="text-[11px] font-mono text-slate-500 flex justify-between border-t border-slate-200/60 dark:border-white/[0.06] pt-2">
                                          <span>Срок: <strong className="text-slate-700 dark:text-slate-300">{offer.estimatedDays} дн.</strong></span>
                                          <span>Итого с Escrow: <strong className="text-emerald-600 dark:text-emerald-400 font-bold">{grandTotal} ₽</strong></span>
                                        </div>
                                      </div>

                                      <button
                                        type="button"
                                        disabled={acceptingOfferId === offer.id}
                                        onClick={() => handleAcceptOffer(offer.id)}
                                        className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono font-bold text-xs rounded-xl shadow-glow-emerald transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                                      >
                                        <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                                        <span>{acceptingOfferId === offer.id ? 'ДЕПОНИРОВАНИЕ...' : `ПРИНЯТЬ // ${grandTotal} ₽`}</span>
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
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-2 text-xs font-mono glass-panel p-3.5 rounded-xl border border-slate-200/60 dark:border-white/[0.04]">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-slate-600 dark:text-slate-300">
                              Исполнитель: <strong>{order.maker?.name}</strong> ({order.maker?.makerProfile?.printerName})
                            </span>
                            <span className="text-slate-500">Заморожено в Escrow: <strong className="text-emerald-500">{order.totalPrice} ₽</strong></span>
                          </div>
                          <span className="text-cyan-400 font-medium animate-pulse flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
                            Мастер выполняет калибровку и печать...
                          </span>
                        </div>
                      )}

                      {/* Shipped - Client can confirm */}
                      {order.status === 'SHIPPED' && (
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-3 border-t border-slate-200/80 dark:border-white/[0.06]">
                          <div className="flex flex-col gap-0.5 text-xs font-mono">
                            <span className="text-slate-600 dark:text-slate-300">
                              Трек-номер посылки: <strong className="text-emerald-600 dark:text-emerald-400">{order.trackingNumber}</strong>
                            </span>
                            <span className="text-slate-500">Фактический вес изделия: {order.weight} г</span>
                          </div>

                          <button
                            onClick={() => handleConfirmDelivery(order.id)}
                            className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono font-bold text-xs rounded-xl shadow-glow-emerald transition cursor-pointer"
                          >
                            Подтвердить получение и закрыть сделку
                          </button>
                        </div>
                      )}

                      {/* Completed */}
                      {order.status === 'COMPLETED' && (
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-3 border-t border-slate-200/80 dark:border-white/[0.06] text-xs font-mono">
                          <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4" /> Заказ успешно доставлен. Сделка закрыта.
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
                                className="glass-panel border border-slate-200 dark:border-white/[0.08] rounded-lg text-xs p-1.5 text-slate-900 dark:text-white"
                              >
                                <option value="">Оценка</option>
                                <option value="5">5 ★ (Отлично)</option>
                                <option value="4">4 ★ (Хорошо)</option>
                                <option value="3">3 ★ (Нормально)</option>
                              </select>
                              <input
                                type="text"
                                placeholder="Отзыв мастеру..."
                                onChange={(e) => setReviewForms(prev => ({
                                  ...prev,
                                  [order.id]: { rating: prev[order.id]?.rating || 5, comment: e.target.value }
                                }))}
                                className="glass-panel border border-slate-200 dark:border-white/[0.08] rounded-lg text-xs px-2.5 py-1.5 w-32 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500/50"
                              />
                              <button
                                type="submit"
                                className="px-3.5 py-1.5 bg-emerald-500 text-slate-950 font-bold rounded-lg hover:bg-emerald-400 transition cursor-pointer"
                              >
                                Ок
                              </button>
                            </form>
                          )}

                          {order.review && (
                            <span className="text-slate-400 font-mono">
                              Отзыв: <strong className="text-amber-400">{order.review.rating}★</strong> ({order.review.comment})
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
              <div className="p-6 glass-panel rounded-3xl border border-slate-200/80 dark:border-white/[0.08] flex flex-col gap-4 shadow-hud-card">
                <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-white/[0.06] pb-3">
                  <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                    <Coins className="w-4 h-4 text-cyan-400" /> 
                    <span>Роялти автора</span>
                  </h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    ROYALTIES
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 font-mono">
                  <div className="p-3.5 glass-panel rounded-2xl border border-slate-200/60 dark:border-white/[0.04] flex flex-col">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider">Моделей в реестре</span>
                    <span className="text-xl font-bold text-slate-900 dark:text-white mt-1">{designerModels.length}</span>
                  </div>
                  <div className="p-3.5 glass-panel rounded-2xl border border-slate-200/60 dark:border-white/[0.04] flex flex-col">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider">Печатей детали</span>
                    <span className="text-xl font-bold text-slate-900 dark:text-white mt-1">{designerSales.length}</span>
                  </div>
                </div>

                <div className="p-4 bg-cyan-500/10 dark:bg-cyan-950/30 rounded-2xl border border-cyan-500/30 flex items-center justify-between shadow-glow-cyan">
                  <div>
                    <span className="text-xs font-mono font-bold text-cyan-600 dark:text-cyan-400 block">НАЧИСЛЕНО РОЯЛТИ:</span>
                    <span className="text-[10px] font-mono text-slate-400">Прямые выплаты за тираж</span>
                  </div>
                  <span className="text-2xl font-black font-mono text-cyan-500 dark:text-cyan-400">{Math.round(totalEarnedRoyalties)} ₽</span>
                </div>
              </div>

              {/* Models List */}
              <div className="p-6 glass-panel rounded-3xl border border-slate-200/80 dark:border-white/[0.08] flex flex-col gap-3.5 shadow-hud-card">
                <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-white/[0.06] pb-3">
                  <h4 className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    // МОИ МОДЕЛИ И СТАВКИ
                  </h4>
                  <span className="text-[10px] font-mono text-slate-400">{designerModels.length} STL</span>
                </div>
                {designerModels.length === 0 ? (
                  <p className="text-xs font-mono text-slate-500 py-6 text-center italic">Вы еще не опубликовали ни одной модели.</p>
                ) : (
                  <div className="flex flex-col gap-2 max-h-72 overflow-y-auto pr-1">
                    {designerModels.map(m => (
                      <div key={m.id} className="p-3 glass-panel rounded-xl border border-slate-200/60 dark:border-white/[0.04] flex justify-between items-center text-xs hover:border-cyan-500/40 transition">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-800 dark:text-slate-200 truncate max-w-[150px]">{m.title}</span>
                          <span className="text-[10px] font-mono text-slate-400">V: {m.volume} см³</span>
                        </div>
                        <span className="font-bold font-mono text-cyan-500 dark:text-cyan-400 text-sm">
                          {m.price} ₽
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Model Upload Form */}
            <div className="lg:col-span-8 p-6 md:p-8 glass-panel rounded-3xl border border-slate-200/80 dark:border-white/[0.08] flex flex-col gap-5 shadow-hud-card">
              <div className="border-b border-slate-200/80 dark:border-white/[0.06] pb-4">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 tracking-tight">
                  <Plus className="w-5 h-5 text-cyan-400" /> 
                  <span>Опубликовать новую CAD-модель</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Задайте геометрические характеристики и установите авторскую цену за каждую печать вашего чертежа.
                </p>
              </div>

              <form onSubmit={handleModelSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <label className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">НАЗВАНИЕ МОДЕЛИ</label>
                  <input
                    type="text"
                    required
                    value={newModel.title}
                    onChange={(e) => setNewModel(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Например: Эргономичный зажим для верстака 80мм"
                    className="bg-slate-50 dark:bg-[#07090e] border border-slate-200 dark:border-white/[0.08] rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-cyan-400/60 font-mono"
                  />
                </div>

                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <label className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">ОПИСАНИЕ И ИНЖЕНЕРНЫЕ ТРЕБОВАНИЯ</label>
                  <textarea
                    required
                    rows={3}
                    value={newModel.description}
                    onChange={(e) => setNewModel(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Укажите рекомендации по печати: ориентацию слоев, прочность стенок, рекомендуемый пластик..."
                    className="bg-slate-50 dark:bg-[#07090e] border border-slate-200 dark:border-white/[0.08] rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-cyan-400/60 resize-none font-mono text-xs"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">ФАЙЛ ДЕТАЛИ (.STL)</label>
                  <select
                    value={newModel.filePath}
                    onChange={(e) => handleModelFileChange(e.target.value)}
                    className="bg-slate-50 dark:bg-[#07090e] border border-slate-200 dark:border-white/[0.08] rounded-xl px-3 py-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-cyan-400/60 cursor-pointer font-mono"
                  >
                    <option value="/sample-models/xyz_calibration_cube.stl">xyz_calibration_cube.stl (Кубик 20мм)</option>
                    <option value="/sample-models/3dbenchy.stl">3dbenchy.stl (Калибровочный 3DBenchy)</option>
                    <option value="/sample-models/laptop_stand.stl">laptop_stand.stl (Подставка под ноутбук)</option>
                  </select>
                </div>

                {/* Fixed Designer Price Input */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">
                    АВТОРСКИЙ РОЯЛТИ (₽ ЗА 1 ИЗДЕЛИЕ)
                  </label>
                  <input
                    type="number"
                    min="50"
                    step="50"
                    required
                    value={newModel.price}
                    onChange={(e) => setNewModel(prev => ({ ...prev, price: Number(e.target.value) }))}
                    className="bg-slate-50 dark:bg-[#07090e] border border-slate-200 dark:border-white/[0.08] rounded-xl px-3 py-2.5 text-slate-900 dark:text-slate-100 font-mono font-extrabold text-cyan-400 focus:outline-none focus:border-cyan-400/60"
                  />
                </div>

                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <label className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">ИНЖЕНЕРНЫЕ ТЕГИ (ЧЕРЕЗ ЗАПЯТУЮ)</label>
                  <input
                    type="text"
                    required
                    value={newModel.tags}
                    onChange={(e) => setNewModel(prev => ({ ...prev, tags: e.target.value }))}
                    placeholder="Калибровка,Оснастка,Инструменты,FDM"
                    className="bg-slate-50 dark:bg-[#07090e] border border-slate-200 dark:border-white/[0.08] rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-cyan-400/60 font-mono"
                  />
                </div>

                <div className="md:col-span-2 mt-2">
                  <button
                    type="submit"
                    disabled={modelSubmitting}
                    className="w-full py-3.5 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 font-mono font-bold text-xs rounded-xl shadow-glow-cyan transition cursor-pointer disabled:opacity-50"
                  >
                    {modelSubmitting ? 'РЕГИСТРАЦИЯ МОДЕЛИ В СЕТИ...' : 'ОПУБЛИКОВАТЬ В КАТАЛОГЕ // ФИКСИРОВАТЬ РОЯЛТИ'}
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
            <div className="lg:col-span-4 p-6 glass-panel rounded-3xl border border-slate-200/80 dark:border-white/[0.08] flex flex-col gap-4 shadow-hud-card text-xs">
              <div className="border-b border-slate-200/80 dark:border-white/[0.06] pb-3 flex items-center justify-between">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <Settings className="w-4 h-4 text-emerald-500" /> 
                  <span>Парк оборудования</span>
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  FARM CONFIG
                </span>
              </div>

              <form onSubmit={handleProfileSubmit} className="flex flex-col gap-3.5 font-mono">
                <div className="flex flex-col gap-1">
                  <label className="text-slate-400 text-[11px] uppercase tracking-wider">Модель 3D-принтера</label>
                  <input
                    type="text"
                    required
                    value={makerForm.printerName}
                    onChange={(e) => setMakerForm(prev => ({ ...prev, printerName: e.target.value }))}
                    className="bg-slate-50 dark:bg-[#07090e] border border-slate-200 dark:border-white/[0.08] rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500/50"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-slate-400 text-[11px] uppercase tracking-wider">Камера печати X × Y × Z (мм)</label>
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="number"
                      required
                      value={makerForm.bedSizeX}
                      onChange={(e) => setMakerForm(prev => ({ ...prev, bedSizeX: Number(e.target.value) }))}
                      className="bg-slate-50 dark:bg-[#07090e] border border-slate-200 dark:border-white/[0.08] rounded-xl p-2 text-center text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500/50"
                      placeholder="X"
                    />
                    <input
                      type="number"
                      required
                      value={makerForm.bedSizeY}
                      onChange={(e) => setMakerForm(prev => ({ ...prev, bedSizeY: Number(e.target.value) }))}
                      className="bg-slate-50 dark:bg-[#07090e] border border-slate-200 dark:border-white/[0.08] rounded-xl p-2 text-center text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500/50"
                      placeholder="Y"
                    />
                    <input
                      type="number"
                      required
                      value={makerForm.bedSizeZ}
                      onChange={(e) => setMakerForm(prev => ({ ...prev, bedSizeZ: Number(e.target.value) }))}
                      className="bg-slate-50 dark:bg-[#07090e] border border-slate-200 dark:border-white/[0.08] rounded-xl p-2 text-center text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500/50"
                      placeholder="Z"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-slate-400 text-[11px] uppercase tracking-wider">Филаменты в наличии</label>
                  <input
                    type="text"
                    required
                    value={makerForm.materials}
                    onChange={(e) => setMakerForm(prev => ({ ...prev, materials: e.target.value }))}
                    className="bg-slate-50 dark:bg-[#07090e] border border-slate-200 dark:border-white/[0.08] rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500/50"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-slate-400 text-[11px] uppercase tracking-wider">Цветовая гамма</label>
                  <input
                    type="text"
                    required
                    value={makerForm.colors}
                    onChange={(e) => setMakerForm(prev => ({ ...prev, colors: e.target.value }))}
                    className="bg-slate-50 dark:bg-[#07090e] border border-slate-200 dark:border-white/[0.08] rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500/50"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-slate-400 text-[11px] uppercase tracking-wider">Локация мейкера</label>
                  <input
                    type="text"
                    required
                    value={makerForm.location}
                    onChange={(e) => setMakerForm(prev => ({ ...prev, location: e.target.value }))}
                    className="bg-slate-50 dark:bg-[#07090e] border border-slate-200 dark:border-white/[0.08] rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500/50"
                  />
                </div>

                {profileSavedMsg && (
                  <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 rounded-xl text-center text-xs font-mono">
                    ✓ Параметры оборудования обновлены
                  </div>
                )}

                <button
                  type="submit"
                  disabled={profileSaving}
                  className="w-full py-2.5 bg-slate-900 dark:bg-white/[0.06] hover:bg-emerald-500 hover:text-slate-950 text-white font-mono font-bold rounded-xl border border-slate-700 dark:border-white/[0.1] transition cursor-pointer"
                >
                  {profileSaving ? 'СОХРАНЕНИЕ...' : 'ОБНОВИТЬ СПЕЦИФИКАЦИЮ'}
                </button>
              </form>
            </div>

            {/* Bidding Requests Feed & Active Jobs */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              {/* 1. Open Client Requests (Аукцион заявок) */}
              <div className="p-6 md:p-7 glass-panel rounded-3xl border border-slate-200/80 dark:border-white/[0.08] flex flex-col gap-4 shadow-hud-card">
                <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-white/[0.06] pb-3">
                  <div>
                    <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-emerald-500" /> 
                      <span>Биржа заявок на печать</span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Клиенты ожидают откликов. Предложите свою ставку и срок выполнения для получения контракта.
                    </p>
                  </div>
                  <span className="text-xs font-mono px-2.5 py-1 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20 font-bold">
                    ОТКРЫТЫХ: {openRequests.length}
                  </span>
                </div>

                {openRequests.length === 0 ? (
                  <p className="text-xs font-mono text-slate-500 py-8 text-center italic border border-dashed border-slate-200 dark:border-white/[0.06] rounded-2xl">
                    [NO ACTIVE RFQ] Сейчас нет новых открытых заявок на печать в сети.
                  </p>
                ) : (
                  <div className="flex flex-col gap-4">
                    {openRequests.map((req) => {
                      const myOffer = req.offers?.find((o: any) => o.makerId === activeUser.id)
                      const form = bidForms[req.id] || { price: myOffer?.price || '', estimatedDays: myOffer?.estimatedDays || 2, comment: myOffer?.comment || '' }

                      return (
                        <div key={req.id} className="p-5 glass-panel rounded-2xl border border-slate-200/80 dark:border-white/[0.08] flex flex-col gap-3.5 hover:border-emerald-500/30 transition shadow-sm">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-200/60 dark:border-white/[0.04] pb-2">
                            <span className="font-bold text-sm text-slate-900 dark:text-white tracking-tight">
                              {req.model.title}
                            </span>
                            <span className="text-xs font-mono text-slate-500">
                              Авторский роялти: <strong className="text-emerald-500">{req.modelPrice} ₽</strong>
                            </span>
                          </div>

                          <div className="text-xs font-mono text-slate-600 dark:text-slate-400 grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-100/60 dark:bg-[#07090e] p-3 rounded-xl border border-slate-200/60 dark:border-white/[0.04]">
                            <div>Материал: <strong className="text-slate-800 dark:text-slate-200">{req.material} ({req.color})</strong></div>
                            <div>Заполнение: <strong className="text-slate-800 dark:text-slate-200">{req.infill}%</strong></div>
                            <div>Слой: <strong className="text-slate-800 dark:text-slate-200">{req.layerHeight}мм</strong></div>
                            <div>Локация: <strong className="truncate block text-slate-800 dark:text-slate-200">{req.deliveryAddress}</strong></div>
                          </div>

                          {/* Bid submission form */}
                          <form 
                            onSubmit={(e) => handleSendBid(e, req.id)}
                            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-1"
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
                                className="w-32 bg-slate-50 dark:bg-[#07090e] border border-slate-200 dark:border-white/[0.08] rounded-xl px-3 py-2 text-xs font-mono font-extrabold text-emerald-500 dark:text-emerald-400 focus:outline-none focus:border-emerald-500/50"
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
                                className="w-24 bg-slate-50 dark:bg-[#07090e] border border-slate-200 dark:border-white/[0.08] rounded-xl px-3 py-2 text-xs font-mono text-center focus:outline-none focus:border-emerald-500/50"
                              />

                              <input
                                type="text"
                                placeholder="Комментарий (принтер, сопло, плотность...)"
                                value={form.comment}
                                onChange={(e) => setBidForms(prev => ({
                                  ...prev,
                                  [req.id]: { ...form, comment: e.target.value }
                                }))}
                                className="flex-1 bg-slate-50 dark:bg-[#07090e] border border-slate-200 dark:border-white/[0.08] rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-emerald-500/50"
                              />
                            </div>

                            <button
                              type="submit"
                              disabled={bidSubmittingId === req.id}
                              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono font-bold text-xs rounded-xl shadow-glow-emerald transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                            >
                              <Send className="w-3.5 h-3.5 stroke-[2.2]" />
                              <span>{myOffer ? 'ОБНОВИТЬ' : 'ПОДАТЬ СТАВКУ'}</span>
                            </button>
                          </form>

                          {myOffer && (
                            <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-medium">
                              ✓ Ваша ставка активна: {myOffer.price} ₽ ({myOffer.estimatedDays} дн.). Заказчик рассматривает предложение.
                            </span>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* 2. Maker's Active Jobs */}
              <div className="p-6 md:p-7 glass-panel rounded-3xl border border-slate-200/80 dark:border-white/[0.08] flex flex-col gap-4 shadow-hud-card">
                <div className="border-b border-slate-200/80 dark:border-white/[0.06] pb-3 flex items-center justify-between">
                  <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-cyan-400" /> 
                    <span>Заказы в производстве</span>
                  </h3>
                  <span className="text-xs font-mono text-slate-400">
                    АКТИВНЫХ: {makerJobs.length}
                  </span>
                </div>

                {makerJobs.length === 0 ? (
                  <p className="text-xs font-mono text-slate-500 py-6 text-center italic border border-dashed border-slate-200 dark:border-white/[0.06] rounded-2xl">
                    У вас пока нет заказов в работе. Делайте ставки на бирже выше.
                  </p>
                ) : (
                  <div className="flex flex-col gap-4">
                    {makerJobs.map((job) => (
                      <div key={job.id} className="p-5 glass-panel rounded-2xl border border-slate-200/80 dark:border-white/[0.08] flex flex-col gap-4">
                        <div className="flex justify-between items-start border-b border-slate-200/60 dark:border-white/[0.04] pb-2">
                          <div className="flex flex-col">
                            <span className="font-bold text-sm text-slate-900 dark:text-white">{job.model.title}</span>
                            <span className="text-xs font-mono text-slate-500">Ваша согласованная выплата: <strong className="text-emerald-500">{job.makerPrice} ₽</strong></span>
                          </div>

                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold ${
                            job.status === 'PRINTING' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30' :
                            job.status === 'SHIPPED' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30' :
                            'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          }`}>
                            {job.status === 'PRINTING' ? 'В ПЕЧАТИ' : job.status === 'SHIPPED' ? 'ОТПРАВЛЕН' : 'ЗАВЕРШЕН'}
                          </span>
                        </div>

                        {/* QC Check Form when PRINTING */}
                        {job.status === 'PRINTING' && (
                          <form 
                            onSubmit={(e) => handleQcSubmit(e, job.id)}
                            className="flex flex-col gap-3 text-xs font-mono"
                          >
                            <span className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px]">
                              // КОНТРОЛЬ КАЧЕСТВА (QC) И ОТГРУЗКА
                            </span>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div className="flex flex-col gap-1">
                                <label className="text-slate-400 text-[10px] uppercase">Фактический вес (г)</label>
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
                                  className="bg-slate-50 dark:bg-[#07090e] border border-slate-200 dark:border-white/[0.08] rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500/50"
                                />
                              </div>

                              <div className="flex flex-col gap-1">
                                <label className="text-slate-400 text-[10px] uppercase">Почтовый трек-номер</label>
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
                                  className="bg-slate-50 dark:bg-[#07090e] border border-slate-200 dark:border-white/[0.08] rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500/50"
                                />
                              </div>
                            </div>

                            <button
                              type="submit"
                              className="mt-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono font-bold text-xs rounded-xl shadow-glow-emerald transition cursor-pointer"
                            >
                              ОТПРАВИТЬ QC-ОТЧЕТ И ЗАКРЫТЬ ЭТАП ПЕЧАТИ
                            </button>
                          </form>
                        )}

                        {job.status === 'SHIPPED' && (
                          <div className="text-xs font-mono text-slate-400 flex items-center gap-2">
                            <Truck className="w-4 h-4 text-cyan-400" />
                            <span>Посылка в пути (Трек: <strong className="text-white">{job.trackingNumber}</strong>). Ожидание подтверждения заказчика.</span>
                          </div>
                        )}

                        {job.status === 'COMPLETED' && (
                          <div className="text-xs font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-2 font-medium">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Контракт выполнен. Оплата ({job.makerPrice} ₽) зачислена на ваш счет.</span>
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
