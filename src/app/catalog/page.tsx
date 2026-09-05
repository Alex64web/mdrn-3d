import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { 
  Box, 
  Ruler, 
  User, 
  ArrowRight, 
  Layers, 
  Sliders
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
      {/* Header Bar */}
      <div className="p-8 bg-white dark:bg-slate-900/60 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm transition-colors">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Каталог 3D-моделей
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm max-w-2xl">
            Здесь представлены готовые модели с фиксированной авторской ценой. Выберите модель, 
            настройте материал и отправьте заявку мастерам для получения их предложений.
          </p>
        </div>

        <div className="px-4 py-2 bg-slate-100 dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300">
          Всего моделей: {models.length}
        </div>
      </div>

      {/* Grid of Clean Cards */}
      {models.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-slate-900/40 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 text-slate-500 text-sm">
          Каталог пока пуст. Загрузите первую модель через кабинет Дизайнера.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {models.map((model) => {
            const tags = model.tags.split(',').map(t => t.trim())

            return (
              <div 
                key={model.id} 
                className="group flex flex-col justify-between bg-white dark:bg-slate-900/40 hover:bg-slate-50 dark:hover:bg-slate-900/80 rounded-3xl border border-slate-200 dark:border-slate-800 hover:border-orange-400 dark:hover:border-orange-500/50 transition duration-200 p-6 shadow-sm hover:shadow-md"
              >
                <div className="flex flex-col gap-4">
                  {/* Model 3D Placeholder Box */}
                  <div className="relative w-full h-44 bg-slate-100 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800/80 flex flex-col items-center justify-center overflow-hidden">
                    <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-500 group-hover:text-orange-500 group-hover:scale-105 transition duration-300 shadow-sm">
                      <Box className="w-12 h-12 stroke-[1.5]" />
                    </div>

                    {/* Volume badge */}
                    <div className="absolute bottom-2 right-3 text-[11px] font-semibold text-slate-600 dark:text-slate-400 bg-white/90 dark:bg-slate-900/90 px-2 py-0.5 rounded-lg border border-slate-200 dark:border-slate-800">
                      {model.volume} см³
                    </div>
                  </div>

                  {/* Title & Author */}
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-orange-500 transition-colors">
                        {model.title}
                      </h3>
                    </div>
                    <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <User className="w-3 h-3" /> Автор: {model.designer.name}
                    </span>
                    <p className="text-slate-500 dark:text-slate-400 text-xs line-clamp-2 mt-1">
                      {model.description}
                    </p>
                  </div>

                  {/* Physical Dimensions */}
                  <div className="grid grid-cols-3 gap-2 p-2.5 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-600 dark:text-slate-400">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-400">Ширина</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{model.sizeX} мм</span>
                    </div>
                    <div className="flex flex-col border-x border-slate-200 dark:border-slate-800">
                      <span className="text-[10px] text-slate-400">Глубина</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{model.sizeY} мм</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-400">Высота</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{model.sizeZ} мм</span>
                    </div>
                  </div>

                  {/* Designer Price Tag */}
                  <div className="flex items-center justify-between p-3 bg-orange-50/80 dark:bg-orange-950/30 rounded-2xl border border-orange-200 dark:border-orange-900/40">
                    <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                      Цена модели (автору):
                    </span>
                    <span className="text-base font-extrabold text-orange-600 dark:text-orange-400">
                      {model.price} ₽
                    </span>
                  </div>
                </div>

                {/* Card CTA Action */}
                <Link
                  href={`/model/${model.id}`}
                  className="mt-5 w-full py-3 bg-slate-900 hover:bg-orange-500 dark:bg-slate-800 dark:hover:bg-orange-500 text-white font-semibold text-xs rounded-2xl transition flex items-center justify-center gap-2 shadow-sm"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Настроить и оставить заявку</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
