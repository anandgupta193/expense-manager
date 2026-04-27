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
