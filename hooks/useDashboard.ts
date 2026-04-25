'use client'

import { useState } from 'react'
import type { Dayjs } from 'dayjs'
import dayjs from 'dayjs'
import { useAppData } from '@/app/providers'
import { buildSpenderOptions } from '@/utils/expenseUtils'

export interface ChartData {
  name: string
  value: number
  color: string
  fill: string
}

export function useDashboard() {
  const { expenses, categories, spenders } = useAppData()
  const [selectedSpenderId, setSelectedSpenderId] = useState<string | undefined>(undefined)
  const [selectedMonth, setSelectedMonth] = useState<Dayjs | null>(dayjs())

  const filteredExpenses =
    selectedSpenderId === undefined ? expenses : expenses.filter((e) => e.spenderId === selectedSpenderId)

  const monthFilteredExpenses =
    selectedMonth === null
      ? filteredExpenses
      : filteredExpenses.filter((e) => {
          const d = dayjs(e.date)
          return d.month() === selectedMonth.month() && d.year() === selectedMonth.year()
        })

  const monthTotal = monthFilteredExpenses.reduce((s, e) => s + e.amount, 0)
  const topCat =
    categories
      .map((c) => ({
        name: c.name,
        total: monthFilteredExpenses.filter((e) => e.categoryId === c.id).reduce((s, e) => s + e.amount, 0),
      }))
      .sort((a, b) => b.total - a.total)[0] ?? null

  const allCategoryData: ChartData[] = categories
    .map((c) => ({
      name: c.name,
      value: monthFilteredExpenses.filter((e) => e.categoryId === c.id).reduce((s, e) => s + e.amount, 0),
      color: c.color,
      fill: c.color,
    }))
    .filter((d) => d.value > 0)
    .sort((a, b) => b.value - a.value)

  const chartData: ChartData[] = allCategoryData.slice(0, 5)

  const dailyChartData = (() => {
    if (!selectedMonth) return []
    const daysInMonth = selectedMonth.daysInMonth()
    const totals: Record<string, number> = {}
    monthFilteredExpenses.forEach((e) => {
      totals[e.date] = (totals[e.date] ?? 0) + e.amount
    })
    return Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1
      const dateKey = selectedMonth.date(day).format('YYYY-MM-DD')
      return { day, total: totals[dateKey] ?? 0 }
    })
  })()

  const spenderOptions = buildSpenderOptions(spenders)

  return {
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
  }
}
