# Full SEO Audit Report — Expense Manager PWA

**Audit Date:** 2026-03-09
**App URL (local):** http://localhost:3000
**Stack:** Next.js 16 · React 19 · TypeScript · Ant Design v6 · Firebase (Auth + Firestore) · Tailwind CSS v4

---

## SEO Health Score: 32 / 100

| Category                      | Weight | Raw Score | Weighted        |
| ----------------------------- | ------ | --------- | --------------- |
| Technical SEO                 | 25%    | 38/100    | 9.5             |
| Content Quality               | 25%    | 38/100    | 9.5             |
| On-Page SEO                   | 20%    | 28/100    | 5.6             |
| Schema / Structured Data      | 10%    | 0/100     | 0.0             |
| Performance / Core Web Vitals | 10%    | 40/100    | 4.0             |
| Images                        | 5%     | 70/100    | 3.5             |
| AI Search Readiness           | 5%     | 15/100    | 0.75            |
| **Total**                     |        |           | **32.85 / 100** |

**Business type detected:** Personal finance PWA (SaaS/tool category, Google-authenticated, YMYL-adjacent)

---

## Top 5 Critical Issues

1. **No robots.txt or sitemap** — Googlebot has no crawl guidance whatsoever
2. **Zero security headers** — No CSP, X-Frame-Options, HSTS, Referrer-Policy on a financial app
3. **Entire app is behind auth wall** — Every URL serves only the sign-in screen to crawlers
4. **No structured data** — Zero JSON-LD/schema anywhere in the codebase
5. **LCP estimated 3.5–6 s+** — Full auth+data waterfall before any content paints

## Top 5 Quick Wins

1. Add `app/robots.ts` (5 min — stops AI crawlers + clarifies crawl intent)
2. Add `app/sitemap.ts` (10 min — minimal 5-route sitemap)
3. Add `metadataBase` + OG tags to `app/layout.tsx` (15 min)
4. Add `optimizePackageImports` for antd/recharts in `next.config.ts` (2 min — 30–50% JS reduction)
5. Remove `/add` from `public/sw.js` STATIC_URLS (2 min — fixes broken offline cache)

---

## Section 1: Technical SEO

**Score: 38 / 100**

### 1.1 Crawlability — FAIL

**[CRITICAL] robots.txt absent**
`public/robots.txt` and `app/robots.ts` do not exist. Googlebot receives a Next.js 404 on `/robots.txt`. No crawl policy is communicated. For a private financial app this also means AI training crawlers (GPTBot, ClaudeBot, PerplexityBot) have no opt-out mechanism.

**[CRITICAL] sitemap absent**
No `public/sitemap.xml` or `app/sitemap.ts`. Search engines have no structured URL discovery mechanism.

### 1.2 Indexability — FAIL

**[CRITICAL] All routes render identical thin content to unauthenticated visitors**
`AppShell` renders `<SignInPage />` when `user` is null. Googlebot sees the same ~35 words of sign-in UI on every route (`/`, `/categories`, `/spenders`, `/settings`, `/auth`). This creates cross-URL duplicate content and every page will be assessed as thin content.

**[CRITICAL] No canonical tags**
`app/layout.tsx` does not set `metadataBase`. Canonical tags are either absent or point to `localhost`, creating duplicate content risk across HTTP/HTTPS and www/non-www variants on deployment.

**[HIGH] Global title/description — zero per-page metadata**

- `title: 'Expense Manager'` — every page, identical
- `description: 'Track and manage your daily expenses'` — 36 chars (recommended: 120–160)
- No `openGraph`, no `twitter` keys in metadata

**[HIGH] /auth should be noindexed**
The `/auth` route is publicly crawlable and serves only an OAuth CTA with no content value.

**[MEDIUM] No custom 404 page**
`app/not-found.tsx` does not exist. Next.js default is served.

### 1.3 Security Headers — FAIL (0/100)

`next.config.ts` is empty — no `headers()` function. All of the following are absent:

| Header                                | Risk                                         |
| ------------------------------------- | -------------------------------------------- |
| `Content-Security-Policy`             | XSS, script injection, data exfiltration     |
| `X-Frame-Options` / `frame-ancestors` | Clickjacking                                 |
| `X-Content-Type-Options: nosniff`     | MIME sniffing                                |
| `Referrer-Policy`                     | URL leakage to Firebase/Google third-parties |
| `Permissions-Policy`                  | Unnecessary browser API access               |
| `Strict-Transport-Security`           | Downgrade attacks                            |

For a financial application storing user expense data, missing CSP and HSTS is a serious security posture problem in addition to being an SEO signal.

### 1.4 URL Structure — PASS (75/100)

Clean flat URLs: `/`, `/categories`, `/settings`, `/spenders`, `/auth`. No query-parameter pages, no deeply nested paths. Good.

**[LOW]** `/auth` vs. `/sign-in` — minor semantic clarity issue.

### 1.5 Mobile — PARTIAL (70/100)

- Viewport meta tag: Next.js injects automatically — PASS
- Mobile-first responsive layout with `md:hidden`/`hidden md:flex` — PASS
- **[MEDIUM]** Bottom nav touch targets at `py-2.5` (~44px total) — at the lower boundary; increase to `py-3`
- **[LOW]** No `touch-action: manipulation` or `-webkit-tap-highlight-color` reset

### 1.6 PWA Manifest — PARTIAL (60/100)

Core fields present in `app/manifest.ts`: `name`, `short_name`, `description`, `start_url`, `display`, `background_color`, `theme_color`, `icons`.

**[MEDIUM]** Both icons use `image/svg+xml`. Safari on iOS and older Android Chrome do not support SVG manifest icons. PNG 192×192 and 512×512 are required for cross-browser add-to-homescreen.

**[MEDIUM]** No `apple-touch-icon` link tag. Safari ignores the web manifest for homescreen icons.

**[MEDIUM]** Icon purpose split: 192px is `maskable` only, 512px is `any` only. Best practice is to provide both `any` and `maskable` at each size.

**[LOW]** No `id` field — if `start_url` changes, browsers treat it as a new app.

**[LOW]** No `screenshots` field — reduces Chrome's install dialog richness.

### 1.7 JavaScript Rendering — FAIL (10/100)

**[CRITICAL]** 100% client-side rendered. All meaningful components are `'use client'`. Page server components contain no content — they re-export client components. Root layout wraps in `<Providers>` which is also `'use client'`. Googlebot's rendering queue may index pages days after crawling, or not render them at all.

**[MEDIUM — Active Bug]** `public/sw.js` pre-caches `/add` in `STATIC_URLS` but `app/add/page.tsx` is deleted (confirmed by git status). The service worker's `install` event will attempt to `cache.addAll([..., '/add', ...])`, fetching a 404, which can silently fail or break the entire SW install.

---

## Section 2: Content Quality

**Score: 38 / 100**

### 2.1 Auth Wall Analysis

The most important structural finding: **there is no public content layer.** The app is a tool-only PWA with Google OAuth as the only entry point. Every public URL shows:

> "Track, sync, and understand your spending" + 3 bullets + "Continue with Google" button

~35 words total. This is the same content visible on all 5 routes.

### 2.2 E-E-A-T Assessment: 22 / 100

Personal finance tools are YMYL-adjacent under Google's QRG. Higher trust standards apply.

| Signal            | Score | Notes                                                                                                                                                    |
| ----------------- | ----- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Experience        | 8/20  | No first-hand use cases, testimonials, or scenarios. Three generic feature bullets.                                                                      |
| Expertise         | 12/25 | Technical implementation is solid but not visible to crawlers or users. No author, no credentials.                                                       |
| Authoritativeness | 8/25  | No external citations, press, social proof, or domain-building content.                                                                                  |
| Trustworthiness   | 14/30 | ✅ "Your data is private" note on sign-in. ✅ Google OAuth as auth mechanism. ❌ No privacy policy link. ❌ No contact info. ❌ No data deletion policy. |

### 2.3 Heading Hierarchy

`<Title level={3}>` (renders as `<h3>`) is used as the first and only heading on Dashboard, CategoryManager, SpenderManager, and SignInPage. Skips `<h1>` and `<h2>`. Search engines use heading hierarchy to establish page topic priority.

| Component       | H1  | Heading Used                   | Issue                                |
| --------------- | --- | ------------------------------ | ------------------------------------ |
| Dashboard       | ❌  | `<h3>` via `<Title level={3}>` | No H1                                |
| CategoryManager | ❌  | `<h3>`                         | No H1                                |
| SpenderManager  | ❌  | `<h3>`                         | No H1                                |
| Settings page   | ✅  | Raw `<h1>`                     | Correct — use this as the pattern    |
| SignInPage      | ❌  | `<h3>`                         | No H1 on the only public-facing page |

### 2.4 On-Page Content Depth

| URL        | Visible words (unauthenticated) | Landing page minimum | Gap        |
| ---------- | ------------------------------- | -------------------- | ---------- |
| All routes | ~35 words                       | 500 words            | −465 words |

This is a structural gap, not a word-count problem. There is no content layer.

### 2.5 Open Graph / Social Sharing

No `og:title`, `og:description`, `og:image`, or `twitter:card` tags exist. Sharing any URL produces a bare link with no preview card on any platform.

### 2.6 Trust Signals on Sign-In Page

Present: "Your data is private and only accessible to you" (line 142 `SignInPage.tsx`) — rendered at 11px, no link.

Missing:

- Privacy policy link
- Terms of service
- Contact information
- Data deletion policy
- Who built this / about

---

## Section 3: Schema / Structured Data

**Score: 0 / 100**

Zero structured data found anywhere in the codebase. No JSON-LD, microdata, or RDFa on any page.

Searched: all `.tsx` / `.ts` files for `schema.org`, `@type`, `@context`, `itemscope`, `itemtype`, `vocab=`.

### Recommended Schema (in priority order)

| Priority | Type             | Location                  | Reason                                                |
| -------- | ---------------- | ------------------------- | ----------------------------------------------------- |
| High     | `WebApplication` | `app/layout.tsx` (global) | Identifies app category, features, platform to Google |
| High     | `WebSite`        | `app/layout.tsx` (global) | Establishes canonical URL, sitelinks eligibility      |
| Medium   | `BreadcrumbList` | Per `page.tsx`            | Breadcrumb rich results (when pages become crawlable) |
| Low      | `Organization`   | `app/layout.tsx`          | Publisher identity for E-E-A-T                        |

**Not recommended:** `FAQ` (restricted to gov/health since Aug 2023), `HowTo` (rich results removed Sep 2023).

### Generated JSON-LD for `WebApplication` + `WebSite`

Add to `app/layout.tsx` inside a `<head>` block:

```tsx
function SchemaOrg() {
  const baseUrl = 'https://your-domain.com' // replace with production URL

  const webApplication = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Expense Manager',
    url: baseUrl,
    description: 'Track, sync, and understand your personal spending across all devices.',
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'All',
    browserRequirements: 'Requires JavaScript. Requires a modern browser.',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    featureList: [
      'Expense tracking',
      'Category management',
      'Multi-spender support',
      'Cloud sync via Firebase',
      'Dark mode',
      'Progressive Web App — installable',
    ],
    screenshot: `${baseUrl}/icons/icon-512.svg`,
  }

  const webSite = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Expense Manager',
    url: baseUrl,
    description: 'Track and manage your daily expenses',
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webApplication) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webSite) }} />
    </>
  )
}
```

---

## Section 4: Performance / Core Web Vitals

**Score: 40 / 100**

### 4.1 LCP — HIGH RISK (estimated 3.5–6 s+, Poor band)

The render path to first meaningful content is a 6-step waterfall:

1. HTML received (empty Next.js shell — no SSR content)
2. JS bundle (~800 KB–1 MB) downloads + parses
3. React hydrates. `useAuth` fires `onAuthStateChanged` → network round-trip to Firebase Auth
4. Full-viewport `<Spin size="large" />` shown. **This spinner is the LCP element.**
5. Auth resolves → `DataProvider` mounts → 3 parallel Firestore `getDocs` calls → second spinner
6. Data arrives → actual content paints

The LCP element (spinner) is not the intended content. After content loads, the LCP shifts to a stat card or chart heading, but this happens 3.5–6 s+ into load.

### 4.2 INP — MODERATE RISK (estimated 150–300 ms, borderline)

Key issues in `hooks/useDashboard.ts`:

- `catMap` and `spenderMap` (`Object.fromEntries`) rebuilt on every render (line 47–48) — not memoized
- `chartData` iterates all expenses × categories on every render (lines 86–93) — not memoized
- `monthlyGroups` iterates all expenses on every render (lines 65–74) — not memoized
- `buildTableColumns` called on every render — returns new array with new inline functions, invalidating antd Table's column diffing
- `openEdit` and `handleDelete` not wrapped in `useCallback` — cascade-invalidates `columns`

**Bundle weight** (estimated initial JS):

| Package             | Est. gzipped contribution |
| ------------------- | ------------------------- |
| `antd` v6           | ~400 KB                   |
| `firebase` v12      | ~200 KB                   |
| `recharts` v3       | ~120 KB                   |
| `@ant-design/icons` | ~50 KB+                   |
| **Total**           | **~800 KB – 1 MB+**       |

`next.config.ts` has no `optimizePackageImports` — the full antd library ships in every chunk.

### 4.3 CLS — LOW-MODERATE RISK (estimated 0.05–0.15)

- Auth spinner → full dashboard layout swap (full DOM replacement = layout shift event)
- Data spinner → dashboard content swap (second shift)
- Theme FOUC: `ThemeProvider` initializes to `'light'` then reads localStorage in `useEffect` → one-frame flash of wrong theme on dark-mode reload
- antd CSS-in-JS injected post-hydration (no server-side extraction configured)

### 4.4 Service Worker Issues

- **SW registration deferred** — registered inside `useAppShell` which only runs post-auth. SW is not active for unauthenticated load, defeating the caching purpose.
- **`/add` in STATIC_URLS** — route deleted, SW install will try to cache a 404
- **Cache name hardcoded** (`em-v1`) — no versioning strategy tied to build hash
- **No cache size limit** — caches all GET responses including Firestore API calls; can grow unbounded

---

## Section 5: Images

**Score: 70 / 100**

- No `<img>` tags with missing `alt` in app components
- **[LOW]** `<Avatar>` in `AppShell.tsx` line 116 uses `src={user.photoURL}` with no `alt` attribute
- **[MEDIUM]** Google Icon SVG in `SignInPage.tsx` (lines 15–21) has no `aria-label`, but the parent button has visible text — acceptable
- **[MEDIUM]** SVG icons in PWA manifest — no PNG fallbacks (see Technical section)
- README uses `placehold.co` images with correct descriptive alt text — fine for docs

---

## Section 6: AI Search Readiness

**Score: 15 / 100**

- No structured data → no machine-readable signals about app purpose or capabilities
- No `llms.txt` file
- No AI crawler directives in robots.txt (doesn't exist)
- Sign-in page content is not citable: 35 words with no substantive claims, no authorship, no factual assertions
- No authority signals: no external citations, no press, no author profile
- App is behind auth wall — AI crawlers cannot access any content
- **One positive signal:** "Your data is private and only accessible to you" is a factual, verifiable, citable claim

---

## Key File Reference

| File                        | Issues Found                                                                           |
| --------------------------- | -------------------------------------------------------------------------------------- |
| `app/layout.tsx`            | No metadataBase, no OG tags, no canonical, no schema, no per-page metadata             |
| `app/manifest.ts`           | SVG-only icons, missing apple-touch-icon, no `id`, icon purpose split                  |
| `next.config.ts`            | Empty — no headers, no optimizePackageImports                                          |
| `public/sw.js`              | Caches deleted `/add` route, late registration, no cache limit                         |
| `components/AppShell.tsx`   | Full auth wall (line 206), logo link no aria-label (line 64), Avatar no alt (line 116) |
| `hooks/useDashboard.ts`     | catMap/spenderMap/chartData/monthlyGroups/columns not memoized                         |
| `app/globals.css`           | Persistent `will-change: transform` on `.card-lift`                                    |
| `components/SignInPage.tsx` | No H1, no privacy policy link, trust signals at 11px with no href                      |
| All `page.tsx` files        | No per-page metadata exports                                                           |
