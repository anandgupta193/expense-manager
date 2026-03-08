# Hooks

All hooks are `"use client"`. They own all state and logic — components only call them and render the returned values.

---

## useAuth (`hooks/useAuth.ts`)

Wraps Firebase `onAuthStateChanged`. Used inside `AuthProvider` in `app/providers.tsx`.

**Returns (`AuthState`):**

```typescript
{
  user: User | null // Firebase User object; null when signed out
  loading: boolean // true until first auth state resolved
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
}
```

**Side effects:** Subscribes to `onAuthStateChanged` on mount; unsubscribes on unmount.

---

## useDataContext (`hooks/useDataContext.ts`)

Loads all Firestore data for the authenticated user. Only called from `DataProvider` in `app/providers.tsx`.

**Parameters:** `user: User`

**Returns (`DataState`):**

```typescript
{
  expenses: Expense[]
  categories: Category[]
  spenders: Spender[]
  dataLoading: boolean
  setExpenses: (expenses: Expense[]) => void    // updates state + Firestore
  setCategories: (categories: Category[]) => void
  setSpenders: (spenders: Spender[]) => void
}
```

**Side effects:** On mount, reads all three Firestore collections in parallel. Seeds defaults (categories + self-spender) if collections are empty (new user). Each setter updates local state optimistically and writes to Firestore async.

---

## useAddExpense (`hooks/useAddExpense.ts`)

Manages the Add Expense form.

**Returns:**

```typescript
{
  form: FormInstance<AddExpenseFormValues>
  spenders: Spender[]
  categoryOptions: SelectOption[]   // { value, label } with color dot
  spenderOptions: SelectOption[]    // { value, label } with avatar
  handleSubmit: (values: AddExpenseFormValues) => void
}
```

**Side effects:** Reads categories and spenders from `useAppData()` context (no direct localStorage/Firestore access).
**On submit:** Prepends new expense via `setExpenses`, shows success toast, navigates to `/`.

---

## useDashboard (`hooks/useDashboard.ts`)

Manages all Dashboard state: expenses, filter, edit modal, derived stats, chart data.

**Returns:**

```typescript
{
  expenses: Expense[]
  categories: Category[]
  spenders: Spender[]
  selectedSpender: string | null
  setSelectedSpender: (id: string | null) => void
  filteredExpenses: Expense[]        // filtered by selectedSpender
  totalAll: number                   // sum of all expenses
  totalThisMonth: number
  avgPerDay: number                  // this month total / days elapsed
  editingExpense: Expense | null
  setEditingExpense: (e: Expense | null) => void
  handleEditSave: (updated: Expense) => void
  handleDelete: (id: string) => void
  chartData: { name: string; value: number; color: string }[]
  columns: TableColumnsType<Expense>  // antd table columns with actions
}
```

**Data source:** `useAppData()` context — no direct storage access.

---

## useCategoryManager (`hooks/useCategoryManager.ts`)

Manages category CRUD.

**Returns:**

```typescript
{
  categories: Category[]
  expenseCounts: Record<string, number>  // categoryId → count
  form: FormInstance
  editForm: FormInstance
  editingCategory: Category | null
  setEditingCategory: (c: Category | null) => void
  handleAdd: (values: { name: string; color: Color | string }) => void
  handleEdit: (values: { name: string; color: Color | string }) => void
  handleDelete: (id: string) => void
}
```

**Guards:** `handleDelete` checks `expenseCounts[id] > 0` and shows error if so.
**Data source:** `useAppData()` context.

---

## useSpenderManager (`hooks/useSpenderManager.ts`)

Manages spender CRUD.

**Returns:**

```typescript
{
  spenders: Spender[]
  expenseCounts: Record<string, number>  // spenderId → count
  editTarget: Spender | null
  modalOpen: boolean
  addForm: FormInstance
  editForm: FormInstance
  handleAdd: (values: { name: string; avatarColor: Color | string }) => void
  openEdit: (spender: Spender) => void
  closeEdit: () => void
  handleEditSave: (values: { name: string; avatarColor: Color | string }) => void
  handleDelete: (id: string) => void
  currentUserId: string | null         // user.uid — used to show "You" tag
}
```

**Guards:** `handleDelete` shows Popconfirm; if spender has expenses, `message.warning` fires and delete is aborted.
**Data source:** `useAppData()` context + `useAuthContext()` for `currentUserId`.

---

## useReminderSettings (`hooks/useReminderSettings.ts`)

Manages reminder notification config.

**Returns:**

```typescript
{
  config: ReminderConfig              // { enabled: boolean, time: "HH:MM" }
  handleToggle: (checked: boolean) => Promise<void>
  handleTimeChange: (value: Dayjs | null) => void
}
```

**Side effects:** `handleToggle(true)` calls `Notification.requestPermission()`. All changes persist immediately to `em-reminder` in localStorage.

---

## useAppShell (`hooks/useAppShell.ts`)

Registers the service worker.

**Returns:** nothing
**Side effects:** Calls `navigator.serviceWorker.register('/sw.js')` on mount (errors swallowed).

---

## useReminder (`lib/useReminder.ts`)

Polls every 60 seconds and fires a browser notification at the configured time, once per day.

**Returns:** nothing
**Side effects:** `setInterval` on mount, cleared on unmount. Uses a `useRef` to track the last-fired date and prevent duplicate notifications. Called inside `AppShell` so it runs on every page.

**Notification fires when:**

1. `config.enabled === true`
2. `Notification.permission === 'granted'`
3. Current `HH:MM` matches `config.time`
4. Has not already fired today
