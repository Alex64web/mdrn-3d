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
    <div className="min-h-[75vh] flex items-center justify-center py-6">
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl p-8 md:p-10 transition-colors">
        {/* Header */}
        <div className="text-center flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-orange-500 text-white flex items-center justify-center mb-3 shadow-md shadow-orange-500/20">
            <Box className="w-6 h-6 stroke-[2.2]" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            {activeTab === 'login' ? 'Вход в MDRN 3D' : 'Создание аккаунта'}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {activeTab === 'login' 
              ? 'Войдите в свой личный кабинет платформы 3D-печати' 
              : 'Присоединяйтесь как заказчик, автор моделей или владелец 3D-принтера'}
          </p>
        </div>

        {/* Tab switch */}
        <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl mb-8">
          <button
            type="button"
            onClick={() => { setActiveTab('login'); setError(null); }}
            className={`py-2.5 text-sm font-semibold rounded-xl transition ${
              activeTab === 'login'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            Войти
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('register'); setError(null); }}
            className={`py-2.5 text-sm font-semibold rounded-xl transition ${
              activeTab === 'register'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            Регистрация
          </button>
        </div>

        {/* Error notification */}
        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-start gap-3 text-rose-700 dark:text-rose-400 text-xs leading-relaxed animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        {activeTab === 'login' ? (
          <form onSubmit={handleLogin} className="flex flex-col gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="alex@example.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Пароль
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-3 w-full py-3.5 bg-orange-500 hover:bg-orange-600 active:scale-[0.99] text-white font-bold text-sm rounded-2xl shadow-md shadow-orange-500/20 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? 'Вход в аккаунт...' : 'Войти в личный кабинет'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          /* Register Form */
          <form onSubmit={handleRegister} className="flex flex-col gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Ваше имя или псевдоним
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="Алексей Смирнов"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="alex@example.com"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Пароль (от 4 символов)
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
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition"
                />
              </div>
            </div>

            {/* Role selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Выберите вашу роль в платформе
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Client */}
                <button
                  type="button"
                  onClick={() => setRegRole('CLIENT')}
                  className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition ${
                    regRole === 'CLIENT'
                      ? 'border-orange-500 bg-orange-50/50 dark:bg-orange-950/20 text-slate-900 dark:text-white ring-2 ring-orange-500/20'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <User className={`w-5 h-5 ${regRole === 'CLIENT' ? 'text-orange-500' : 'text-slate-400'}`} />
                    {regRole === 'CLIENT' && <CheckCircle2 className="w-4 h-4 text-orange-500" />}
                  </div>
                  <div>
                    <span className="font-bold text-xs block text-slate-900 dark:text-white">Клиент</span>
                    <span className="text-[11px] text-slate-500 leading-tight block mt-0.5">Заказ печати и выбор мастеров</span>
                  </div>
                </button>

                {/* Designer */}
                <button
                  type="button"
                  onClick={() => setRegRole('DESIGNER')}
                  className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition ${
                    regRole === 'DESIGNER'
                      ? 'border-purple-500 bg-purple-50/50 dark:bg-purple-950/20 text-slate-900 dark:text-white ring-2 ring-purple-500/20'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Palette className={`w-5 h-5 ${regRole === 'DESIGNER' ? 'text-purple-500' : 'text-slate-400'}`} />
                    {regRole === 'DESIGNER' && <CheckCircle2 className="w-4 h-4 text-purple-500" />}
                  </div>
                  <div>
                    <span className="font-bold text-xs block text-slate-900 dark:text-white">Дизайнер</span>
                    <span className="text-[11px] text-slate-500 leading-tight block mt-0.5">Публикация моделей и роялти</span>
                  </div>
                </button>

                {/* Maker */}
                <button
                  type="button"
                  onClick={() => setRegRole('MAKER')}
                  className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition ${
                    regRole === 'MAKER'
                      ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 text-slate-900 dark:text-white ring-2 ring-emerald-500/20'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Printer className={`w-5 h-5 ${regRole === 'MAKER' ? 'text-emerald-500' : 'text-slate-400'}`} />
                    {regRole === 'MAKER' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                  </div>
                  <div>
                    <span className="font-bold text-xs block text-slate-900 dark:text-white">Мастер</span>
                    <span className="text-[11px] text-slate-500 leading-tight block mt-0.5">Печать на 3D-принтерах и торги</span>
                  </div>
                </button>
              </div>
            </div>

            {/* If Maker: extra equipment info */}
            {regRole === 'MAKER' && (
              <div className="p-4 bg-emerald-50/60 dark:bg-emerald-950/20 rounded-2xl border border-emerald-200/80 dark:border-emerald-900/40 flex flex-col gap-4 animate-in fade-in duration-200">
                <span className="text-xs font-bold text-emerald-800 dark:text-emerald-400">
                  Параметры вашего 3D-оборудования
                </span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Модель принтера
                    </label>
                    <input
                      type="text"
                      required
                      value={printerName}
                      onChange={(e) => setPrinterName(e.target.value)}
                      placeholder="Bambu Lab P1S"
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Город / Локация
                    </label>
                    <input
                      type="text"
                      required
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Москва"
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-0.5">X (мм)</label>
                    <input
                      type="number"
                      value={bedSizeX}
                      onChange={(e) => setBedSizeX(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-0.5">Y (мм)</label>
                    <input
                      type="number"
                      value={bedSizeY}
                      onChange={(e) => setBedSizeY(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-0.5">Z (мм)</label>
                    <input
                      type="number"
                      value={bedSizeZ}
                      onChange={(e) => setBedSizeZ(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Поддерживаемые пластики
                  </label>
                  <input
                    type="text"
                    value={materials}
                    onChange={(e) => setMaterials(e.target.value)}
                    placeholder="PLA, PETG, ABS, TPU"
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-3 w-full py-3.5 bg-orange-500 hover:bg-orange-600 active:scale-[0.99] text-white font-bold text-sm rounded-2xl shadow-md shadow-orange-500/20 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? 'Создание аккаунта...' : 'Зарегистрироваться и войти'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Footnote */}
        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800/80 text-center">
          <Link href="/" className="text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white transition">
            ← Вернуться на главную страницу
          </Link>
        </div>
      </div>
    </div>
  )
}