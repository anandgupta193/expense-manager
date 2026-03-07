'use client'

import { Button, DatePicker, Form, Input, InputNumber, Select, Typography, theme } from 'antd'
import { PlusOutlined, ArrowLeftOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { useRouter } from 'next/navigation'
import { useAddExpense } from '@/hooks/useAddExpense'
import { requiredRule, minAmountRule } from '@/constants/validation'

const { Title, Text } = Typography

export default function AddExpense() {
  const { token } = theme.useToken()
  const router = useRouter()
  const { form, spenders, categoryOptions, spenderOptions, handleSubmit } = useAddExpense()

  return (
    <div className="max-w-lg mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => router.back()} className="flex items-center" />
        <div>
          <Title level={3} className="!mb-0">
            Add Expense
          </Title>
          <Text type="secondary">Record a new expense</Text>
        </div>
      </div>

      {/* Form card */}
      <div
        className="rounded-xl p-6"
        style={{
          background: token.colorBgContainer,
          border: `1px solid ${token.colorBorderSecondary}`,
        }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{ date: dayjs(), categoryId: 'cat-other' }}
        >
          <Form.Item label="Description" name="description" rules={[requiredRule('Enter a description')]}>
            <Input placeholder="e.g. Grocery shopping at BigBazaar" maxLength={120} size="large" />
          </Form.Item>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Form.Item label="Amount (₹)" name="amount" rules={[requiredRule('Enter an amount'), minAmountRule()]}>
              <InputNumber className="w-full" min={0.01} precision={2} placeholder="0.00" size="large" prefix="₹" />
            </Form.Item>

            <Form.Item label="Date" name="date" rules={[requiredRule('Pick a date')]}>
              <DatePicker className="w-full" size="large" />
            </Form.Item>
          </div>

          <Form.Item label="Category" name="categoryId" rules={[requiredRule('Select a category')]}>
            <Select options={categoryOptions} size="large" />
          </Form.Item>

          <Form.Item label="Spent By (optional)" name="spenderId">
            <Select
              options={spenderOptions}
              size="large"
              allowClear
              placeholder={spenders.length === 0 ? 'Add spenders first' : 'Select a spender'}
              disabled={spenders.length === 0}
            />
          </Form.Item>

          <Form.Item label="Notes (optional)" name="notes">
            <Input.TextArea rows={3} placeholder="Any additional details..." maxLength={200} showCount />
          </Form.Item>

          <div className="flex gap-3 pt-2">
            <Button onClick={() => router.back()} size="large" className="flex-1 sm:flex-none">
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              icon={<PlusOutlined />}
              size="large"
              className="flex-1 sm:flex-none"
            >
              Add Expense
            </Button>
          </div>
        </Form>
      </div>
    </div>
  )
}
