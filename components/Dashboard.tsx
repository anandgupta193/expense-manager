'use client'

import { useState } from 'react'
import {
  Button,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Select,
  Table,
  Tag,
  Typography,
  Empty,
  theme,
} from 'antd'
import {
  DeleteOutlined,
  EditOutlined,
  RiseOutlined,
  FallOutlined,
  WalletOutlined,
  CalendarOutlined,
} from '@ant-design/icons'
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import dayjs, { Dayjs } from 'dayjs'
import { storage } from '@/lib/storage'
import type { Category, Expense, Spender } from '@/lib/types'

const { Title, Text } = Typography

interface ChartData {
  name: string
  value: number
  color: string
}

interface EditFormValues {
  description: string
  amount: number
  categoryId: string
  date: Dayjs
  notes?: string
  spenderId?: string
}

function formatINR(amount: number) {
  return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function currentMonthTotal(expenses: Expense[]): number {
  const now = dayjs()
  return expenses
    .filter((e) => dayjs(e.date).month() === now.month() && dayjs(e.date).year() === now.year())
    .reduce((s, e) => s + e.amount, 0)
}

function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string
  value: string
  icon: React.ReactNode
  color: string
}) {
  const { token } = theme.useToken()
  return (
    <div
      className="rounded-xl p-4 flex items-center gap-4"
      style={{
        background: token.colorBgContainer,
        border: `1px solid ${token.colorBorderSecondary}`,
      }}
    >
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
        style={{ background: color + '20', color }}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <Text type="secondary" className="text-xs block">
          {label}
        </Text>
        <Text strong className="text-lg block truncate">
          {value}
        </Text>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { token } = theme.useToken()
  const [expenses, setExpenses] = useState<Expense[]>(() => storage.getExpenses())
  const [categories] = useState<Category[]>(() => storage.getCategories())
  const [spenders] = useState<Spender[]>(() => storage.getSpenders())
  const [selectedSpenderIds, setSelectedSpenderIds] = useState<string[]>([])
  const [editTarget, setEditTarget] = useState<Expense | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [form] = Form.useForm<EditFormValues>()

  const catMap = Object.fromEntries(categories.map((c) => [c.id, c]))
  const spenderMap = Object.fromEntries(spenders.map((s) => [s.id, s]))

  const filteredExpenses =
    selectedSpenderIds.length === 0
      ? expenses
      : expenses.filter((e) => e.spenderId && selectedSpenderIds.includes(e.spenderId))

  const total = filteredExpenses.reduce((s, e) => s + e.amount, 0)
  const monthTotal = currentMonthTotal(filteredExpenses)
  const topCat =
    categories
      .map((c) => ({
        name: c.name,
        total: filteredExpenses.filter((e) => e.categoryId === c.id).reduce((s, e) => s + e.amount, 0),
      }))
      .sort((a, b) => b.total - a.total)[0] ?? null

  const chartData: ChartData[] = categories
    .map((c) => ({
      name: c.name,
      value: filteredExpenses.filter((e) => e.categoryId === c.id).reduce((s, e) => s + e.amount, 0),
      color: c.color,
    }))
    .filter((d) => d.value > 0)

  function openEdit(expense: Expense) {
    setEditTarget(expense)
    form.setFieldsValue({
      description: expense.description,
      amount: expense.amount,
      categoryId: expense.categoryId,
      date: dayjs(expense.date),
      notes: expense.notes,
      spenderId: expense.spenderId,
    })
    setModalOpen(true)
  }

  function handleDelete(id: string) {
    const updated = expenses.filter((e) => e.id !== id)
    storage.setExpenses(updated)
    setExpenses(updated)
  }

  function handleEditSave(values: EditFormValues) {
    if (!editTarget) return
    const updated = expenses.map((e) =>
      e.id === editTarget.id
        ? {
            ...e,
            description: values.description.trim(),
            amount: values.amount,
            categoryId: values.categoryId,
            date: values.date.format('YYYY-MM-DD'),
            notes: values.notes?.trim() || undefined,
            spenderId: values.spenderId || undefined,
          }
        : e
    )
    storage.setExpenses(updated)
    setExpenses(updated)
    setModalOpen(false)
    setEditTarget(null)
  }

  const columns = [
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

  const categoryOptions = categories.map((c) => ({
    value: c.id,
    label: (
      <span className="flex items-center gap-2">
        <span className="inline-block w-3 h-3 rounded-full flex-shrink-0" style={{ background: c.color }} />
        {c.name}
      </span>
    ),
  }))

  const spenderOptions = spenders.map((s) => ({
    value: s.id,
    label: (
      <span className="flex items-center gap-2">
        <span className="inline-block w-3 h-3 rounded-full flex-shrink-0" style={{ background: s.avatarColor }} />
        {s.name}
      </span>
    ),
  }))

  return (
    <div className="space-y-6">
      {/* Page title */}
      <div>
        <Title level={3} className="!mb-0">
          Dashboard
        </Title>
        <Text type="secondary">Overview of all your expenses</Text>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total Spent" value={formatINR(total)} icon={<WalletOutlined />} color={token.colorPrimary} />
        <StatCard
          label="This Month"
          value={formatINR(monthTotal)}
          icon={<CalendarOutlined />}
          color={token.colorWarning}
        />
        <StatCard
          label="Total Expenses"
          value={`${filteredExpenses.length}`}
          icon={<RiseOutlined />}
          color={token.colorSuccess}
        />
        <StatCard
          label="Top Category"
          value={topCat ? topCat.name : '—'}
          icon={<FallOutlined />}
          color={token.colorError}
        />
      </div>

      {/* Chart + breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Donut chart */}
        <div
          className="rounded-xl p-4"
          style={{
            background: token.colorBgContainer,
            border: `1px solid ${token.colorBorderSecondary}`,
          }}
        >
          <Title level={5} className="!mb-4">
            Spending by Category
          </Title>
          {chartData.length === 0 ? (
            <Empty description="No expenses yet" className="py-8" />
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={110}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {chartData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [formatINR(Number(value)), 'Amount']}
                  contentStyle={{
                    background: token.colorBgContainer,
                    border: `1px solid ${token.colorBorderSecondary}`,
                    borderRadius: token.borderRadius,
                    color: token.colorText,
                  }}
                />
                <Legend formatter={(value) => <span style={{ color: token.colorText, fontSize: 13 }}>{value}</span>} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Category breakdown list */}
        <div
          className="rounded-xl p-4"
          style={{
            background: token.colorBgContainer,
            border: `1px solid ${token.colorBorderSecondary}`,
          }}
        >
          <Title level={5} className="!mb-4">
            Category Breakdown
          </Title>
          {chartData.length === 0 ? (
            <Empty description="No expenses yet" className="py-8" />
          ) : (
            <div className="space-y-3">
              {chartData
                .sort((a, b) => b.value - a.value)
                .map((item) => {
                  const pct = total > 0 ? (item.value / total) * 100 : 0
                  return (
                    <div key={item.name}>
                      <div className="flex justify-between items-center mb-1">
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: item.color }} />
                          <Text className="text-sm">{item.name}</Text>
                        </div>
                        <Text strong className="text-sm">
                          {formatINR(item.value)}
                        </Text>
                      </div>
                      <div
                        className="h-2 rounded-full overflow-hidden"
                        style={{ background: token.colorFillSecondary }}
                      >
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${pct}%`, background: item.color }}
                        />
                      </div>
                    </div>
                  )
                })}
            </div>
          )}
        </div>
      </div>

      {/* Spender filter */}
      {spenders.length > 0 && (
        <div className="flex items-center gap-3 flex-wrap">
          <Text type="secondary" className="text-sm">
            Filter by spender:
          </Text>
          <Select
            mode="multiple"
            allowClear
            placeholder="All spenders"
            options={spenderOptions}
            value={selectedSpenderIds}
            onChange={setSelectedSpenderIds}
            style={{ minWidth: 220 }}
          />
        </div>
      )}

      {/* Expenses table */}
      <div
        className="rounded-xl p-4"
        style={{
          background: token.colorBgContainer,
          border: `1px solid ${token.colorBorderSecondary}`,
        }}
      >
        <Title level={5} className="!mb-4">
          All Expenses ({filteredExpenses.length})
        </Title>
        <Table
          dataSource={filteredExpenses}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 10, hideOnSinglePage: true, showSizeChanger: false }}
          scroll={{ x: 'max-content' }}
          locale={{ emptyText: <Empty description="No expenses yet" /> }}
          size="small"
        />
      </div>

      {/* Edit modal */}
      <Modal
        title="Edit Expense"
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false)
          setEditTarget(null)
        }}
        footer={null}
        destroyOnHidden
      >
        <Form form={form} layout="vertical" onFinish={handleEditSave} className="pt-4">
          <Form.Item
            label="Description"
            name="description"
            rules={[{ required: true, message: 'Enter a description' }]}
          >
            <Input maxLength={120} />
          </Form.Item>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item label="Amount (₹)" name="amount" rules={[{ required: true, message: 'Enter amount' }]}>
              <InputNumber className="w-full" min={0.01} precision={2} />
            </Form.Item>

            <Form.Item label="Date" name="date" rules={[{ required: true, message: 'Pick a date' }]}>
              <DatePicker className="w-full" />
            </Form.Item>
          </div>

          <Form.Item label="Category" name="categoryId" rules={[{ required: true, message: 'Select a category' }]}>
            <Select options={categoryOptions} />
          </Form.Item>

          <Form.Item label="Spent By" name="spenderId">
            <Select
              options={spenderOptions}
              allowClear
              placeholder={spenders.length === 0 ? 'Add spenders first' : 'Select a spender'}
              disabled={spenders.length === 0}
            />
          </Form.Item>

          <Form.Item label="Notes" name="notes">
            <Input.TextArea rows={2} maxLength={200} />
          </Form.Item>

          <div className="flex gap-3 justify-end">
            <Button onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit">
              Save Changes
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  )
}
