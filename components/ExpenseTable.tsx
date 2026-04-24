'use client'

import {
  AutoComplete,
  Button,
  DatePicker,
  Drawer,
  Empty,
  Form,
  Grid,
  Input,
  InputNumber,
  Modal,
  Select,
  Table,
  Typography,
  theme,
} from 'antd'
import { useRef } from 'react'
import { DownloadOutlined, PlusOutlined } from '@ant-design/icons'
import { useExpenseTable } from '@/hooks/useExpenseTable'
import { requiredRule } from '@/constants/validation'
import AddExpenseFAB, { type AddExpenseFABRef } from '@/components/AddExpenseFAB'

const { Text } = Typography

export default function ExpenseTable() {
  const { token } = theme.useToken()
  const screens = Grid.useBreakpoint()
  const isMobile = screens.sm === false
  const fabRef = useRef<AddExpenseFABRef>(null)
  const {
    spenders,
    selectedSpenderIds,
    setSelectedSpenderIds,
    selectedCategoryId,
    setSelectedCategoryId,
    selectedMonth,
    setSelectedMonth,
    modalOpen,
    form,
    monthFilteredExpenses,
    columns,
    categoryOptions,
    spenderOptions,
    descriptionOptions,
    setDescriptionInput,
    closeEdit,
    handleEditSave,
    handleExportCSV,
  } = useExpenseTable()

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="fade-up flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="hidden sm:block">
          <Text strong style={{ fontSize: 22, fontWeight: 700 }}>
            Expenses
          </Text>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Select
            allowClear
            placeholder="All categories"
            options={categoryOptions}
            value={selectedCategoryId}
            onChange={(v) => setSelectedCategoryId(v ?? null)}
            style={{ minWidth: 140 }}
          />
          {spenders.length > 0 && (
            <Select
              mode="multiple"
              allowClear
              placeholder="All spenders"
              options={spenderOptions}
              value={selectedSpenderIds}
              onChange={setSelectedSpenderIds}
              style={{ minWidth: 120 }}
            />
          )}
          <DatePicker
            picker="month"
            value={selectedMonth}
            onChange={(v) => setSelectedMonth(v)}
            allowClear
            format="MMM YYYY"
            inputReadOnly
          />
          <div className="hidden sm:flex">
            <Button type="primary" icon={<PlusOutlined />} onClick={() => fabRef.current?.open()}>
              Add Expense
            </Button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div
        className="rounded-2xl overflow-hidden fade-up"
        style={{
          background: token.colorBgContainer,
          border: `1px solid ${token.colorBorderSecondary}`,
          boxShadow: '0 2px 16px rgba(0,0,0,0.05)',
        }}
      >
        <div
          className="px-5 py-4 flex items-center justify-between"
          style={{ borderBottom: `1px solid ${token.colorBorderSecondary}` }}
        >
          <Text strong style={{ fontSize: 14, fontWeight: 600 }}>
            {selectedMonth ? `${selectedMonth.format('MMMM YYYY')} Expenses` : 'All Expenses'}
          </Text>
          <div className="flex items-center gap-3">
            <Text type="secondary" style={{ fontSize: 12 }}>
              {monthFilteredExpenses.length} records
            </Text>
            <Button
              icon={<DownloadOutlined />}
              size="small"
              onClick={handleExportCSV}
              disabled={monthFilteredExpenses.length === 0}
              style={{ borderRadius: 8 }}
            >
              Export CSV
            </Button>
          </div>
        </div>
        <div className="p-4">
          <Table
            dataSource={monthFilteredExpenses}
            columns={columns}
            rowKey="id"
            pagination={{ pageSize: 10, hideOnSinglePage: true, showSizeChanger: false }}
            scroll={{ x: 'max-content' }}
            locale={{ emptyText: <Empty description="No expenses yet" /> }}
            size="small"
          />
        </div>
      </div>

      <AddExpenseFAB ref={fabRef} />

      {/* Edit expense — bottom sheet on mobile, modal on desktop */}
      {(() => {
        const editExpenseFormJSX = (
          <Form form={form} layout="vertical" onFinish={handleEditSave} className="pt-4">
            <Form.Item label="Description" name="description" rules={[requiredRule('Enter a description')]}>
              <AutoComplete
                options={descriptionOptions}
                onSearch={setDescriptionInput}
                listHeight={200}
                getPopupContainer={(trigger) => trigger.parentElement ?? document.body}
              >
                <Input maxLength={120} inputMode="text" />
              </AutoComplete>
            </Form.Item>

            <div className="grid grid-cols-2 gap-4">
              <Form.Item label="Amount (₹)" name="amount" rules={[requiredRule('Enter amount')]}>
                <InputNumber className="w-full" min={0.01} precision={2} />
              </Form.Item>

              <Form.Item label="Date & Time" name="date" rules={[requiredRule('Pick a date')]}>
                <DatePicker
                  className="w-full"
                  showTime={{ format: 'HH:mm', minuteStep: 5 }}
                  format="YYYY-MM-DD HH:mm"
                  inputReadOnly
                  getPopupContainer={(trigger) => trigger.parentElement ?? document.body}
                />
              </Form.Item>
            </div>

            <Form.Item label="Category" name="categoryId" rules={[requiredRule('Select a category')]}>
              <Select
                showSearch={false}
                options={categoryOptions}
                getPopupContainer={(trigger) => trigger.parentElement ?? document.body}
              />
            </Form.Item>

            <Form.Item label="Spent By" name="spenderId">
              <Select
                showSearch={false}
                options={spenderOptions}
                allowClear
                placeholder={spenders.length === 0 ? 'Add spenders first' : 'Select a spender'}
                disabled={spenders.length === 0}
                getPopupContainer={(trigger) => trigger.parentElement ?? document.body}
              />
            </Form.Item>

            <Form.Item label="Notes" name="notes">
              <Input.TextArea rows={2} maxLength={200} />
            </Form.Item>

            <div className="flex gap-3 justify-end">
              <Button onClick={closeEdit}>Cancel</Button>
              <Button type="primary" htmlType="submit">
                Save Changes
              </Button>
            </div>
          </Form>
        )
        return isMobile ? (
          <Drawer
            title="Edit Expense"
            placement="bottom"
            open={modalOpen}
            onClose={closeEdit}
            styles={{ body: { paddingBottom: 32, overflowY: 'auto' }, wrapper: { height: 'auto', maxHeight: '90dvh' } }}
            destroyOnHidden
          >
            {editExpenseFormJSX}
          </Drawer>
        ) : (
          <Modal title="Edit Expense" open={modalOpen} onCancel={closeEdit} footer={null} destroyOnHidden>
            {editExpenseFormJSX}
          </Modal>
        )
      })()}
    </div>
  )
}
