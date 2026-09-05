import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import ModelConfigurator from '@/components/forms/ModelConfigurator'
import Link from 'next/link'
import { ArrowLeft, Box, User, Coins } from 'lucide-react'

export const revalidate = 0 // Disable cache for updates

interface PageProps {
  params: {
    id: string
  }
}

export default async function ModelPage({ params }: PageProps) {
  const { id } = params

  const model = await prisma.model3D.findUnique({
    where: { id },
    include: { designer: true }
  })

  if (!model) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
        <Box className="w-16 h-16 text-slate-400" />
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">Модель не найдена</h2>
        <p className="text-slate-500 text-sm">Указанная модель отсутствует в базе данных.</p>
        <Link href="/catalog" className="text-orange-500 hover:text-orange-600 font-semibold text-sm mt-2">
          ← Вернуться в каталог
        </Link>
      </div>
    )
  }

  const activeUserId = cookies().get('active_user_id')?.value
  const users = await prisma.user.findMany({ where: { role: 'CLIENT' } })
  const defaultClient = users[0]

  let clientUser = null
  if (activeUserId) {
    clientUser = await prisma.user.findUnique({
      where: { id: activeUserId }
    })
  }

  const clientId = clientUser?.id || defaultClient?.id || ''

  return (
    <div className="flex flex-col gap-6 py-2">
      {/* Navigation Breadcrumbs */}
      <div>
        <Link 
          href="/catalog" 
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-orange-500 transition py-1.5 px-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Назад в каталог</span>
        </Link>
      </div>

      {/* Model Title Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <User className="w-3 h-3 text-orange-500" /> Автор: {model.designer.name}
            </span>
          </div>

          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {model.title}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm max-w-2xl">
            {model.description}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto text-xs text-slate-600 dark:text-slate-300 bg-orange-50 dark:bg-orange-950/40 px-4 py-2.5 rounded-2xl border border-orange-200 dark:border-orange-900/40">
          <Coins className="w-4 h-4 text-orange-500" />
          <span className="font-medium">Цена автора модели:</span>
          <span className="font-extrabold text-orange-600 dark:text-orange-400 text-sm">{model.price} ₽</span>
        </div>
      </div>

      {/* Configurator */}
      <ModelConfigurator 
        model={model} 
        clientId={clientId}
      />
    </div>
  )
}
