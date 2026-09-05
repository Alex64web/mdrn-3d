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
  Sparkles,
  Cpu,
  Compass,
  Zap,
  Activity,
  Award
} from 'lucide-react'

export default function Home() {
  return (
    <div className="flex flex-col gap-16 py-4">
      {/* 1. HERO SECTION: HIGH-TECH HUD */}
      <section className="relative overflow-hidden py-20 px-6 md:px-14 rounded-3xl glass-panel hud-grid border border-white/[0.08] dark:border-white/[0.08] transition-all shadow-hud-card">
        {/* Ambient background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 dark:bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center text-center max-w-4xl mx-auto gap-7">
          {/* Status Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 dark:bg-emerald-950/40 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-mono font-semibold tracking-wider">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span>NETWORK LIVE // 142 PRINT NODES</span>
          </div>

          {/* Gradient Headline */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.1]">
            Локальная 3D-печать <br className="hidden sm:block" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400">
              по требованию
            </span>
          </h1>

          <p className="text-slate-600 dark:text-slate-300 text-base md:text-xl max-w-2xl leading-relaxed font-normal">
            Распределенная сеть сертифицированных 3D-мейкеров. Заказывайте печать цифровых моделей без фабричных наценок, 
            получайте прямые предложения мастеров и оплачивайте безопасно через Escrow.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 mt-3 w-full sm:w-auto">
            <Link
              href="/catalog"
              className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-sm rounded-2xl transition shadow-glow-emerald flex items-center justify-center gap-2 group"
            >
              <span>Каталог 3D-моделей</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            
            <Link
              href="/login?tab=register"
              className="px-8 py-4 glass-panel hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold text-sm rounded-2xl transition border border-slate-300 dark:border-white/10 flex items-center justify-center gap-2"
            >
              <Printer className="w-4 h-4 text-emerald-500" />
              <span>Стать мастером печати</span>
            </Link>
          </div>

          {/* Live Telemetry Ticker */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full pt-8 mt-6 border-t border-slate-200/80 dark:border-white/[0.06] text-left">
            <div className="flex flex-col gap-0.5 p-3 rounded-xl bg-slate-100/50 dark:bg-slate-900/40 border border-slate-200/50 dark:border-white/[0.04]">
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500 dark:text-slate-400">Фермы онлайн</span>
              <span className="text-lg font-bold font-mono text-slate-900 dark:text-emerald-400">142 Узла</span>
            </div>
            <div className="flex flex-col gap-0.5 p-3 rounded-xl bg-slate-100/50 dark:bg-slate-900/40 border border-slate-200/50 dark:border-white/[0.04]">
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500 dark:text-slate-400">Допуск точности</span>
              <span className="text-lg font-bold font-mono text-slate-900 dark:text-cyan-400">±0.05 мм</span>
            </div>
            <div className="flex flex-col gap-0.5 p-3 rounded-xl bg-slate-100/50 dark:bg-slate-900/40 border border-slate-200/50 dark:border-white/[0.04]">
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500 dark:text-slate-400">Escrow Pool</span>
              <span className="text-lg font-bold font-mono text-slate-900 dark:text-emerald-400">100% Защита</span>
            </div>
            <div className="flex flex-col gap-0.5 p-3 rounded-xl bg-slate-100/50 dark:bg-slate-900/40 border border-slate-200/50 dark:border-white/[0.04]">
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500 dark:text-slate-400">Первый отклик</span>
              <span className="text-lg font-bold font-mono text-slate-900 dark:text-white">~12 мин</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. BENTO GRID: HOW IT WORKS & CAPABILITIES */}
      <section className="flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-500 font-semibold uppercase tracking-wider">
            <Activity className="w-4 h-4" />
            <span>Инженерная архитектура</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Как устроена распределенная экосистема
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Bento Card 1: 3D Configurator */}
          <div className="md:col-span-2 glass-panel p-8 rounded-3xl border border-slate-200/80 dark:border-white/[0.08] relative overflow-hidden flex flex-col justify-between gap-8 group hover:border-emerald-500/40 transition-all">
            <div className="flex flex-col gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/20">
                <Box className="w-6 h-6 stroke-[2]" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Интерактивный 3D-Вьювер и Конфигуратор
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm max-w-xl leading-relaxed">
                Загружайте и осматривайте детали прямо в браузере в масштабе 1:1. Выбирайте полимеры (PLA, PETG, ABS, TPU), 
                процент заполнения и высоту слоя. Платформа мгновенно рассчитывает объем и ориентировочный расход филамента.
              </p>
            </div>

            {/* Visual HUD Simulation */}
            <div className="p-4 rounded-2xl bg-slate-100 dark:bg-[#07090e] border border-slate-200 dark:border-white/[0.06] flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-4 text-slate-600 dark:text-slate-400">
                <span>BED: 256×256 MM</span>
                <span className="hidden sm:inline">NOZZLE: 0.4 MM</span>
                <span className="text-emerald-500">PEI // ACTIVE</span>
              </div>
              <span className="text-slate-900 dark:text-white font-bold">100% BROWSER WEBGL</span>
            </div>
          </div>

          {/* Bento Card 2: Maker Auction */}
          <div className="glass-panel p-8 rounded-3xl border border-slate-200/80 dark:border-white/[0.08] flex flex-col justify-between gap-6 hover:border-cyan-500/40 transition-all">
            <div className="flex flex-col gap-3">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center border border-cyan-500/20">
                <Zap className="w-6 h-6 stroke-[2]" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Аукцион мастеров
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                Вы публикуете заявку бесплатно (0 ₽). Мастера предлагают реальные цены без наценок агентств.
              </p>
            </div>

            {/* Offer preview badge */}
            <div className="p-3.5 rounded-2xl bg-cyan-950/20 border border-cyan-800/30 flex flex-col gap-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Bambu Lab P1S</span>
                <span className="font-mono text-emerald-400 font-bold">580 ₽</span>
              </div>
              <span className="text-[11px] text-slate-500">Срок: 1 день • Рейтинг 5.0 ★</span>
            </div>
          </div>

          {/* Bento Card 3: Escrow & QC */}
          <div className="glass-panel p-8 rounded-3xl border border-slate-200/80 dark:border-white/[0.08] flex flex-col justify-between gap-6 hover:border-emerald-500/40 transition-all">
            <div className="flex flex-col gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/20">
                <ShieldCheck className="w-6 h-6 stroke-[2]" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Смарт-Escrow и QC
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                Деньги замораживаются на депозите платформы и перечисляются мастеру только после проверки качества изделия и подтверждения доставки.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono text-emerald-600 dark:text-emerald-400">
              <CheckCircle className="w-4 h-4" />
              <span>100% ФИНАНСОВАЯ ГАРАНТИЯ</span>
            </div>
          </div>

          {/* Bento Card 4: Creator Royalties */}
          <div className="md:col-span-2 glass-panel p-8 rounded-3xl border border-slate-200/80 dark:border-white/[0.08] flex flex-col justify-between gap-6 hover:border-purple-500/40 transition-all">
            <div className="flex flex-col gap-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20">
                <Award className="w-6 h-6 stroke-[2]" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Защита авторских прав и роялти дизайнеров
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm max-w-xl leading-relaxed">
                Каждый 3D-моделлер самостоятельно определяет стоимость цифровой лицензии в рублях. При каждом подтвержденном заказе автор автоматически получает фиксированное вознаграждение на свой баланс.
              </p>
            </div>

            <div className="flex items-center gap-4">
              <Link 
                href="/catalog" 
                className="text-xs font-bold text-purple-600 dark:text-purple-400 flex items-center gap-1.5 hover:gap-2 transition-all"
              >
                <span>Перейти в витрину авторских моделей</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3. ROLES OVERVIEW */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Role 1: Client */}
        <div className="glass-panel p-8 rounded-3xl border border-slate-200/80 dark:border-white/[0.08] flex flex-col justify-between gap-6">
          <div className="flex flex-col gap-3">
            <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-500 font-semibold">Роль 01 // Клиент</span>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Заказ 3D-печати</h3>
            <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">
              Выбирайте готовые проверенные модели или настраивайте свои параметры. Сравнивайте предложения мейкеров по рейтингу, отзывам и близости.
            </p>
          </div>
          <Link
            href="/catalog"
            className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 hover:gap-2 transition-all"
          >
            <span>В каталог</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Role 2: Designer */}
        <div className="glass-panel p-8 rounded-3xl border border-slate-200/80 dark:border-white/[0.08] flex flex-col justify-between gap-6">
          <div className="flex flex-col gap-3">
            <span className="text-[11px] font-mono uppercase tracking-wider text-purple-400 font-semibold">Роль 02 // Автор</span>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Монетизация 3D-моделей</h3>
            <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">
              Загружайте STL-файлы, назначайте свою фиксированную цену за печать и получайте пассивный доход от печати ваших моделей по всей стране.
            </p>
          </div>
          <Link
            href="/dashboard"
            className="text-xs font-semibold text-purple-600 dark:text-purple-400 flex items-center gap-1 hover:gap-2 transition-all"
          >
            <span>Кабинет автора</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Role 3: Maker */}
        <div className="glass-panel p-8 rounded-3xl border border-slate-200/80 dark:border-white/[0.08] flex flex-col justify-between gap-6">
          <div className="flex flex-col gap-3">
            <span className="text-[11px] font-mono uppercase tracking-wider text-cyan-400 font-semibold">Роль 03 // Мейкер</span>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Загрузка оборудования</h3>
            <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">
              Подключайте свои 3D-принтеры к общей сети. Просматривайте открытые заявки в своем городе, сами назначайте цену и получайте гарантированную оплату.
            </p>
          </div>
          <Link
            href="/dashboard"
            className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 flex items-center gap-1 hover:gap-2 transition-all"
          >
            <span>Лента заявок</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </section>
    </div>
  )
}