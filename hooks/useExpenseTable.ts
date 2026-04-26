'use client'

import { useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
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
  const searchParams = useSearchParams()

  const dateParam = searchParams.get('date')
  const monthParam = searchParams.get('month')
  const initialDay: Dayjs | null = dateParam ? dayjs(dateParam, 'YYYY-MM-DD') : null
  const initialMonth: Dayjs | null = dateParam ? null : monthParam ? dayjs(monthParam, 'YYYY-MM') : dayjs()

  const [selectedSpenderId, setSelectedSpenderId] = useState<string | undefined>(undefined)
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(searchParams.get('category'))
  const [selectedMonth, setSelectedMonth] = useState<Dayjs | null>(initialMonth)
  const [selectedDay, setSelectedDay] = useState<Dayjs | null>(initialDay)
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

  const dayFilteredExpenses =
    selectedDay === null
      ? monthFilteredExpenses
      : monthFilteredExpenses.filter((e) => e.date === selectedDay.format('YYYY-MM-DD'))

  function handleMonthChange(v: Dayjs | null) {
    setSelectedMonth(v)
    if (v !== null) setSelectedDay(null)
  }

  function handleDayChange(v: Dayjs | null) {
    setSelectedDay(v)
    if (v !== null) setSelectedMonth(null)
  }

  function handleExportCSV() {
    const label = selectedDay ? selectedDay.format('YYYY-MM-DD') : (selectedMonth?.format('YYYY-MM') ?? 'all')
    exportExpensesToCSV(dayFilteredExpenses, catMap, spenderMap, `expenses-${label}.csv`)
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
    handleMonthChange,
    selectedDay,
    handleDayChange,
    modalOpen,
    form,
    monthFilteredExpenses: dayFilteredExpenses,
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
