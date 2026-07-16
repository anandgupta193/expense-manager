'use client'

import { Tag, theme } from 'antd'
import { TagsOutlined } from '@ant-design/icons'
import type { AgentAction, Category } from '@/lib/types'
import type { ActionItem } from '@/hooks/useChat'
import CardShell from './CardShell'

interface Props {
  item: ActionItem
  categories: Category[]
  onConfirm: () => void
  onCancel: () => void
}

export default function CategoryCard({ item, categories, onConfirm, onCancel }: Props) {
  const { token } = theme.useToken()
  const action = item.action as Extract<AgentAction, { type: `${string}_category` }>
  const gated = action.type !== 'add_category'
  const title =
    action.type === 'add_category'
      ? 'Category added'
      : action.type === 'update_category'
        ? 'Edit category'
        : 'Delete category'

  const current = 'id' in action ? categories.find((c) => c.id === action.id) : undefined
  const name =
    action.type === 'add_category'
      ? action.category.name
      : action.type === 'update_category'
        ? (action.patch.name ?? current?.name ?? action.id)
        : (current?.name ?? action.id)
  const color =
    action.type === 'add_category'
      ? action.category.color
      : action.type === 'update_category'
        ? (action.patch.color ?? current?.color)
        : current?.color

  return (
    <CardShell
      icon={<TagsOutlined style={{ color: token.colorPrimary }} />}
      title={title}
      status={item.status}
      onConfirm={gated ? onConfirm : undefined}
      onCancel={gated ? onCancel : undefined}
    >
      <Tag color={color}>{name}</Tag>
    </CardShell>
  )
}
