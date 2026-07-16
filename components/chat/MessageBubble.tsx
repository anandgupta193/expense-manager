'use client'

import { theme } from 'antd'
import type { ReactNode } from 'react'
import type { UiMessage } from '@/hooks/useChat'

export default function MessageBubble({ message, children }: { message: UiMessage; children?: ReactNode }) {
  const { token } = theme.useToken()
  const isUser = message.role === 'user'
  const showTyping = message.role === 'assistant' && message.streaming && !message.content

  return (
    <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
      {(message.content || showTyping) && (
        <div
          className="max-w-[85%] rounded-2xl px-4 py-2 whitespace-pre-wrap break-words"
          style={{
            background: isUser ? token.colorPrimary : token.colorBgContainer,
            color: isUser ? '#fff' : message.error ? token.colorError : token.colorText,
            border: isUser ? 'none' : `1px solid ${token.colorBorderSecondary}`,
          }}
        >
          {showTyping ? <TypingDots color={token.colorTextSecondary} /> : message.content}
        </div>
      )}
      {/* Action cards / summary cards render full-width under the bubble */}
      <div className="w-full max-w-[85%]">{children}</div>
    </div>
  )
}

function TypingDots({ color }: { color: string }) {
  return (
    <span className="inline-flex gap-1 items-center py-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="inline-block w-1.5 h-1.5 rounded-full animate-bounce"
          style={{ background: color, animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </span>
  )
}
