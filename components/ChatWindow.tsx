'use client'

import { useEffect, useRef, useState } from 'react'
import { Button, Input, Tag, Typography, theme } from 'antd'
import { SendOutlined, RobotOutlined } from '@ant-design/icons'
import { useChat } from '@/hooks/useChat'
import { useAppData } from '@/app/providers'
import { QUICK_ACTIONS } from '@/constants/quickActions'
import MessageBubble from '@/components/chat/MessageBubble'
import { ChatActionCard, ChatCardView } from '@/components/chat/registry'
import CategoryChoiceCard from '@/components/chat/CategoryChoiceCard'

export default function ChatWindow() {
  const { token } = theme.useToken()
  const { messages, busy, error, send, confirmAction, cancelAction, resolvePendingCategory, createCategoryAndResolve } =
    useChat()
  const { categories, spenders, expenses } = useAppData()
  const [input, setInput] = useState('')
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const submit = (text: string) => {
    if (!text.trim() || busy) return
    setInput('')
    void send(text)
  }

  const renderData = { categories, spenders, expenses }
  const isEmpty = messages.length === 0

  return (
    <div className="flex flex-col mx-auto w-full max-w-3xl px-4 h-[calc(100dvh-12rem)] md:h-[calc(100dvh-8rem)] overflow-hidden">
      {/* Messages */}
      <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar py-4 flex flex-col gap-3">
        {isEmpty ? (
          <div className="flex flex-1 flex-col items-center justify-center text-center gap-3">
            <RobotOutlined style={{ fontSize: 40, color: token.colorPrimary }} />
            <Typography.Title level={4} style={{ margin: 0 }}>
              Your expense assistant
            </Typography.Title>
            <Typography.Text type="secondary">
              Add expenses, ask about your spending, or manage categories — just type.
            </Typography.Text>
          </div>
        ) : (
          messages.map((m, mi) => (
            <MessageBubble key={mi} message={m}>
              {m.actionItems?.map((item, ii) => (
                <ChatActionCard
                  key={ii}
                  item={item}
                  data={renderData}
                  onConfirm={() => confirmAction(mi, ii)}
                  onCancel={() => cancelAction(mi, ii)}
                />
              ))}
              {m.cards?.map((card, ci) => (
                <ChatCardView key={ci} card={card} />
              ))}
              {m.pendingCategory && (
                <CategoryChoiceCard
                  pendingCategory={m.pendingCategory}
                  categories={categories}
                  onPick={(categoryId) => resolvePendingCategory(mi, categoryId)}
                  onCreate={(name) => createCategoryAndResolve(mi, name)}
                />
              )}
            </MessageBubble>
          ))
        )}
        <div ref={endRef} />
      </div>

      {/* Composer */}
      <div className="pb-4 pt-2">
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 -mx-1 px-1">
          {QUICK_ACTIONS.map((qa) => (
            <Tag
              key={qa.label}
              onClick={() => submit(qa.prompt)}
              style={{ cursor: busy ? 'not-allowed' : 'pointer', userSelect: 'none', whiteSpace: 'nowrap' }}
              color="processing"
            >
              {qa.label}
            </Tag>
          ))}
        </div>

        {error && (
          <Typography.Text type="danger" className="block mb-2 text-sm">
            {error}
          </Typography.Text>
        )}

        <div className="flex gap-2 items-end">
          <Input.TextArea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onPressEnter={(e) => {
              if (!e.shiftKey) {
                e.preventDefault()
                submit(input)
              }
            }}
            placeholder="Message your assistant…"
            autoSize={{ minRows: 1, maxRows: 4 }}
          />
          <Button
            type="primary"
            icon={<SendOutlined />}
            loading={busy}
            onClick={() => submit(input)}
            disabled={!input.trim()}
          />
        </div>
      </div>
    </div>
  )
}
