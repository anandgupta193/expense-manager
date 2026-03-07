'use client'

import { Button, ColorPicker, Form, Input, Popconfirm, Typography, Modal, theme, Empty } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { useSpenderManager } from '@/hooks/useSpenderManager'
import { requiredRule, uniqueNameRule } from '@/constants/validation'

const { Title, Text } = Typography

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
  const {
    spenders,
    expenseCounts,
    modalOpen,
    addForm,
    editForm,
    handleAdd,
    openEdit,
    closeEdit,
    handleEditSave,
    handleDelete,
  } = useSpenderManager()

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
                requiredRule('Enter a name'),
                uniqueNameRule(
                  spenders.map((s) => s.name),
                  'spender'
                ),
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
              const count = expenseCounts[spender.id] ?? 0
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
      <Modal title="Edit Spender" open={modalOpen} onCancel={closeEdit} footer={null} destroyOnHidden>
        <Form form={editForm} layout="vertical" onFinish={handleEditSave} className="pt-4">
          <div className="flex gap-4 items-end">
            <Form.Item label="Name" name="name" className="flex-1" rules={[requiredRule('Enter a name')]}>
              <Input maxLength={40} size="large" />
            </Form.Item>
            <Form.Item label="Color" name="avatarColor">
              <ColorPicker size="large" />
            </Form.Item>
          </div>

          <div className="flex gap-3 justify-end">
            <Button onClick={closeEdit}>Cancel</Button>
            <Button type="primary" htmlType="submit">
              Save Changes
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  )
}
