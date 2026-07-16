'use client'

import { theme } from 'antd'
import { WalletOutlined } from '@ant-design/icons'
import type { AgentAction } from '@/lib/types'
import type { ActionItem } from '@/hooks/useChat'
import { formatINR } from '@/utils/formatters'
import CardShell from './CardShell'

export default function BudgetCard({ item }: { item: ActionItem }) {
  const { token } = theme.useToken()
  const action = item.action as Extract<AgentAction, { type: 'set_budget' }>
  return (
    <CardShell
      icon={<WalletOutlined style={{ color: token.colorPrimary }} />}
      title="Monthly budget set"
      status={item.status}
    >
      <span className="text-lg font-semibold" style={{ color: token.colorText }}>
        {action.monthlyLimit === null ? 'No limit' : formatINR(action.monthlyLimit)}
      </span>
    </CardShell>
  )
}
