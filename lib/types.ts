export interface Category {
  id: string
  name: string
  color: string
}

export interface Spender {
  id: string
  name: string
  avatarColor: string // hex
}

export interface Expense {
  id: string
  description: string
  amount: number
  categoryId: string
  date: string // YYYY-MM-DD
  time?: string // HH:mm
  notes?: string
  spenderId?: string
}

export type Theme = 'light' | 'dark'

export interface ReminderConfig {
  enabled: boolean
  time: string // "HH:MM"
}

export interface BudgetConfig {
  monthlyLimit: number | null // null = not set
}

export interface SpendingAnalysis {
  period: string
  categoryBreakdown: Array<{ name: string; amount: number; pct: number }>
  insights: string[]
  flags: string[]
  recommendations: string[]
  nextMonthGoals: string[]
}

export interface LocalSummary {
  totalSpent: number
  transactions: number
  avgDailySpend: number
  activeDays: number
}

/* ── v2: agentic chat ─────────────────────────────────────────────── */

// A structured mutation the agent proposes. The client is the source of truth
// and applies these via the existing useAppData()/useBudgetContext() setters.
export type AgentAction =
  | { type: 'add_expense'; expense: Expense }
  | { type: 'update_expense'; id: string; patch: Partial<Omit<Expense, 'id'>> }
  | { type: 'delete_expense'; id: string }
  | { type: 'add_category'; category: Category }
  | { type: 'update_category'; id: string; patch: Partial<Omit<Category, 'id'>> }
  | { type: 'delete_category'; id: string }
  | { type: 'add_spender'; spender: Spender }
  | { type: 'update_spender'; id: string; patch: Partial<Omit<Spender, 'id'>> }
  | { type: 'delete_spender'; id: string }
  | { type: 'set_budget'; monthlyLimit: number | null }

// add_* apply immediately; update_*/delete_* require an explicit user Confirm.
export function isDestructive(a: AgentAction): boolean {
  return a.type.startsWith('update_') || a.type.startsWith('delete_')
}

export interface DateRange {
  from: string // YYYY-MM-DD, inclusive
  to: string // YYYY-MM-DD, inclusive
}

// Non-mutating artifacts the agent surfaces (rendered by components/chat/*).
export type ChatCard = {
  kind: 'spending_summary'
  title: string
  total: number
  breakdown: Array<{ label: string; amount: number }>
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  actions?: AgentAction[]
  cards?: ChatCard[]
}

export interface ChatSnapshot {
  expenses: Expense[] // default: current month only
  range: DateRange // the window `expenses` covers (drives on-demand expansion)
  categories: Category[]
  spenders: Spender[]
  budget: BudgetConfig
}

// A fully-normalized expense still missing its (mandatory) category. The client
// finalizes it when the user picks a category chip.
export type PendingExpense = Omit<Expense, 'categoryId'>

export interface ChatRequest {
  messages: ChatMessage[]
  snapshot: ChatSnapshot
}

// SSE events streamed by /api/chat; each `data:` line is one of these.
export type ChatStreamEvent =
  | { type: 'text-delta'; delta: string }
  | { type: 'action'; action: AgentAction }
  | { type: 'card'; card: ChatCard }
  | { type: 'need_data'; range: DateRange } // client must re-POST the turn with a wider range
  | { type: 'choose_category'; prompt: string; pending: PendingExpense } // client shows a category picker to finalize
  | { type: 'done' }
  | { type: 'error'; message: string }
