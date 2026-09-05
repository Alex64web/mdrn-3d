import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import UnifiedDashboard from '@/components/dashboard/UnifiedDashboard'

export const revalidate = 0 // Disable cache for live matching/order updates

export default async function DashboardPage() {
  const users = await prisma.user.findMany({
    orderBy: { role: 'asc' }
  })

  const activeUserId = cookies().get('active_user_id')?.value
  let activeUser = null

  if (activeUserId) {
    activeUser = await prisma.user.findUnique({
      where: { id: activeUserId },
      include: { makerProfile: true }
    })
  }
  
  if (!activeUser && users.length > 0) {
    activeUser = users.find(u => u.role === 'CLIENT') || users[0]
  }

  const orders = await prisma.order.findMany({
    include: {
      client: true,
      model: {
        include: { designer: true }
      },
      maker: {
        include: { makerProfile: true }
      },
      offers: {
        include: {
          maker: {
            include: { makerProfile: true }
          }
        },
        orderBy: {
          price: 'asc'
        }
      },
      review: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  const models = await prisma.model3D.findMany({
    include: {
      designer: true
    }
  })

  return (
    <div className="flex flex-col gap-6 py-2">
      <div className="p-8 bg-white dark:bg-slate-900/60 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm transition-colors">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Панель управления
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm max-w-2xl">
            Управляйте заявками, предложениями мастеров и изготовлением деталей. 
            Переключайте пользователей в верхнем меню для тестирования всех ролей платформы.
          </p>
        </div>

        <div className="px-4 py-2 bg-slate-100 dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300">
          Активных заказов в сети: {orders.length}
        </div>
      </div>

      {activeUser ? (
        <UnifiedDashboard 
          activeUser={activeUser} 
          allOrders={orders} 
          allModels={models} 
        />
      ) : (
        <div className="text-center py-20 text-slate-500 text-sm border border-dashed border-slate-300 dark:border-slate-800 rounded-3xl">
          База данных не инициализирована. Запустите сидирование Prisma.
        </div>
      )}
    </div>
  )
}
