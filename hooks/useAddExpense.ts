'use client'

import { useMemo, useState } from 'react'
import { App, Form } from 'antd'
import dayjs from 'dayjs'
import { useAppData } from '@/app/providers'
import type { Expense } from '@/lib/types'
import { buildCategoryOptions, buildDescriptionOptions, buildSpenderOptions } from '@/utils/expenseUtils'

interface AddFormValues {
  description: string
  amount: number
  categoryId: string
  date: import('dayjs').Dayjs
  notes?: string
  spenderId?: string
}

export function useAddExpense() {
  const { message } = App.useApp()
  const { expenses, categories, spenders, setExpenses } = useAppData()
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [addForm] = Form.useForm<AddFormValues>()
  const [descriptionInput, setDescriptionInput] = useState('')

  function openAddModal() {
    addForm.resetFields()
    addForm.setFieldsValue({ date: dayjs(), categoryId: 'cat-other' })
    setDescriptionInput('')
    setAddModalOpen(true)
  }

  function closeAddModal() {
    setAddModalOpen(false)
  }

  function handleAddSave(values: AddFormValues) {
    const now = new Date(Date.now())
    const newExpense: Expense = {
      id: crypto.randomUUID(),
      date: values.date.format('YYYY-MM-DD'),
      time: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
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

  const descriptionOptions = useMemo(() => {
    const all = buildDescriptionOptions(expenses)
    return descriptionInput.trim()
      ? all.filter((o) => o.value.toLowerCase().includes(descriptionInput.toLowerCase())).slice(0, 20)
      : all.slice(0, 20)
  }, [expenses, descriptionInput])

  return {
    spenders,
    addModalOpen,
    addForm,
    descriptionOptions,
    setDescriptionInput,
    categoryOptions: buildCategoryOptions(categories),
    spenderOptions: buildSpenderOptions(spenders),
    openAddModal,
    closeAddModal,
    handleAddSave,
  }
}
