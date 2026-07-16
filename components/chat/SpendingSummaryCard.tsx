'use client'

import { theme } from 'antd'
import { PieChartOutlined } from '@ant-design/icons'
import type { ChatCard } from '@/lib/types'
import { formatINR } from '@/utils/formatters'

export default function SpendingSummaryCard({ card }: { card: ChatCard }) {
  const { token } = theme.useToken()
  const max = Math.max(1, ...card.breakdown.map((b) => b.amount))

  return (
    <div
      className="rounded-xl p-4 my-2"
      style={{ background: token.colorFillAlter, border: `1px solid ${token.colorBorderSecondary}` }}
    >
      <div className="flex items-center gap-2 mb-3">
        <PieChartOutlined style={{ color: token.colorPrimary }} />
        <span className="font-medium" style={{ color: token.colorText }}>
          {card.title}
        </span>
        <span className="ml-auto font-semibold" style={{ color: token.colorText }}>
          {formatINR(card.total)}
        </span>
      </div>

      <div className="flex flex-col gap-2">
        {card.breakdown.map((b, i) => (
          <div key={i} className="flex flex-col gap-1">
            <div className="flex justify-between text-xs" style={{ color: token.colorTextSecondary }}>
              <span>{b.label}</span>
              <span>{formatINR(b.amount)}</span>
            </div>
            <div className="h-2 rounded-full" style={{ background: token.colorFill }}>
              <div
                className="h-2 rounded-full"
                style={{ width: `${Math.round((b.amount / max) * 100)}%`, background: token.colorPrimary }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
