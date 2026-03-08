'use client'

import { useRouter } from 'next/navigation'
import { App, Form } from 'antd'
import type { Dayjs } from 'dayjs'
import { useAppData } from '@/app/providers'
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
  const { expenses, categories, spenders, setExpenses } = useAppData()
  const [form] = Form.useForm<AddExpenseFormValues>()

  function handleSubmit(values: AddExpenseFormValues) {
    const newExpense = {
      id: crypto.randomUUID(),
      description: values.description.trim(),
      amount: values.amount,
      categoryId: values.categoryId,
      date: values.date.format('YYYY-MM-DD'),
      notes: values.notes?.trim() || undefined,
      spenderId: values.spenderId || undefined,
    }
    setExpenses([newExpense, ...expenses])
    message.success('Expense added!')
    router.push('/')
  }

  const categoryOptions = buildCategoryOptions(categories)
  const spenderOptions = buildSpenderOptions(spenders)

  return { form, spenders, categoryOptions, spenderOptions, handleSubmit }
}
