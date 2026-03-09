'use client'

import { InputNumber, theme, Typography } from 'antd'
import { DollarOutlined } from '@ant-design/icons'
import { useBudgetSettings } from '@/hooks/useBudgetSettings'

const { Text } = Typography

export default function BudgetSettings() {
  const { token } = theme.useToken()
  const { config, handleLimitChange } = useBudgetSettings()

  return (
    <div
      className="rounded-2xl overflow-hidden fade-up"
      style={{
        background: token.colorBgContainer,
        border: `1px solid ${token.colorBorderSecondary}`,
        boxShadow: '0 2px 16px rgba(0,0,0,0.05)',
      }}
    >
      {/* Header */}
      <div
        className="px-5 py-4 flex items-center gap-3"
        style={{ borderBottom: `1px solid ${token.colorBorderSecondary}` }}
      >
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: `${token.colorSuccess}18`, color: token.colorSuccess }}
        >
          <DollarOutlined style={{ fontSize: 15 }} />
        </div>
        <Text strong style={{ fontSize: 14, fontWeight: 600 }}>
          Monthly Budget
        </Text>
      </div>

      {/* Settings */}
      <div className="p-5 flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div>
            <Text style={{ fontWeight: 500 }}>Monthly limit</Text>
            <Text type="secondary" className="block" style={{ fontSize: 12, marginTop: 1 }}>
              Track spending against a monthly budget
            </Text>
          </div>
          <InputNumber
            prefix="₹"
            min={0}
            step={100}
            precision={0}
            value={config.monthlyLimit ?? undefined}
            onChange={handleLimitChange}
            placeholder="Not set"
            style={{ width: '100%' }}
            className="sm:max-w-[140px]"
          />
        </div>

        <Text style={{ color: token.colorTextSecondary, fontSize: 12, lineHeight: 1.5 }}>
          Set to 0 or clear to disable the budget tracker on the Dashboard.
        </Text>
      </div>
    </div>
  )
}
