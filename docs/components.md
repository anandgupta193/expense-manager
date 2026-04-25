# Components

All components are `"use client"`. They render JSX only — all state and logic lives in the companion hook.

## AppShell (`components/AppShell.tsx`)

**Responsibility:** Root layout wrapper. Renders sticky top nav (desktop) and fixed bottom tab bar (mobile). Registers the service worker, starts reminder polling, and handles auth UI.

**Consumes:**

- `useAuthContext()` — for `user`, `loading`, `signInWithGoogle`, `signOut`
- `useTheme()` — for theme toggle button state
- `useAppShell()` — registers service worker
- `useReminder()` — starts notification polling
- `NAV_ITEMS` from `constants/navigation.tsx`
- `theme.useToken()` — all colors from antd tokens

**Auth behaviour:**

- While `loading`: renders a full-screen spinner
- When `user === null`: renders `<SignInPage>` (no nav, no layout)
- When `user !== null`: mounts `<DataProvider user={user}>` then renders full app layout

**Auth UI in top nav (desktop):**

- Signed out: "Sign in with Google" button
- Signed in: antd `<Avatar>` with user photo / initials + dropdown menu with sign-out option

**Layout:**

```
<div> (min-h-screen flex-col)
  <header> sticky top nav (hidden on mobile)
    logo | desktop nav links | theme toggle | auth UI
  </header>
  <main> page content (pb-24 on mobile for tab bar clearance)
  <nav> fixed bottom tab bar (md:hidden)
```

---

## SignInPage (`components/SignInPage.tsx`)

**Responsibility:** Full-screen sign-in prompt shown to unauthenticated users.

**Consumes:** `useAuthContext()` for `signInWithGoogle`

**UI:** Centered card with app name, tagline, and "Sign in with Google" button.

---

## AddExpenseFAB (`components/AddExpenseFAB.tsx`)

**Responsibility:** Floating action button that opens the Add Expense form (drawer on mobile, modal on desktop).

**Hook:** `useAddExpense()`

**Ref:** Exported as a `forwardRef` with type `AddExpenseFABRef { open(): void }`. Parent components can call `fabRef.current?.open()` to trigger the modal programmatically (used by Dashboard for `?action=add` URL param and by ExpenseTable's header button).

**Form fields:** Description (with autocomplete), Amount, Date (date-only picker — time is auto-captured at save), Category, Spent By (optional), Notes (optional).

---

## Dashboard (`components/Dashboard.tsx`)

**Responsibility:** Main overview page. Displays stat cards, daily spending chart, donut chart, per-category breakdown, and a floating add button.

**Hooks:** `useDashboard()`, `useBudgetContext()`, `useAppData()`, `useSearchParams()`, `useRouter()`

**Sections:**

- Stat cards: This Month Total, Transaction Count, Top Category, Budget Remaining
- Spender filter — single-select dropdown to filter all dashboard data by one spender
- Month picker — select any past or current month
- Daily spending line chart (Recharts `LineChart`) — total spend per day for the selected month; X-axis labels every 5 days
- Donut chart (Recharts `PieChart`) — top 5 category breakdown
- Category breakdown — ranked progress bars for all categories
- `AddExpenseFAB` (with `ref`) — opened programmatically when `?action=add` is in the URL

---

## CategoryManager (`components/CategoryManager.tsx`)

**Responsibility:** CRUD for expense categories.

**Hook:** `useCategoryManager()`

**Layout:**

- Add form: name input + color picker (`antd ColorPicker`) + Add button
- Category list: color swatch · name · expense count · Edit/Delete buttons
- Edit modal: same fields as add form, pre-populated

**Constraints:** Cannot delete a category that has expenses referencing it.

---

## SpenderManager (`components/SpenderManager.tsx`)

**Responsibility:** CRUD for spenders (people who incur expenses).

**Hook:** `useSpenderManager()`

**Layout:**

- Add form: name input + avatar color picker + Add button
- Spender list: colored avatar · name · expense count · "You" tag (if `spender.id === currentUserId`) · Edit/Delete buttons
- Edit modal: same fields, pre-populated

**Constraints:** Cannot delete a spender that has expenses referencing it. Clicking delete always shows `<Popconfirm>`; if spender has expenses, the description warns and confirm triggers `message.warning` without deleting.

**SpenderAvatar:** Local sub-component — colored circle with initials (first letter of name).

---

## ReminderSettings (`components/ReminderSettings.tsx`)

**Responsibility:** Configure daily expense reminder notification.

**Hook:** `useReminderSettings()`

**UI:**

- Enable/disable toggle (requests `Notification` permission on enable)
- Time picker (antd `TimePicker`) — sets fire time in `HH:MM`

Settings are persisted immediately to localStorage on change.

---

## BudgetSettings (`components/BudgetSettings.tsx`)

**Responsibility:** Configure monthly budget limits per category (or overall).

**Hook:** `useBudgetSettings()`

**UI:**

- Enable/disable budget tracking toggle
- Budget amount inputs per category (or a global monthly limit)

Settings are persisted to Firestore (`users/{uid}/settings.budget`) via `useBudgetContext()`.

---

## antd v6 Usage Notes

- Use `options` prop on `<Select>`, not `<Select.Option>` (deprecated)
- `<Statistic>` uses `styles.content`, not `valueStyle`
- `<ColorPicker>` value is `Color | string`; call `.toHexString()` via `resolveColor()` in `utils/formatters.ts`
