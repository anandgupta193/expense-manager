'use client'

import { useEffect, useState } from 'react'
import { App, Form } from 'antd'
import type { Color } from 'antd/es/color-picker'
import { storage } from '@/lib/storage'
import type { Expense, Spender } from '@/lib/types'
import { resolveColor } from '@/utils/formatters'

interface SpenderFormValues {
  name: string
  avatarColor: Color | string
}

export function useSpenderManager() {
  const { message } = App.useApp()
  const [spenders, setSpenders] = useState<Spender[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [editTarget, setEditTarget] = useState<Spender | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [addForm] = Form.useForm<SpenderFormValues>()
  const [editForm] = Form.useForm<SpenderFormValues>()

  useEffect(() => {
    setSpenders(storage.getSpenders())
    setExpenses(storage.getExpenses())
  }, [])

  const expenseCounts = Object.fromEntries(
    spenders.map((s) => [s.id, expenses.filter((e) => e.spenderId === s.id).length])
  )

  function persist(updated: Spender[]) {
    storage.setSpenders(updated)
    setSpenders(updated)
  }

  function handleAdd(values: SpenderFormValues) {
    const avatarColor = resolveColor(values.avatarColor)
    const newSpender: Spender = {
      id: crypto.randomUUID(),
      name: values.name.trim(),
      avatarColor,
    }
    persist([...spenders, newSpender])
    addForm.resetFields()
    message.success('Spender added!')
  }

  function openEdit(spender: Spender) {
    setEditTarget(spender)
    editForm.setFieldsValue({ name: spender.name, avatarColor: spender.avatarColor })
    setModalOpen(true)
  }

  function closeEdit() {
    setModalOpen(false)
    setEditTarget(null)
  }

  function handleEditSave(values: SpenderFormValues) {
    if (!editTarget) return
    const avatarColor = resolveColor(values.avatarColor)
    persist(spenders.map((s) => (s.id === editTarget.id ? { ...s, name: values.name.trim(), avatarColor } : s)))
    setModalOpen(false)
    setEditTarget(null)
    message.success('Spender updated!')
  }

  function handleDelete(id: string) {
    const inUse = expenses.some((e) => e.spenderId === id)
    if (inUse) {
      message.warning('Cannot delete — this spender has expenses. Reassign them first.')
      return
    }
    persist(spenders.filter((s) => s.id !== id))
    message.success('Spender deleted.')
  }

  return {
    spenders,
    expenseCounts,
    editTarget,
    modalOpen,
    addForm,
    editForm,
    handleAdd,
    openEdit,
    closeEdit,
    handleEditSave,
    handleDelete,
  }
}
