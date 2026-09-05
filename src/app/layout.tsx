import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import UserAuthHeader from '@/components/UserAuthHeader'
import ThemeToggle from '@/components/ThemeToggle'
import Link from 'next/link'
import { Box, Layers, ShieldCheck } from 'lucide-react'
import { getCurrentUser } from '@/lib/auth'

const inter = Inter({ subsets: ['latin', 'cyrillic'] })

export const metadata: Metadata = {
  title: 'MDRN 3D — Распределенная платформа 3D-печати',
  description: 'Маркетплейс 3D-моделей и сеть локальной печати по требованию с аукционом мастеров',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const activeUser = await getCurrentUser()

  return (
    <html lang="ru" className="dark h-full">
      <body className={`${inter.className} flex flex-col min-h-screen antialiased text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-[#0b0f19] transition-colors duration-200`}>
        {/* Navigation Header */}
        <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800/80 bg-white/85 dark:bg-[#0b0f19]/85 backdrop-blur-md transition-colors">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
            {/* Brand Logo & Nav */}
            <div className="flex items-center gap-8">
              <Link href="/" className="flex items-center gap-2.5 group">
                <div className="p-2 bg-orange-500 hover:bg-orange-600 rounded-xl text-white transition shadow-sm">
                  <Box className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div className="flex flex-col">
                  <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-white">
                    MDRN <span className="text-orange-500 font-normal">3D</span>
                  </span>
                </div>
              </Link>

              <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
                <Link 
                  href="/catalog" 
                  className="text-slate-600 dark:text-slate-300 hover:text-orange-500 dark:hover:text-orange-400 transition-colors"
                >
                  Каталог моделей
                </Link>
                <Link 
                  href="/dashboard" 
                  className="text-slate-600 dark:text-slate-300 hover:text-orange-500 dark:hover:text-orange-400 transition-colors"
                >
                  Панель управления
                </Link>
              </nav>
            </div>

            {/* Right Controls: Auth Header & Theme Toggle */}
            <div className="flex items-center gap-3">
              <UserAuthHeader user={activeUser ? {
                id: activeUser.id,
                name: activeUser.name,
                email: activeUser.email,
                role: activeUser.role,
                balance: activeUser.balance
              } : null} />

              {/* Theme Switcher Button */}
              <ThemeToggle />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 container mx-auto px-4 py-8">
          {children}
        </main>

        {/* Clean Footer */}
        <footer className="border-t border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#070a12] py-8 text-xs text-slate-500 transition-colors">
          <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-800 dark:text-slate-200">MDRN 3D</span>
              <span>— Платформа распределенной печати по требованию</span>
            </div>

            <div className="flex items-center gap-4 text-slate-400">
              <span>Next.js 14</span>
              <span>•</span>
              <span>Three.js</span>
              <span>•</span>
              <span>SQLite Prisma</span>
              <span>•</span>
              <span className="text-emerald-500 font-medium flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Escrow Защита
              </span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  )
}
