'use client'

import type { Category, ChatCard, Expense, Spender } from '@/lib/types'
import type { ActionItem } from '@/hooks/useChat'
import ExpenseCard from './ExpenseCard'
import CategoryCard from './CategoryCard'
import SpenderCard from './SpenderCard'
import BudgetCard from './BudgetCard'
import SpendingSummaryCard from './SpendingSummaryCard'

export interface RenderData {
  categories: Category[]
  spenders: Spender[]
  expenses: Expense[]
}

/**
 * The agent-surfaced component catalog. Maps a proposed action (or a summary
 * card) to the component that renders it — the single registration point, and
 * the seam where a future A2UI renderer would plug in.
 */
export function ChatActionCard({
  item,
  data,
  onConfirm,
  onCancel,
}: {
  item: ActionItem
  data: RenderData
  onConfirm: () => void
  onCancel: () => void
}) {
  const t = item.action.type
  if (t.endsWith('_expense')) {
    return (
      <ExpenseCard
        item={item}
        categories={data.categories}
        spenders={data.spenders}
        expenses={data.expenses}
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    )
  }
  if (t.endsWith('_category')) {
    return <CategoryCard item={item} categories={data.categories} onConfirm={onConfirm} onCancel={onCancel} />
  }
  if (t.endsWith('_spender')) {
    return <SpenderCard item={item} spenders={data.spenders} onConfirm={onConfirm} onCancel={onCancel} />
  }
  if (t === 'set_budget') {
    return <BudgetCard item={item} />
  }
  return null
}

export function ChatCardView({ card }: { card: ChatCard }) {
  if (card.kind === 'spending_summary') return <SpendingSummaryCard card={card} />
  return null
}
