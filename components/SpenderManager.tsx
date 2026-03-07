'use client'

import { useState } from 'react'
import { App, Button, ColorPicker, Form, Input, Popconfirm, Typography, Modal, theme, Empty } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import type { Color } from 'antd/es/color-picker'
import { storage } from '@/lib/storage'
import type { Spender } from '@/lib/types'

const { Title, Text } = Typography

interface SpenderFormValues {
  name: string
  avatarColor: Color | string
}

function resolveColor(color: Color | string): string {
  if (typeof color === 'string') return color
  return color.toHexString()
}

function SpenderAvatar({ name, color }: { name: string; color: string }) {
  return (
    <div
      className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-white text-base"
      style={{ background: color }}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  )
}

export default function SpenderManager() {
  const { token } = theme.useToken()
  const { message } = App.useApp()
  const [spenders, setSpenders] = useState<Spender[]>(() => storage.getSpenders())
  const [editTarget, setEditTarget] = useState<Spender | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [addForm] = Form.useForm<SpenderFormValues>()
  const [editForm] = Form.useForm<SpenderFormValues>()

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

  function handleEditSave(values: SpenderFormValues) {
    if (!editTarget) return
    const avatarColor = resolveColor(values.avatarColor)
    persist(spenders.map((s) => (s.id === editTarget.id ? { ...s, name: values.name.trim(), avatarColor } : s)))
    setModalOpen(false)
    setEditTarget(null)
    message.success('Spender updated!')
  }

  function handleDelete(id: string) {
    const expenses = storage.getExpenses()
    const inUse = expenses.some((e) => e.spenderId === id)
    if (inUse) {
      message.warning('Cannot delete — this spender has expenses. Reassign them first.')
      return
    }
    persist(spenders.filter((s) => s.id !== id))
    message.success('Spender deleted.')
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <Title level={3} className="!mb-0">
          Spenders
        </Title>
        <Text type="secondary">Manage people who spend money</Text>
      </div>

      {/* Add new spender */}
      <div
        className="rounded-xl p-6"
        style={{
          background: token.colorBgContainer,
          border: `1px solid ${token.colorBorderSecondary}`,
        }}
      >
        <Title level={5} className="!mb-4">
          Add New Spender
        </Title>
        <Form form={addForm} layout="vertical" onFinish={handleAdd} initialValues={{ avatarColor: '#6366f1' }}>
          <div className="flex gap-4 items-end">
            <Form.Item
              label="Name"
              name="name"
              className="flex-1 !mb-0"
              rules={[
                { required: true, message: 'Enter a name' },
                {
                  validator: (_, value) => {
                    if (value && spenders.some((s) => s.name.toLowerCase() === value.trim().toLowerCase())) {
                      return Promise.reject('A spender with this name already exists')
                    }
                    return Promise.resolve()
                  },
                },
              ]}
            >
              <Input placeholder="e.g. Alice" maxLength={40} size="large" />
            </Form.Item>

            <Form.Item label="Color" name="avatarColor" className="!mb-0">
              <ColorPicker size="large" />
            </Form.Item>

            <Form.Item className="!mb-0">
              <Button type="primary" htmlType="submit" icon={<PlusOutlined />} size="large">
                Add
              </Button>
            </Form.Item>
          </div>
        </Form>
      </div>

      {/* Spender list */}
      <div
        className="rounded-xl p-6"
        style={{
          background: token.colorBgContainer,
          border: `1px solid ${token.colorBorderSecondary}`,
        }}
      >
        <Title level={5} className="!mb-4">
          All Spenders ({spenders.length})
        </Title>

        {spenders.length === 0 ? (
          <Empty description="No spenders yet" />
        ) : (
          <div className="space-y-2">
            {spenders.map((spender) => {
              const expenses = storage.getExpenses()
              const count = expenses.filter((e) => e.spenderId === spender.id).length
              return (
                <div
                  key={spender.id}
                  className="flex items-center gap-4 p-4 rounded-xl"
                  style={{
                    background: token.colorFillAlter,
                    border: `1px solid ${token.colorBorderSecondary}`,
                  }}
                >
                  <SpenderAvatar name={spender.name} color={spender.avatarColor} />

                  <div className="flex-1 min-w-0">
                    <Text strong className="block truncate">
                      {spender.name}
                    </Text>
                    <Text type="secondary" className="text-xs">
                      {count} expense{count !== 1 ? 's' : ''}
                    </Text>
                  </div>

                  <div className="flex gap-1 flex-shrink-0">
                    <Button type="text" icon={<EditOutlined />} onClick={() => openEdit(spender)} />
                    <Popconfirm
                      title={`Delete "${spender.name}"?`}
                      description={
                        count > 0
                          ? `This spender has ${count} expense(s). Reassign them first.`
                          : 'This action cannot be undone.'
                      }
                      onConfirm={() => handleDelete(spender.id)}
                      okText="Delete"
                      okButtonProps={{ danger: true }}
                      cancelText="Cancel"
                      disabled={count > 0}
                    >
                      <Button type="text" danger icon={<DeleteOutlined />} />
                    </Popconfirm>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Edit modal */}
      <Modal
        title="Edit Spender"
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false)
          setEditTarget(null)
        }}
        footer={null}
        destroyOnHidden
      >
        <Form form={editForm} layout="vertical" onFinish={handleEditSave} className="pt-4">
          <div className="flex gap-4 items-end">
            <Form.Item
              label="Name"
              name="name"
              className="flex-1"
              rules={[{ required: true, message: 'Enter a name' }]}
            >
              <Input maxLength={40} size="large" />
            </Form.Item>
            <Form.Item label="Color" name="avatarColor">
              <ColorPicker size="large" />
            </Form.Item>
          </div>

          <div className="flex gap-3 justify-end">
            <Button onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit">
              Save Changes
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  )
}
