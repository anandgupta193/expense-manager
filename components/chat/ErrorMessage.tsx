'use client'

import { Button, Space, theme } from 'antd'
import { useRouter } from 'next/navigation'
import { ERROR_ACTIONS } from '@/constants/chat'

interface ErrorMessageProps {
  content: string
  onRetry: () => void
  disabled?: boolean
}

export default function ErrorMessage({ content, onRetry, disabled }: ErrorMessageProps) {
  const { token } = theme.useToken()
  const router = useRouter()

  const handleDashboard = () => {
    router.push('/dashboard')
  }

  return (
    <div
      className="max-w-[85%] rounded-2xl px-4 py-3 flex flex-col gap-3"
      style={{
        background: token.colorBgContainer,
        color: token.colorError,
        border: `1px solid ${token.colorBorderSecondary}`,
      }}
    >
      <div className="whitespace-pre-wrap break-words">{content}</div>
      <Space>
        <Button type="text" size="small" onClick={onRetry} disabled={disabled} style={{ color: token.colorError }}>
          {ERROR_ACTIONS.TRY_AGAIN}
        </Button>
        <Button type="text" size="small" onClick={handleDashboard} style={{ color: token.colorError }}>
          {ERROR_ACTIONS.GO_TO_DASHBOARD}
        </Button>
      </Space>
    </div>
  )
}
