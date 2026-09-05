"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
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
  Info,
  ShieldCheck,
  Cpu,
  Layers
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
  { name: 'Laser Emerald', hex: '#10b981', label: 'Изумруд' },
  { name: 'Signal Orange', hex: '#f97316', label: 'Оранжевый' },
  { name: 'Stealth Black', hex: '#0f172a', label: 'Черный' },
  { name: 'Pure White', hex: '#f8fafc', label: 'Белый' },
  { name: 'Titanium Gray', hex: '#64748b', label: 'Серый' },
  { name: 'Electric Cyan', hex: '#06b6d4', label: 'Циан' }
]

const MATERIAL_INFO: Record<MaterialType, { label: string; tag: string; desc: string; temp: string }> = {
  PLA: { label: 'PLA', tag: 'Высокая точность', desc: 'Базовый жесткий термопласт, экологичный и точный', temp: 'до 55°C' },
  PETG: { label: 'PETG', tag: 'Ударопрочный', desc: 'Химически и влагостойкий, долговечный конструкционный пластик', temp: 'до 75°C' },
  ABS: { label: 'ABS', tag: 'Термостойкий', desc: 'Инженерный полимер для авто и техники, выдерживает нагрев', temp: 'до 100°C' },
  TPU: { label: 'TPU', tag: 'Эластомер (Flex)', desc: 'Гибкая резина для демпферов, прокладок, втулок и бамперов', temp: 'до 80°C' },
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
      router.push(`/login?callback=/model/${model.id}`)
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
      {/* LEFT: 3D Viewer & Physical Geometry HUD */}
      <div className="lg:col-span-7 flex flex-col gap-6">
        <StlViewer 
          modelUrl={model.filePath} 
          color={colorObj.hex} 
          modelDimensions={{
            x: model.sizeX,
            y: model.sizeY,
            z: model.sizeZ,
            volume: model.volume
          }}
        />

        {/* Physical Geometry HUD Card */}
        <div className="p-6 glass-panel border border-slate-200/80 dark:border-white/[0.08] rounded-3xl flex flex-col gap-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
              <Ruler className="w-4 h-4 text-emerald-500" />
              <span>Геометрия и габаритный бокс детали</span>
            </h4>
            <span className="text-[10px] font-mono text-emerald-500 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
              SCALE 1:1 (MM)
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3.5 bg-slate-100/60 dark:bg-slate-900/60 rounded-2xl border border-slate-200/60 dark:border-white/[0.04] flex flex-col">
              <span className="text-[10px] font-mono text-slate-400 uppercase">Ось X (Ширина)</span>
              <span className="text-base font-bold font-mono text-slate-900 dark:text-white mt-0.5">{model.sizeX} мм</span>
            </div>
            <div className="p-3.5 bg-slate-100/60 dark:bg-slate-900/60 rounded-2xl border border-slate-200/60 dark:border-white/[0.04] flex flex-col">
              <span className="text-[10px] font-mono text-slate-400 uppercase">Ось Y (Глубина)</span>
              <span className="text-base font-bold font-mono text-slate-900 dark:text-white mt-0.5">{model.sizeY} мм</span>
            </div>
            <div className="p-3.5 bg-slate-100/60 dark:bg-slate-900/60 rounded-2xl border border-slate-200/60 dark:border-white/[0.04] flex flex-col">
              <span className="text-[10px] font-mono text-slate-400 uppercase">Ось Z (Высота)</span>
              <span className="text-base font-bold font-mono text-slate-900 dark:text-white mt-0.5">{model.sizeZ} мм</span>
            </div>
          </div>

          <div className="flex items-center justify-between p-3.5 bg-slate-100/60 dark:bg-slate-900/60 rounded-2xl border border-slate-200/60 dark:border-white/[0.04] text-xs font-mono">
            <span className="text-slate-500 dark:text-slate-400">Объем твердого тела модели:</span>
            <span className="font-bold text-emerald-500 text-sm">{model.volume} см³</span>
          </div>
        </div>
      </div>

      {/* RIGHT: High-Tech Request Configurator */}
      <form onSubmit={handleRequestSubmit} className="lg:col-span-5 flex flex-col gap-6">
        <div className="p-7 glass-panel border border-slate-200/80 dark:border-white/[0.08] rounded-3xl flex flex-col gap-6 shadow-hud-card">
          <div className="border-b border-slate-200 dark:border-white/[0.08] pb-4">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Конфигуратор печати</h2>
              <span className="text-[10px] font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">CAD-SPEC</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Настройте физические свойства. Мастера предложат свои индивидуальные цены на основе этих параметров.
            </p>
          </div>

          {/* 1. Material Selector */}
          <div className="flex flex-col gap-2.5">
            <div className="flex justify-between items-center text-xs font-semibold text-slate-800 dark:text-slate-200">
              <span>1. Конструкционный материал</span>
              <span className="font-mono text-emerald-500 text-[11px]">{MATERIAL_INFO[material].tag} • {MATERIAL_INFO[material].temp}</span>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              {(['PLA', 'PETG', 'ABS', 'TPU'] as MaterialType[]).map((mat) => (
                <button
                  key={mat}
                  type="button"
                  onClick={() => setMaterial(mat)}
                  className={`p-3.5 rounded-2xl border text-left transition flex flex-col gap-1 relative overflow-hidden ${
                    material === mat
                      ? 'bg-emerald-500/10 dark:bg-emerald-950/30 border-emerald-500 text-slate-900 dark:text-white ring-1 ring-emerald-500/30'
                      : 'bg-slate-50/50 dark:bg-slate-900/40 border-slate-200 dark:border-white/[0.06] text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs font-mono">{mat}</span>
                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-800 text-slate-500">{MATERIAL_INFO[mat].temp}</span>
                  </div>
                  <span className="text-[11px] text-slate-500 leading-tight line-clamp-1">
                    {MATERIAL_INFO[mat].desc}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Color Swatches with Volumetric Glow */}
          <div className="flex flex-col gap-2.5">
            <div className="flex justify-between items-center text-xs font-semibold text-slate-800 dark:text-slate-200">
              <span>2. Цвет филамента</span>
              <span className="font-mono text-slate-500 dark:text-slate-400 text-[11px]">{colorObj.label}</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {FILAMENT_COLORS.map((col) => (
                <button
                  key={col.name}
                  type="button"
                  onClick={() => setColorObj(col)}
                  className={`p-2 rounded-xl border flex items-center gap-2 transition ${
                    colorObj.name === col.name
                      ? 'bg-emerald-500/10 dark:bg-emerald-950/30 border-emerald-500 ring-1 ring-emerald-500/30'
                      : 'bg-slate-50/50 dark:bg-slate-900/40 border-slate-200 dark:border-white/[0.06] hover:border-slate-300 dark:hover:border-white/10'
                  }`}
                >
                  <span 
                    className="w-3.5 h-3.5 rounded-full border border-black/20 shrink-0 shadow-sm" 
                    style={{ backgroundColor: col.hex }}
                  />
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate">{col.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 3. Infill Slider */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center text-xs font-semibold text-slate-800 dark:text-slate-200">
              <span>3. Заполнение структуры (Infill)</span>
              <span className="font-mono text-emerald-500 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                {infill}% {infill <= 20 ? '(Эконом)' : infill <= 50 ? '(Прочный)' : '(Монолит)'}
              </span>
            </div>
            <input
              type="range"
              min={10}
              max={100}
              step={5}
              value={infill}
              onChange={(e) => setInfill(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg cursor-pointer accent-emerald-500"
            />
          </div>

          {/* 4. Layer Height Slider */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center text-xs font-semibold text-slate-800 dark:text-slate-200">
              <span>4. Высота слоя (Точность экструзии)</span>
              <span className="font-mono text-cyan-400 font-bold bg-cyan-500/10 px-2 py-0.5 rounded-md border border-cyan-500/20">
                {layerHeight} мм {layerHeight <= 0.12 ? '(High-Res)' : layerHeight <= 0.20 ? '(Optimal)' : '(Draft)'}
              </span>
            </div>
            <input
              type="range"
              min={0.08}
              max={0.28}
              step={0.04}
              value={layerHeight}
              onChange={(e) => setLayerHeight(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg cursor-pointer accent-cyan-400"
            />
          </div>

          {/* 5. Address */}
          <div className="flex flex-col gap-1.5 pt-3 border-t border-slate-200 dark:border-white/[0.08]">
            <label className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-500" /> Адрес / Город доставки
            </label>
            <input
              type="text"
              required
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              placeholder="Москва, ул. Тверская, д. 12"
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-white/[0.08] rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 transition"
            />
          </div>

          {/* Physical Estimate & Pricing Card */}
          <div className="p-4 bg-slate-100/70 dark:bg-[#07090e] rounded-2xl border border-slate-200 dark:border-white/[0.06] flex flex-col gap-2.5 text-xs font-mono">
            <div className="flex justify-between text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <Weight className="w-3.5 h-3.5 text-emerald-500" /> Расчетный вес филамента:
              </span>
              <span className="font-bold text-slate-900 dark:text-white">~{estimates.weightGrams} г</span>
            </div>

            <div className="flex justify-between text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-cyan-400" /> Примерное время станка:
              </span>
              <span className="font-bold text-slate-900 dark:text-white">~{estimates.printTimeHours} ч</span>
            </div>

            <div className="h-px bg-slate-200 dark:bg-white/[0.06] my-1" />

            <div className="flex justify-between items-center text-slate-700 dark:text-slate-300">
              <span>Лицензия автора (модель):</span>
              <span className="font-bold text-slate-900 dark:text-white text-sm">{model.price} ₽</span>
            </div>

            <div className="flex justify-between items-center text-slate-700 dark:text-slate-300">
              <span>Стоимость печати (мастер):</span>
              <span className="text-emerald-500 font-bold">Определится на торгах</span>
            </div>

            <div className="flex justify-between items-center text-slate-400 text-[11px]">
              <span>Защита Escrow платформы:</span>
              <span>5% при сделке</span>
            </div>
          </div>

          {/* Info Badge */}
          <div className="p-3 bg-emerald-500/10 dark:bg-emerald-950/20 rounded-2xl border border-emerald-500/20 text-xs text-emerald-700 dark:text-emerald-400 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              Публикация заявки <strong>бесплатна (0 ₽)</strong>. Вы оплачиваете заказ только после того, как мастер предложит свою цену, а вы нажмете согласие.
            </span>
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-2xl text-rose-600 dark:text-rose-400 text-xs">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 rounded-2xl text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Submit Request Button or Login Prompt */}
          {clientId ? (
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-4 font-bold text-sm rounded-2xl transition flex items-center justify-center gap-2 shadow-glow-emerald ${
                isSubmitting
                  ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 cursor-pointer'
              }`}
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? 'Отправка заявки...' : 'Опубликовать заявку мастерам (0 ₽)'}</span>
            </button>
          ) : (
            <Link
              href={`/login?callback=/model/${model.id}`}
              className="w-full py-4 font-bold text-sm rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 transition flex items-center justify-center gap-2 shadow-glow-emerald"
            >
              <Send className="w-4 h-4" />
              <span>Войдите в аккаунт, чтобы оставить заявку</span>
            </Link>
          )}
        </div>
      </form>
    </div>
  )
}