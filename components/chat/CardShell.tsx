'use client'

import { Button, Tag, theme } from 'antd'
import { CheckOutlined, CloseOutlined } from '@ant-design/icons'
import type { ReactNode } from 'react'
import type { ActionItem } from '@/hooks/useChat'

interface CardShellProps {
  icon?: ReactNode
  title: string
  children?: ReactNode
  status: ActionItem['status']
  onConfirm?: () => void
  onCancel?: () => void
}

const STATUS_TAG: Record<ActionItem['status'], { color: string; label: string } | null> = {
  applied: { color: 'success', label: 'Added' },
  confirmed: { color: 'success', label: 'Done' },
  cancelled: { color: 'default', label: 'Cancelled' },
  pending: null,
}

export default function CardShell({ icon, title, children, status, onConfirm, onCancel }: CardShellProps) {
  const { token } = theme.useToken()
  const tag = STATUS_TAG[status]

  return (
    <div
      className="rounded-xl p-4 my-2"
      style={{
        background: token.colorFillAlter,
        border: `1px solid ${token.colorBorderSecondary}`,
        opacity: status === 'cancelled' ? 0.6 : 1,
      }}
    >
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="font-medium" style={{ color: token.colorText }}>
          {title}
        </span>
        {tag && (
          <Tag color={tag.color} className="ml-auto">
            {tag.label}
          </Tag>
        )}
      </div>

      {children}

      {status === 'pending' && (
        <div className="flex gap-2 mt-3">
          <Button size="small" type="primary" danger icon={<CheckOutlined />} onClick={onConfirm}>
            Confirm
          </Button>
          <Button size="small" icon={<CloseOutlined />} onClick={onCancel}>
            Cancel
          </Button>
        </div>
      )}
    </div>
  )
}
