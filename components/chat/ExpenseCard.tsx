'use client'

import { Tag, theme } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import type { AgentAction, Category, Expense, Spender } from '@/lib/types'
import type { ActionItem } from '@/hooks/useChat'
import { formatINR } from '@/utils/formatters'
import CardShell from './CardShell'

interface Props {
  item: ActionItem
  categories: Category[]
  spenders: Spender[]
  expenses: Expense[]
  onConfirm: () => void
  onCancel: () => void
}

function CategoryChip({ id, categories }: { id?: string; categories: Category[] }) {
  if (!id) return null
  const cat = categories.find((c) => c.id === id)
  if (!cat) return null
  return <Tag color={cat.color}>{cat.name}</Tag>
}

function ExpenseRow({
  expense,
  categories,
  spenders,
}: {
  expense: Partial<Expense>
  categories: Category[]
  spenders: Spender[]
}) {
  const { token } = theme.useToken()
  const spender = expense.spenderId ? spenders.find((s) => s.id === expense.spenderId) : undefined
  return (
    <div className="flex items-baseline gap-2 flex-wrap">
      {expense.amount !== undefined && (
        <span className="text-lg font-semibold" style={{ color: token.colorText }}>
          {formatINR(expense.amount)}
        </span>
      )}
      {expense.description && <span style={{ color: token.colorText }}>{expense.description}</span>}
      <CategoryChip id={expense.categoryId} categories={categories} />
      <span className="text-xs" style={{ color: token.colorTextSecondary }}>
        {[expense.date, expense.time].filter(Boolean).join(' ')}
        {spender ? ` · ${spender.name}` : ''}
      </span>
    </div>
  )
}

export default function ExpenseCard({ item, categories, spenders, expenses, onConfirm, onCancel }: Props) {
  const { token } = theme.useToken()
  const action = item.action as Extract<AgentAction, { type: `${string}_expense` }>

  if (action.type === 'add_expense') {
    return (
      <CardShell
        icon={<PlusOutlined style={{ color: token.colorSuccess }} />}
        title="Expense added"
        status={item.status}
      >
        <ExpenseRow expense={action.expense} categories={categories} spenders={spenders} />
      </CardShell>
    )
  }

  if (action.type === 'update_expense') {
    const target = expenses.find((e) => e.id === action.id)
    return (
      <CardShell
        icon={<EditOutlined style={{ color: token.colorWarning }} />}
        title="Edit expense"
        status={item.status}
        onConfirm={onConfirm}
        onCancel={onCancel}
      >
        {target && (
          <div className="mb-1 text-xs line-through" style={{ color: token.colorTextSecondary }}>
            <ExpenseRow expense={target} categories={categories} spenders={spenders} />
          </div>
        )}
        <ExpenseRow expense={{ ...target, ...action.patch }} categories={categories} spenders={spenders} />
      </CardShell>
    )
  }

  // delete_expense
  const target = expenses.find((e) => e.id === action.id)
  return (
    <CardShell
      icon={<DeleteOutlined style={{ color: token.colorError }} />}
      title="Delete expense"
      status={item.status}
      onConfirm={onConfirm}
      onCancel={onCancel}
    >
      {target ? (
        <ExpenseRow expense={target} categories={categories} spenders={spenders} />
      ) : (
        <span style={{ color: token.colorTextSecondary }}>This expense is no longer available.</span>
      )}
    </CardShell>
  )
}
