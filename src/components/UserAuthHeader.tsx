'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { logoutUser } from '@/app/actions'
import { Wallet, LogOut, User, Sparkles, Terminal } from 'lucide-react'

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
          className="px-3.5 py-1.5 text-xs font-mono text-slate-700 dark:text-slate-300 hover:text-emerald-500 dark:hover:text-emerald-400 border border-slate-200 dark:border-white/[0.08] hover:border-emerald-500/40 rounded-xl transition"
        >
          // ВОЙТИ
        </Link>
        <Link
          href="/login?tab=register"
          className="px-4 py-1.5 text-xs font-mono font-bold text-slate-950 bg-emerald-500 hover:bg-emerald-400 active:scale-95 rounded-xl shadow-glow-emerald transition flex items-center gap-1.5"
        >
          <Sparkles className="w-3.5 h-3.5 fill-current" />
          <span>РЕГИСТРАЦИЯ</span>
        </Link>
      </div>
    )
  }

  const roleLabel = 
    user.role === 'MAKER' ? 'MAKER' :
    user.role === 'DESIGNER' ? 'DESIGNER' : 'CLIENT'

  const roleBadgeStyle = 
    user.role === 'MAKER' 
      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30' 
      : user.role === 'DESIGNER' 
      ? 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/30' 
      : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'

  return (
    <div className="flex items-center gap-2.5">
      {/* Balance HUD Widget */}
      <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 glass-panel border border-slate-200 dark:border-white/[0.08] rounded-xl text-xs font-mono">
        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-glow-emerald"></div>
        <span className="text-[10px] text-slate-400 uppercase tracking-wider">БАЛАНС:</span>
        <span className="font-bold text-slate-900 dark:text-emerald-400">
          {Math.round(user.balance).toLocaleString('ru-RU')} ₽
        </span>
      </div>

      {/* User info & Role */}
      <div className="flex items-center gap-2 px-3 py-1 glass-panel border border-slate-200 dark:border-white/[0.08] rounded-xl shadow-sm">
        <div className="w-6 h-6 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
          <User className="w-3.5 h-3.5" />
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-bold text-slate-900 dark:text-white leading-tight max-w-[120px] truncate font-mono">
            {user.name}
          </span>
          <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded border w-fit leading-tight mt-0.5 tracking-wider ${roleBadgeStyle}`}>
            [{roleLabel}]
          </span>
        </div>
      </div>

      {/* Logout button */}
      <button
        onClick={handleLogout}
        disabled={loggingOut}
        title="Выйти из аккаунта"
        className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 rounded-xl transition disabled:opacity-50"
      >
        <LogOut className="w-4 h-4" />
      </button>
    </div>
  )
}