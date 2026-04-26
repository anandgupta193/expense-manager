'use client'

import { useRef, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import dayjs from 'dayjs'
import { DatePicker, Empty, Progress, Select, Typography, theme, Tag } from 'antd'
import { RiseOutlined, FallOutlined, CalendarOutlined } from '@ant-design/icons'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { useDashboard } from '@/hooks/useDashboard'
import { formatINR } from '@/utils/formatters'
import { useBudgetContext, useAppData } from '@/app/providers'
import AddExpenseFAB, { type AddExpenseFABRef } from '@/components/AddExpenseFAB'

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
      className="rounded-2xl p-3 sm:p-5 flex items-center gap-2 sm:gap-4 card-lift fade-up relative overflow-hidden"
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
        className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center text-base sm:text-lg flex-shrink-0 relative z-10"
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
        <Text
          strong
          className="block truncate text-base sm:text-xl"
          style={{ lineHeight: 1.25, color: token.colorText }}
        >
          {value}
        </Text>
      </div>
    </div>
  )
}

function BudgetStatCard({
  remaining,
  limit,
  pct,
  color,
  animDelay = '0ms',
}: {
  remaining: number
  limit: number
  pct: number
  color: string
  animDelay?: string
}) {
  const { token } = theme.useToken()
  const valueStr = remaining >= 0 ? formatINR(remaining) : `-${formatINR(Math.abs(remaining))}`
  const spent = limit - remaining < 0 ? limit : limit - remaining
  return (
    <div
      className="rounded-2xl p-3 sm:p-5 flex items-center gap-2 sm:gap-4 card-lift fade-up relative overflow-hidden"
      style={{
        background: token.colorBgContainer,
        border: `1px solid ${token.colorBorderSecondary}`,
        borderTop: `3px solid ${color}`,
        boxShadow: `0 2px 16px rgba(0,0,0,0.06)`,
        animationDelay: animDelay,
      }}
    >
      <div
        className="absolute -bottom-4 -right-4 w-20 h-20 rounded-full pointer-events-none"
        style={{ background: `${color}0c` }}
      />

      <div className="flex-shrink-0 relative z-10">
        <Progress
          type="circle"
          percent={Math.min(pct, 100)}
          size={40}
          strokeColor={color}
          strokeWidth={10}
          format={() => null}
        />
      </div>

      <div className="min-w-0 flex-1 relative z-10">
        <Text
          type="secondary"
          className="hidden sm:block"
          style={{
            fontSize: 11,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            fontWeight: 600,
            display: 'block',
          }}
        >
          Budget Left
        </Text>
        <Text strong className="block truncate text-base sm:text-xl" style={{ lineHeight: 1.25, color }}>
          {valueStr}
        </Text>
        <Text type="secondary" className="hidden sm:block" style={{ fontSize: 11 }}>
          {formatINR(spent)} of {formatINR(limit)}
        </Text>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { token } = theme.useToken()
  const { budget } = useBudgetContext()
  const { dataLoading } = useAppData()
  const router = useRouter()
  const searchParams = useSearchParams()
  const fabRef = useRef<AddExpenseFABRef>(null)
  const [hoveredCategoryId, setHoveredCategoryId] = useState<string | null>(null)

  useEffect(() => {
    if (!dataLoading && searchParams.get('action') === 'add') {
      fabRef.current?.open()
      router.replace('/')
    }
  }, [dataLoading, searchParams, router])
  const {
    spenders,
    selectedSpenderId,
    setSelectedSpenderId,
    selectedMonth,
    setSelectedMonth,
    monthFilteredExpenses,
    monthTotal,
    topCat,
    allCategoryData,
    chartData,
    dailyChartData,
    spenderOptions,
  } = useDashboard()

  const budgetLimit = budget.monthlyLimit
  const budgetRemaining = budgetLimit ? budgetLimit - monthTotal : null
  const budgetPct = budgetLimit ? (monthTotal / budgetLimit) * 100 : 0
  const budgetColor = budgetPct < 50 ? token.colorSuccess : budgetPct <= 80 ? token.colorWarning : token.colorError

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="fade-up flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        {/* Title hidden on mobile — shown in nav bar */}
        <div className="hidden sm:block">
          <Title level={3} style={{ marginBottom: 2, fontWeight: 700, fontSize: 22 }}>
            Dashboard
          </Title>
          <Text type="secondary" style={{ fontSize: 13 }}>
            Overview of all your expenses
          </Text>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {monthFilteredExpenses.length > 0 && (
            <Tag
              className="hidden sm:inline-flex"
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
          {/* Desktop: spenders select */}
          {spenders.length > 0 && (
            <Select
              allowClear
              placeholder="All spenders"
              options={spenderOptions}
              value={selectedSpenderId}
              onChange={(v) => setSelectedSpenderId(v ?? undefined)}
              style={{ minWidth: 120 }}
            />
          )}
          {/* Desktop: date picker */}
          <DatePicker
            picker="month"
            value={selectedMonth}
            onChange={(v) => setSelectedMonth(v)}
            allowClear={false}
            format="MMM YYYY"
            inputReadOnly
          />
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 stagger">
        <StatCard
          label={selectedMonth ? selectedMonth.format('MMM YYYY') : dayjs().format('MMM YYYY')}
          value={formatINR(monthTotal)}
          icon={<CalendarOutlined />}
          color={token.colorWarning}
          animDelay="0ms"
        />
        {budgetLimit && budgetLimit > 0 ? (
          <BudgetStatCard
            remaining={budgetRemaining!}
            limit={budgetLimit}
            pct={budgetPct}
            color={budgetColor}
            animDelay="65ms"
          />
        ) : (
          <StatCard
            label="Transactions"
            value={`${monthFilteredExpenses.length}`}
            icon={<RiseOutlined />}
            color={token.colorSuccess}
            animDelay="65ms"
          />
        )}
        <div className="hidden sm:block col-span-2 lg:col-span-1">
          <StatCard
            label="Top Category"
            value={topCat ? topCat.name : '—'}
            icon={<FallOutlined />}
            color={token.colorError}
            animDelay="130ms"
          />
        </div>
      </div>

      {/* Daily spending line chart */}
      <div
        className="fade-up rounded-2xl p-5"
        style={{ background: token.colorBgContainer, border: `1px solid ${token.colorBorderSecondary}` }}
      >
        <Text strong style={{ fontSize: 14, fontWeight: 600 }}>
          Daily Spending
        </Text>
        <div className="mt-3">
          <ResponsiveContainer width="100%" height={180}>
            <LineChart
              data={dailyChartData}
              margin={{ top: 8, right: 12, left: 12, bottom: 0 }}
              onClick={(data) => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const date = (data as any)?.activePayload?.[0]?.payload?.date as string | undefined
                if (date) router.push(`/expenses?date=${date}`)
              }}
              style={{ cursor: 'pointer' }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={token.colorBorderSecondary} vertical={false} />
              <XAxis
                dataKey="day"
                ticks={[1, 5, 10, 15, 20, 25, 30]}
                tick={{ fontSize: 11, fill: token.colorTextTertiary }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis hide />
              <Tooltip
                formatter={(value) => [formatINR(Number(value)), 'Spent']}
                contentStyle={{
                  background: token.colorBgElevated,
                  border: `1px solid ${token.colorBorderSecondary}`,
                  borderRadius: 8,
                  fontSize: 12,
                  color: token.colorText,
                }}
                labelFormatter={(day) => `${selectedMonth?.format('MMM')} ${day}`}
              />
              <Line
                type="monotone"
                dataKey="total"
                stroke={token.colorPrimary}
                strokeWidth={2}
                dot={{ r: 2, fill: token.colorPrimary, strokeWidth: 0 }}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
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
                Top {chartData.length} categories
              </Text>
            )}
          </div>
          <div className="p-4 flex flex-col gap-4">
            {chartData.length === 0 ? (
              <Empty description="No expenses yet" className="py-10" />
            ) : (
              <>
                <ResponsiveContainer width="100%" height={260}>
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
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 pb-2">
                  {chartData.map((entry) => (
                    <div key={entry.name} className="flex items-center gap-1.5">
                      <span
                        style={{ width: 10, height: 10, borderRadius: 2, background: entry.color, flexShrink: 0 }}
                      />
                      <span style={{ fontSize: 12, color: token.colorText }}>{entry.name}</span>
                    </div>
                  ))}
                </div>
              </>
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
            {monthTotal > 0 && (
              <Text type="secondary" style={{ fontSize: 12 }}>
                {formatINR(monthTotal)} total
              </Text>
            )}
          </div>
          <div className="p-5">
            {allCategoryData.length === 0 ? (
              <Empty description="No expenses yet" className="py-10" />
            ) : (
              <div className="space-y-4">
                {allCategoryData
                  .sort((a, b) => b.value - a.value)
                  .map((item) => {
                    const pct = monthTotal > 0 ? (item.value / monthTotal) * 100 : 0
                    return (
                      <div
                        key={item.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => router.push(`/expenses?category=${item.id}`)}
                        onKeyDown={(e) => e.key === 'Enter' && router.push(`/expenses?category=${item.id}`)}
                        onMouseEnter={() => setHoveredCategoryId(item.id)}
                        onMouseLeave={() => setHoveredCategoryId(null)}
                        style={{
                          cursor: 'pointer',
                          borderRadius: 8,
                          margin: '0 -8px',
                          padding: '4px 8px',
                          background: hoveredCategoryId === item.id ? token.colorFillTertiary : 'transparent',
                          transition: 'background 0.15s ease',
                        }}
                      >
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

      <AddExpenseFAB ref={fabRef} />
    </div>
  )
}
