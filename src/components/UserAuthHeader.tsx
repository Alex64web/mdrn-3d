'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { logoutUser } from '@/app/actions'
import { Wallet, LogOut, User, Sparkles } from 'lucide-react'

interface CurrentUserProps {
  id: string
  name: string
  email: string
  role: string
  balance: number
}

export default function UserAuthHeader({ user }: { user: CurrentUserProps | null }) {
  const router = useRouter()
  const [loggingOut, setLoggingOut] = useState(false)

  const handleLogout = async () => {
    setLoggingOut(true)
    try {
      await logoutUser()
      router.push('/')
      router.refresh()
    } finally {
      setLoggingOut(false)
    }
  }

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Link
          href="/login"
          className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-orange-500 dark:hover:text-orange-400 transition"
        >
          Войти
        </Link>
        <Link
          href="/login?tab=register"
          className="px-4 py-1.5 text-xs font-bold text-white bg-orange-500 hover:bg-orange-600 active:scale-95 rounded-xl shadow-sm shadow-orange-500/20 transition flex items-center gap-1.5"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Регистрация
        </Link>
      </div>
    )
  }

  const roleLabel = 
    user.role === 'MAKER' ? 'Мастер печати' :
    user.role === 'DESIGNER' ? '3D-Дизайнер' : 'Заказчик'

  const roleBadgeStyle = 
    user.role === 'MAKER' 
      ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/80' 
      : user.role === 'DESIGNER' 
      ? 'bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800/80' 
      : 'bg-orange-50 dark:bg-orange-950/50 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800/80'

  return (
    <div className="flex items-center gap-2.5">
      {/* Balance */}
      <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs">
        <Wallet className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
        <span className="font-bold text-slate-900 dark:text-emerald-400">
          {Math.round(user.balance).toLocaleString('ru-RU')} ₽
        </span>
      </div>

      {/* User info & Role */}
      <div className="flex items-center gap-2 px-3 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
        <div className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300">
          <User className="w-3.5 h-3.5" />
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-bold text-slate-900 dark:text-white leading-tight max-w-[120px] truncate">
            {user.name}
          </span>
          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border w-fit leading-tight mt-0.5 ${roleBadgeStyle}`}>
            {roleLabel}
          </span>
        </div>
      </div>

      {/* Logout button */}
      <button
        onClick={handleLogout}
        disabled={loggingOut}
        title="Выйти из аккаунта"
        className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition disabled:opacity-50"
      >
        <LogOut className="w-4 h-4" />
      </button>
    </div>
  )
}