'use client'

import { Button, ColorPicker, Form, Input, Popconfirm, Typography, Modal, theme, Empty } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
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
      <div>
        <Title level={3} className="!mb-0">
          Categories
        </Title>
        <Text type="secondary">Create and manage your expense categories</Text>
      </div>

      {/* Add new category */}
      <div
        className="rounded-xl p-6"
        style={{
          background: token.colorBgContainer,
          border: `1px solid ${token.colorBorderSecondary}`,
        }}
      >
        <Title level={5} className="!mb-4">
          Add New Category
        </Title>
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
              <Input placeholder="e.g. Rent & Housing" maxLength={40} size="large" />
            </Form.Item>

            <Form.Item label="Color" name="color" className="!mb-0">
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

      {/* Category list */}
      <div
        className="rounded-xl p-6"
        style={{
          background: token.colorBgContainer,
          border: `1px solid ${token.colorBorderSecondary}`,
        }}
      >
        <Title level={5} className="!mb-4">
          All Categories ({categories.length})
        </Title>

        {categories.length === 0 ? (
          <Empty description="No categories yet" />
        ) : (
          <div className="space-y-2">
            {categories.map((cat) => {
              const count = expenseCounts[cat.id] ?? 0
              return (
                <div
                  key={cat.id}
                  className="flex items-center gap-4 p-4 rounded-xl"
                  style={{
                    background: token.colorFillAlter,
                    border: `1px solid ${token.colorBorderSecondary}`,
                  }}
                >
                  {/* Color swatch */}
                  <div className="w-10 h-10 rounded-lg flex-shrink-0" style={{ background: cat.color }} />

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <Text strong className="block truncate">
                      {cat.name}
                    </Text>
                    <Text type="secondary" className="text-xs">
                      {count} expense{count !== 1 ? 's' : ''}
                    </Text>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-1 flex-shrink-0">
                    <Button type="text" icon={<EditOutlined />} onClick={() => openEdit(cat)} />
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

      {/* Edit modal */}
      <Modal title="Edit Category" open={modalOpen} onCancel={closeEdit} footer={null} destroyOnHidden>
        <Form form={editForm} layout="vertical" onFinish={handleEditSave} className="pt-4">
          <div className="flex gap-4 items-end">
            <Form.Item label="Name" name="name" className="flex-1" rules={[requiredRule('Enter a name')]}>
              <Input maxLength={40} size="large" />
            </Form.Item>
            <Form.Item label="Color" name="color">
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
