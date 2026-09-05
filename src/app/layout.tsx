import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import UserAuthHeader from '@/components/UserAuthHeader'
import ThemeToggle from '@/components/ThemeToggle'
import Link from 'next/link'
import { Box, Layers, ShieldCheck, Activity, Cpu } from 'lucide-react'
import { getCurrentUser } from '@/lib/auth'

const inter = Inter({ subsets: ['latin', 'cyrillic'], variable: '--font-inter' })
const mono = JetBrains_Mono({ subsets: ['latin', 'cyrillic'], variable: '--font-mono' })

export const metadata: Metadata = {
  title: 'MDRN 3D — Распределенная платформа 3D-печати',
  description: 'Инженерная экосистема локальной 3D-печати по требованию с распределенной сетью мейкеров и Escrow-защитой',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const activeUser = await getCurrentUser()

  return (
    <html lang="ru" className="dark h-full">
      <body className={`${inter.className} ${mono.variable} flex flex-col min-h-screen antialiased text-slate-900 dark:text-slate-100 bg-[#f8fafc] dark:bg-[#08090d] transition-colors duration-200 selection:bg-emerald-500 selection:text-black`}>
        {/* Top Micro Telemetry Strip */}
        <div className="hidden md:flex items-center justify-between px-6 py-1 text-[11px] font-mono bg-slate-100 dark:bg-[#050608] border-b border-slate-200/80 dark:border-white/[0.05] text-slate-500">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 -ml-3"></span>
              <span>GRID ACTIVE</span>
            </span>
            <span className="text-slate-400 dark:text-slate-700">|</span>
            <span>LATENCY: 14ms</span>
            <span className="text-slate-400 dark:text-slate-700">|</span>
            <span>TOLERANCE: ±0.05mm</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-slate-400">PROTOCOL:</span>
            <span className="text-slate-700 dark:text-slate-300 font-semibold">ESCROW-V2_AUTOMATED</span>
          </div>
        </div>

        {/* Navigation Header */}
        <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 dark:border-white/[0.08] bg-white/80 dark:bg-[#08090d]/80 backdrop-blur-xl transition-colors">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
            {/* Brand Logo & Nav */}
            <div className="flex items-center gap-8">
              <Link href="/" className="flex items-center gap-3 group">
                <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-slate-950 font-bold shadow-glow-emerald transition group-hover:scale-105">
                  <Box className="w-5 h-5 stroke-[2.3]" />
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-white">
                      MDRN<span className="text-emerald-500">.3D</span>
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-white/[0.06] border border-slate-200 dark:border-white/[0.08] text-slate-500 dark:text-slate-400">
                      HUD
                    </span>
                  </div>
                </div>
              </Link>

              <nav className="hidden md:flex items-center gap-1 text-xs font-mono">
                <Link 
                  href="/catalog" 
                  className="px-3.5 py-2 rounded-lg text-slate-600 dark:text-slate-300 hover:text-emerald-500 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-white/[0.04] transition"
                >
                  // КАТАЛОГ
                </Link>
                <Link 
                  href="/dashboard" 
                  className="px-3.5 py-2 rounded-lg text-slate-600 dark:text-slate-300 hover:text-emerald-500 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-white/[0.04] transition"
                >
                  // ТЕРМИНАЛ
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

              <ThemeToggle />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 container mx-auto px-4 py-8 relative">
          {children}
        </main>

        {/* Engineering Precision Footer */}
        <footer className="border-t border-slate-200/80 dark:border-white/[0.08] bg-white/60 dark:bg-[#050608] py-8 text-xs font-mono text-slate-500 transition-colors">
          <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 dark:text-white">MDRN.3D</span>
              <span className="text-slate-400">— Инженерная распределенная сеть аддитивного производства</span>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-slate-400">
              <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="w-3.5 h-3.5" /> Escrow Smart Contract
              </span>
              <span>•</span>
              <span>Three.js Engine</span>
              <span>•</span>
              <span>PostgreSQL Neon</span>
              <span>•</span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[10px]">
                SYS: ONLINE
              </span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  )
}
