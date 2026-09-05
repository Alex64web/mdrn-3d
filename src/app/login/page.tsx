'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { registerUser, loginUser } from '@/app/actions'
import { Box, User, Palette, Printer, ArrowRight, Lock, Mail, AlertCircle, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const defaultTab = searchParams.get('tab') === 'register' ? 'register' : 'login'

  const [activeTab, setActiveTab] = useState<'login' | 'register'>(defaultTab)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Login fields
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  // Register fields
  const [regName, setRegName] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [regRole, setRegRole] = useState<'CLIENT' | 'DESIGNER' | 'MAKER'>('CLIENT')

  // Maker-specific fields
  const [printerName, setPrinterName] = useState('Bambu Lab P1S')
  const [bedSizeX, setBedSizeX] = useState(256)
  const [bedSizeY, setBedSizeY] = useState(256)
  const [bedSizeZ, setBedSizeZ] = useState(256)
  const [materials, setMaterials] = useState('PLA, PETG, ABS')
  const [colors, setColors] = useState('Черный, Белый, Оранжевый')
  const [location, setLocation] = useState('Москва')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const res = await loginUser({
        email: loginEmail,
        password: loginPassword
      })

      if (!res.success) {
        setError(res.error || 'Ошибка входа')
      } else {
        const callback = searchParams.get('callback') || '/dashboard'
        router.push(callback)
        router.refresh()
      }
    } catch (err: any) {
      setError(err.message || 'Произошла непредвиденная ошибка')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const res = await registerUser({
        name: regName,
        email: regEmail,
        password: regPassword,
        role: regRole,
        printerName,
        bedSizeX: Number(bedSizeX),
        bedSizeY: Number(bedSizeY),
        bedSizeZ: Number(bedSizeZ),
        materials,
        colors,
        location
      })

      if (!res.success) {
        setError(res.error || 'Ошибка регистрации')
      } else {
        const callback = searchParams.get('callback') || '/dashboard'
        router.push(callback)
        router.refresh()
      }
    } catch (err: any) {
      setError(err.message || 'Произошла непредвиденная ошибка')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[75vh] flex items-center justify-center py-8">
      <div className="w-full max-w-xl glass-panel rounded-3xl border border-slate-200/80 dark:border-white/[0.08] shadow-hud-card p-8 md:p-10 transition-colors relative overflow-hidden">
        {/* Header */}
        <div className="text-center flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-slate-950 flex items-center justify-center mb-3 shadow-glow-emerald">
            <Box className="w-6 h-6 stroke-[2.3]" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {activeTab === 'login' ? 'Авторизация в терминале' : 'Регистрация оператора'}
          </h1>
          <p className="text-xs font-mono text-slate-500 dark:text-slate-400 mt-1">
            {activeTab === 'login' 
              ? '// Доступ к распределенной сети производства MDRN.3D' 
              : '// Подключение к сети: Заказчик / CAD-Дизайнер / Мейкер'}
          </p>
        </div>

        {/* Tab switch */}
        <div className="grid grid-cols-2 p-1.5 glass-panel rounded-2xl mb-8 border border-slate-200 dark:border-white/[0.06]">
          <button
            type="button"
            onClick={() => { setActiveTab('login'); setError(null); }}
            className={`py-2 text-xs font-mono font-bold rounded-xl transition ${
              activeTab === 'login'
                ? 'bg-emerald-500 text-slate-950 shadow-glow-emerald'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            // ВХОД
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('register'); setError(null); }}
            className={`py-2 text-xs font-mono font-bold rounded-xl transition ${
              activeTab === 'register'
                ? 'bg-emerald-500 text-slate-950 shadow-glow-emerald'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            // РЕГИСТРАЦИЯ
          </button>
        </div>

        {/* Error notification */}
        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3 text-rose-600 dark:text-rose-400 text-xs font-mono leading-relaxed">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        {activeTab === 'login' ? (
          <form onSubmit={handleLogin} className="flex flex-col gap-5">
            <div>
              <label className="block text-[11px] font-mono font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                СИСТЕМНЫЙ EMAIL
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="operator@mdrn-3d.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-[#07090e] border border-slate-200 dark:border-white/[0.08] rounded-2xl text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500/60 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                ПАРОЛЬ ДОСТУПА
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-[#07090e] border border-slate-200 dark:border-white/[0.08] rounded-2xl text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500/60 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-3 w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 active:scale-[0.99] text-slate-950 font-mono font-bold text-xs rounded-2xl shadow-glow-emerald transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'ПРОВЕРКА КЛЮЧЕЙ ДОСТУПА...' : 'ВОЙТИ В ТЕРМИНАЛ'}
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </form>
        ) : (
          /* Register Form */
          <form onSubmit={handleRegister} className="flex flex-col gap-5">
            <div>
              <label className="block text-[11px] font-mono font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                ПОЗЫВНОЙ / ИМЯ ОПЕРАТОРА
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="Алексей Смирнов"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-[#07090e] border border-slate-200 dark:border-white/[0.08] rounded-2xl text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500/60 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                СИСТЕМНЫЙ EMAIL
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="operator@mdrn-3d.com"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-[#07090e] border border-slate-200 dark:border-white/[0.08] rounded-2xl text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500/60 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                ПАРОЛЬ ДОСТУПА (ОТ 4 СИМВОЛОВ)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="password"
                  required
                  minLength={4}
                  placeholder="••••••••"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-[#07090e] border border-slate-200 dark:border-white/[0.08] rounded-2xl text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500/60 transition"
                />
              </div>
            </div>

            {/* Role selection */}
            <div>
              <label className="block text-[11px] font-mono font-semibold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">
                ВЫБОР РОЛИ В ЭКОСИСТЕМЕ
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono">
                {/* Client */}
                <button
                  type="button"
                  onClick={() => setRegRole('CLIENT')}
                  className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition ${
                    regRole === 'CLIENT'
                      ? 'border-emerald-500 bg-emerald-500/10 text-slate-900 dark:text-white shadow-glow-emerald'
                      : 'border-slate-200 dark:border-white/[0.08] hover:border-slate-300 dark:hover:border-white/[0.15] text-slate-500'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <User className={`w-5 h-5 ${regRole === 'CLIENT' ? 'text-emerald-500' : 'text-slate-400'}`} />
                    {regRole === 'CLIENT' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                  </div>
                  <div>
                    <span className="font-bold text-xs block text-slate-900 dark:text-white">[CLIENT]</span>
                    <span className="text-[10px] text-slate-400 leading-tight block mt-0.5">Заказ изделий и аукцион</span>
                  </div>
                </button>

                {/* Designer */}
                <button
                  type="button"
                  onClick={() => setRegRole('DESIGNER')}
                  className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition ${
                    regRole === 'DESIGNER'
                      ? 'border-cyan-400 bg-cyan-500/10 text-slate-900 dark:text-white shadow-glow-cyan'
                      : 'border-slate-200 dark:border-white/[0.08] hover:border-slate-300 dark:hover:border-white/[0.15] text-slate-500'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Palette className={`w-5 h-5 ${regRole === 'DESIGNER' ? 'text-cyan-400' : 'text-slate-400'}`} />
                    {regRole === 'DESIGNER' && <CheckCircle2 className="w-4 h-4 text-cyan-400" />}
                  </div>
                  <div>
                    <span className="font-bold text-xs block text-slate-900 dark:text-white">[DESIGNER]</span>
                    <span className="text-[10px] text-slate-400 leading-tight block mt-0.5">CAD-модели и роялти</span>
                  </div>
                </button>

                {/* Maker */}
                <button
                  type="button"
                  onClick={() => setRegRole('MAKER')}
                  className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition ${
                    regRole === 'MAKER'
                      ? 'border-emerald-500 bg-emerald-500/10 text-slate-900 dark:text-white shadow-glow-emerald'
                      : 'border-slate-200 dark:border-white/[0.08] hover:border-slate-300 dark:hover:border-white/[0.15] text-slate-500'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Printer className={`w-5 h-5 ${regRole === 'MAKER' ? 'text-emerald-500' : 'text-slate-400'}`} />
                    {regRole === 'MAKER' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                  </div>
                  <div>
                    <span className="font-bold text-xs block text-slate-900 dark:text-white">[MAKER]</span>
                    <span className="text-[10px] text-slate-400 leading-tight block mt-0.5">Парк принтеров и ставки</span>
                  </div>
                </button>
              </div>
            </div>

            {/* If Maker: extra equipment info */}
            {regRole === 'MAKER' && (
              <div className="p-4.5 glass-panel rounded-2xl border border-emerald-500/30 flex flex-col gap-4 animate-in fade-in duration-200 font-mono">
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                  // ПАРАМЕТРЫ ПРИНТЕРА МЕЙКЕРА
                </span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1 uppercase">
                      Модель принтера
                    </label>
                    <input
                      type="text"
                      required
                      value={printerName}
                      onChange={(e) => setPrinterName(e.target.value)}
                      placeholder="Bambu Lab P1S"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-[#07090e] border border-slate-200 dark:border-white/[0.08] rounded-xl text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1 uppercase">
                      Город / Локация
                    </label>
                    <input
                      type="text"
                      required
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Москва"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-[#07090e] border border-slate-200 dark:border-white/[0.08] rounded-xl text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-0.5">X (мм)</label>
                    <input
                      type="number"
                      value={bedSizeX}
                      onChange={(e) => setBedSizeX(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-[#07090e] border border-slate-200 dark:border-white/[0.08] rounded-xl text-xs text-slate-900 dark:text-white text-center"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-0.5">Y (мм)</label>
                    <input
                      type="number"
                      value={bedSizeY}
                      onChange={(e) => setBedSizeY(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-[#07090e] border border-slate-200 dark:border-white/[0.08] rounded-xl text-xs text-slate-900 dark:text-white text-center"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-0.5">Z (мм)</label>
                    <input
                      type="number"
                      value={bedSizeZ}
                      onChange={(e) => setBedSizeZ(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-[#07090e] border border-slate-200 dark:border-white/[0.08] rounded-xl text-xs text-slate-900 dark:text-white text-center"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 mb-1 uppercase">
                    Материалы в наличии
                  </label>
                  <input
                    type="text"
                    value={materials}
                    onChange={(e) => setMaterials(e.target.value)}
                    placeholder="PLA, PETG, ABS, TPU"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#07090e] border border-slate-200 dark:border-white/[0.08] rounded-xl text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-3 w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 active:scale-[0.99] text-slate-950 font-mono font-bold text-xs rounded-2xl shadow-glow-emerald transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'СОЗДАНИЕ АККАУНТА...' : 'ЗАРЕГИСТРИРОВАТЬСЯ В СЕТИ'}
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </form>
        )}

        {/* Footnote */}
        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-white/[0.06] text-center font-mono">
          <Link href="/" className="text-xs text-slate-500 hover:text-emerald-500 dark:hover:text-emerald-400 transition">
            ← // ВЕРНУТЬСЯ НА ГЛАВНУЮ
          </Link>
        </div>
      </div>
    </div>
  )
}