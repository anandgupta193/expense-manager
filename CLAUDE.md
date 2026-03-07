# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server at http://localhost:3000
npm run build    # Production build (also runs TypeScript type check)
npm run lint     # ESLint
npm run start    # Serve production build
```

There are no tests yet. TypeScript errors surface during `npm run build`.

## Architecture

**Stack:** Next.js 16 (App Router) · React 19 · TypeScript · Ant Design v6 · Tailwind CSS v4 · Recharts

### Directory structure

```
config/           # JSON-driven defaults (categories, reminder)
constants/        # Static values: navigation items, form validation factories
hooks/            # Custom hooks — all state + logic, no JSX
utils/            # Pure functions: formatters, expense utilities (may contain JSX in render helpers)
lib/              # Data layer: types, storage, useReminder hook
components/       # UI only — import from hooks/, constants/, utils/
```

**Architecture rules:**

- **Hooks own all state and logic.** Components only render JSX.
- **Utils are pure functions.** No hooks, no side effects.
- **Constants are static values.** `constants/navigation.tsx` (NAV_ITEMS), `constants/validation.ts` (rule factories).
- **Config drives defaults.** `config/categories.json` and `config/reminder.json` are the single source of truth for seeded data.

### Data layer — `lib/`

All data lives in **localStorage only** (no backend). Keys: `em-expenses`, `em-categories`, `em-spenders`, `em-theme`, `em-reminder`.

- `lib/types.ts` — `Expense`, `Category`, `Spender`, `Theme`, `ReminderConfig` interfaces
- `lib/storage.ts` — thin read/write wrappers; `getCategories()` seeds default data on first load
- `lib/defaultData.ts` — imports `DEFAULT_CATEGORIES` from `config/categories.json`

### Theme system

`app/providers.tsx` is a `"use client"` component that:

1. Wraps everything in antd `ConfigProvider` (switches `darkAlgorithm` / `defaultAlgorithm`)
2. Exposes `useTheme()` context with `{ theme, toggleTheme }`
3. Toggles `.dark` class on `<html>` for Tailwind dark variants

**Do not use Tailwind `dark:` variants for colors** — antd tokens handle component colors. Use `theme.useToken()` for any custom color values so they adapt to the active algorithm.

### Page → component pattern

Each page file is a minimal server component that imports a single `"use client"` component:

```
app/page.tsx              → components/Dashboard.tsx
app/add/page.tsx          → components/AddExpense.tsx
app/categories/page.tsx   → components/CategoryManager.tsx
app/layout.tsx            → wraps with <Providers><AppShell>
```

`components/AppShell.tsx` renders the sticky top nav (desktop) and fixed bottom tab bar (mobile) and registers the service worker.

### PWA

- `app/manifest.ts` — Next.js built-in manifest route (`/manifest.webmanifest`)
- `public/sw.js` — network-first service worker with fallback to cache
- Icons at `public/icons/icon-192.svg` and `icon-512.svg`

### Styling conventions

- Spacing always in multiples of 4 (Tailwind: `p-4`, `p-8`, `gap-4`, etc.)
- Tailwind handles layout (grid, flex, spacing, responsive breakpoints)
- antd tokens via `theme.useToken()` handle all colors/borders/backgrounds
- Mobile-first: single column → `lg:grid-cols-2` for dashboard panels; `md:hidden` / `hidden md:flex` for nav variants

### antd v6 notes

- Use the `options` prop on `<Select>` — `<Select.Option>` is deprecated
- `<Statistic>` uses `styles.content` not `valueStyle`
- `<ColorPicker>` value is `Color | string`; call `.toHexString()` to resolve
