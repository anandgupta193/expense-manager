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

## Dashboard (`components/Dashboard.tsx`)

**Responsibility:** Main overview page. Displays totals, pie chart, per-category breakdown, and full expense table with edit/delete. Add expense is triggered from a floating action button on Dashboard (no separate `/add` route).

**Hook:** `useDashboard()`

**Sections:**

- Stat cards: Total Expenses (all time), This Month, Average per Day, Number of Transactions
- Spender filter — dropdown to filter expense table and chart by spender
- Pie chart (Recharts `PieChart`) — category breakdown, color-coded
- Expense table (antd `Table`) — columns: Date, Description, Category, Amount, Spender, Actions
- Add/Edit modal — inline form for adding a new expense or editing an existing one

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

Settings are persisted immediately to `em-budget` in localStorage on change.

---

## antd v6 Usage Notes

- Use `options` prop on `<Select>`, not `<Select.Option>` (deprecated)
- `<Statistic>` uses `styles.content`, not `valueStyle`
- `<ColorPicker>` value is `Color | string`; call `.toHexString()` via `resolveColor()` in `utils/formatters.ts`
