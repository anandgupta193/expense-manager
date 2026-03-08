'use client'

import { useState } from 'react'
import { App, Form } from 'antd'
import type { Color } from 'antd/es/color-picker'
import { useAppData } from '@/app/providers'
import type { Category } from '@/lib/types'
import { resolveColor } from '@/utils/formatters'

interface CategoryFormValues {
  name: string
  color: Color | string
}

export function useCategoryManager() {
  const { message } = App.useApp()
  const { categories, expenses, setCategories } = useAppData()
  const [editTarget, setEditTarget] = useState<Category | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [addForm] = Form.useForm<CategoryFormValues>()
  const [editForm] = Form.useForm<CategoryFormValues>()

  const expenseCounts = Object.fromEntries(
    categories.map((c) => [c.id, expenses.filter((e) => e.categoryId === c.id).length])
  )

  function handleAdd(values: CategoryFormValues) {
    const color = resolveColor(values.color)
    const newCat: Category = {
      id: crypto.randomUUID(),
      name: values.name.trim(),
      color,
    }
    setCategories([...categories, newCat])
    addForm.resetFields()
    message.success('Category added!')
  }

  function openEdit(cat: Category) {
    setEditTarget(cat)
    editForm.setFieldsValue({ name: cat.name, color: cat.color })
    setModalOpen(true)
  }

  function closeEdit() {
    setModalOpen(false)
    setEditTarget(null)
  }

  function handleEditSave(values: CategoryFormValues) {
    if (!editTarget) return
    const color = resolveColor(values.color)
    setCategories(categories.map((c) => (c.id === editTarget.id ? { ...c, name: values.name.trim(), color } : c)))
    setModalOpen(false)
    setEditTarget(null)
    message.success('Category updated!')
  }

  function handleDelete(id: string) {
    const inUse = expenses.some((e) => e.categoryId === id)
    if (inUse) {
      message.warning('Cannot delete — this category has expenses. Reassign them first.')
      return
    }
    setCategories(categories.filter((c) => c.id !== id))
    message.success('Category deleted.')
  }

  return {
    categories,
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
