'use client'

import { useMemo, useState } from 'react'
import { Form, theme } from 'antd'
import type { Dayjs } from 'dayjs'
import dayjs from 'dayjs'
import { useAppData } from '@/app/providers'
import type { Expense } from '@/lib/types'
import {
  buildCategoryOptions,
  buildDescriptionOptions,
  buildSpenderOptions,
  buildTableColumns,
} from '@/utils/expenseUtils'
import { exportExpensesToCSV } from '@/utils/exportUtils'

interface EditFormValues {
  description: string
  amount: number
  categoryId: string
  date: Dayjs
  notes?: string
  spenderId?: string
}

export function useExpenseTable() {
  const { token } = theme.useToken()
  const { expenses, categories, spenders, setExpenses } = useAppData()
  const [selectedSpenderId, setSelectedSpenderId] = useState<string | undefined>(undefined)
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null)
  const [selectedMonth, setSelectedMonth] = useState<Dayjs | null>(dayjs())
  const [editTarget, setEditTarget] = useState<Expense | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [descriptionInput, setDescriptionInput] = useState('')
  const [form] = Form.useForm<EditFormValues>()

  const catMap = Object.fromEntries(categories.map((c) => [c.id, c]))
  const spenderMap = Object.fromEntries(spenders.map((s) => [s.id, s]))

  const filteredExpenses =
    selectedSpenderId === undefined ? expenses : expenses.filter((e) => e.spenderId === selectedSpenderId)

  const categoryFilteredExpenses =
    selectedCategoryId === null ? filteredExpenses : filteredExpenses.filter((e) => e.categoryId === selectedCategoryId)

  const monthFilteredExpenses =
    selectedMonth === null
      ? categoryFilteredExpenses
      : categoryFilteredExpenses.filter((e) => {
          const d = dayjs(e.date)
          return d.month() === selectedMonth.month() && d.year() === selectedMonth.year()
        })

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
      date: dayjs(`${expense.date} ${expense.time ?? '00:00'}`),
      notes: expense.notes,
      spenderId: expense.spenderId,
    })
    setModalOpen(true)
  }

  function closeEdit() {
    setModalOpen(false)
    setEditTarget(null)
    setDescriptionInput('')
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
            time: values.date.format('HH:mm'),
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
  const descriptionOptions = useMemo(() => {
    const all = buildDescriptionOptions(expenses)
    const filtered = descriptionInput.trim()
      ? all.filter((o) => o.value.toLowerCase().includes(descriptionInput.toLowerCase()))
      : all
    return filtered.slice(0, 20)
  }, [expenses, descriptionInput])

  return {
    spenders,
    selectedSpenderId,
    setSelectedSpenderId,
    selectedCategoryId,
    setSelectedCategoryId,
    selectedMonth,
    setSelectedMonth,
    modalOpen,
    form,
    monthFilteredExpenses,
    columns,
    categoryOptions,
    spenderOptions,
    descriptionOptions,
    setDescriptionInput,
    openEdit,
    closeEdit,
    handleEditSave,
    handleExportCSV,
  }
}
