'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { App, Form } from 'antd'
import type { Dayjs } from 'dayjs'
import { storage } from '@/lib/storage'
import type { Category, Spender } from '@/lib/types'
import { buildCategoryOptions, buildSpenderOptions } from '@/utils/expenseUtils'

export interface AddExpenseFormValues {
  description: string
  amount: number
  categoryId: string
  date: Dayjs
  notes?: string
  spenderId?: string
}

export function useAddExpense() {
  const { message } = App.useApp()
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [spenders, setSpenders] = useState<Spender[]>([])
  const [form] = Form.useForm<AddExpenseFormValues>()

  useEffect(() => {
    setCategories(storage.getCategories())
    setSpenders(storage.getSpenders())
  }, [])

  function handleSubmit(values: AddExpenseFormValues) {
    const expenses = storage.getExpenses()
    const newExpense = {
      id: crypto.randomUUID(),
      description: values.description.trim(),
      amount: values.amount,
      categoryId: values.categoryId,
      date: values.date.format('YYYY-MM-DD'),
      notes: values.notes?.trim() || undefined,
      spenderId: values.spenderId || undefined,
    }
    storage.setExpenses([newExpense, ...expenses])
    message.success('Expense added!')
    router.push('/')
  }

  const categoryOptions = buildCategoryOptions(categories)
  const spenderOptions = buildSpenderOptions(spenders)

  return { form, spenders, categoryOptions, spenderOptions, handleSubmit }
}
