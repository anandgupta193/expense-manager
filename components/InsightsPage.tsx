'use client'

import { useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import dayjs from 'dayjs'
import { Alert, Button, Spin, Typography, theme, Divider } from 'antd'
import {
  ArrowLeftOutlined,
  BulbOutlined,
  CheckCircleOutlined,
  RocketOutlined,
  WarningOutlined,
} from '@ant-design/icons'
import { useAppData, useBudgetContext } from '@/app/providers'
import { useSpendingAnalysis } from '@/hooks/useSpendingAnalysis'
import { formatINR } from '@/utils/formatters'
import type { SpendingAnalysis, LocalSummary } from '@/lib/types'

const { Text, Title } = Typography

const BAR_COLORS = ['#667eea', '#f093fb', '#4facfe', '#43e97b', '#fa709a']

// ── Stat chip ─────────────────────────────────────────────────────────────────

function StatChip({ label, value }: { label: string; value: string }) {
  const { token } = theme.useToken()
  return (
    <div
      className="flex flex-col rounded-2xl px-4 py-3"
      style={{ background: token.colorFillAlter, border: `1px solid ${token.colorBorderSecondary}` }}
    >
      <Text
        style={{
          fontSize: 10,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color: token.colorTextTertiary,
          fontWeight: 700,
        }}
      >
        {label}
      </Text>
      <Text strong style={{ fontSize: 18, lineHeight: 1.3, marginTop: 4, color: token.colorText }}>
        {value}
      </Text>
    </div>
  )
}

// ── Category bar ──────────────────────────────────────────────────────────────

function CategoryBar({ name, amount, pct, color }: { name: string; amount: number; pct: number; color: string }) {
  const { token } = theme.useToken()
  return (
    <div>
      <div className="flex justify-between items-center mb-1.5">
        <div className="flex items-center gap-2 min-w-0 flex-1 mr-3">
          <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: color }} />
          <Text style={{ fontSize: 14 }} className="truncate">
            {name}
          </Text>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <Text strong style={{ fontSize: 14 }}>
            {formatINR(amount)}
          </Text>
          <Text type="secondary" style={{ fontSize: 12, minWidth: 34, textAlign: 'right' }}>
            {pct}%
          </Text>
        </div>
      </div>
      <div className="h-2 rounded-full overflow-hidden" style={{ background: token.colorFillSecondary }}>
        <div
          className="h-full rounded-full"
          style={{ width: `${pct}%`, background: color, transition: 'width 0.7s ease' }}
        />
      </div>
    </div>
  )
}

// ── AI section block ──────────────────────────────────────────────────────────

function AISectionBlock({
  icon,
  label,
  accentColor,
  bgColor,
  borderColor,
  items,
  numbered,
}: {
  icon: React.ReactNode
  label: string
  accentColor: string
  bgColor: string
  borderColor: string
  items: string[]
  numbered?: boolean
}) {
  const { token } = theme.useToken()
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <span style={{ color: accentColor, fontSize: 15 }}>{icon}</span>
        <Text
          style={{
            fontSize: 12,
            textTransform: 'uppercase',
            letterSpacing: '0.07em',
            fontWeight: 700,
            color: token.colorTextSecondary,
          }}
        >
          {label}
        </Text>
        <span
          className="ml-auto flex items-center gap-1 rounded-md px-2 py-0.5"
          style={{
            background: 'linear-gradient(135deg, #667eea18 0%, #764ba218 100%)',
            border: '1px solid #667eea30',
          }}
        >
          <span style={{ fontSize: 9, color: '#667eea', fontWeight: 800, letterSpacing: '0.05em' }}>✦ AI</span>
        </span>
      </div>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div
            key={i}
            className="flex items-start gap-3 rounded-xl px-4 py-3"
            style={{
              background: bgColor,
              border: `1px solid ${borderColor}`,
              borderLeft: `3px solid ${accentColor}`,
            }}
          >
            {numbered ? (
              <span
                className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ background: accentColor, color: '#fff', fontWeight: 700, fontSize: 11 }}
              >
                {i + 1}
              </span>
            ) : (
              <span style={{ color: accentColor, fontSize: 16, marginTop: 1, flexShrink: 0, lineHeight: 1.5 }}>•</span>
            )}
            <Text style={{ fontSize: 14, lineHeight: 1.6 }}>{item}</Text>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Results layout ────────────────────────────────────────────────────────────

function Results({ analysis, localSummary }: { analysis: SpendingAnalysis; localSummary: LocalSummary }) {
  const { token } = theme.useToken()

  return (
    <div className="space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatChip label="Total Spent" value={formatINR(localSummary.totalSpent)} />
        <StatChip label="Transactions" value={String(localSummary.transactions)} />
        <StatChip label="Avg / Day" value={formatINR(localSummary.avgDailySpend)} />
        <StatChip label="Active Days" value={`${localSummary.activeDays}d`} />
      </div>

      {/* Category breakdown */}
      {analysis.categoryBreakdown.length > 0 && (
        <div>
          <Text
            style={{
              fontSize: 12,
              textTransform: 'uppercase',
              letterSpacing: '0.07em',
              fontWeight: 700,
              color: token.colorTextSecondary,
              display: 'block',
              marginBottom: 16,
            }}
          >
            Top Categories
          </Text>
          <div className="space-y-4">
            {analysis.categoryBreakdown.map((c, i) => (
              <CategoryBar
                key={c.name}
                name={c.name}
                amount={c.amount}
                pct={c.pct}
                color={BAR_COLORS[i % BAR_COLORS.length]}
              />
            ))}
          </div>
        </div>
      )}

      {analysis.flags.length > 0 && (
        <Alert
          type="warning"
          icon={<WarningOutlined />}
          showIcon
          style={{ borderRadius: token.borderRadiusLG }}
          description={
            <ul className="list-none m-0 p-0 space-y-1">
              {analysis.flags.map((f, i) => (
                <li key={i} style={{ fontSize: 14 }}>
                  {f}
                </li>
              ))}
            </ul>
          }
        />
      )}

      <Divider />

      <AISectionBlock
        icon={<BulbOutlined />}
        label="Insights"
        accentColor={token.colorWarning}
        bgColor={token.colorWarningBg}
        borderColor={token.colorWarningBorder}
        items={analysis.insights}
      />

      <AISectionBlock
        icon={<CheckCircleOutlined />}
        label="Recommendations"
        accentColor={token.colorSuccess}
        bgColor={token.colorSuccessBg}
        borderColor={token.colorSuccessBorder}
        items={analysis.recommendations}
        numbered
      />

      {analysis.nextMonthGoals?.length > 0 && (
        <AISectionBlock
          icon={<RocketOutlined />}
          label="Next Month Goals"
          accentColor={token.colorPrimary}
          bgColor={token.colorInfoBg}
          borderColor={token.colorInfoBorder}
          items={analysis.nextMonthGoals}
          numbered
        />
      )}
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function InsightsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { token } = theme.useToken()

  const { expenses, categories, dataLoading } = useAppData()
  const { budget } = useBudgetContext()
  const { analysis, localSummary, loading, error, analyze } = useSpendingAnalysis()

  const monthParam = searchParams.get('month') // YYYY-MM
  const spenderParam = searchParams.get('spender')

  const month = monthParam ? dayjs(monthParam, 'YYYY-MM') : dayjs()
  const monthLabel = month.format('MMMM YYYY')

  const didFetch = useRef(false)

  useEffect(() => {
    if (dataLoading || didFetch.current) return
    didFetch.current = true

    const filtered = expenses.filter((e) => {
      const matchMonth = e.date.startsWith(month.format('YYYY-MM'))
      const matchSpender = spenderParam ? e.spenderId === spenderParam : true
      return matchMonth && matchSpender
    })

    if (filtered.length === 0) {
      router.replace('/')
      return
    }

    analyze(filtered, categories, budget.monthlyLimit, month)
  }, [dataLoading]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-screen" style={{ background: token.colorBgLayout }}>
      {/* Header */}
      <div
        className="sticky top-0 z-10 flex items-center gap-3 px-4 py-3 sm:px-6"
        style={{
          background: token.colorBgContainer,
          borderBottom: `1px solid ${token.colorBorderSecondary}`,
        }}
      >
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => router.back()}
          style={{ color: token.colorTextSecondary }}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span
              className="w-5 h-5 rounded flex items-center justify-center text-xs flex-shrink-0"
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: '#fff',
              }}
            >
              ✦
            </span>
            <Title level={5} style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>
              AI Spending Analysis
            </Title>
          </div>
          <Text type="secondary" style={{ fontSize: 12, marginLeft: 28 }}>
            {monthLabel}
          </Text>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-6 sm:px-6 max-w-2xl mx-auto pb-24 md:pb-8">
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Spin size="large" />
            <Text type="secondary">Analysing your spending…</Text>
          </div>
        )}

        {!loading && error && (
          <div className="flex flex-col items-center gap-4 py-24">
            <Text type="secondary">{error}</Text>
            <Button
              onClick={() => {
                didFetch.current = false
                const filtered = expenses.filter((e) => {
                  const matchMonth = e.date.startsWith(month.format('YYYY-MM'))
                  const matchSpender = spenderParam ? e.spenderId === spenderParam : true
                  return matchMonth && matchSpender
                })
                analyze(filtered, categories, budget.monthlyLimit, month)
              }}
            >
              Retry
            </Button>
          </div>
        )}

        {!loading && analysis && localSummary && <Results analysis={analysis} localSummary={localSummary} />}
      </div>
    </div>
  )
}
