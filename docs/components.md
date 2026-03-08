# Components

All components are `"use client"`. They render JSX only — all state and logic lives in the companion hook.

## AppShell (`components/AppShell.tsx`)

**Responsibility:** Root layout wrapper. Renders sticky top nav (desktop) and fixed bottom tab bar (mobile). Registers the service worker and starts the reminder polling.

**Consumes:**

- `useTheme()` — for theme toggle button state
- `useAppShell()` — registers service worker
- `useReminder()` — starts notification polling
- `NAV_ITEMS` from `constants/navigation.tsx`
- `theme.useToken()` — all colors from antd tokens

**Layout:**

```
<div> (min-h-screen flex-col)
  <header> sticky top nav (hidden on mobile)
    logo | desktop nav links | theme toggle button
  </header>
  <main> page content (pb-24 on mobile for tab bar clearance)
  <nav> fixed bottom tab bar (md:hidden)
```

---

## Dashboard (`components/Dashboard.tsx`)

**Responsibility:** Main overview page. Displays totals, pie chart, per-category breakdown, and full expense table with edit/delete.

**Hook:** `useDashboard()`

**Sections:**

- Stat cards: Total Expenses (all time), This Month, Average per Day, Number of Transactions
- Spender filter — dropdown to filter expense table and chart by spender
- Pie chart (Recharts `PieChart`) — category breakdown, color-coded
- Expense table (antd `Table`) — columns: Date, Description, Category, Amount, Spender, Actions
- Edit modal — inline edit of any expense field

---

## AddExpense (`components/AddExpense.tsx`)

**Responsibility:** Form to record a new expense. Redirects to `/` on success.

**Hook:** `useAddExpense()`

**Form fields:**
| Field | Component | Required |
|-------|-----------|----------|
| Description | Input | Yes |
| Amount (₹) | InputNumber | Yes (> 0) |
| Date | DatePicker | Yes |
| Category | Select | Yes |
| Spender | Select | No |
| Notes | TextArea | No |

On submit: saves to localStorage via hook, shows success message, pushes to `/`.

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
- Spender list: colored avatar · name · expense count · Edit/Delete buttons
- Edit modal: same fields, pre-populated

**Constraints:** Cannot delete a spender that has expenses referencing it.

**SpenderAvatar:** Local sub-component — colored circle with initials (first letter of name).

---

## ReminderSettings (`components/ReminderSettings.tsx`)

**Responsibility:** Configure daily expense reminder notification.

**Hook:** `useReminderSettings()`

**UI:**

- Enable/disable toggle (requests `Notification` permission on enable)
- Time picker (antd `TimePicker`) — sets fire time in `HH:MM`

Settings are persisted immediately on change.

---

## antd v6 Usage Notes

- Use `options` prop on `<Select>`, not `<Select.Option>` (deprecated)
- `<Statistic>` uses `styles.content`, not `valueStyle`
- `<ColorPicker>` value is `Color | string`; call `.toHexString()` via `resolveColor()` in `utils/formatters.ts`
