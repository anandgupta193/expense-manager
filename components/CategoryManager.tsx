'use client'

import { Button, ColorPicker, Form, Input, Popconfirm, Typography, Modal, theme, Empty } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, TagsOutlined } from '@ant-design/icons'
import { useCategoryManager } from '@/hooks/useCategoryManager'
import { requiredRule, uniqueNameRule } from '@/constants/validation'

const { Title, Text } = Typography

export default function CategoryManager() {
  const { token } = theme.useToken()
  const {
    categories,
    expenseCounts,
    modalOpen,
    addForm,
    editForm,
    handleAdd,
    openEdit,
    closeEdit,
    handleEditSave,
    handleDelete,
  } = useCategoryManager()

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="fade-up">
        <Title level={3} style={{ marginBottom: 2, fontWeight: 700, fontSize: 22 }}>
          Categories
        </Title>
        <Text type="secondary" style={{ fontSize: 13 }}>
          Create and manage your expense categories
        </Text>
      </div>

      {/* Add new category */}
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
            Add New Category
          </Text>
        </div>
        <div className="p-5">
          <Form form={addForm} layout="vertical" onFinish={handleAdd} initialValues={{ color: '#6366f1' }}>
            <div className="flex gap-4 items-end">
              <Form.Item
                label="Name"
                name="name"
                className="flex-1 !mb-0"
                rules={[
                  requiredRule('Enter a name'),
                  uniqueNameRule(
                    categories.map((c) => c.name),
                    'category'
                  ),
                ]}
              >
                <Input placeholder="e.g. Rent & Housing" maxLength={40} size="large" style={{ borderRadius: 8 }} />
              </Form.Item>

              <Form.Item label="Color" name="color" className="!mb-0">
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

      {/* Category list */}
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
            All Categories
          </Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {categories.length} total
          </Text>
        </div>

        <div className="p-4">
          {categories.length === 0 ? (
            <Empty description="No categories yet" className="py-8" />
          ) : (
            <div className="space-y-2">
              {categories.map((cat) => {
                const count = expenseCounts[cat.id] ?? 0
                return (
                  <div
                    key={cat.id}
                    className="flex items-center gap-4 px-4 py-3.5 rounded-xl card-lift"
                    style={{
                      background: token.colorFillAlter,
                      border: `1px solid ${token.colorBorderSecondary}`,
                      borderLeft: `3px solid ${cat.color}`,
                    }}
                  >
                    {/* Color swatch */}
                    <div
                      className="w-9 h-9 rounded-lg flex-shrink-0 flex items-center justify-center"
                      style={{
                        background: `${cat.color}20`,
                        boxShadow: `0 0 0 3px ${cat.color}18`,
                      }}
                    >
                      <TagsOutlined style={{ color: cat.color, fontSize: 15 }} />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <Text strong className="block truncate" style={{ fontSize: 14 }}>
                        {cat.name}
                      </Text>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {count} expense{count !== 1 ? 's' : ''}
                      </Text>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-1 flex-shrink-0">
                      <Button
                        type="text"
                        icon={<EditOutlined />}
                        onClick={() => openEdit(cat)}
                        style={{ color: token.colorTextSecondary }}
                      />
                      <Popconfirm
                        title={`Delete "${cat.name}"?`}
                        description={
                          count > 0
                            ? `This category has ${count} expense(s). Delete anyway?`
                            : 'This action cannot be undone.'
                        }
                        onConfirm={() => handleDelete(cat.id)}
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
      <Modal title="Edit Category" open={modalOpen} onCancel={closeEdit} footer={null} destroyOnHidden>
        <Form form={editForm} layout="vertical" onFinish={handleEditSave} className="pt-4">
          <div className="flex gap-4 items-end">
            <Form.Item label="Name" name="name" className="flex-1" rules={[requiredRule('Enter a name')]}>
              <Input maxLength={40} size="large" style={{ borderRadius: 8 }} />
            </Form.Item>
            <Form.Item label="Color" name="color">
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
