<div align="center">

# 💸 Expense Manager

**A beautiful personal finance tracker with Google Sign-In and real-time cloud sync.**

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Ant Design](https://img.shields.io/badge/Ant%20Design-6-0170FE?style=for-the-badge&logo=antdesign&logoColor=white)](https://ant.design)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Firebase](https://img.shields.io/badge/Firebase-Auth%20%2B%20Firestore-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com)
[![PWA](https://img.shields.io/badge/PWA-Ready-5A0FC8?style=for-the-badge&logo=pwa&logoColor=white)](https://web.dev/progressive-web-apps/)

[![License](https://img.shields.io/github/license/anandgupta193/expense-manager?style=flat-square&color=green)](LICENSE)
[![Last Commit](https://img.shields.io/github/last-commit/anandgupta193/expense-manager?style=flat-square)](https://github.com/anandgupta193/expense-manager/commits/main)
[![Build](https://img.shields.io/badge/build-passing-brightgreen?style=flat-square)]()
[![Code Style](https://img.shields.io/badge/code%20style-prettier-F7B93E?style=flat-square&logo=prettier)](https://prettier.io)

</div>

---

## ✨ Features

### 📊 Dashboard

- **Monthly snapshot** — total spend for the selected month, transaction count, and top spending category at a glance
- **Budget progress** — circular progress ring shows how much of your monthly budget remains; turns yellow → red as you approach the limit
- **Donut chart** — visual breakdown of the top 5 spending categories for the selected month
- **Category breakdown** — ranked list of every category with spend amount and percentage bar
- **Filter by month** — switch between any past or current month using the month picker
- **Filter by spender** — narrow the entire dashboard to one or more spenders (useful for shared households)

### 🧾 Expenses

- **Full expense table** — all transactions for the selected month with description, amount, category, date, spender, and notes
- **Add expense** — quick-add form with description autocomplete (suggests from your history), amount, category, date, optional notes, and spender
- **Edit expense** — tap any row to edit all fields; opens as a bottom sheet on mobile and a modal on desktop
- **Delete expense** — remove any transaction with one tap
- **Export to CSV** — download the current month's (or all) expenses as a CSV file for use in Excel or Sheets
- **Month & spender filters** — independent from the Dashboard; set your own view on the Expenses page

### 🏷️ Categories

- **Custom categories** — create as many categories as you need with a name and a custom color
- **Color picker** — choose any hex color to visually distinguish categories in charts and tables
- **Edit & delete** — rename or recolor any category, or remove ones you no longer use
- **7 defaults seeded on sign-in** — Food & Dining, Transport, Shopping, Entertainment, Health, Utilities, Other

### ⚙️ Settings

- **Monthly budget** — set a spending limit; the Dashboard shows a budget-remaining card with color-coded progress once a limit is set
- **Daily reminder** — enable a browser push notification at a time you choose to remind yourself to log expenses
- **Spenders** — add people (family members, roommates) to track who made each purchase; filter Dashboard and Expenses by spender

### 🔐 Account & Sync

- **Google Sign-In** — one-tap sign-in; no passwords to manage
- **Real-time cloud sync** — all expenses, categories, and spenders are stored in Firestore and available on any device after sign-in
- **Manual refresh** — tap the refresh button in the nav bar to force-sync the latest data from the cloud

### 🎨 Appearance & Accessibility

- **Dark / Light mode** — full theme toggle persisted across sessions; all components adapt via Ant Design tokens
- **Mobile-first design** — bottom tab bar on mobile, sticky top nav on desktop; add/edit forms open as a bottom sheet on mobile for thumb-friendly access

### 📱 PWA (Installable App)

- **Install on any device** — add to home screen on iOS, Android, or desktop Chrome/Edge; runs like a native app
- **Offline support** — service worker caches the app shell so it loads without a network connection; data syncs when connectivity returns

---

## 📸 Screenshots

> Dashboard · Add Expense · Category Manager · Dark Mode

<table>
  <tr>
    <td align="center"><b>Dashboard</b></td>
    <td align="center"><b>Add Expense</b></td>
  </tr>
  <tr>
    <td><img src="https://placehold.co/480x300/6366f1/white?text=Dashboard" alt="Dashboard" width="100%"/></td>
    <td><img src="https://placehold.co/480x300/6366f1/white?text=Add+Expense" alt="Add Expense" width="100%"/></td>
  </tr>
  <tr>
    <td align="center"><b>Categories</b></td>
    <td align="center"><b>Dark Mode</b></td>
  </tr>
  <tr>
    <td><img src="https://placehold.co/480x300/6366f1/white?text=Categories" alt="Categories" width="100%"/></td>
    <td><img src="https://placehold.co/480x300/1f1f1f/6366f1?text=Dark+Mode" alt="Dark Mode" width="100%"/></td>
  </tr>
</table>

---

## 🚀 Quick Start

### 1. Clone and install

```bash
git clone https://github.com/anandgupta193/expense-manager.git
cd expense-manager
npm install
```

### 2. Configure Firebase

Copy the example env file and fill in your Firebase project values:

```bash
cp .env.local.example .env.local
```

```env
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

> See [Firebase Console](https://console.firebase.google.com) → Project Settings → Your apps → Web app config.
> Enable **Authentication → Google** provider and **Firestore Database** in your Firebase project.

### 3. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and sign in with Google.

---

## 🛠️ Tech Stack

| Layer      | Technology                                       |
| ---------- | ------------------------------------------------ |
| Framework  | [Next.js 16](https://nextjs.org) (App Router)    |
| UI Library | [Ant Design 6](https://ant.design)               |
| Styling    | [Tailwind CSS 4](https://tailwindcss.com)        |
| Charts     | [Recharts 3](https://recharts.org)               |
| Language   | TypeScript 5                                     |
| Auth       | Firebase Authentication (Google Sign-In)         |
| Database   | Cloud Firestore — expenses, categories, spenders |
| Local      | `localStorage` — theme + reminder config only    |
| PWA        | Custom service worker + Web Manifest             |
| Linting    | ESLint + Prettier + Husky pre-commit             |

---

## 📂 Project Structure

```
expense-manager/
├── app/                    # Next.js App Router pages & layout
│   ├── layout.tsx          # Root layout (font, metadata, providers)
│   ├── page.tsx            # / → Dashboard
│   ├── expenses/page.tsx   # /expenses → Expense table + add/edit
│   ├── categories/page.tsx # /categories → Category Manager
│   ├── settings/page.tsx   # /settings → Budget + Reminder + Spenders
│   ├── spenders/page.tsx   # /spenders → redirects to /settings
│   ├── auth/page.tsx       # /auth → Sign In
│   ├── providers.tsx       # Auth + Theme + Data contexts, antd ConfigProvider
│   └── manifest.ts         # PWA web manifest
│
├── components/             # JSX-only UI components (no business logic)
│   ├── AppShell.tsx        # Nav bar, bottom tab bar, auth UI, refresh button
│   ├── Dashboard.tsx       # Stat cards, donut chart, category breakdown
│   ├── ExpenseTable.tsx    # Expense table, filters, add/edit modals, FAB
│   ├── CategoryManager.tsx # CRUD for categories
│   ├── SpenderManager.tsx  # CRUD for spenders
│   ├── BudgetSettings.tsx  # Monthly budget limit input
│   ├── ReminderSettings.tsx# Notification toggle & time picker
│   └── SignInPage.tsx      # Google sign-in screen
│
├── hooks/                  # Custom React hooks (all state & logic)
│   ├── useAuth.ts          # Firebase onAuthStateChanged wrapper
│   ├── useDataContext.ts   # Loads + syncs Firestore data; exposes refreshData
│   ├── useDashboard.ts     # Chart data, stat values, month/spender filters
│   ├── useExpenseTable.ts  # Table state, add/edit/delete, export CSV
│   ├── useCategoryManager.ts
│   ├── useSpenderManager.ts
│   ├── useReminderSettings.ts
│   └── useAppShell.ts
│
├── utils/                  # Pure utility functions
│   ├── formatters.ts       # formatINR, resolveColor
│   ├── expenseUtils.tsx    # buildCategoryOptions, buildTableColumns, etc.
│   └── exportUtils.ts      # exportExpensesToCSV
│
├── constants/              # Static values
│   ├── navigation.tsx      # NAV_ITEMS array
│   └── validation.ts       # Form rule factories
│
├── config/                 # JSON-driven defaults
│   ├── categories.json     # 7 default categories with colors
│   └── reminder.json       # Default reminder config
│
├── lib/                    # Core data layer
│   ├── types.ts            # TypeScript interfaces
│   ├── storage.ts          # localStorage wrappers (theme + budget + reminder)
│   ├── firebase.ts         # Lazy Firebase singletons (SSR-safe)
│   ├── firestore.ts        # Async Firestore CRUD API (fs* functions)
│   ├── defaultData.ts      # Exports DEFAULT_CATEGORIES
│   └── useReminder.ts      # Background notification hook
│
├── firestore.rules         # Firestore security rules
└── public/
    ├── sw.js               # Service worker (network-first, offline fallback)
    └── icons/              # PWA icons (192px, 512px SVG)
```

---

## 💾 Data Model

Expenses, categories, and spenders live in **Firestore** under `users/{uid}/`. Theme and reminder config stay in `localStorage` only.

### Firestore Collections

| Collection   | Doc ID        | Type       | Notes                                               |
| ------------ | ------------- | ---------- | --------------------------------------------------- |
| `expenses`   | `expense.id`  | `Expense`  | All recorded expenses                               |
| `categories` | `category.id` | `Category` | Seeded with 7 defaults on first sign-in             |
| `spenders`   | `spender.id`  | `Spender`  | Seeded with the user's own spender on first sign-in |

### localStorage

| Key           | Type                | Description         |
| ------------- | ------------------- | ------------------- |
| `em-theme`    | `"light" \| "dark"` | Active theme        |
| `em-reminder` | `ReminderConfig`    | Notification config |

**Core types:**

```ts
interface Expense {
  id: string
  description: string
  amount: number // INR
  categoryId: string
  date: string // "YYYY-MM-DD"
  notes?: string
  spenderId?: string
}

interface Category {
  id: string
  name: string
  color: string // hex, e.g. "#FF6B6B"
}

interface Spender {
  id: string // user.uid for the seeded self-spender
  name: string
  avatarColor: string // hex
}
```

---

## 📦 Scripts

```bash
npm run dev          # Start development server (http://localhost:3000)
npm run build        # Production build + TypeScript type check
npm run start        # Serve production build
npm run lint         # Run ESLint
npm run format       # Format all files with Prettier
npm run format:check # Check formatting without writing
```

---

## 📱 Install as App (PWA)

The app is fully installable as a Progressive Web App:

- **Desktop (Chrome/Edge):** Click the install icon in the address bar
- **iOS Safari:** Share → Add to Home Screen
- **Android Chrome:** Menu → Add to Home Screen

Once installed, the app works offline using a cached service worker. Data syncs to Firestore when connectivity is restored.

---

## 🎨 Default Categories

Seven categories are seeded on first sign-in — all editable:

| Category         | Color     |
| ---------------- | --------- |
| 🍔 Food & Dining | `#FF6B6B` |
| 🚌 Transport     | `#4ECDC4` |
| 🛍️ Shopping      | `#45B7D1` |
| 🎬 Entertainment | `#96CEB4` |
| 💊 Health        | `#F6AD55` |
| ⚡ Utilities     | `#DDA0DD` |
| 📦 Other         | `#94A3B8` |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Commit your changes (pre-commit hook runs lint + prettier automatically)
4. Push and open a Pull Request

---

## 📄 License

[MIT](LICENSE) — free to use, modify, and distribute.

---

<div align="center">
  <sub>Built with ❤️ using Next.js · Ant Design · Tailwind CSS · Firebase</sub>
</div>
