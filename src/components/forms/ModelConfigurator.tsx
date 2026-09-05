"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import StlViewer from '../viewer/StlViewer'
import { estimatePrint, MaterialType } from '@/lib/slicer-calc'
import { createOrderRequest } from '@/app/actions'
import { 
  Ruler, 
  Send, 
  Weight, 
  Clock, 
  MapPin, 
  CheckCircle, 
  AlertCircle,
  Sparkles,
  Info
} from 'lucide-react'

interface ModelConfiguratorProps {
  model: {
    id: string
    title: string
    description: string
    filePath: string
    price: number
    royalty: number
    sizeX: number
    sizeY: number
    sizeZ: number
    volume: number
  }
  clientId: string
}

const FILAMENT_COLORS = [
  { name: 'Signal Orange', hex: '#ff5500', label: 'Оранжевый' },
  { name: 'Stealth Black', hex: '#0f172a', label: 'Черный' },
  { name: 'Pure White', hex: '#f8fafc', label: 'Белый' },
  { name: 'Titanium Gray', hex: '#64748b', label: 'Серый' },
  { name: 'Prusian Blue', hex: '#0284c7', label: 'Синий' },
  { name: 'Crimson Red', hex: '#dc2626', label: 'Красный' }
]

const MATERIAL_INFO: Record<MaterialType, { label: string; desc: string }> = {
  PLA: { label: 'PLA', desc: 'Экологичный, высокая точность, подходит для большинства задач' },
  PETG: { label: 'PETG', desc: 'Ударопрочный, влагостойкий, долговечный пластик' },
  ABS: { label: 'ABS', desc: 'Термостойкий, жесткий, выдерживает до 100°C' },
  TPU: { label: 'TPU (Flex)', desc: 'Гибкий полимер, демпферы, уплотнители и бамперы' },
}

export default function ModelConfigurator({ model, clientId }: ModelConfiguratorProps) {
  const router = useRouter()
  
  const [material, setMaterial] = useState<MaterialType>('PLA')
  const [colorObj, setColorObj] = useState(FILAMENT_COLORS[0])
  const [infill, setInfill] = useState<number>(20)
  const [layerHeight, setLayerHeight] = useState<number>(0.2)
  const [deliveryAddress, setDeliveryAddress] = useState<string>('Москва, ул. Тверская, д. 12')
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  // Physical estimate
  const estimates = estimatePrint(model.volume, model.royalty, {
    material,
    infill,
    layerHeight
  })

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!clientId) {
      setErrorMsg('Не выбран активный пользователь. Выберите роль Клиента в верхнем меню.')
      return
    }

    setIsSubmitting(true)
    setErrorMsg(null)
    setSuccessMsg(null)

    try {
      await createOrderRequest({
        clientId,
        modelId: model.id,
        material,
        color: colorObj.name,
        infill,
        layerHeight,
        deliveryAddress
      })
      setSuccessMsg('Заявка успешно отправлена! Мастера получили уведомление и скоро предложат свои цены.')
      
      setTimeout(() => {
        router.push('/dashboard')
        router.refresh()
      }, 2000)
    } catch (err: any) {
      setErrorMsg(err.message || 'Ошибка отправки заявки')
      setIsSubmitting(false)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* LEFT: 3D Viewer & Spec */}
      <div className="lg:col-span-7 flex flex-col gap-6">
        <StlViewer modelUrl={model.filePath} color={colorObj.hex} />

        {/* Physical Geometry Card */}
        <div className="p-6 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-3xl flex flex-col gap-4 shadow-sm">
          <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Ruler className="w-4 h-4 text-orange-500" /> Физические параметры модели
          </h4>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col">
              <span className="text-[11px] text-slate-400">Ширина (X)</span>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-100">{model.sizeX} мм</span>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col">
              <span className="text-[11px] text-slate-400">Глубина (Y)</span>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-100">{model.sizeY} мм</span>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col">
              <span className="text-[11px] text-slate-400">Высота (Z)</span>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-100">{model.sizeZ} мм</span>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs">
            <span className="text-slate-500 dark:text-slate-400">Чистый объем 3D-сетки:</span>
            <span className="font-bold text-slate-900 dark:text-white">{model.volume} см³</span>
          </div>
        </div>
      </div>

      {/* RIGHT: Request Parameters Form */}
      <form onSubmit={handleRequestSubmit} className="lg:col-span-5 flex flex-col gap-6">
        <div className="p-6 md:p-7 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-3xl flex flex-col gap-5 shadow-sm">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Параметры заявки</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Укажите желаемые свойства печати. Мастера предложат свои цены на основе этих данных.
            </p>
          </div>

          {/* 1. Material */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">1. Материал печати</label>
            <div className="grid grid-cols-2 gap-2">
              {(['PLA', 'PETG', 'ABS', 'TPU'] as MaterialType[]).map((mat) => (
                <button
                  key={mat}
                  type="button"
                  onClick={() => setMaterial(mat)}
                  className={`p-3 rounded-2xl border text-left transition flex flex-col gap-0.5 ${
                    material === mat
                      ? 'bg-orange-50 dark:bg-orange-950/60 border-orange-500 text-orange-900 dark:text-white'
                      : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <span className="font-bold text-xs">{mat}</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                    {MATERIAL_INFO[mat].desc}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Color */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">2. Цвет пластика</label>
            <div className="grid grid-cols-3 gap-2">
              {FILAMENT_COLORS.map((col) => (
                <button
                  key={col.name}
                  type="button"
                  onClick={() => setColorObj(col)}
                  className={`p-2.5 rounded-2xl border flex items-center gap-2 transition ${
                    colorObj.name === col.name
                      ? 'bg-orange-50 dark:bg-orange-950/60 border-orange-500'
                      : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <span 
                    className="w-3.5 h-3.5 rounded-full border border-black/20 flex-shrink-0" 
                    style={{ backgroundColor: col.hex }}
                  />
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-200 truncate">{col.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 3. Infill */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center text-xs font-semibold text-slate-700 dark:text-slate-300">
              <span>3. Заполнение детали</span>
              <span className="text-orange-500">{infill}%</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[15, 40, 100].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setInfill(val)}
                  className={`py-2 text-xs font-semibold rounded-xl border transition ${
                    infill === val
                      ? 'bg-orange-500 text-white border-orange-500'
                      : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  {val}% {val === 15 ? '(Эконом)' : val === 40 ? '(Прочный)' : '(Монолит)'}
                </button>
              ))}
            </div>
          </div>

          {/* 4. Layer Height */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center text-xs font-semibold text-slate-700 dark:text-slate-300">
              <span>4. Высота слоя</span>
              <span className="text-orange-500">{layerHeight} мм</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[0.12, 0.20, 0.28].map((lh) => (
                <button
                  key={lh}
                  type="button"
                  onClick={() => setLayerHeight(lh)}
                  className={`py-2 text-xs font-semibold rounded-xl border transition ${
                    layerHeight === lh
                      ? 'bg-orange-500 text-white border-orange-500'
                      : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  {lh} мм {lh === 0.12 ? '(Точно)' : lh === 0.20 ? '(Баланс)' : '(Быстро)'}
                </button>
              ))}
            </div>
          </div>

          {/* 5. Address */}
          <div className="flex flex-col gap-1.5 pt-2 border-t border-slate-200 dark:border-slate-800">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-orange-500" /> Адрес доставки
            </label>
            <input
              type="text"
              required
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              placeholder="Город, улица, дом, квартира"
              className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
            />
          </div>
        </div>

        {/* Pricing & Estimation Overview */}
        <div className="p-6 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-3xl flex flex-col gap-4 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <div>
              <span className="text-xs text-slate-400">Стоимость модели (автору):</span>
              <div className="text-2xl font-black text-slate-900 dark:text-white">
                {model.price} ₽
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs text-slate-400">Примерный вес детали:</span>
              <div className="text-base font-bold text-orange-500">
                ≈ {estimates.weightGrams} г
              </div>
            </div>
          </div>

          <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-2xl border border-blue-200 dark:border-blue-900/40 text-xs text-blue-700 dark:text-blue-300 flex items-start gap-2.5">
            <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>
              Отправка заявки <strong>бесплатна</strong>. Мастера пришлют свои предложения по цене изготовления в Панель управления, где вы сможете выбрать подходящее.
            </span>
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-900 rounded-2xl text-red-600 dark:text-red-400 text-xs">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900 rounded-2xl text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2">
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Submit Request Button */}
          <button
            type="submit"
            disabled={isSubmitting || !clientId}
            className={`w-full py-4 font-bold text-sm rounded-2xl transition flex items-center justify-center gap-2 shadow-sm ${
              isSubmitting
                ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                : 'bg-orange-500 hover:bg-orange-600 text-white cursor-pointer'
            }`}
          >
            <Send className="w-4 h-4" />
            <span>{isSubmitting ? 'Отправка заявки...' : 'Отправить заявку мастерам'}</span>
          </button>
        </div>
      </form>
    </div>
  )
}
