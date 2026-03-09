'use client'

import { Switch, TimePicker, theme, Typography } from 'antd'
import { BellOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { useReminderSettings } from '@/hooks/useReminderSettings'

const { Text } = Typography

export default function ReminderSettings() {
  const { token } = theme.useToken()
  const { config, handleToggle, handleTimeChange } = useReminderSettings()

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
          style={{ background: `${token.colorPrimary}18`, color: token.colorPrimary }}
        >
          <BellOutlined style={{ fontSize: 15 }} />
        </div>
        <Text strong style={{ fontSize: 14, fontWeight: 600 }}>
          Daily Reminder
        </Text>
      </div>

      {/* Settings */}
      <div className="p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <Text style={{ fontWeight: 500 }}>Enable reminder</Text>
            <Text type="secondary" className="block" style={{ fontSize: 12, marginTop: 1 }}>
              Get a daily nudge to log expenses
            </Text>
          </div>
          <Switch checked={config.enabled} onChange={handleToggle} />
        </div>

        <div
          className="flex items-center justify-between rounded-xl px-4 py-3"
          style={{
            background: token.colorFillAlter,
            border: `1px solid ${token.colorBorderSecondary}`,
            opacity: config.enabled ? 1 : 0.5,
            transition: 'opacity 0.2s ease',
          }}
        >
          <Text style={{ color: config.enabled ? token.colorText : token.colorTextDisabled, fontSize: 14 }}>
            Reminder time
          </Text>
          <TimePicker
            value={dayjs(config.time, 'HH:mm')}
            format="HH:mm"
            use12Hours={false}
            disabled={!config.enabled}
            onChange={handleTimeChange}
            allowClear={false}
          />
        </div>

        <Text style={{ color: token.colorTextSecondary, fontSize: 12, lineHeight: 1.5 }}>
          Notification fires while the app is open in your browser.
        </Text>
      </div>
    </div>
  )
}
