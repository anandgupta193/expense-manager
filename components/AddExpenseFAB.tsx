'use client'

import { forwardRef, useImperativeHandle } from 'react'
import { AutoComplete, Button, DatePicker, Drawer, Form, Grid, Input, InputNumber, Modal, Select, theme } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { useAddExpense } from '@/hooks/useAddExpense'
import { requiredRule } from '@/constants/validation'

export interface AddExpenseFABRef {
  open: () => void
}

const AddExpenseFAB = forwardRef<AddExpenseFABRef>(function AddExpenseFAB(_, ref) {
  const { token } = theme.useToken()
  const screens = Grid.useBreakpoint()
  const isMobile = screens.sm === false
  const {
    spenders,
    addModalOpen,
    addForm,
    descriptionOptions,
    setDescriptionInput,
    categoryOptions,
    spenderOptions,
    openAddModal,
    closeAddModal,
    handleAddSave,
  } = useAddExpense()

  useImperativeHandle(ref, () => ({ open: openAddModal }))

  const addExpenseFormJSX = (
    <Form form={addForm} layout="vertical" onFinish={handleAddSave} className="pt-2">
      <Form.Item label="Description" name="description" rules={[requiredRule('Enter a description')]}>
        <AutoComplete
          options={descriptionOptions}
          onChange={setDescriptionInput}
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
        <Form.Item label="Date" name="date" rules={[requiredRule('Pick a date')]}>
          <DatePicker
            className="w-full"
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
        <Button onClick={closeAddModal}>Cancel</Button>
        <Button type="primary" htmlType="submit" icon={<PlusOutlined />}>
          Add Expense
        </Button>
      </div>
    </Form>
  )

  return (
    <>
      {/* FAB — mobile/tablet only */}
      <button
        onClick={openAddModal}
        className="lg:hidden fixed bottom-20 left-1/2 -translate-x-1/2 z-40
                   w-14 h-14 rounded-full flex items-center justify-center
                   active:scale-95 transition-transform duration-150"
        style={{
          background: token.colorPrimary,
          boxShadow: `0 4px 20px ${token.colorPrimary}55, 0 2px 8px rgba(0,0,0,0.18)`,
        }}
        aria-label="Add expense"
      >
        <PlusOutlined style={{ fontSize: 22, color: '#fff' }} />
      </button>

      {/* Add Expense — bottom sheet on mobile, modal on desktop */}
      {isMobile ? (
        <Drawer
          title="Add Expense"
          placement="bottom"
          open={addModalOpen}
          onClose={closeAddModal}
          styles={{ body: { paddingBottom: 32, overflowY: 'auto' }, wrapper: { height: 'auto', maxHeight: '90dvh' } }}
          destroyOnHidden
        >
          {addExpenseFormJSX}
        </Drawer>
      ) : (
        <Modal title="Add Expense" open={addModalOpen} onCancel={closeAddModal} footer={null} destroyOnHidden>
          {addExpenseFormJSX}
        </Modal>
      )}
    </>
  )
})

export default AddExpenseFAB
