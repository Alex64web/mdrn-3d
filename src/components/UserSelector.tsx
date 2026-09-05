"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { User, ChevronDown } from 'lucide-react'

interface UserItem {
  id: string
  name: string
  role: string
  email: string
}

export default function UserSelector({ users }: { users: UserItem[] }) {
  const router = useRouter()
  const [activeId, setActiveId] = useState<string>('')

  useEffect(() => {
    const match = document.cookie.match(/(^| )active_user_id=([^;]+)/)
    if (match) {
      setActiveId(match[2])
    } else if (users.length > 0) {
      const defaultUser = users.find(u => u.role === 'CLIENT') || users[0]
      document.cookie = `active_user_id=${defaultUser.id}; path=/; max-age=31536000`
      setActiveId(defaultUser.id)
    }
  }, [users])

  const handleUserChange = (id: string) => {
    document.cookie = `active_user_id=${id}; path=/; max-age=31536000`
    setActiveId(id)
    router.refresh()
    window.location.reload()
  }

  const activeUser = users.find(u => u.id === activeId)

  return (
    <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-850/80 border border-slate-200 dark:border-slate-800 p-1.5 pl-3 rounded-2xl">
      <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
        <User className="w-3.5 h-3.5 text-orange-500" />
        <span className="text-xs font-medium hidden sm:inline">Пользователь:</span>
      </div>

      <div className="relative">
        <select
          value={activeId}
          onChange={(e) => handleUserChange(e.target.value)}
          className="appearance-none bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-orange-500/60 text-slate-900 dark:text-slate-200 text-xs font-medium rounded-xl py-1.5 pl-3 pr-8 cursor-pointer transition focus:outline-none focus:ring-2 focus:ring-orange-500/20"
        >
          {users.map((user) => (
            <option key={user.id} value={user.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-200 py-1">
              {user.name} ({user.role === 'CLIENT' ? 'Клиент' : user.role === 'DESIGNER' ? 'Дизайнер' : 'Мастер'})
            </option>
          ))}
        </select>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
      </div>

      {activeUser && (
        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-lg bg-orange-100 text-orange-700 dark:bg-orange-950/80 dark:text-orange-300 border border-orange-200 dark:border-orange-800/80 hidden md:inline">
          {activeUser.role === 'CLIENT' ? 'Клиент' : activeUser.role === 'DESIGNER' ? 'Дизайнер' : 'Мастер'}
        </span>
      )}
    </div>
  )
}
