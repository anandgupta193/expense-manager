'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useAppData, useBudgetContext, useAuthContext } from '@/app/providers'
import { applyActions, type ApplyContext } from '@/lib/agent/actions'
import { createSSEParser } from '@/lib/sse'
import { consumeChat } from '@/lib/chatQuota'
import { DAILY_CHAT_LIMIT } from '@/constants/chat'
import { isDestructive } from '@/lib/types'
import type {
  AgentAction,
  Category,
  ChatCard,
  ChatRequest,
  ChatSnapshot,
  DateRange,
  Expense,
  PendingExpense,
} from '@/lib/types'

export interface ActionItem {
  action: AgentAction
  status: 'applied' | 'pending' | 'confirmed' | 'cancelled'
}

export interface PendingCategory {
  prompt: string
  pending: PendingExpense
  status: 'open' | 'resolved' | 'dismissed'
  chosenLabel?: string
}

export interface UiMessage {
  role: 'user' | 'assistant'
  content: string
  actionItems?: ActionItem[]
  cards?: ChatCard[]
  pendingCategory?: PendingCategory
  streaming?: boolean
  error?: boolean
}

// Palette for auto-coloring newly-created categories.
const NEW_CATEGORY_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899']

// If no data arrives from the assistant for this long, treat it as "not responding".
const RESPONSE_TIMEOUT_MS = 30_000

function monthRange(now: Date): DateRange {
  const y = now.getFullYear()
  const m = now.getMonth()
  const pad = (n: number) => String(n).padStart(2, '0')
  const last = new Date(y, m + 1, 0).getDate()
  return { from: `${y}-${pad(m + 1)}-01`, to: `${y}-${pad(m + 1)}-${pad(last)}` }
}

export function useChat() {
  const { expenses, categories, spenders, setExpenses, setCategories, setSpenders } = useAppData()
  const { budget, setBudget } = useBudgetContext()
  const { user } = useAuthContext()

  const [messages, setMessages] = useState<UiMessage[]>([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Keep the latest data/setters available inside async callbacks without
  // re-creating them on every keystroke.
  const messagesRef = useRef<UiMessage[]>(messages)
  messagesRef.current = messages
  const ctxRef = useRef<ApplyContext>(null as unknown as ApplyContext)
  ctxRef.current = { expenses, categories, spenders, setExpenses, setCategories, setSpenders, setBudget }

  const buildSnapshot = useCallback(
    (range: DateRange): ChatSnapshot => {
      const inWindow = expenses.filter((e) => e.date >= range.from && e.date <= range.to)
      return { expenses: inWindow, range, categories, spenders, budget }
    },
    [expenses, categories, spenders, budget]
  )

  const patchMessage = useCallback((idx: number, patch: (m: UiMessage) => UiMessage) => {
    setMessages((prev) => prev.map((m, i) => (i === idx ? patch(m) : m)))
  }, [])

  const runTurn = useCallback(
    async (assistantIdx: number, wire: ChatRequest['messages'], range: DateRange, hop: number): Promise<void> => {
      if (!user) return
      const token = await user.getIdToken()
      const snapshot = buildSnapshot(range)
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), RESPONSE_TIMEOUT_MS)
      let res: Response
      try {
        res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ messages: wire, snapshot } satisfies ChatRequest),
          signal: controller.signal,
        })
      } catch (err) {
        const timedOut = err instanceof DOMException && err.name === 'AbortError'
        patchMessage(assistantIdx, (m) => ({
          ...m,
          streaming: false,
          error: true,
          content: timedOut ? 'The assistant did not respond in time. Please try again.' : 'Request failed.',
        }))
        return
      } finally {
        clearTimeout(timeout)
      }
      if (!res.ok || !res.body) {
        patchMessage(assistantIdx, (m) => ({
          ...m,
          streaming: false,
          error: true,
          content: m.content || 'Request failed.',
        }))
        return
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      const parse = createSSEParser()
      const autoApply: AgentAction[] = []
      let expansion: DateRange | null = null
      let sawOutput = false
      // Reset the "not responding" deadline every time a chunk actually arrives.
      let idleTimeout = setTimeout(() => controller.abort(), RESPONSE_TIMEOUT_MS)

      try {
        for (;;) {
          const { value, done } = await reader.read()
          if (done) break
          clearTimeout(idleTimeout)
          idleTimeout = setTimeout(() => controller.abort(), RESPONSE_TIMEOUT_MS)
          for (const ev of parse(decoder.decode(value, { stream: true }))) {
            sawOutput = true
            if (ev.type === 'text-delta') {
              patchMessage(assistantIdx, (m) => ({ ...m, content: m.content + ev.delta }))
            } else if (ev.type === 'action') {
              if (isDestructive(ev.action)) {
                patchMessage(assistantIdx, (m) => ({
                  ...m,
                  actionItems: [...(m.actionItems ?? []), { action: ev.action, status: 'pending' }],
                }))
              } else {
                autoApply.push(ev.action)
                patchMessage(assistantIdx, (m) => ({
                  ...m,
                  actionItems: [...(m.actionItems ?? []), { action: ev.action, status: 'applied' }],
                }))
              }
            } else if (ev.type === 'card') {
              patchMessage(assistantIdx, (m) => ({ ...m, cards: [...(m.cards ?? []), ev.card] }))
            } else if (ev.type === 'choose_category') {
              patchMessage(assistantIdx, (m) => ({
                ...m,
                pendingCategory: { prompt: ev.prompt, pending: ev.pending, status: 'open' },
              }))
            } else if (ev.type === 'need_data') {
              expansion = ev.range
            } else if (ev.type === 'error') {
              patchMessage(assistantIdx, (m) => ({ ...m, error: true, content: m.content || ev.message }))
            }
            // 'done' handled implicitly by stream end
          }
        }
      } catch (err) {
        const timedOut = err instanceof DOMException && err.name === 'AbortError'
        patchMessage(assistantIdx, (m) => ({
          ...m,
          streaming: false,
          error: true,
          content:
            m.content || (timedOut ? 'The assistant did not respond in time. Please try again.' : 'Request failed.'),
        }))
        return
      } finally {
        clearTimeout(idleTimeout)
      }

      // On-demand expansion: re-run this turn once with a wider window.
      if (expansion && hop < 1) {
        const widened: DateRange = {
          from: expansion.from < range.from ? expansion.from : range.from,
          to: expansion.to > range.to ? expansion.to : range.to,
        }
        patchMessage(assistantIdx, (m) => ({ ...m, content: '' }))
        return runTurn(assistantIdx, wire, widened, hop + 1)
      }

      if (autoApply.length) applyActions(autoApply, ctxRef.current)
      // Stream ended cleanly but produced nothing at all — the assistant never actually responded.
      patchMessage(assistantIdx, (m) => {
        const hasOutput = sawOutput || m.content || m.actionItems?.length || m.cards?.length || m.pendingCategory
        return hasOutput
          ? { ...m, streaming: false }
          : { ...m, streaming: false, error: true, content: 'The assistant did not respond. Please try again.' }
      })
    },
    [user, buildSnapshot, patchMessage]
  )

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim()
      if (!trimmed || busy) return
      if (!consumeChat(DAILY_CHAT_LIMIT)) {
        setError('Daily chat limit reached. Try again tomorrow.')
        return
      }
      setError(null)
      setBusy(true)

      const prevLen = messagesRef.current.length
      const userMsg: UiMessage = { role: 'user', content: trimmed }
      const assistantMsg: UiMessage = { role: 'assistant', content: '', streaming: true }
      // Deactivate any still-open category picker so it can't double-save.
      setMessages((prev) => [
        ...prev.map((m) =>
          m.pendingCategory?.status === 'open'
            ? { ...m, pendingCategory: { ...m.pendingCategory, status: 'dismissed' as const } }
            : m
        ),
        userMsg,
        assistantMsg,
      ])

      const wire = [...messagesRef.current, userMsg].map((m) => ({ role: m.role, content: m.content }))
      try {
        await runTurn(prevLen + 1, wire, monthRange(new Date()), 0)
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Something went wrong.'
        patchMessage(prevLen + 1, (m) => ({ ...m, streaming: false, error: true, content: m.content || msg }))
      } finally {
        setBusy(false)
      }
    },
    [busy, runTurn, patchMessage]
  )

  const confirmAction = useCallback((msgIdx: number, itemIdx: number) => {
    const item = messagesRef.current[msgIdx]?.actionItems?.[itemIdx]
    if (!item || item.status !== 'pending') return
    applyActions([item.action], ctxRef.current)
    setMessages((prev) =>
      prev.map((m, i) =>
        i === msgIdx
          ? { ...m, actionItems: m.actionItems?.map((it, j) => (j === itemIdx ? { ...it, status: 'confirmed' } : it)) }
          : m
      )
    )
  }, [])

  const cancelAction = useCallback((msgIdx: number, itemIdx: number) => {
    setMessages((prev) =>
      prev.map((m, i) =>
        i === msgIdx
          ? { ...m, actionItems: m.actionItems?.map((it, j) => (j === itemIdx ? { ...it, status: 'cancelled' } : it)) }
          : m
      )
    )
  }, [])

  const markResolved = useCallback((msgIdx: number, chosenLabel: string) => {
    setMessages((prev) =>
      prev.map((m, i) =>
        i === msgIdx && m.pendingCategory
          ? { ...m, pendingCategory: { ...m.pendingCategory, status: 'resolved', chosenLabel } }
          : m
      )
    )
  }, [])

  // Pick an existing category → finalize the pending expense instantly.
  const resolvePendingCategory = useCallback(
    (msgIdx: number, categoryId: string) => {
      const pc = messagesRef.current[msgIdx]?.pendingCategory
      if (!pc || pc.status !== 'open') return
      const expense: Expense = { ...pc.pending, categoryId }
      applyActions([{ type: 'add_expense', expense }], ctxRef.current)
      const label = ctxRef.current.categories.find((c) => c.id === categoryId)?.name ?? 'category'
      markResolved(msgIdx, label)
    },
    [markResolved]
  )

  // Create a new category and finalize the pending expense under it (one batch).
  const createCategoryAndResolve = useCallback(
    (msgIdx: number, name: string) => {
      const pc = messagesRef.current[msgIdx]?.pendingCategory
      if (!pc || pc.status !== 'open') return
      const trimmedName = name.trim()
      if (!trimmedName) return
      const color = NEW_CATEGORY_COLORS[ctxRef.current.categories.length % NEW_CATEGORY_COLORS.length]
      const category: Category = { id: `cat-${crypto.randomUUID()}`, name: trimmedName, color }
      const expense: Expense = { ...pc.pending, categoryId: category.id }
      applyActions(
        [
          { type: 'add_category', category },
          { type: 'add_expense', expense },
        ],
        ctxRef.current
      )
      markResolved(msgIdx, trimmedName)
    },
    [markResolved]
  )

  // Reset the transcript on sign-out (stateless: nothing persisted).
  useEffect(() => {
    if (!user) setMessages([])
  }, [user])

  return {
    messages,
    busy,
    error,
    send,
    confirmAction,
    cancelAction,
    resolvePendingCategory,
    createCategoryAndResolve,
  }
}
