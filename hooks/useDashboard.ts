'use client'

import { useState } from 'react'
import { App, Form, theme } from 'antd'
import type { Dayjs } from 'dayjs'
import dayjs from 'dayjs'
import { useAppData } from '@/app/providers'
import type { Expense } from '@/lib/types'
import { buildCategoryOptions, buildSpenderOptions, buildTableColumns } from '@/utils/expenseUtils'
import { exportExpensesToCSV } from '@/utils/exportUtils'

interface EditFormValues {
  description: string
  amount: number
  categoryId: string
  date: Dayjs
  notes?: string
  spenderId?: string
}

interface AddFormValues {
  description: string
  amount: number
  categoryId: string
  date: Dayjs
  notes?: string
  spenderId?: string
}

export interface ChartData {
  name: string
  value: number
  color: string
  fill: string
}

export function useDashboard() {
  const { token } = theme.useToken()
  const { message } = App.useApp()
  const { expenses, categories, spenders, setExpenses } = useAppData()
  const [selectedSpenderIds, setSelectedSpenderIds] = useState<string[]>([])
  const [selectedMonth, setSelectedMonth] = useState<Dayjs | null>(dayjs())
  const [editTarget, setEditTarget] = useState<Expense | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [form] = Form.useForm<EditFormValues>()
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [addForm] = Form.useForm<AddFormValues>()

  const catMap = Object.fromEntries(categories.map((c) => [c.id, c]))
  const spenderMap = Object.fromEntries(spenders.map((s) => [s.id, s]))

  const filteredExpenses =
    selectedSpenderIds.length === 0
      ? expenses
      : expenses.filter((e) => e.spenderId && selectedSpenderIds.includes(e.spenderId))

  const monthFilteredExpenses =
    selectedMonth === null
      ? filteredExpenses
      : filteredExpenses.filter((e) => {
          const d = dayjs(e.date)
          return d.month() === selectedMonth.month() && d.year() === selectedMonth.year()
        })

  // Build map keyed by 'YYYY-MM'
  const monthMap: Record<string, { label: string; monthKey: string; dayjsObj: Dayjs; total: number; count: number }> =
    {}
  filteredExpenses.forEach((e) => {
    const d = dayjs(e.date)
    const key = d.format('YYYY-MM')
    if (!monthMap[key]) {
      monthMap[key] = { label: d.format('MMM YYYY'), monthKey: key, dayjsObj: d.startOf('month'), total: 0, count: 0 }
    }
    monthMap[key].total += e.amount
    monthMap[key].count += 1
  })
  const monthlyGroups = Object.values(monthMap).sort((a, b) => b.monthKey.localeCompare(a.monthKey))

  const total = filteredExpenses.reduce((s, e) => s + e.amount, 0)
  const monthTotal = monthFilteredExpenses.reduce((s, e) => s + e.amount, 0)
  const topCat =
    categories
      .map((c) => ({
        name: c.name,
        total: monthFilteredExpenses.filter((e) => e.categoryId === c.id).reduce((s, e) => s + e.amount, 0),
      }))
      .sort((a, b) => b.total - a.total)[0] ?? null

  const chartData: ChartData[] = categories
    .map((c) => ({
      name: c.name,
      value: monthFilteredExpenses.filter((e) => e.categoryId === c.id).reduce((s, e) => s + e.amount, 0),
      color: c.color,
      fill: c.color,
    }))
    .filter((d) => d.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, 5)

  function handleExportCSV() {
    const filename = selectedMonth ? `expenses-${selectedMonth.format('YYYY-MM')}.csv` : 'expenses-all.csv'
    exportExpensesToCSV(monthFilteredExpenses, catMap, spenderMap, filename)
  }

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

  function closeEdit() {
    setModalOpen(false)
    setEditTarget(null)
  }

  function openAddModal() {
    addForm.resetFields()
    addForm.setFieldsValue({ date: dayjs(), categoryId: 'cat-other' })
    setAddModalOpen(true)
  }

  function closeAddModal() {
    setAddModalOpen(false)
  }

  function handleAddSave(values: AddFormValues) {
    const newExpense: Expense = {
      id: crypto.randomUUID(),
      date: values.date.format('YYYY-MM-DD'),
      description: values.description.trim(),
      amount: values.amount,
      categoryId: values.categoryId,
      spenderId: values.spenderId || undefined,
      notes: values.notes?.trim() || undefined,
    }
    setExpenses([newExpense, ...expenses])
    closeAddModal()
    message.success('Expense added!')
  }

  function handleDelete(id: string) {
    setExpenses(expenses.filter((e) => e.id !== id))
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
    setExpenses(updated)
    setModalOpen(false)
    setEditTarget(null)
  }

  const columns = buildTableColumns(catMap, spenderMap, token, openEdit, handleDelete)
  const categoryOptions = buildCategoryOptions(categories)
  const spenderOptions = buildSpenderOptions(spenders)

  return {
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
    openEdit,
    closeEdit,
    handleEditSave,
    openAddModal,
    closeAddModal,
    handleAddSave,
    handleExportCSV,
  }
}
