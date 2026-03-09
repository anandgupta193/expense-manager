'use client'

import { Button, DatePicker, Form, Input, InputNumber, Modal, Select, Table, Typography, Empty, theme, Tag } from 'antd'
import {
  RiseOutlined,
  FallOutlined,
  WalletOutlined,
  CalendarOutlined,
  DownloadOutlined,
  PlusOutlined,
} from '@ant-design/icons'
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
  animDelay = '0ms',
}: {
  label: string
  value: string
  icon: React.ReactNode
  color: string
  animDelay?: string
}) {
  const { token } = theme.useToken()
  return (
    <div
      className="rounded-2xl p-5 flex items-center gap-4 card-lift fade-up relative overflow-hidden"
      style={{
        background: token.colorBgContainer,
        border: `1px solid ${token.colorBorderSecondary}`,
        borderTop: `3px solid ${color}`,
        boxShadow: `0 2px 16px rgba(0,0,0,0.06)`,
        animationDelay: animDelay,
      }}
    >
      {/* Subtle tint in background corner */}
      <div
        className="absolute -bottom-4 -right-4 w-20 h-20 rounded-full pointer-events-none"
        style={{ background: `${color}0c` }}
      />

      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center text-lg flex-shrink-0 relative z-10"
        style={{
          background: `${color}18`,
          color,
          boxShadow: `0 0 0 5px ${color}0e`,
        }}
      >
        {icon}
      </div>

      <div className="min-w-0 flex-1 relative z-10">
        <Text
          type="secondary"
          style={{
            fontSize: 11,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            fontWeight: 600,
            display: 'block',
          }}
        >
          {label}
        </Text>
        <Text strong className="block truncate" style={{ fontSize: 20, lineHeight: 1.25, color: token.colorText }}>
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
    selectedMonth,
    setSelectedMonth,
    modalOpen,
    form,
    addModalOpen,
    addForm,
    filteredExpenses,
    monthFilteredExpenses,
    monthlyGroups,
    total,
    monthTotal,
    topCat,
    chartData,
    columns,
    categoryOptions,
    spenderOptions,
    closeEdit,
    handleEditSave,
    openAddModal,
    closeAddModal,
    handleAddSave,
    handleExportCSV,
  } = useDashboard()

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="fade-up flex items-end justify-between flex-wrap gap-3">
        <div>
          <Title level={3} style={{ marginBottom: 2, fontWeight: 700, fontSize: 22 }}>
            Dashboard
          </Title>
          <Text type="secondary" style={{ fontSize: 13 }}>
            Overview of all your expenses
          </Text>
        </div>
        <div className="flex items-center gap-3">
          {monthFilteredExpenses.length > 0 && (
            <Tag
              style={{
                borderRadius: 20,
                fontSize: 12,
                padding: '2px 10px',
                border: `1px solid ${token.colorBorderSecondary}`,
                background: token.colorFillAlter,
                color: token.colorTextSecondary,
              }}
            >
              {monthFilteredExpenses.length} transactions
            </Tag>
          )}
          <Button type="primary" icon={<PlusOutlined />} onClick={openAddModal}>
            Add Expense
          </Button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 stagger">
        <StatCard
          label="Total Spent"
          value={formatINR(total)}
          icon={<WalletOutlined />}
          color={token.colorPrimary}
          animDelay="0ms"
        />
        <StatCard
          label="This Month"
          value={formatINR(monthTotal)}
          icon={<CalendarOutlined />}
          color={token.colorWarning}
          animDelay="65ms"
        />
        <StatCard
          label="Transactions"
          value={`${filteredExpenses.length}`}
          icon={<RiseOutlined />}
          color={token.colorSuccess}
          animDelay="130ms"
        />
        <StatCard
          label="Top Category"
          value={topCat ? topCat.name : '—'}
          icon={<FallOutlined />}
          color={token.colorError}
          animDelay="195ms"
        />
      </div>

      {/* Chart + breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Donut chart */}
        <div
          className="rounded-2xl overflow-hidden fade-up"
          style={{
            background: token.colorBgContainer,
            border: `1px solid ${token.colorBorderSecondary}`,
            boxShadow: '0 2px 16px rgba(0,0,0,0.05)',
            animationDelay: '80ms',
          }}
        >
          <div
            className="px-5 py-4 flex items-center justify-between"
            style={{ borderBottom: `1px solid ${token.colorBorderSecondary}` }}
          >
            <Text strong style={{ fontSize: 14, fontWeight: 600 }}>
              Spending by Category
            </Text>
            {chartData.length > 0 && (
              <Text type="secondary" style={{ fontSize: 12 }}>
                {chartData.length} categories
              </Text>
            )}
          </div>
          <div className="p-4">
            {chartData.length === 0 ? (
              <Empty description="No expenses yet" className="py-10" />
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={72}
                    outerRadius={112}
                    paddingAngle={2}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {chartData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [formatINR(Number(value)), 'Amount']}
                    contentStyle={{
                      background: token.colorBgElevated,
                      border: `1px solid ${token.colorBorderSecondary}`,
                      borderRadius: 10,
                      color: token.colorText,
                      boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                      fontSize: 13,
                    }}
                  />
                  <Legend
                    formatter={(value) => <span style={{ color: token.colorText, fontSize: 12 }}>{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Category breakdown list */}
        <div
          className="rounded-2xl overflow-hidden fade-up"
          style={{
            background: token.colorBgContainer,
            border: `1px solid ${token.colorBorderSecondary}`,
            boxShadow: '0 2px 16px rgba(0,0,0,0.05)',
            animationDelay: '140ms',
          }}
        >
          <div
            className="px-5 py-4 flex items-center justify-between"
            style={{ borderBottom: `1px solid ${token.colorBorderSecondary}` }}
          >
            <Text strong style={{ fontSize: 14, fontWeight: 600 }}>
              Category Breakdown
            </Text>
            {total > 0 && (
              <Text type="secondary" style={{ fontSize: 12 }}>
                {formatINR(total)} total
              </Text>
            )}
          </div>
          <div className="p-5">
            {chartData.length === 0 ? (
              <Empty description="No expenses yet" className="py-10" />
            ) : (
              <div className="space-y-4">
                {chartData
                  .sort((a, b) => b.value - a.value)
                  .map((item) => {
                    const pct = total > 0 ? (item.value / total) * 100 : 0
                    return (
                      <div key={item.name}>
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center gap-2.5">
                            <span
                              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                              style={{
                                background: item.color,
                                boxShadow: `0 0 0 3px ${item.color}22`,
                              }}
                            />
                            <Text className="text-sm font-medium">{item.name}</Text>
                          </div>
                          <div className="flex items-center gap-2">
                            <Text strong style={{ fontSize: 13 }}>
                              {formatINR(item.value)}
                            </Text>
                            <Text
                              type="secondary"
                              style={{
                                fontSize: 11,
                                minWidth: 30,
                                textAlign: 'right',
                              }}
                            >
                              {pct.toFixed(0)}%
                            </Text>
                          </div>
                        </div>
                        <div
                          className="h-2 rounded-full overflow-hidden"
                          style={{ background: token.colorFillSecondary }}
                        >
                          <div
                            className="h-full rounded-full progress-fill"
                            style={{
                              width: `${pct}%`,
                              background: item.color,
                              boxShadow: `0 0 8px ${item.color}60`,
                            }}
                          />
                        </div>
                      </div>
                    )
                  })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Monthly Overview */}
      {monthlyGroups.length > 0 && (
        <div className="fade-up" style={{ animationDelay: '100ms' }}>
          <div className="flex items-center justify-between mb-3">
            <Text strong style={{ fontSize: 14 }}>
              Monthly Overview
            </Text>
            {selectedMonth && (
              <Button size="small" type="text" onClick={() => setSelectedMonth(null)}>
                View all months
              </Button>
            )}
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {monthlyGroups.map((g) => {
              const isActive = selectedMonth?.format('YYYY-MM') === g.monthKey
              return (
                <div
                  key={g.monthKey}
                  onClick={() => setSelectedMonth(isActive ? null : g.dayjsObj)}
                  className="flex-shrink-0 rounded-xl px-4 py-3 cursor-pointer card-lift"
                  style={{
                    minWidth: 130,
                    background: isActive ? token.colorPrimary : token.colorBgContainer,
                    border: `1px solid ${isActive ? token.colorPrimary : token.colorBorderSecondary}`,
                    boxShadow: isActive ? `0 4px 12px ${token.colorPrimary}35` : '0 1px 6px rgba(0,0,0,0.04)',
                    color: isActive ? '#fff' : token.colorText,
                    transition: 'all 0.18s ease',
                  }}
                >
                  <Text style={{ fontSize: 12, display: 'block', opacity: 0.75, color: 'inherit' }}>{g.label}</Text>
                  <Text strong style={{ fontSize: 16, display: 'block', color: 'inherit' }}>
                    {formatINR(g.total)}
                  </Text>
                  <Text style={{ fontSize: 11, opacity: 0.65, color: 'inherit' }}>
                    {g.count} expense{g.count !== 1 ? 's' : ''}
                  </Text>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Filters */}
      <div
        className="flex items-center gap-3 flex-wrap rounded-2xl px-5 py-4 fade-up"
        style={{
          background: token.colorBgContainer,
          border: `1px solid ${token.colorBorderSecondary}`,
          boxShadow: '0 1px 6px rgba(0,0,0,0.04)',
          animationDelay: '100ms',
        }}
      >
        {spenders.length > 0 && (
          <>
            <Text type="secondary" style={{ fontSize: 13, fontWeight: 500 }}>
              Filter by spender
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
          </>
        )}
        <DatePicker
          picker="month"
          placeholder="Filter by month"
          value={selectedMonth}
          onChange={(val) => setSelectedMonth(val)}
          allowClear
          style={{ minWidth: 160 }}
        />
      </div>

      {/* Expenses table */}
      <div
        className="rounded-2xl overflow-hidden fade-up"
        style={{
          background: token.colorBgContainer,
          border: `1px solid ${token.colorBorderSecondary}`,
          boxShadow: '0 2px 16px rgba(0,0,0,0.05)',
          animationDelay: '120ms',
        }}
      >
        <div
          className="px-5 py-4 flex items-center justify-between"
          style={{ borderBottom: `1px solid ${token.colorBorderSecondary}` }}
        >
          <Text strong style={{ fontSize: 14, fontWeight: 600 }}>
            {selectedMonth ? `${selectedMonth.format('MMMM YYYY')} Expenses` : 'All Expenses'}
          </Text>
          <div className="flex items-center gap-3">
            <Text type="secondary" style={{ fontSize: 12 }}>
              {monthFilteredExpenses.length} records
            </Text>
            <Button
              icon={<DownloadOutlined />}
              size="small"
              onClick={handleExportCSV}
              disabled={monthFilteredExpenses.length === 0}
              style={{ borderRadius: 8 }}
            >
              Export CSV
            </Button>
          </div>
        </div>
        <div className="p-4">
          <Table
            dataSource={monthFilteredExpenses}
            columns={columns}
            rowKey="id"
            pagination={{ pageSize: 10, hideOnSinglePage: true, showSizeChanger: false }}
            scroll={{ x: 'max-content' }}
            locale={{ emptyText: <Empty description="No expenses yet" /> }}
            size="small"
          />
        </div>
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

      {/* Add Expense modal */}
      <Modal title="Add Expense" open={addModalOpen} onCancel={closeAddModal} footer={null} destroyOnHidden>
        <Form form={addForm} layout="vertical" onFinish={handleAddSave} className="pt-4">
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
            <Button onClick={closeAddModal}>Cancel</Button>
            <Button type="primary" htmlType="submit" icon={<PlusOutlined />}>
              Add Expense
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  )
}
