import { Button, Popconfirm, Tag, Typography } from 'antd'
import { DeleteOutlined, EditOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import type { GlobalToken } from 'antd/es/theme/interface'
import type { Category, Expense, Spender } from '@/lib/types'
import { formatINR } from './formatters'

const { Text } = Typography

export function currentMonthTotal(expenses: Expense[]): number {
  const now = dayjs()
  return expenses
    .filter((e) => dayjs(e.date).month() === now.month() && dayjs(e.date).year() === now.year())
    .reduce((s, e) => s + e.amount, 0)
}

export function buildCategoryOptions(categories: Category[]) {
  return categories.map((c) => ({
    value: c.id,
    label: (
      <span className="flex items-center gap-2">
        <span className="inline-block w-3 h-3 rounded-full flex-shrink-0" style={{ background: c.color }} />
        {c.name}
      </span>
    ),
  }))
}

export function buildSpenderOptions(spenders: Spender[]) {
  return spenders.map((s) => ({
    value: s.id,
    label: (
      <span className="flex items-center gap-2">
        <span className="inline-block w-3 h-3 rounded-full flex-shrink-0" style={{ background: s.avatarColor }} />
        {s.name.split(' ')[0]}
      </span>
    ),
  }))
}

export function buildDescriptionOptions(expenses: Expense[]): { value: string }[] {
  const sorted = [...expenses].sort((a, b) => (a.date < b.date ? 1 : -1))
  const seen = new Set<string>()
  const result: { value: string }[] = []
  for (const exp of sorted) {
    const key = exp.description.toLowerCase()
    if (!seen.has(key)) {
      seen.add(key)
      result.push({ value: exp.description })
    }
  }
  return result
}

export function buildTableColumns(
  catMap: Record<string, Category>,
  spenderMap: Record<string, Spender>,
  token: GlobalToken,
  openEdit: (expense: Expense) => void,
  handleDelete: (id: string) => void
) {
  return [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      width: 112,
      sorter: (a: Expense, b: Expense) => a.date.localeCompare(b.date),
      defaultSortOrder: 'descend' as const,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'Category',
      dataIndex: 'categoryId',
      key: 'categoryId',
      width: 148,
      render: (id: string) => {
        const cat = catMap[id]
        return cat ? (
          <Tag color="default" style={{ borderColor: cat.color, color: cat.color }}>
            <span className="inline-block w-2 h-2 rounded-full mr-1" style={{ background: cat.color }} />
            {cat.name}
          </Tag>
        ) : (
          <Tag>Unknown</Tag>
        )
      },
    },
    {
      title: 'Spent By',
      dataIndex: 'spenderId',
      key: 'spenderId',
      width: 120,
      render: (spenderId: string | undefined) => {
        const spender = spenderId ? spenderMap[spenderId] : null
        if (!spender) return <Text type="secondary">—</Text>
        return (
          <span className="flex items-center gap-2">
            <span
              className="inline-block w-6 h-6 rounded-full flex-shrink-0 text-white text-xs font-bold flex items-center justify-center"
              style={{ background: spender.avatarColor, lineHeight: '24px', textAlign: 'center' }}
            >
              {spender.name.charAt(0).toUpperCase()}
            </span>
            {spender.name}
          </span>
        )
      },
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      width: 120,
      align: 'right' as const,
      sorter: (a: Expense, b: Expense) => a.amount - b.amount,
      render: (amount: number) => (
        <Text strong style={{ color: token.colorError }}>
          {formatINR(amount)}
        </Text>
      ),
    },
    {
      title: 'Notes',
      dataIndex: 'notes',
      key: 'notes',
      ellipsis: true,
      responsive: ['lg'] as 'lg'[],
    },
    {
      title: '',
      key: 'actions',
      width: 80,
      render: (_: unknown, record: Expense) => (
        <div className="flex gap-1">
          <Button type="text" icon={<EditOutlined />} size="small" onClick={() => openEdit(record)} />
          <Popconfirm
            title="Delete this expense?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="text" danger icon={<DeleteOutlined />} size="small" />
          </Popconfirm>
        </div>
      ),
    },
  ]
}
