'use client'

import { Button, DatePicker, Form, Input, InputNumber, Modal, Select, Table, Typography, Empty, theme } from 'antd'
import { RiseOutlined, FallOutlined, WalletOutlined, CalendarOutlined } from '@ant-design/icons'
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { useDashboard } from '@/hooks/useDashboard'
import { formatINR } from '@/utils/formatters'
import { requiredRule } from '@/constants/validation'

const { Title, Text } = Typography

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
  const {
    spenders,
    selectedSpenderIds,
    setSelectedSpenderIds,
    modalOpen,
    form,
    filteredExpenses,
    total,
    monthTotal,
    topCat,
    chartData,
    columns,
    categoryOptions,
    spenderOptions,
    closeEdit,
    handleEditSave,
  } = useDashboard()

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
      <Modal title="Edit Expense" open={modalOpen} onCancel={closeEdit} footer={null} destroyOnHidden>
        <Form form={form} layout="vertical" onFinish={handleEditSave} className="pt-4">
          <Form.Item label="Description" name="description" rules={[requiredRule('Enter a description')]}>
            <Input maxLength={120} />
          </Form.Item>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item label="Amount (₹)" name="amount" rules={[requiredRule('Enter amount')]}>
              <InputNumber className="w-full" min={0.01} precision={2} />
            </Form.Item>

            <Form.Item label="Date" name="date" rules={[requiredRule('Pick a date')]}>
              <DatePicker className="w-full" />
            </Form.Item>
          </div>

          <Form.Item label="Category" name="categoryId" rules={[requiredRule('Select a category')]}>
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
            <Button onClick={closeEdit}>Cancel</Button>
            <Button type="primary" htmlType="submit">
              Save Changes
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  )
}
