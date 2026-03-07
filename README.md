<div align="center">

# 💸 Expense Manager

**A beautiful, offline-first personal finance tracker — no account, no cloud, no nonsense.**

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Ant Design](https://img.shields.io/badge/Ant%20Design-6-0170FE?style=for-the-badge&logo=antdesign&logoColor=white)](https://ant.design)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![PWA](https://img.shields.io/badge/PWA-Ready-5A0FC8?style=for-the-badge&logo=pwa&logoColor=white)](https://web.dev/progressive-web-apps/)

[![License](https://img.shields.io/github/license/anandgupta193/expense-manager?style=flat-square&color=green)](LICENSE)
[![Last Commit](https://img.shields.io/github/last-commit/anandgupta193/expense-manager?style=flat-square)](https://github.com/anandgupta193/expense-manager/commits/main)
[![Build](https://img.shields.io/badge/build-passing-brightgreen?style=flat-square)]()
[![Code Style](https://img.shields.io/badge/code%20style-prettier-F7B93E?style=flat-square&logo=prettier)](https://prettier.io)

</div>

---

## ✨ Features

| Feature               | Details                                                              |
| --------------------- | -------------------------------------------------------------------- |
| 📊 **Dashboard**      | Total spend, monthly spend, top category, expense count at a glance  |
| 📈 **Charts**         | Donut chart + category breakdown bar with spend percentages          |
| ➕ **Add Expenses**   | Description, amount (₹), category, date, optional notes & spender    |
| ✏️ **Edit & Delete**  | Inline edit modal and one-click delete with confirmation             |
| 🏷️ **Categories**     | Create, color-code, edit and delete custom categories                |
| 👥 **Spenders**       | Track who spent what — filter the dashboard by spender               |
| 🔔 **Daily Reminder** | Browser notification reminder at a configurable time                 |
| 🌙 **Dark Mode**      | Full dark/light theme toggle, persisted across sessions              |
| 📱 **PWA**            | Installable on mobile/desktop, works fully offline                   |
| 🔒 **100% Private**   | All data stays in your browser's localStorage — no server, no signup |

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

```bash
# Clone the repo
git clone https://github.com/anandgupta193/expense-manager.git
cd expense-manager

# Install dependencies
npm install

# Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — no environment variables or database setup required.

---

## 🛠️ Tech Stack

| Layer      | Technology                                    |
| ---------- | --------------------------------------------- |
| Framework  | [Next.js 16](https://nextjs.org) (App Router) |
| UI Library | [Ant Design 6](https://ant.design)            |
| Styling    | [Tailwind CSS 4](https://tailwindcss.com)     |
| Charts     | [Recharts 3](https://recharts.org)            |
| Language   | TypeScript 5                                  |
| Storage    | Browser `localStorage` — zero backend         |
| PWA        | Custom service worker + Web Manifest          |
| Linting    | ESLint + Prettier + Husky pre-commit          |

---

## 📂 Project Structure

```
expense-manager/
├── app/                    # Next.js App Router pages & layout
│   ├── layout.tsx          # Root layout (font, metadata, providers)
│   ├── page.tsx            # / → Dashboard
│   ├── add/page.tsx        # /add → Add Expense
│   ├── categories/page.tsx # /categories → Category Manager
│   ├── spenders/page.tsx   # /spenders → Spender Manager
│   ├── settings/page.tsx   # /settings → Reminder Settings
│   ├── providers.tsx       # Theme context + antd ConfigProvider
│   └── manifest.ts         # PWA web manifest
│
├── components/             # JSX-only UI components (no business logic)
│   ├── AppShell.tsx        # Nav bar, bottom tab bar, layout wrapper
│   ├── Dashboard.tsx       # Stats, charts, expense table
│   ├── AddExpense.tsx      # Add expense form
│   ├── CategoryManager.tsx # CRUD for categories
│   ├── SpenderManager.tsx  # CRUD for spenders
│   └── ReminderSettings.tsx# Notification toggle & time picker
│
├── hooks/                  # Custom React hooks (all state & logic)
│   ├── useDashboard.ts
│   ├── useAddExpense.ts
│   ├── useCategoryManager.ts
│   ├── useSpenderManager.ts
│   ├── useReminderSettings.ts
│   └── useAppShell.ts
│
├── utils/                  # Pure utility functions
│   ├── formatters.ts       # formatINR, resolveColor
│   └── expenseUtils.tsx    # currentMonthTotal, buildCategoryOptions, buildTableColumns
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
│   ├── storage.ts          # localStorage read/write wrappers
│   ├── defaultData.ts      # Exports DEFAULT_CATEGORIES
│   └── useReminder.ts      # Background notification hook
│
└── public/
    ├── sw.js               # Service worker (network-first, offline fallback)
    └── icons/              # PWA icons (192px, 512px SVG)
```

---

## 💾 Data Model

All data lives in `localStorage`. No accounts, no sync, no servers.

| Key             | Type                | Description                                      |
| --------------- | ------------------- | ------------------------------------------------ |
| `em-expenses`   | `Expense[]`         | All recorded expenses                            |
| `em-categories` | `Category[]`        | User-defined categories (seeded with 7 defaults) |
| `em-spenders`   | `Spender[]`         | People who spent money                           |
| `em-theme`      | `"light" \| "dark"` | Active theme                                     |
| `em-reminder`   | `ReminderConfig`    | Notification enabled state + time                |

**Core types:**

```ts
interface Expense {
  id: string
  description: string
  amount: number
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
  id: string
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

Once installed, the app works completely offline using a cached service worker.

---

## 🎨 Default Categories

Seven categories are seeded on first launch — all editable:

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
  <sub>Built with ❤️ using Next.js · Ant Design · Tailwind CSS</sub>
</div>
