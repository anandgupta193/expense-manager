# Expense Manager — Documentation Index

Agent-optimized reference for the codebase. Start here, then follow links for detail.

## Files

| File                                 | What it covers                                                      |
| ------------------------------------ | ------------------------------------------------------------------- |
| [architecture.md](./architecture.md) | Directory layout, layer rules, data flow, page→component pattern    |
| [data-model.md](./data-model.md)     | TypeScript types, localStorage schema, storage API, default seeding |
| [components.md](./components.md)     | Every component: responsibility, props, what hook it delegates to   |
| [hooks.md](./hooks.md)               | Every hook: purpose, inputs, return values, side effects            |
| [styling.md](./styling.md)           | Theme system, Tailwind v4 usage, antd token conventions, font setup |
| [pwa.md](./pwa.md)                   | Service worker strategy, PWA manifest, notification system          |

## Quick Facts

- **Stack:** Next.js 16 (App Router) · React 19 · TypeScript · Ant Design v6 · Tailwind CSS v4 · Recharts · Firebase (Auth + Firestore)
- **Persistence:** Firestore for expenses/categories/spenders; localStorage for theme + reminder
- **Auth:** Google Sign-In via Firebase Auth (`useAuth` hook)
- **Currency:** INR (₹) throughout
- **Font:** Outfit (Google) via next/font → `--font-primary` CSS var
- **Primary color:** `#6366f1` (indigo)
- **Dev command:** `npm run dev` → http://localhost:3000
- **Build check:** `npm run build` (runs TypeScript + Turbopack)
- **Env:** copy `.env.local.example` → `.env.local` and fill in `NEXT_PUBLIC_FIREBASE_*` values
