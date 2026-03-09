'use client'

import { Button, ColorPicker, Form, Input, Popconfirm, Typography, Modal, theme, Empty, Tag } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { useSpenderManager } from '@/hooks/useSpenderManager'
import { requiredRule, uniqueNameRule } from '@/constants/validation'

const { Title, Text } = Typography

function SpenderAvatar({ name, color }: { name: string; color: string }) {
  return (
    <div
      className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-white text-base"
      style={{
        background: color,
        boxShadow: `0 0 0 3px ${color}28, 0 2px 8px ${color}40`,
        letterSpacing: '-0.5px',
      }}
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
    currentUserId,
  } = useSpenderManager()

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="fade-up">
        <Title level={3} style={{ marginBottom: 2, fontWeight: 700, fontSize: 22 }}>
          Spenders
        </Title>
        <Text type="secondary" style={{ fontSize: 13 }}>
          Manage people who spend money
        </Text>
      </div>

      {/* Add new spender */}
      <div
        className="rounded-2xl overflow-hidden fade-up"
        style={{
          background: token.colorBgContainer,
          border: `1px solid ${token.colorBorderSecondary}`,
          boxShadow: '0 2px 16px rgba(0,0,0,0.05)',
          animationDelay: '60ms',
        }}
      >
        <div className="px-5 py-4" style={{ borderBottom: `1px solid ${token.colorBorderSecondary}` }}>
          <Text strong style={{ fontSize: 14, fontWeight: 600 }}>
            Add New Spender
          </Text>
        </div>
        <div className="p-5">
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
                <Input placeholder="e.g. Alice" maxLength={40} size="large" style={{ borderRadius: 8 }} />
              </Form.Item>

              <Form.Item label="Color" name="avatarColor" className="!mb-0">
                <ColorPicker size="large" />
              </Form.Item>

              <Form.Item className="!mb-0">
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<PlusOutlined />}
                  size="large"
                  style={{
                    borderRadius: 8,
                    boxShadow: `0 4px 12px ${token.colorPrimary}35`,
                    fontWeight: 600,
                  }}
                >
                  Add
                </Button>
              </Form.Item>
            </div>
          </Form>
        </div>
      </div>

      {/* Spender list */}
      <div
        className="rounded-2xl overflow-hidden fade-up"
        style={{
          background: token.colorBgContainer,
          border: `1px solid ${token.colorBorderSecondary}`,
          boxShadow: '0 2px 16px rgba(0,0,0,0.05)',
          animationDelay: '120ms',
        }}
      >
        <div
          className="px-5 py-4 flex items-center justify-between"
          style={{ borderBottom: `1px solid ${token.colorBorderSecondary}` }}
        >
          <Text strong style={{ fontSize: 14, fontWeight: 600 }}>
            All Spenders
          </Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {spenders.length} total
          </Text>
        </div>

        <div className="p-4">
          {spenders.length === 0 ? (
            <Empty description="No spenders yet" className="py-8" />
          ) : (
            <div className="space-y-2">
              {spenders.map((spender) => {
                const count = expenseCounts[spender.id] ?? 0
                const isYou = spender.id === currentUserId
                return (
                  <div
                    key={spender.id}
                    className="flex items-center gap-4 px-4 py-3.5 rounded-xl card-lift"
                    style={{
                      background: token.colorFillAlter,
                      border: `1px solid ${token.colorBorderSecondary}`,
                    }}
                  >
                    <SpenderAvatar name={spender.name} color={spender.avatarColor} />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Text strong className="truncate" style={{ fontSize: 14 }}>
                          {spender.name}
                        </Text>
                        {isYou && (
                          <Tag
                            color="blue"
                            style={{ fontSize: 11, borderRadius: 20, padding: '0 7px', lineHeight: '18px' }}
                          >
                            You
                          </Tag>
                        )}
                      </div>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {count} expense{count !== 1 ? 's' : ''}
                      </Text>
                    </div>

                    <div className="flex gap-1 flex-shrink-0">
                      <Button
                        type="text"
                        icon={<EditOutlined />}
                        onClick={() => openEdit(spender)}
                        style={{ color: token.colorTextSecondary }}
                      />
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
      </div>

      {/* Edit modal */}
      <Modal title="Edit Spender" open={modalOpen} onCancel={closeEdit} footer={null} destroyOnHidden>
        <Form form={editForm} layout="vertical" onFinish={handleEditSave} className="pt-4">
          <div className="flex gap-4 items-end">
            <Form.Item label="Name" name="name" className="flex-1" rules={[requiredRule('Enter a name')]}>
              <Input maxLength={40} size="large" style={{ borderRadius: 8 }} />
            </Form.Item>
            <Form.Item label="Color" name="avatarColor">
              <ColorPicker size="large" />
            </Form.Item>
          </div>

          <div className="flex gap-3 justify-end">
            <Button onClick={closeEdit} style={{ borderRadius: 8 }}>
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" style={{ borderRadius: 8, fontWeight: 600 }}>
              Save Changes
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  )
}
