'use client'

import { useEffect, useState } from 'react'
import { Form, theme } from 'antd'
import type { Dayjs } from 'dayjs'
import dayjs from 'dayjs'
import { storage } from '@/lib/storage'
import type { Category, Expense, Spender } from '@/lib/types'
import { buildCategoryOptions, buildSpenderOptions, buildTableColumns, currentMonthTotal } from '@/utils/expenseUtils'

interface EditFormValues {
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
}

export function useDashboard() {
  const { token } = theme.useToken()
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [spenders, setSpenders] = useState<Spender[]>([])
  const [selectedSpenderIds, setSelectedSpenderIds] = useState<string[]>([])
  const [editTarget, setEditTarget] = useState<Expense | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [form] = Form.useForm<EditFormValues>()

  useEffect(() => {
    setExpenses(storage.getExpenses())
    setCategories(storage.getCategories())
    setSpenders(storage.getSpenders())
  }, [])

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

  function closeEdit() {
    setModalOpen(false)
    setEditTarget(null)
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

  const columns = buildTableColumns(catMap, spenderMap, token, openEdit, handleDelete)
  const categoryOptions = buildCategoryOptions(categories)
  const spenderOptions = buildSpenderOptions(spenders)

  return {
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
    openEdit,
    closeEdit,
    handleEditSave,
  }
}
