# SEO Action Plan — Expense Manager PWA

**Generated:** 2026-03-09
**Overall SEO Health Score:** 32 / 100
**Target after completing Critical + High items:** ~65 / 100

---

## CRITICAL — Fix Before Any Public Deployment

### C1. Add `app/robots.ts`

**File:** `app/robots.ts` (new)
**Time:** 5 min
**Impact:** Crawlability, AI crawler control

Choose one strategy based on intent:

**Option A — Private app (recommended for auth-only tool):**

```ts
// app/robots.ts
import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', disallow: '/' }],
  }
}
```

**Option B — Public marketing site + gated app:**

```ts
import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/categories', '/spenders', '/settings'] },
      { userAgent: 'GPTBot', disallow: '/' },
      { userAgent: 'ClaudeBot', disallow: '/' },
      { userAgent: 'PerplexityBot', disallow: '/' },
    ],
    sitemap: 'https://your-domain.com/sitemap.xml',
  }
}
```

---

### C2. Add `app/sitemap.ts`

**File:** `app/sitemap.ts` (new)
**Time:** 10 min
**Impact:** Crawl discovery

```ts
// app/sitemap.ts
import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://your-domain.com'
  return [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${baseUrl}/auth`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
  ]
}
```

---

### C3. Add security headers to `next.config.ts`

**File:** `next.config.ts`
**Time:** 20 min
**Impact:** Security, ranking signals

```ts
// next.config.ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ['antd', 'recharts', '@ant-design/icons'],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
        ],
      },
    ]
  },
}

export default nextConfig
```

Note: `optimizePackageImports` is included here — handles C4 as well.

---

### C4. Enable `optimizePackageImports` in `next.config.ts`

**Handled in C3 above.**
**Time:** 0 min (already included)
**Impact:** LCP — estimated 30–50% JS bundle reduction

---

### C5. Add `metadataBase` and canonical to `app/layout.tsx`

**File:** `app/layout.tsx`
**Time:** 10 min
**Impact:** Duplicate content, canonical URLs

```ts
export const metadata: Metadata = {
  metadataBase: new URL('https://your-domain.com'),
  title: {
    template: '%s | Expense Manager',
    default: 'Expense Manager',
  },
  description:
    'A free personal expense tracker with cloud sync, category management, multi-spender support, and visual spending insights. Works as a PWA.',
  alternates: { canonical: '/' },
  // ... rest of existing metadata
}
```

---

### C6. Fix broken service worker — remove `/add` from STATIC_URLS

**File:** `public/sw.js`
**Time:** 2 min
**Impact:** Fixes broken SW install event; restores offline support

Remove `'/add'` from the `STATIC_URLS` array. The route `app/add/page.tsx` was deleted.

---

## HIGH — Fix Within 1 Week

### H1. Add per-page metadata to all `page.tsx` files

**Files:** All page files
**Time:** 20 min
**Impact:** On-page SEO, unique titles/descriptions per route

```ts
// app/categories/page.tsx
import type { Metadata } from 'next'
export const metadata: Metadata = {
  title: 'Categories',
  description: 'Create and color-code custom spending categories to organize your expenses by type.',
  alternates: { canonical: '/categories' },
}

// app/spenders/page.tsx
export const metadata: Metadata = {
  title: 'Spenders',
  description: 'Track and manage individual spenders to see who is spending what in your household.',
  alternates: { canonical: '/spenders' },
}

// app/settings/page.tsx
export const metadata: Metadata = {
  title: 'Settings',
  description: 'Configure your Expense Manager preferences, reminders, and account settings.',
  alternates: { canonical: '/settings' },
}

// app/auth/page.tsx
export const metadata: Metadata = {
  title: 'Sign In',
  robots: { index: false, follow: false },
}
```

---

### H2. Add Open Graph and Twitter Card tags

**File:** `app/layout.tsx`
**Time:** 15 min + OG image creation
**Impact:** Social sharing, AI citation readiness

Create a static OG image at `public/og-image.png` (1200×630 px), then:

```ts
export const metadata: Metadata = {
  // ... existing fields
  openGraph: {
    type: 'website',
    siteName: 'Expense Manager',
    title: 'Expense Manager — Personal Expense Tracker',
    description:
      'Free personal expense tracker with cloud sync, category management, and spending insights. Works as a PWA.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Expense Manager dashboard' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Expense Manager — Personal Expense Tracker',
    description: 'Free personal expense tracker with cloud sync and spending insights.',
    images: ['/og-image.png'],
  },
}
```

---

### H3. Add WebApplication + WebSite JSON-LD schema

**File:** `app/layout.tsx`
**Time:** 15 min
**Impact:** Schema score (currently 0/100), AI citation readiness

Add the `SchemaOrg` component from Section 3 of the audit report, then include `<SchemaOrg />` in the layout's `<head>`:

```tsx
return (
  <html lang="en">
    <head>
      <SchemaOrg />
    </head>
    <body ...>
```

---

### H4. Fix heading hierarchy — add H1 to all pages

**Files:** `components/Dashboard.tsx`, `components/CategoryManager.tsx`, `components/SpenderManager.tsx`, `components/SignInPage.tsx`
**Time:** 20 min
**Impact:** On-page SEO, accessibility

Change `<Title level={3}>` to `<Title level={1}>` on the primary heading of each page. Use `style` prop to maintain visual appearance if needed:

```tsx
// Before
<Title level={3}>Dashboard</Title>

// After
<Title level={1} style={{ fontSize: token.fontSizeLG }}>Dashboard</Title>
```

---

### H5. Add trust signals and privacy link to `SignInPage.tsx`

**File:** `components/SignInPage.tsx`
**Time:** 30 min (requires a `/privacy` page or external privacy policy URL)
**Impact:** E-E-A-T trustworthiness, YMYL compliance

Add below the existing privacy note:

- Link to a privacy policy (create `app/privacy/page.tsx` or link to a hosted doc)
- Brief "About" sentence (who built this, that data is only stored in your Firebase account)
- Increase privacy note font size from 11px to at least `token.fontSizeSM`

---

## MEDIUM — Fix Within 1 Month

### M1. Decide on indexability architecture

**Impact:** This is a prerequisite for most other SEO work to matter

Two options:

**Option A (Recommended for discoverability):** Create a public landing page at `/` served to unauthenticated visitors. Move the app to `/app`. The landing page becomes the SEO surface.

**Option B (Private tool):** Add `robots: { index: false }` to all app routes. Accept no organic search presence.

The current state (neither) is the worst outcome.

---

### M2. Memoize expensive computations in `useDashboard.ts`

**File:** `hooks/useDashboard.ts`
**Time:** 30 min
**Impact:** INP — eliminates redundant O(n) iterations on every render

```ts
const catMap = useMemo(
  () => Object.fromEntries(categories.map((c) => [c.id, c])),
  [categories]
)
const spenderMap = useMemo(
  () => Object.fromEntries(spenders.map((s) => [s.id, s])),
  [spenders]
)
const monthlyGroups = useMemo(() => { /* existing logic */ }, [filteredExpenses])
const chartData = useMemo(() => { /* existing logic */ }, [filteredExpenses, categories])
const openEdit = useCallback(/* existing fn */, [...deps])
const handleDelete = useCallback(/* existing fn */, [...deps])
const columns = useMemo(
  () => buildTableColumns(catMap, spenderMap, token, openEdit, handleDelete),
  [catMap, spenderMap, token, openEdit, handleDelete]
)
```

---

### M3. Dynamically import Recharts

**File:** `components/Dashboard.tsx`
**Time:** 20 min
**Impact:** LCP — removes ~120 KB from initial bundle; chart is below fold

Extract the chart into a separate component, then:

```ts
import dynamic from 'next/dynamic'
const SpendingChart = dynamic(() => import('./SpendingChart'), { ssr: false })
```

---

### M4. Replace full-viewport spinners with skeleton UI

**File:** `components/AppShell.tsx`
**Time:** 45 min
**Impact:** LCP, CLS — content-shaped skeleton prevents layout shift on data arrival

Replace `<Spin size="large" />` with antd `<Skeleton active />` layouts that approximate the stat cards + chart + table structure.

---

### M5. Fix dark mode FOUC

**File:** `app/layout.tsx` (inline script)
**Time:** 20 min
**Impact:** CLS (visual), UX

Add a blocking inline script in `<head>` before React hydration:

```html
<script dangerouslySetInnerHTML={{ __html: `
  (function() {
    try {
      var t = localStorage.getItem('em-theme');
      if (t === 'dark') document.documentElement.classList.add('dark');
    } catch(e) {}
  })();
` }} />
```

---

### M6. Add PNG icons for PWA manifest

**Time:** 20 min (use any SVG-to-PNG converter)
**Impact:** PWA install on iOS and older Android

- Create `public/icons/icon-192.png` and `public/icons/icon-512.png`
- Update `app/manifest.ts` icons array to include both SVG and PNG entries
- Add `icons` to the metadata export in `app/layout.tsx` for `apple-touch-icon`

---

### M7. Fix service worker registration timing

**File:** `app/layout.tsx`
**Time:** 20 min
**Impact:** Caching — SW must register on page load, not after auth

Move registration from `useAppShell` to a `<Script strategy="afterInteractive">` tag in the root layout:

```tsx
import Script from 'next/script'
// In layout return:
;<Script id="sw-register" strategy="afterInteractive">{`
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js');
  }
`}</Script>
```

---

### M8. Add custom 404 page

**File:** `app/not-found.tsx` (new)
**Time:** 15 min
**Impact:** UX, crawl signal quality

---

### M9. Fix mobile logo link accessibility

**File:** `components/AppShell.tsx` line 64
**Time:** 2 min
**Impact:** Accessibility, crawl signal

```tsx
<Link href="/" aria-label="Expense Manager home">
```

---

## LOW — Backlog

| #   | Task                                                                                     | File                               | Time   |
| --- | ---------------------------------------------------------------------------------------- | ---------------------------------- | ------ |
| L1  | Add `id: '/'` to PWA manifest                                                            | `app/manifest.ts`                  | 2 min  |
| L2  | Add `screenshots` to PWA manifest                                                        | `app/manifest.ts`                  | 30 min |
| L3  | Add alt text to Avatar component                                                         | `components/AppShell.tsx` line 116 | 5 min  |
| L4  | Remove persistent `will-change: transform` from `.card-lift`; apply only on hover via JS | `app/globals.css`                  | 15 min |
| L5  | Add `app/error.tsx` for graceful runtime error handling                                  | New file                           | 15 min |
| L6  | Consider renaming `/auth` to `/sign-in`                                                  | Route rename                       | 10 min |
| L7  | Scope SW cache — exclude Firestore + OAuth API responses                                 | `public/sw.js`                     | 20 min |
| L8  | Add `touch-action: manipulation` reset for buttons/links                                 | `app/globals.css`                  | 5 min  |
| L9  | Add `BreadcrumbList` JSON-LD per page (when auth wall is resolved)                       | All `page.tsx` files               | 30 min |

---

## Score Projection

| Phase                          | Items Completed   | Estimated Score |
| ------------------------------ | ----------------- | --------------- |
| Baseline (current)             | —                 | 32/100          |
| After Critical                 | C1–C6             | ~48/100         |
| After Critical + High          | C1–C6, H1–H5      | ~62/100         |
| After Critical + High + Medium | All above + M1–M9 | ~75/100         |
| After all items                | All above + Low   | ~82/100         |
