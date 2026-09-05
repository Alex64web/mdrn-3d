import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { 
  Box, 
  Ruler, 
  User, 
  ArrowRight, 
  Sliders,
  Sparkles,
  Layers,
  Eye,
  CheckCircle2
} from 'lucide-react'

export const revalidate = 0 // Live refresh

export default async function Catalog() {
  const models = await prisma.model3D.findMany({
    include: {
      designer: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  return (
    <div className="flex flex-col gap-8 py-2">
      {/* High-Tech Header Banner */}
      <div className="p-8 glass-panel hud-grid rounded-3xl border border-slate-200/80 dark:border-white/[0.08] flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-hud-card transition-colors relative overflow-hidden">
        <div className="relative z-10 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-mono text-[10px] font-bold tracking-wider">
              VERIFIED 3D LIBRARY
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Каталог цифровых 3D-моделей
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm max-w-2xl leading-relaxed">
            Проверенные геометрические модели с фиксированной авторской ценой. Выбирайте деталь, 
            настраивайте физические параметры и запускайте торги среди сертифицированных мейкеров.
          </p>
        </div>

        <div className="relative z-10 px-4 py-2 glass-panel rounded-2xl border border-slate-200 dark:border-white/[0.08] text-xs font-mono text-slate-600 dark:text-slate-300 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>МОДЕЛЕЙ В БАЗЕ: {models.length}</span>
        </div>
      </div>

      {/* Grid of Precision Cards */}
      {models.length === 0 ? (
        <div className="text-center py-20 glass-panel rounded-3xl border border-dashed border-slate-300 dark:border-white/10 text-slate-500 text-sm font-mono">
          КАТАЛОГ ПУСТ // ДОБАВЬТЕ МОДЕЛЬ ЧЕРЕЗ КАБИНЕТ АВТОРА
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {models.map((model) => {
            const tags = model.tags.split(',').map(t => t.trim())

            return (
              <div 
                key={model.id} 
                className="group flex flex-col justify-between glass-panel rounded-3xl border border-slate-200/80 dark:border-white/[0.08] hover:border-emerald-500/50 transition-all duration-300 p-6 shadow-sm hover:shadow-glow-emerald/30 relative overflow-hidden"
              >
                <div className="flex flex-col gap-4">
                  {/* 16:10 Visual Preview Container */}
                  <div className="relative w-full aspect-[16/10] bg-slate-100 dark:bg-[#07090e] rounded-2xl border border-slate-200 dark:border-white/[0.06] flex flex-col items-center justify-center overflow-hidden group-hover:border-emerald-500/30 transition-colors">
                    {/* CAD Crosshairs */}
                    <div className="absolute top-2 left-2.5 font-mono text-[9px] text-slate-400 dark:text-slate-600 select-none">
                      +
                    </div>
                    <div className="absolute top-2 right-2.5 font-mono text-[9px] text-slate-400 dark:text-slate-600 select-none">
                      +
                    </div>

                    {/* Central 3D Icon */}
                    <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 text-slate-400 group-hover:text-emerald-400 group-hover:scale-110 transition-all duration-300 shadow-sm">
                      <Box className="w-10 h-10 stroke-[1.5]" />
                    </div>

                    {/* Volume Badge */}
                    <div className="absolute bottom-2.5 right-3 text-[10px] font-mono font-bold text-slate-700 dark:text-slate-300 bg-white/90 dark:bg-slate-900/90 px-2 py-0.5 rounded-lg border border-slate-200 dark:border-white/10 shadow-sm">
                      {model.volume} см³
                    </div>

                    {/* Quick Preview Hover Overlay */}
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="px-3 py-1.5 rounded-xl bg-emerald-500 text-slate-950 font-mono text-[11px] font-bold shadow-lg flex items-center gap-1.5">
                        <Eye className="w-3.5 h-3.5" />
                        <span>3D ОСМОТР</span>
                      </span>
                    </div>
                  </div>

                  {/* Title & Author */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors">
                        {model.title}
                      </h3>
                    </div>
                    
                    <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                      <User className="w-3 h-3 text-slate-400" />
                      <span>Автор:</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">{model.designer.name}</span>
                    </div>

                    <p className="text-slate-500 dark:text-slate-400 text-xs line-clamp-2 mt-0.5 leading-relaxed">
                      {model.description}
                    </p>
                  </div>

                  {/* Physical Dimensions Spec */}
                  <div className="grid grid-cols-3 gap-2 p-2.5 bg-slate-50/70 dark:bg-[#07090e] rounded-2xl border border-slate-200/60 dark:border-white/[0.04] text-center text-xs font-mono">
                    <div className="flex flex-col">
                      <span className="text-[9px] text-slate-400 uppercase">Ширина</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{model.sizeX} мм</span>
                    </div>
                    <div className="flex flex-col border-x border-slate-200 dark:border-white/[0.04]">
                      <span className="text-[9px] text-slate-400 uppercase">Глубина</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{model.sizeY} мм</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[9px] text-slate-400 uppercase">Высота</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{model.sizeZ} мм</span>
                    </div>
                  </div>

                  {/* Designer Royalty Price Tag */}
                  <div className="flex items-center justify-between p-3 bg-emerald-500/10 dark:bg-emerald-950/20 rounded-2xl border border-emerald-500/20">
                    <span className="text-xs text-slate-700 dark:text-slate-300 font-mono">
                      Лицензия автора:
                    </span>
                    <span className="text-base font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
                      {model.price} ₽
                    </span>
                  </div>
                </div>

                {/* Card CTA Action */}
                <Link
                  href={`/model/${model.id}`}
                  className="mt-5 w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs rounded-2xl transition flex items-center justify-center gap-2 shadow-glow-emerald group"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Настроить и запустить расчет</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}