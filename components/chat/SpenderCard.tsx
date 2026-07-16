'use client'

import { theme } from 'antd'
import { UserOutlined } from '@ant-design/icons'
import type { AgentAction, Spender } from '@/lib/types'
import type { ActionItem } from '@/hooks/useChat'
import CardShell from './CardShell'

interface Props {
  item: ActionItem
  spenders: Spender[]
  onConfirm: () => void
  onCancel: () => void
}

export default function SpenderCard({ item, spenders, onConfirm, onCancel }: Props) {
  const { token } = theme.useToken()
  const action = item.action as Extract<AgentAction, { type: `${string}_spender` }>
  const gated = action.type !== 'add_spender'
  const title =
    action.type === 'add_spender' ? 'Person added' : action.type === 'update_spender' ? 'Edit person' : 'Delete person'

  const current = 'id' in action ? spenders.find((s) => s.id === action.id) : undefined
  const name =
    action.type === 'add_spender'
      ? action.spender.name
      : action.type === 'update_spender'
        ? (action.patch.name ?? current?.name ?? action.id)
        : (current?.name ?? action.id)

  return (
    <CardShell
      icon={<UserOutlined style={{ color: token.colorPrimary }} />}
      title={title}
      status={item.status}
      onConfirm={gated ? onConfirm : undefined}
      onCancel={gated ? onCancel : undefined}
    >
      <span style={{ color: token.colorText }}>{name}</span>
    </CardShell>
  )
}
