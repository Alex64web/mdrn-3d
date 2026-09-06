'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  ChevronLeft, 
  ChevronRight, 
  Maximize2, 
  Clock, 
  FileText, 
  ExternalLink,
  Printer,
  Sparkles,
  ShieldCheck,
  Zap,
  TrendingUp,
  Cpu,
  Layers
} from 'lucide-react'

const speakerNotes: Record<number, string> = {
  1: "«Добрый день, уважаемые эксперты и жюри! Меня зовут [Ваше Имя], проект MDRN 3D. Мы создаем распределенную фабрику аддитивного производства — Uber для 3D-печати. Сегодня сотни тысяч 3D-принтеров стоят без дела, а бизнесу и клиентам нужны детали быстро и без бюрократии. MDRN 3D объединяет заказчиков, мейкеров и 3D-дизайнеров на единой платформе с мгновенным 3D-расчетом и 100% Escrow-гарантией. Наш продукт уже работает в продакшене!»",
  2: "«Рынок 3D-печати сломан для всех сторон. Клиенты: купить принтер — дорого и сложно, а студии считают КП по 2 дня с дикой наценкой. Владельцы принтеров: более 70% времени станки простаивают без заказов. Дизайнеры: модели пиратят на форумах, автор не получает ни рубля с физических копий. Мы устраняем этот разрыв цифровой платформой.»",
  3: "«Как работает MDRN 3D: 1. Клиент за 2 секунды получает 3D-рендеринг и точный расчет веса прямо в браузере. 2. Заявка отправляется на биржу, где мейкеры соревнуются в аукционе, снижая цену клиенту до 40%. 3. Деньги замораживаются в Escrow, мастер обязан прикрепить фотоотчет и вес детали перед отправкой. А дизайнеры получают процент с каждого напечатанного изделия!»",
  4: "«Рынок аддитивного производства растет на 22% в год и к 2030 году превысит 50 миллиардов долларов. В РФ объем рынка запчастей и прототипов — 45 млрд рублей. Из-за санкций возник острый дефицит деталей. Появились надежные скоростные принтеры Bambu Lab. Наш ответ — локальная печать нужной детали за 24 часа без гигантских складов.»",
  5: "«Бизнес-модель масштабируема: мы не покупаем станки. Зарабатываем 15–20% Take Rate со сделок, 10% с роялти и B2B PRO-подписки для ферм. Средний чек — 1 800 ₽, доход платформы — 300 ₽. CAC — 450 ₽, LTV — 2 100 ₽. Соотношение LTV к CAC превышает 4.6x — отличная экономика уже на старте!»",
  6: "«Мы пришли не с идеей, а с готовым продуктом на Next.js и Neon PostgreSQL с 3D-движком. За 12 месяцев подключим 500 узлов печати в 15 городах и запустим B2B-кабинет. Привлекаем 3.5 миллиона рублей инвестиций или гранта на масштабирование. Демо доступно прямо сейчас на mdrn-3d.vercel.app. Спасибо за внимание, готов к вопросам!»"
}

export default function PitchDeckPage() {
  const [currentSlide, setCurrentSlide] = useState(1)
  const totalSlides = 6
  const [showNotes, setShowNotes] = useState(true)
  const [timerSeconds, setTimerSeconds] = useState(0)
  const [timerRunning, setTimerRunning] = useState(false)

  // Timer
  useEffect(() => {
    let interval: any = null
    if (timerRunning) {
      interval = setInterval(() => {
        setTimerSeconds(s => s + 1)
      }, 1000)
    } else {
      clearInterval(interval)
    }
    return () => clearInterval(interval)
  }, [timerRunning])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
        setCurrentSlide(curr => Math.min(curr + 1, totalSlides))
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        setCurrentSlide(curr => Math.max(curr - 1, 1))
      } else if (e.key.toLowerCase() === 'n' || e.key.toLowerCase() === 'т') {
        setShowNotes(v => !v)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [totalSlides])

  const formatTime = (totalSec: number) => {
    const m = String(Math.floor(totalSec / 60)).padStart(2, '0')
    const s = String(totalSec % 60).padStart(2, '0')
    return `${m}:${s}`
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {})
    } else {
      if (document.exitFullscreen) document.exitFullscreen()
    }
  }

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col justify-between -mt-6 -mx-4 sm:-mx-6 lg:-mx-8 p-4 sm:p-8 hud-grid select-none">
      
      {/* Top Telemetry & Controls */}
      <div className="border border-white/10 glass-panel rounded-2xl p-4 mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
          <span className="font-mono text-xs font-bold text-emerald-400 tracking-wider">
            MDRN 3D // STARTUP PITCH DECK
          </span>
          <span className="text-xs text-slate-500 hidden sm:inline">• ЧЕМПИОНАТ СТАРТАПОВ 2026</span>
        </div>

        <div className="flex items-center gap-3">
          {/* Timer */}
          <div className="flex items-center gap-2 bg-slate-900/90 border border-white/10 px-3 py-1 rounded-xl text-xs font-mono">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-slate-400">ТАЙМЕР:</span>
            <span className="text-amber-400 font-bold">{formatTime(timerSeconds)}</span>
            <button
              onClick={() => setTimerRunning(!timerRunning)}
              className={`text-[10px] px-2 py-0.5 rounded font-bold transition ${
                timerRunning ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              }`}
            >
              {timerRunning ? 'СТОП' : 'СТАРТ'}
            </button>
          </div>

          {/* Notes toggle */}
          <button
            onClick={() => setShowNotes(!showNotes)}
            className={`px-3 py-1 rounded-xl text-xs font-mono border transition flex items-center gap-1.5 ${
              showNotes ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' : 'bg-slate-900 border-white/10 text-slate-400'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Шпаргалка (N)</span>
          </button>

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            className="px-3 py-1 rounded-xl text-xs font-mono bg-slate-900 border border-white/10 text-slate-300 hover:bg-slate-800 transition hidden sm:flex items-center gap-1"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>F11</span>
          </button>

          <Link
            href="/dashboard"
            className="px-3 py-1 rounded-xl text-xs font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 transition flex items-center gap-1"
          >
            <span>В сервис</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Slide Area */}
      <div className="flex-1 flex items-center justify-center max-w-6xl mx-auto w-full my-4">
        {/* SLIDE 1 */}
        {currentSlide === 1 && (
          <div className="w-full flex flex-col gap-6 animate-fadeIn">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono w-fit">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              PITCH DECK // СТАРТАП-ЧЕМПИОНАТ 2026
            </div>
            <h1 className="text-5xl sm:text-7xl font-black tracking-tight text-white">
              MDRN <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500">3D</span>
            </h1>
            <p className="text-xl sm:text-2xl font-semibold text-cyan-400">
              Распределенная фабрика 3D-печати по требованию
            </p>

            <div className="glass-panel p-6 rounded-2xl border border-white/10 shadow-glow-cyan">
              <p className="text-base sm:text-lg text-slate-200 italic font-medium leading-relaxed">
                «Uber для 3D-печати: превращаем тысячи простаивающих 3D-принтеров по всей стране в единую умную фабрику. От загрузки 3D-файла до готового физического изделия у вашей двери за 24 часа без покупки дорогого оборудования».
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2">
              <div className="glass-panel p-4 rounded-xl border-l-4 border-l-emerald-500">
                <span className="text-xs font-mono text-emerald-400 font-bold block mb-1">РАБОТАЮЩИЙ ПРОДУКТ</span>
                <p className="text-xs text-slate-300">Сервис развернут онлайн на mdrn-3d.vercel.app. Браузерный 3D-движок, биржа и Escrow.</p>
              </div>
              <div className="glass-panel p-4 rounded-xl border-l-4 border-l-cyan-500">
                <span className="text-xs font-mono text-cyan-400 font-bold block mb-1">ZERO CAPEX МОДЕЛЬ</span>
                <p className="text-xs text-slate-300">0 собственных станков. Монетизируем свободные мощности мейкеров и студий.</p>
              </div>
              <div className="glass-panel p-4 rounded-xl border-l-4 border-l-amber-500">
                <span className="text-xs font-mono text-amber-400 font-bold block mb-1">100% ESCROW-ГАРАНТИЯ</span>
                <p className="text-xs text-slate-300">Безопасная сделка: холдирование платежа до QC-фотоконтроля и проверки веса.</p>
              </div>
            </div>
          </div>
        )}

        {/* SLIDE 2 */}
        {currentSlide === 2 && (
          <div className="w-full flex flex-col gap-6 animate-fadeIn">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono w-fit">
              [ 02 // РЫНОЧНАЯ БОЛЬ ]
            </div>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white">
              Традиционная 3D-печать сломана для всех сторон
            </h2>
            <p className="text-sm sm:text-base text-slate-400">Клиенты теряют дни на согласование, а парки принтеров простаивают без заказов</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="glass-panel p-5 rounded-2xl border-t-2 border-t-rose-500">
                <span className="text-xs font-mono text-rose-400 font-bold tracking-wider block mb-3">ДЛЯ КЛИЕНТОВ И БИЗНЕСА</span>
                <ul className="space-y-3 text-xs sm:text-sm text-slate-300">
                  <li><strong className="text-white">Порог входа:</strong> Надежный принтер стоит от 60 000 ₽ + десятки часов на калибровку.</li>
                  <li><strong className="text-white">Бюрократия студий:</strong> Обычные студии считают КП вручную по 24–48 часов с наценкой.</li>
                  <li><strong className="text-white">Риск брака:</strong> При заказе у частников нет гарантий качества и возврата денег.</li>
                </ul>
              </div>

              <div className="glass-panel p-5 rounded-2xl border-t-2 border-t-amber-500">
                <span className="text-xs font-mono text-amber-400 font-bold tracking-wider block mb-3">ДЛЯ ВЛАДЕЛЬЦЕВ ПРИНТЕРОВ</span>
                <ul className="space-y-3 text-xs sm:text-sm text-slate-300">
                  <li><strong className="text-white">70%+ простоя:</strong> Принтеры куплены, но большую часть недели простаивают без клиентов.</li>
                  <li><strong className="text-white">Сложный маркетинг:</strong> Частному мастеру тяжело продвигать себя на досках объявлений.</li>
                  <li><strong className="text-white">Риск неоплаты:</strong> Клиенты отказываются забирать детали при постоплате.</li>
                </ul>
              </div>

              <div className="glass-panel p-5 rounded-2xl border-t-2 border-t-cyan-500">
                <span className="text-xs font-mono text-cyan-400 font-bold tracking-wider block mb-3">ДЛЯ 3D-ДИЗАЙНЕРОВ</span>
                <ul className="space-y-3 text-xs sm:text-sm text-slate-300">
                  <li><strong className="text-white">Пиратство моделей:</strong> Выложенные STL-файлы моментально утекают в сеть бесплатно.</li>
                  <li><strong className="text-white">Нет роялти:</strong> Автор продает модель один раз за копейки вместо процента с тиражей.</li>
                  <li><strong className="text-white">Разрыв цепочки:</strong> Нет прямой связки между цифровым файлом и изготовлением.</li>
                </ul>
              </div>
            </div>

            <div className="glass-panel p-4 rounded-xl border border-rose-500/20 bg-rose-950/20 text-xs sm:text-sm text-rose-300 font-mono">
              ⚡ СТАТИСТИКА: 73% частных принтеров простаивают • 48 часов среднее ожидание ответа обычных 3D-студий
            </div>
          </div>
        )}

        {/* SLIDE 3 */}
        {currentSlide === 3 && (
          <div className="w-full flex flex-col gap-6 animate-fadeIn">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono w-fit">
              [ 03 // НАШЕ РЕШЕНИЕ ]
            </div>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white">
              MDRN 3D — Единая технологическая экосистема
            </h2>
            <p className="text-sm sm:text-base text-slate-400">Бесшовная цифровая цепочка: Загрузка STL → Аукцион мастеров → Escrow-сделка → QC → Доставка</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="glass-panel p-5 rounded-2xl relative overflow-hidden">
                <div className="text-3xl font-mono font-black text-cyan-400/40 mb-2">01</div>
                <h3 className="text-base font-bold text-white mb-2">Мгновенный 3D-калькулятор</h3>
                <ul className="space-y-2 text-xs text-slate-300">
                  <li>✔ Расчет за 2 секунды прямо в браузере</li>
                  <li>✔ WebGL / Three.js интерактивный просмотр</li>
                  <li>✔ Расчет объема, габаритов и расхода филамента</li>
                  <li>✔ Выбор материалов: PLA, PETG, ABS, TPU</li>
                </ul>
              </div>

              <div className="glass-panel p-5 rounded-2xl relative overflow-hidden border border-emerald-500/30 shadow-glow-emerald">
                <div className="text-3xl font-mono font-black text-emerald-400/40 mb-2">02</div>
                <h3 className="text-base font-bold text-white mb-2">Обратный аукцион мейкеров</h3>
                <ul className="space-y-2 text-xs text-slate-300">
                  <li>✔ Заявку видят проверенные мейкеры сети</li>
                  <li>✔ Мастера конкурируют по цене и срокам</li>
                  <li>✔ Выбор оборудования (Bambu Lab, Creality и др.)</li>
                  <li>✔ Экономия для клиента до 40% за счет торгов</li>
                </ul>
              </div>

              <div className="glass-panel p-5 rounded-2xl relative overflow-hidden">
                <div className="text-3xl font-mono font-black text-amber-400/40 mb-2">03</div>
                <h3 className="text-base font-bold text-white mb-2">100% Escrow & Фото-QC</h3>
                <ul className="space-y-2 text-xs text-slate-300">
                  <li>✔ Деньги замораживаются до приемки клиентом</li>
                  <li>✔ Обязательное фото готовой детали перед отправкой</li>
                  <li>✔ Точное контрольное взвешивание на весах</li>
                  <li>✔ Трек-номер посылки в едином терминале</li>
                </ul>
              </div>
            </div>

            <div className="glass-panel p-4 rounded-xl border border-cyan-500/20 bg-cyan-950/20">
              <span className="text-xs font-mono text-cyan-400 font-bold block mb-1">КАТАЛОГ С РОЯЛТИ ДЛЯ ДИЗАЙНЕРОВ:</span>
              <p className="text-xs sm:text-sm text-slate-300">
                3D-художники загружают модели и получают авторский процент (роялти) с <strong>каждого</strong> физически напечатанного изделия. Платформа превращает цифровой арт в пассивный доход.
              </p>
            </div>
          </div>
        )}

        {/* SLIDE 4 */}
        {currentSlide === 4 && (
          <div className="w-full flex flex-col gap-6 animate-fadeIn">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono w-fit">
              [ 04 // РЫНОК И ВОЗМОЖНОСТИ ]
            </div>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white">
              Рынок аддитивного производства растет на 22% в год
            </h2>
            <p className="text-sm sm:text-base text-slate-400">Импортозамещение деталей и технологический скачок создают идеальное окно для масштабирования</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="glass-panel p-5 rounded-2xl text-center">
                <span className="text-xs font-mono text-cyan-400 font-bold block mb-2">TAM • МИРОВОЙ РЫНОК</span>
                <div className="text-4xl sm:text-5xl font-mono font-black text-white mb-2">$50.8B</div>
                <p className="text-xs text-slate-400">Объем мирового рынка аддитивного производства к 2030 году (CAGR 22.4%).</p>
              </div>

              <div className="glass-panel p-5 rounded-2xl text-center border border-emerald-500/30 shadow-glow-emerald">
                <span className="text-xs font-mono text-emerald-400 font-bold block mb-2">SAM • РЫНОК РФ И СНГ</span>
                <div className="text-4xl sm:text-5xl font-mono font-black text-emerald-400 mb-2">45 Млрд ₽</div>
                <p className="text-xs text-slate-400">Прототипирование, запчасти, корпуса, мелкосерийные партии и кастом.</p>
              </div>

              <div className="glass-panel p-5 rounded-2xl text-center">
                <span className="text-xs font-mono text-amber-400 font-bold block mb-2">SOM • ЦЕЛЬ НА 3 ГОДА</span>
                <div className="text-4xl sm:text-5xl font-mono font-black text-amber-400 mb-2">3.5 Млрд ₽</div>
                <p className="text-xs text-slate-400">Сегмент распределенной печати по требованию для малого бизнеса и частных клиентов.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="glass-panel p-4 rounded-xl">
                <span className="text-xs font-mono text-emerald-400 font-bold block mb-1">★ ИМПОРТОЗАМЕЩЕНИЕ</span>
                <p className="text-xs text-slate-300">Острый дефицит редких запчастей, автокомпонентов и корпусов из-за ухода западных брендов.</p>
              </div>
              <div className="glass-panel p-4 rounded-xl">
                <span className="text-xs font-mono text-cyan-400 font-bold block mb-1">★ СКОРОСТНЫЕ СТАНКИ</span>
                <p className="text-xs text-slate-300">Революция скоростных принтеров (Bambu Lab, Creality K1) сделала печать быстрой и высокоточной.</p>
              </div>
              <div className="glass-panel p-4 rounded-xl">
                <span className="text-xs font-mono text-amber-400 font-bold block mb-1">★ ЛОКАЛЬНАЯ ЛОГИСТИКА</span>
                <p className="text-xs text-slate-300">Печать детали в том же городе за пару часов устраняет огромные склады и межгородскую доставку.</p>
              </div>
            </div>
          </div>
        )}

        {/* SLIDE 5 */}
        {currentSlide === 5 && (
          <div className="w-full flex flex-col gap-6 animate-fadeIn">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono w-fit">
              [ 05 // БИЗНЕС-МОДЕЛЬ ]
            </div>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white">
              Масштабируемый Take Rate без затрат на оборудование
            </h2>
            <p className="text-sm sm:text-base text-slate-400">Высокая валовая маржинальность платформы благодаря цифровому посредничеству</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glass-panel p-5 rounded-2xl">
                <h3 className="text-sm font-mono font-bold text-amber-400 mb-4 tracking-wider">ИСТОЧНИКИ ВЫРУЧКИ</h3>
                <div className="space-y-3 text-xs sm:text-sm">
                  <div className="border-b border-white/5 pb-2">
                    <span className="text-white font-bold block">1. Комиссия платформы (Take Rate): 15–20%</span>
                    <span className="text-slate-400">С каждой сделки за матчинг, 3D-калькулятор, Escrow и гарантию качества.</span>
                  </div>
                  <div className="border-b border-white/5 pb-2">
                    <span className="text-white font-bold block">2. Комиссия с авторских роялти: 10%</span>
                    <span className="text-slate-400">С выплат 3D-дизайнерам за продажу их моделей через каталог.</span>
                  </div>
                  <div className="border-b border-white/5 pb-2">
                    <span className="text-white font-bold block">3. SaaS PRO-подписка для ферм: 2 990 ₽/мес</span>
                    <span className="text-slate-400">Приоритет в аукционах, пакетная печать и расширенная телеметрия станков.</span>
                  </div>
                  <div>
                    <span className="text-white font-bold block">4. Корпоративные B2B-контракты</span>
                    <span className="text-slate-400">Аутсорсинг деталей для автосервисов, клиник и инжиниринга с НДС.</span>
                  </div>
                </div>
              </div>

              <div className="glass-panel p-5 rounded-2xl border border-emerald-500/20 bg-emerald-950/10">
                <h3 className="text-sm font-mono font-bold text-emerald-400 mb-4 tracking-wider">ЮНИТ-ЭКОНОМИКА ОДНОГО ЗАКАЗА</h3>
                <div className="space-y-2 font-mono text-xs sm:text-sm">
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-slate-300">Средний чек (AOV):</span>
                    <span className="text-white font-bold">1 800 ₽</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-slate-400">Выплата мейкеру (печать):</span>
                    <span className="text-slate-400">1 350 ₽ (75%)</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-slate-400">Роялти дизайнеру:</span>
                    <span className="text-slate-400">150 ₽ (8%)</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/5 bg-emerald-500/10 px-2 rounded">
                    <span className="text-emerald-400 font-bold">Валовая прибыль MDRN 3D:</span>
                    <span className="text-emerald-400 font-bold">300 ₽ (~17%)</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-slate-300">Стоимость привлечения (CAC):</span>
                    <span className="text-slate-300">450 ₽</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-cyan-400 font-bold">LTV (пожизненная ценность):</span>
                    <span className="text-cyan-400 font-bold">2 100 ₽ (7 заказов)</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-amber-400 font-bold">LTV / CAC:</span>
                    <span className="text-amber-400 font-bold">&gt; 4.6x (Отличная сходимость)</span>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-white/10 text-xs text-emerald-300 font-mono">
                  ★ При 5 000 заказов/мес чистый доход платформы: 1.5+ млн ₽/мес.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SLIDE 6 */}
        {currentSlide === 6 && (
          <div className="w-full flex flex-col gap-6 animate-fadeIn">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono w-fit">
              [ 06 // ДОСТИЖЕНИЯ И ЗАПРОС ]
            </div>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white">
              Работающий продукт готов к масштабированию
            </h2>
            <p className="text-sm sm:text-base text-slate-400">Привлекаем посевной раунд 3.5 млн ₽ для подключения 500+ узлов печати</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="glass-panel p-5 rounded-2xl">
                <span className="text-xs font-mono text-emerald-400 font-bold block mb-3">ТЕКУЩИЙ СТАТУС (TRACTION)</span>
                <ul className="space-y-2 text-xs text-slate-300">
                  <li>✔ <strong>Рабочий Production:</strong> mdrn-3d.vercel.app на Next.js + Neon PostgreSQL</li>
                  <li>✔ <strong>3D-инжиниринг:</strong> Three.js WebGL вьювер с точным расчетом геометрии</li>
                  <li>✔ <strong>Сделка под ключ:</strong> Заявка → Аукцион → Escrow → QC фото → Отзыв</li>
                  <li>✔ <strong>Ролевая модель:</strong> Личные кабинеты Клиента, Мастера и Дизайнера</li>
                </ul>
              </div>

              <div className="glass-panel p-5 rounded-2xl">
                <span className="text-xs font-mono text-cyan-400 font-bold block mb-3">ПЛАН РАЗВИТИЯ (12 МЕС.)</span>
                <ul className="space-y-2 text-xs text-slate-300">
                  <li>➔ <strong>Q1–Q2:</strong> 500+ проверенных узлов печати в 15 миллионниках РФ</li>
                  <li>➔ <strong>Q3:</strong> B2B-кабинет для автосервисов, клиник и инженеров с ЭДО и НДС</li>
                  <li>➔ <strong>Q4:</strong> Облачный автослайсинг G-code и экспресс-доставка СДЭК / Яндекс</li>
                  <li>➔ <strong>2027:</strong> AI-проверка моделей на ошибки печати</li>
                </ul>
              </div>

              <div className="glass-panel p-5 rounded-2xl border border-amber-500/30 shadow-glow-orange">
                <span className="text-xs font-mono text-amber-400 font-bold block mb-2">НАШ ЗАПРОС (THE ASK)</span>
                <div className="text-3xl font-mono font-bold text-amber-400 mb-2">3 500 000 ₽</div>
                <p className="text-xs text-slate-300 mb-3">Инвестиции / Грант на масштабирование:</p>
                <ul className="text-[11px] text-slate-400 space-y-1 mb-3">
                  <li>• 50% — Привлечение клиентов и B2B</li>
                  <li>• 30% — Автоматизация API и софта</li>
                  <li>• 20% — Проверка качества и онбординг</li>
                </ul>
                <div className="pt-2 border-t border-white/10 text-xs font-mono text-emerald-400">
                  Партнерства: производители пластика, службы доставки.
                </div>
              </div>
            </div>

            <div className="glass-panel p-4 rounded-xl border border-white/10 flex flex-wrap items-center justify-between gap-4 font-mono text-xs">
              <div className="flex items-center gap-4">
                <span className="text-white font-bold">🌐 ДЕМО: mdrn-3d.vercel.app</span>
                <span className="text-slate-400">📦 GitHub: github.com/Alex64web/mdrn-3d</span>
              </div>
              <div className="text-emerald-400 font-bold">
                Спасибо за внимание! Готовы к вашим вопросам.
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Speaker Notes Drawer */}
      {showNotes && (
        <div className="max-w-6xl mx-auto w-full bg-slate-900/90 border border-amber-500/30 rounded-2xl p-4 mb-4 shadow-hud-card">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              <span className="text-xs font-mono text-amber-400 font-bold">
                СЛОВА СПИКЕРА ДЛЯ СЛАЙДА {currentSlide}:
              </span>
            </div>
            <span className="text-[10px] font-mono text-slate-500">Нажмите N чтобы скрыть</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal">
            {speakerNotes[currentSlide]}
          </p>
        </div>
      )}

      {/* Bottom Controls */}
      <div className="border border-white/10 glass-panel rounded-2xl p-3 flex items-center justify-between font-mono text-xs">
        <div className="flex items-center gap-2 text-slate-400">
          <span>Слайды:</span>
          <kbd className="px-2 py-0.5 rounded bg-slate-800 border border-white/10 text-white">←</kbd>
          <kbd className="px-2 py-0.5 rounded bg-slate-800 border border-white/10 text-white">→</kbd>
        </div>

        {/* Dots */}
        <div className="flex items-center gap-2">
          {Array.from({ length: totalSlides }).map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx + 1)}
              className={`transition-all rounded-full ${
                currentSlide === idx + 1
                  ? 'w-6 h-2 bg-emerald-400'
                  : 'w-2 h-2 bg-slate-700 hover:bg-slate-500'
              }`}
            />
          ))}
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentSlide(curr => Math.max(curr - 1, 1))}
            disabled={currentSlide === 1}
            className="px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-white disabled:opacity-40 transition"
          >
            Назад
          </button>
          <span className="text-white font-bold px-2">{currentSlide} / {totalSlides}</span>
          <button
            onClick={() => setCurrentSlide(curr => Math.min(curr + 1, totalSlides))}
            disabled={currentSlide === totalSlides}
            className="px-3 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold disabled:opacity-40 transition"
          >
            Далее →
          </button>
        </div>
      </div>

    </div>
  )
}
