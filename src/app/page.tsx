import Link from 'next/link'
import { 
  Box, 
  Layers, 
  ShieldCheck, 
  ArrowRight, 
  Users, 
  CheckCircle,
  FileCheck,
  Coins,
  Printer,
  Sparkles
} from 'lucide-react'

export default function Home() {
  return (
    <div className="flex flex-col gap-16 py-4">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden py-16 px-6 md:px-12 bg-white dark:bg-slate-900/60 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto gap-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-50 dark:bg-orange-950/60 border border-orange-200 dark:border-orange-800/60 rounded-full text-xs font-semibold text-orange-600 dark:text-orange-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Аукцион мастеров и честные цены от авторов</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15]">
            3D-печать на заказ по{' '}
            <span className="text-orange-500">
              лучшей цене мастеров
            </span>
          </h1>

          <p className="text-slate-600 dark:text-slate-400 text-base md:text-lg max-w-2xl leading-relaxed">
            Выбирайте модели из каталога с фиксированной ценой автора, отправляйте бесплатную заявку 
            и выбирайте самое выгодное предложение по цене и срокам от мастеров вашего региона.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 mt-2 w-full sm:w-auto">
            <Link
              href="/catalog"
              className="px-8 py-3.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm rounded-2xl transition flex items-center justify-center gap-2 shadow-sm"
            >
              <span>Каталог 3D-моделей</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            
            <Link
              href="/dashboard"
              className="px-8 py-3.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-200 font-semibold text-sm rounded-2xl transition border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-2"
            >
              <span>Панель управления</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 2. HOW IT WORKS: 4 SIMPLE STEPS */}
      <section className="flex flex-col gap-8">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Как работает заказ и ценообразование
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">
            Прозрачная модель: автор получает свою фиксированную цену за CAD-модель, а мастера соревнуются за лучшую стоимость печати.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Step 1 */}
          <div className="p-6 bg-white dark:bg-slate-900/40 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col gap-3 shadow-sm">
            <div className="w-9 h-9 rounded-xl bg-orange-50 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 flex items-center justify-center font-bold text-sm">
              1
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Цена от дизайнера</h3>
            <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">
              Дизайнер публикует модель и сам указывает фиксированную стоимость своей работы (например, 350 ₽).
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-6 bg-white dark:bg-slate-900/40 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col gap-3 shadow-sm">
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm">
              2
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Заявка на печать</h3>
            <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">
              Вы настраиваете цвет, пластик (PLA, PETG, ABS, TPU) и отправляете бесплатную заявку в систему.
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-6 bg-white dark:bg-slate-900/40 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col gap-3 shadow-sm">
            <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-sm">
              3
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Цены от мастеров</h3>
            <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">
              Мейкеры оценивают заказ и присылают свои индивидуальные предложения со стоимостью и сроками изготовления.
            </p>
          </div>

          {/* Step 4 */}
          <div className="p-6 bg-white dark:bg-slate-900/40 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col gap-3 shadow-sm">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-sm">
              4
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Выбор и Escrow</h3>
            <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">
              Вы соглашаетесь на лучшее предложение. Деньги замораживаются в Escrow и выплачиваются только после доставки.
            </p>
          </div>
        </div>
      </section>

      {/* 3. ROLES OVERVIEW */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="p-8 bg-white dark:bg-slate-900/40 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between gap-6 shadow-sm">
          <div className="flex flex-col gap-3">
            <div className="w-11 h-11 rounded-2xl bg-orange-100 text-orange-600 dark:bg-orange-950/80 dark:text-orange-400 flex items-center justify-center">
              <Box className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Для Клиентов</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
              Заказывайте печать без переплат. Получайте несколько предложений от ближайших мейкеров и выбирайте мастера с лучшим рейтингом и ценой.
            </p>
          </div>
          <Link
            href="/catalog"
            className="text-orange-600 dark:text-orange-400 font-semibold text-sm flex items-center gap-1.5 hover:gap-2 transition-all"
          >
            Выбрать 3D-модель <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="p-8 bg-white dark:bg-slate-900/40 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between gap-6 shadow-sm">
          <div className="flex flex-col gap-3">
            <div className="w-11 h-11 rounded-2xl bg-purple-100 text-purple-600 dark:bg-purple-950/80 dark:text-purple-400 flex items-center justify-center">
              <Coins className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Для Дизайнеров</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
              Назначайте свою цену в рублях за каждую модель. Зарабатывайте с каждой физической печати вашего дизайна в любом городе.
            </p>
          </div>
          <Link
            href="/dashboard"
            className="text-purple-600 dark:text-purple-400 font-semibold text-sm flex items-center gap-1.5 hover:gap-2 transition-all"
          >
            Кабинет автора <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="p-8 bg-white dark:bg-slate-900/40 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between gap-6 shadow-sm">
          <div className="flex flex-col gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950/80 dark:text-emerald-400 flex items-center justify-center">
              <Printer className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Для Мастеров печати</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
              Загружайте профиль своего оборудования, просматривайте заявки и сами устанавливайте стоимость своей работы.
            </p>
          </div>
          <Link
            href="/dashboard"
            className="text-emerald-600 dark:text-emerald-400 font-semibold text-sm flex items-center gap-1.5 hover:gap-2 transition-all"
          >
            Лента заказов мейкера <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  )
}
