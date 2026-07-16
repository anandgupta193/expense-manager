import type { AgentAction, BudgetConfig, Category, Expense, Spender } from '@/lib/types'

export interface ApplyContext {
  expenses: Expense[]
  categories: Category[]
  spenders: Spender[]
  setExpenses: (next: Expense[]) => void
  setCategories: (next: Category[]) => void
  setSpenders: (next: Spender[]) => void
  setBudget: (b: BudgetConfig) => void
}

/**
 * Apply a batch of agent actions through the existing data setters. Each
 * collection is written at most once per batch so we never race the
 * full-collection Firestore rewrite behind setExpenses/setCategories/setSpenders.
 */
export function applyActions(actions: AgentAction[], ctx: ApplyContext): void {
  let expenses = ctx.expenses
  let categories = ctx.categories
  let spenders = ctx.spenders
  let budget: BudgetConfig | null = null
  let expensesChanged = false
  let categoriesChanged = false
  let spendersChanged = false

  for (const action of actions) {
    switch (action.type) {
      case 'add_expense':
        expenses = [action.expense, ...expenses]
        expensesChanged = true
        break
      case 'update_expense':
        expenses = expenses.map((e) => (e.id === action.id ? { ...e, ...action.patch } : e))
        expensesChanged = true
        break
      case 'delete_expense':
        expenses = expenses.filter((e) => e.id !== action.id)
        expensesChanged = true
        break
      case 'add_category':
        categories = [...categories, action.category]
        categoriesChanged = true
        break
      case 'update_category':
        categories = categories.map((c) => (c.id === action.id ? { ...c, ...action.patch } : c))
        categoriesChanged = true
        break
      case 'delete_category':
        categories = categories.filter((c) => c.id !== action.id)
        categoriesChanged = true
        break
      case 'add_spender':
        spenders = [...spenders, action.spender]
        spendersChanged = true
        break
      case 'update_spender':
        spenders = spenders.map((s) => (s.id === action.id ? { ...s, ...action.patch } : s))
        spendersChanged = true
        break
      case 'delete_spender':
        spenders = spenders.filter((s) => s.id !== action.id)
        spendersChanged = true
        break
      case 'set_budget':
        budget = { monthlyLimit: action.monthlyLimit }
        break
    }
  }

  if (expensesChanged) ctx.setExpenses(expenses)
  if (categoriesChanged) ctx.setCategories(categories)
  if (spendersChanged) ctx.setSpenders(spenders)
  if (budget) ctx.setBudget(budget)
}
