# 📑 Полная техническая и функциональная спецификация проекта MDRN 3D

## 1. Концепция и назначение платформы
**MDRN 3D** — это веб-платформа распределенной 3D-печати по требованию (**Distributed 3D Print-on-Demand**), объединяющая трех участников:
1. **Клиент (Заказчик):** находит готовую 3D-модель в каталоге, настраивает физические параметры печати (материал, цвет, процент заполнения, высоту слоя) и бесплатно отправляет заявку на расчет.
2. **3D-Дизайнер (Автор модели):** загружает цифровые 3D-модели (STL/OBJ), назначает фиксированную цену за использование дизайна в рублях и получает роялти с каждой физически напечатанной копии.
3. **Мастер 3D-печати (Мейкер / Владелец фермы):** регистрирует свои принтеры, видит ленту открытых заявок в своем регионе, предлагает свою стоимость и сроки изготовления в формате аукциона.

Платформа исключает централизованные фабрики и склады, организуя локальное производство рядом с заказчиком с гарантией качества через встроенный **Escrow (безопасную сделку)** и этап **QC (Quality Control)**.

---

## 2. Стек технологий и инфраструктура

| Уровень | Технологии | Описание |
| :--- | :--- | :--- |
| **Frontend Framework** | Next.js 14 (App Router), React 18, TypeScript | Серверный рендеринг (RSC), Server Actions, клиентские интерактивные компоненты |
| **Стилизация & UI** | TailwindCSS, Lucide Icons | Адаптивный интерфейс, чистый SaaS-стиль, поддержка **Light** и **Dark** тем |
| **3D-графика в браузере**| Three.js, `@react-three/fiber`, `@react-three/drei` | Интерактивный рендеринг STL-моделей на виртуальном столе 3D-принтера (PEI sheet) |
| **База данных & ORM** | Prisma ORM, Neon Serverless PostgreSQL | Облачная реляционная база данных с пулингом соединений |
| **Аутентификация** | Node.js `crypto` (`scrypt`), HTTP-only Cookies | Криптографическое хеширование паролей с солью, защищенные сессии без сторонних сервисов |
| **Хостинг & CI/CD** | Vercel Serverless Hosting, GitHub | Автоматический деплой при пуше в ветку `main` |
| **Production URL** | `https://mdrn-3d.vercel.app` | Постоянный рабочий адрес сайта в сети |
| **GitHub Repo** | `https://github.com/Alex64web/mdrn-3d` | Репозиторий исходного кода |

---

## 3. Модель ценообразования и аукцион заявок

```mermaid
sequenceDiagram
    autonumber
    actor Designer as 1. 3D-Дизайнер
    actor Client as 2. Клиент (Заказчик)
    actor Maker as 3. Мастер (Мейкер)
    participant Platform as 4. Escrow Платформы

    Designer->>Platform: Загружает модель и ставит цену (напр. 350 ₽)
    Client->>Platform: Выбирает модель, пластик, цвет и отправляет заявку (0 ₽)
    Note over Platform: Заявка открыта в ленте мастеров
    Maker->>Platform: Изучает техтребования и отправляет оффер (напр. 800 ₽, 2 дня)
    Note over Client: В личном кабинете видит список предложений
    Client->>Platform: Принимает предложение мастера
    Platform->>Platform: Замораживает с баланса клиента 1 207.5 ₽ (Escrow HELD)
    Note over Maker: Получает заказ в работу, статус "PRINTING"
    Maker->>Platform: Печатает, взвешивает, прикрепляет фото QC и трек-номер
    Client->>Platform: Подтверждает получение заказа
    Platform->>Designer: Выплачивает 350 ₽ (роялти)
    Platform->>Maker: Выплачивает 800 ₽ (за работу)
    Platform->>Platform: Удерживает 57.5 ₽ (5% комиссия сервиса)
```

### Формула расчета Escrow:
$$\text{GrandTotal} = P_{model} + P_{maker} + (P_{model} + P_{maker}) \times 0.05$$

* Отправка заявки клиентом **полностью бесплатна (0 ₽)**.
* Средства замораживаются только в момент, когда клиент сам выбирает конкретного мастера по цене, срокам или отзывам.
* Выплата автору и исполнителю производится только после подтверждения доставки клиентом.

---

## 4. Схема базы данных (Prisma Schema)

```mermaid
erDiagram
    User ||--o| MakerProfile : "has (if MAKER)"
    User ||--o{ Model3D : "creates (if DESIGNER)"
    User ||--o{ Order : "orders (as CLIENT)"
    User ||--o{ Order : "executes (as MAKER)"
    User ||--o{ OrderOffer : "submits (as MAKER)"
    User ||--o{ Review : "receives (as MAKER)"
    Model3D ||--o{ Order : "instantiates"
    Order ||--o{ OrderOffer : "receives bids"
    Order ||--o| Review : "has feedback"

    User {
        String id PK
        String name
        String email UK
        String role "CLIENT | DESIGNER | MAKER | ADMIN"
        String passwordHash
        Float balance
        DateTime createdAt
    }

    MakerProfile {
        String id PK
        String userId FK
        String printerName "Bambu Lab P1S"
        Float bedSizeX "256 mm"
        Float bedSizeY "256 mm"
        Float bedSizeZ "256 mm"
        String materials "PLA, PETG, ABS"
        String colors
        String location "Москва"
        Float rating "5.0"
    }

    Model3D {
        String id PK
        String title
        String description
        String filePath "/sample-models/cube.stl"
        Float price "Авторская цена (₽)"
        Float royalty "Референс %"
        String tags
        Float sizeX
        Float sizeY
        Float sizeZ
        Float volume "см³"
        String designerId FK
    }

    Order {
        String id PK
        String clientId FK
        String modelId FK
        String material "PLA | PETG | ABS | TPU"
        String color
        Int infill "15% - 100%"
        Float layerHeight "0.12 - 0.28 mm"
        Float modelPrice
        Float makerPrice
        Float totalPrice
        String escrowStatus "NONE | HELD | RELEASED | REFUNDED"
        String status "REQUEST | PRINTING | SHIPPED | COMPLETED | CANCELLED"
        String deliveryAddress
        String makerId FK
        Float weight "Фактический вес (г)"
        String qcPhoto "Base64 фото"
        String trackingNumber
    }

    OrderOffer {
        String id PK
        String orderId FK
        String makerId FK
        Float price "Цена мастера (₽)"
        Int estimatedDays
        String comment
        String status "PENDING | ACCEPTED | REJECTED"
    }

    Review {
        String id PK
        String orderId FK
        String makerId FK
        Int rating "1-5"
        String comment
    }
```

---

## 5. Структура файлов проекта

```text
C:\Projects\MDRN_3D\
├── prisma/
│   ├── schema.prisma          # Описание схемы БД для Neon PostgreSQL
│   └── seed.ts                # Сид-скрипт наполнения каталога моделями и стартовыми данными
├── public/
│   └── sample-models/         # 3D-файлы (.stl) для интерактивного просмотра
│       ├── 3dbenchy.stl       # Классический 3D-кораблик Benchy
│       ├── laptop_stand.stl   # Складная подставка для ноутбука
│       └── xyz_calibration_cube.stl # Калибровочный куб 20мм
├── src/
│   ├── app/
│   │   ├── actions.ts         # Server Actions (регистрация, вход, заявки, офферы, Escrow, QC)
│   │   ├── globals.css        # Стили темы (Tailwind, переменные для Light и Dark режимов)
│   │   ├── layout.tsx         # Корневой лейаут: сессия, шапка, баланс, переключатель тем, футер
│   │   ├── page.tsx           # Главная страница (презентация платформы, шаги работы, роли)
│   │   ├── catalog/
│   │   │   └── page.tsx       # Каталог 3D-моделей с ценой автора и переходом в конфигуратор
│   │   ├── dashboard/
│   │   │   └── page.tsx       # Защищенная панель управления (редирект на /login для гостей)
│   │   ├── login/
│   │   │   └── page.tsx       # Страница авторизации и регистрации с выбором ролей и параметров принтера
│   │   └── model/[id]/
│   │       └── page.tsx       # Страница модели: 3D-просмотрщик и конфигуратор печати
│   ├── components/
│   │   ├── ThemeToggle.tsx    # Переключатель Светлая/Темная тема (Sun/Moon, сохранение в localStorage)
│   │   ├── UserAuthHeader.tsx # Компонент шапки: статус пользователя, бейдж роли, баланс, кнопка LogOut
│   │   ├── dashboard/
│   │   │   └── UnifiedDashboard.tsx # Личные кабинеты для Клиента, Дизайнера и Мейкера в одном интерфейсе
│   │   ├── forms/
│   │   │   └── ModelConfigurator.tsx # Конфигуратор печати, калькулятор веса филамента и отправка заявки
│   │   └── viewer/
│   │       └── StlViewer.tsx  # Three.js 3D-вьювер (орбитальная камера, сетка стола, wireframe)
│   └── lib/
│       ├── auth.ts            # Крипто-утилиты (scrypt hash, verify, session cookies)
│       ├── matching.ts        # Алгоритм подбора исполнителей по размерам стола и материалам
│       ├── prisma.ts          # Синглтон PrismaClient с пулингом соединений
│       └── slicer-calc.ts     # Расчет массы филамента по плотности полимера и проценту заполнения
├── tailwind.config.ts         # Конфигурация Tailwind с поддержкой darkMode: 'class'
├── package.json               # Зависимости и скрипты (postinstall: prisma generate)
└── tsconfig.json              # Настройки компилятора TypeScript
```

---

## 6. Ключевые модули и функционал

### 6.1. Аутентификация и безопасность (`src/lib/auth.ts`, `src/app/login/page.tsx`)
* **Криптография:** Пароли хешируются встроенной функцией `crypto.scryptSync(password, salt, 64)`. Соль генерируется индивидуально через `crypto.randomBytes(16)`.
* **Защита от Timing Attacks:** Проверка хеша выполняется через `crypto.timingSafeEqual`.
* **Сессии:** Защищенная HTTP-only кука `mdrn_auth_user` со сроком жизни 30 дней, атрибутами `SameSite=Lax` и `Secure` в продакшне.
* **Регистрация:** Пользователь сразу выбирает свою роль (`CLIENT`, `DESIGNER`, `MAKER`). При выборе роли **Мастер** система валидирует и сохраняет габариты рабочего стола его принтера и список поддерживаемых пластиков в связанную запись `MakerProfile`.
* **Демо-баланс:** Каждому новому аккаунту автоматически начисляется `5 000.0 ₽` для мгновенного тестирования создания заказов и механизма Escrow.

### 6.2. 3D-Вьювер в браузере (`src/components/viewer/StlViewer.tsx`)
* Построен на стеке `@react-three/fiber` и `@react-three/drei`.
* Загружает бинарные и ASCII `.stl` файлы через `STLLoader`.
* Автоматически вычисляет `BoundingBox`, центрирует геометрию и масштабирует модель так, чтобы она реалистично стояла на печатном столе.
* Включает:
  - Пружинный стальной стол принтера (PEI sheet) с координатной сеткой.
  - Управление камерой `OrbitControls` (вращение, зум, панорамирование).
  - Интерактивную панель: включение каркасной сетки (Wireframe), авто-вращение, сброс вида.

### 6.3. Калькулятор слайсинга и массы (`src/lib/slicer-calc.ts`)
Перед отправкой заявки система рассчитывает ориентировочный расход филамента:
$$\text{Weight (g)} = \text{Volume (cm}^3\text{)} \times \text{Density (g/cm}^3\text{)} \times \left(0.20 + 0.80 \times \frac{\text{Infill (\%)}}{100}\right)$$

* **Плотности материалов:**
  - `PLA`: $1.24\text{ г/см}^3$
  - `PETG`: $1.27\text{ г/см}^3$
  - `ABS`: $1.04\text{ г/см}^3$
  - `TPU`: $1.21\text{ г/см}^3$

### 6.4. Единый дашборд (`UnifiedDashboard.tsx`)
Интерфейс динамически адаптируется под роль авторизованного пользователя:
* **Для Клиента:**
  - Мониторинг отправленных заявок (`AWAITING_BIDS`).
  - Просмотр поступивших офферов мастеров с их ценами, сроками и комментариями.
  - Кнопка **«Принять предложение»** $\rightarrow$ списание средств в Escrow и перевод в печать.
  - Кнопка **«Подтвердить получение»** после доставки для закрытия заказа и выплаты денег исполнителю.
* **Для Мастера:**
  - Лента открытых заявок с техническими требованиями (размеры, материал, цвет, масса).
  - Форма отправки предложения с указанием стоимости и дней.
  - Раздел «В работе»: форма закрытия печати с указанием фактического веса на весах, прикреплением фото контроля качества (QC) и трек-номера отправления.
* **Для Дизайнера:**
  - Форма публикации новой модели с указанием цены в рублях, тегов и габаритов.
  - Аналитика проданных лицензий и баланс авторских отчислений.

### 6.5. Переключение темы (Light / Dark)
* Реализовано через класс `.dark` на теге `<html>` и Tailwind-директиву `darkMode: 'class'`.
* Выбор сохраняется в `localStorage('theme')` и применяется мгновенно без мерцания.
* В Светлой теме используются теплые белые и серые оттенки (`bg-slate-50`, `text-slate-900`), в Темной — глубокий графит (`bg-[#0b0f19]`, `text-slate-100`).

---

## 7. Серверные действия (Server Actions API в `actions.ts`)

| Функция | Параметры | Назначение |
| :--- | :--- | :--- |
| `registerUser` | `name, email, password, role, ...makerData` | Регистрация нового аккаунта, хеширование, установка куки |
| `loginUser` | `email, password` | Авторизация пользователя, валидация хеша, сессия |
| `logoutUser` | — | Очистка сессионной куки |
| `getCurrentUser`| — | Чтение куки и получение текущего профиля из БД |
| `createModel3D` | `title, description, filePath, price, tags, sizeX/Y/Z, volume, designerId` | Публикация модели дизайнером |
| `createOrderRequest` | `clientId, modelId, material, color, infill, layerHeight, address` | Бесплатная публикация заявки на расчет |
| `submitMakerOffer` | `orderId, makerId, price, estimatedDays, comment` | Подача ценового предложения мастером |
| `acceptMakerOffer` | `offerId, clientId` | Принятие предложения клиентом, заморозка средств в Escrow |
| `submitQCCheck` | `orderId, makerId, weight, qcPhoto, trackingNumber` | Отправка отчета контроля качества и трек-номера |
| `confirmOrderDelivery` | `orderId, clientId` | Подтверждение доставки, разморозка и выплата денег автору и мастеру |

---

## 8. Как развернуть и запустить проект

### Локальный запуск:
```powershell
# 1. Перейти в каталог
cd C:\Projects\MDRN_3D

# 2. Установить зависимости
npm install

# 3. Синхронизировать базу данных
npx prisma generate
npx prisma db push

# 4. Запустить локальный сервер
npm run dev
# Открыть в браузере: http://localhost:3000
```

### Переменные окружения (`.env` / Vercel Environment Variables):
```env
DATABASE_URL="postgresql://user:password@host/neondb?sslmode=require"
POSTGRES_PRISMA_URL="postgresql://user:password@host/neondb?connect_timeout=15&sslmode=require"
DATABASE_URL_UNPOOLED="postgresql://user:password@host/neondb?sslmode=require"
```

### Обновление на Vercel (Production):
```powershell
git add .
git commit -m "update"
git push origin main
cmd.exe /c "npx vercel --prod --yes"
```