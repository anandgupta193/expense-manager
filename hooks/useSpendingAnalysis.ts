'use client'

import { useState } from 'react'
import type { Expense, Category, SpendingAnalysis, LocalSummary } from '@/lib/types'
import type { Dayjs } from 'dayjs'

export function useSpendingAnalysis() {
  const [analysis, setAnalysis] = useState<SpendingAnalysis | null>(null)
  const [localSummary, setLocalSummary] = useState<LocalSummary | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [open, setOpen] = useState(false)

  function buildPayload(expenses: Expense[], categories: Category[], budget: number | null, month: Dayjs) {
    const catMap = Object.fromEntries(categories.map((c) => [c.id, c.name]))
    const totalSpent = expenses.reduce((s, e) => s + e.amount, 0)
    const activeDaySet = new Set(expenses.map((e) => e.date))
    const daysInMonth = month.daysInMonth()

    const catTotals: Record<string, number> = {}
    expenses.forEach((e) => {
      const name = catMap[e.categoryId] ?? 'Other'
      catTotals[name] = (catTotals[name] ?? 0) + e.amount
    })
    const categoryTotals = Object.entries(catTotals)
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount)

    const dailyTotals: Record<string, number> = {}
    expenses.forEach((e) => {
      dailyTotals[e.date] = (dailyTotals[e.date] ?? 0) + e.amount
    })
    const topDayEntry = Object.entries(dailyTotals).sort((a, b) => b[1] - a[1])[0]

    const activeDays = activeDaySet.size
    const summary: LocalSummary = {
      totalSpent,
      transactions: expenses.length,
      avgDailySpend: activeDays > 0 ? Math.round(totalSpent / activeDays) : 0,
      activeDays,
    }

    return {
      payload: {
        month: month.format('MMMM YYYY'),
        budget,
        totalSpent,
        transactionCount: expenses.length,
        activeDays,
        daysInMonth,
        categoryTotals,
        topDay: topDayEntry ? { date: topDayEntry[0], amount: topDayEntry[1] } : null,
      },
      summary,
    }
  }

  async function analyze(expenses: Expense[], categories: Category[], budget: number | null, month: Dayjs) {
    setOpen(true)
    setLoading(true)
    setError(null)
    setAnalysis(null)
    setLocalSummary(null)
    try {
      const { payload, summary } = buildPayload(expenses, categories, budget, month)
      setLocalSummary(summary)
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error('Failed')
      setAnalysis(await res.json())
    } catch {
      setError('Could not generate analysis. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function close() {
    setOpen(false)
  }

  return { analysis, localSummary, loading, error, open, analyze, close }
}
