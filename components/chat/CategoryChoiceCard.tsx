'use client'

import { useState } from 'react'
import { Tag, Input, Button, theme } from 'antd'
import { PlusOutlined, CheckCircleFilled } from '@ant-design/icons'
import type { Category } from '@/lib/types'
import type { PendingCategory } from '@/hooks/useChat'
import { formatINR } from '@/utils/formatters'

interface Props {
  pendingCategory: PendingCategory
  categories: Category[]
  onPick: (categoryId: string) => void
  onCreate: (name: string) => void
}

export default function CategoryChoiceCard({ pendingCategory, categories, onPick, onCreate }: Props) {
  const { token } = theme.useToken()
  const [adding, setAdding] = useState(false)
  const [name, setName] = useState('')
  const { pending, status, chosenLabel } = pendingCategory

  const submitNew = () => {
    if (!name.trim()) return
    onCreate(name)
    setName('')
    setAdding(false)
  }

  return (
    <div
      className="rounded-xl p-4 my-2"
      style={{
        background: token.colorFillAlter,
        border: `1px solid ${token.colorBorderSecondary}`,
        opacity: status === 'dismissed' ? 0.6 : 1,
      }}
    >
      <div className="flex items-baseline gap-2 flex-wrap mb-1">
        <span className="text-lg font-semibold" style={{ color: token.colorText }}>
          {formatINR(pending.amount)}
        </span>
        <span style={{ color: token.colorText }}>{pending.description}</span>
      </div>

      {status === 'resolved' ? (
        <div className="flex items-center gap-2 mt-1" style={{ color: token.colorSuccess }}>
          <CheckCircleFilled />
          <span>Saved under {chosenLabel}</span>
        </div>
      ) : status === 'dismissed' ? (
        <Tag className="mt-1">Not saved</Tag>
      ) : (
        <>
          <div className="text-xs mb-2" style={{ color: token.colorTextSecondary }}>
            {pendingCategory.prompt}
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            {categories.map((c) => (
              <Tag
                key={c.id}
                color={c.color}
                onClick={() => onPick(c.id)}
                style={{ cursor: 'pointer', userSelect: 'none', margin: 0 }}
              >
                {c.name}
              </Tag>
            ))}
            {adding ? (
              <span className="inline-flex gap-1 items-center">
                <Input
                  size="small"
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onPressEnter={submitNew}
                  placeholder="New category"
                  style={{ width: 140 }}
                />
                <Button size="small" type="primary" onClick={submitNew}>
                  Add
                </Button>
                <Button size="small" onClick={() => setAdding(false)}>
                  Cancel
                </Button>
              </span>
            ) : (
              <Tag
                icon={<PlusOutlined />}
                onClick={() => setAdding(true)}
                style={{ cursor: 'pointer', userSelect: 'none', margin: 0, borderStyle: 'dashed' }}
              >
                New category
              </Tag>
            )}
          </div>
        </>
      )}
    </div>
  )
}
