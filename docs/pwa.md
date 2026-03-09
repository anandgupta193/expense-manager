# PWA & Notifications

## Service Worker (`public/sw.js`)

**Strategy:** Network-first with cache fallback.

```mermaid
flowchart TD
    R[Fetch request] --> NF{Network\navailable?}
    NF -->|Yes| N[Fetch from network]
    N --> UC[Update cache]
    UC --> RS[Return response]
    NF -->|No| CF[Return from cache]
    CF --> RS
```

**Static pre-cache on install:** `/`, `/categories`, `/spenders`, `/settings`

**Cache name:** `em-v1` — bump this string to force cache invalidation on deploy.

**Activation:** Old caches with different names are deleted. `clients.claim()` takes control immediately.

**Registration:** `hooks/useAppShell.ts` calls `navigator.serviceWorker.register('/sw.js')` inside a `useEffect` in `AppShell` (runs on every page).

---

## PWA Manifest (`app/manifest.ts`)

Generated at `/manifest.webmanifest` via Next.js built-in manifest route.

| Field              | Value           |
| ------------------ | --------------- |
| `name`             | Expense Manager |
| `short_name`       | Expenses        |
| `start_url`        | `/`             |
| `display`          | `standalone`    |
| `orientation`      | `portrait`      |
| `background_color` | `#f9fafb`       |
| `theme_color`      | `#6366f1`       |

**Icons:**

- `public/icons/icon-192.svg` — 192×192, `maskable`
- `public/icons/icon-512.svg` — 512×512, `any`

---

## Notification System

```mermaid
sequenceDiagram
    participant U as User
    participant RS as ReminderSettings
    participant S as lib/storage
    participant R as useReminder (polling)
    participant N as Browser Notification API

    U->>RS: Toggles enable ON
    RS->>N: requestPermission()
    N-->>RS: "granted"
    RS->>S: setReminder({ enabled: true, time: "HH:MM" })

    loop Every 60 seconds
        R->>S: getReminder()
        R->>R: Check current HH:MM == config.time
        R->>R: Check not already fired today
        R->>N: new Notification("Expense Manager", { body, icon })
    end
```

**Hook:** `lib/useReminder.ts` — mounted in `AppShell`, runs on every page.

**Fire conditions (all must be true):**

1. `config.enabled === true`
2. `Notification.permission === 'granted'`
3. Current `HH:MM` matches `config.time`
4. `lastFiredRef.current !== today` (prevents duplicate in the same minute)

**Permission flow:**

- Requested only when user enables the toggle in Settings
- If denied, toggle stays off and a warning toast is shown
- Re-enabling re-requests permission

**Configuration storage:** `em-reminder` key → `{ enabled: boolean, time: "HH:MM" }`

**Default:** `{ enabled: false, time: "23:00" }` from `config/reminder.json`
