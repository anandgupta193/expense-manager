import { NextRequest } from 'next/server'
import { Runner, InMemorySessionService, StreamingMode, createEvent, type Event } from '@google/adk'
import type { Content } from '@google/genai'
import { verifyIdToken, bearerFromHeader } from '@/lib/auth/verifyIdToken'
import { buildExpenseAgent, APP_NAME } from '@/lib/agent/expenseAgent'
import { sseEncode } from '@/lib/sse'
import type { ChatRequest, ChatStreamEvent } from '@/lib/types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function partsText(event: Event): string {
  return (event.content?.parts ?? []).map((p) => p.text ?? '').join('')
}

export async function POST(req: NextRequest) {
  // 1. Auth: verify the Firebase ID token (no Admin SDK).
  const token = bearerFromHeader(req.headers.get('authorization'))
  let uid: string
  try {
    if (!token) throw new Error('Missing token')
    uid = await verifyIdToken(token)
  } catch {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // 2. Parse the request.
  let body: ChatRequest
  try {
    body = (await req.json()) as ChatRequest
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400 })
  }
  const { messages, snapshot } = body
  if (!Array.isArray(messages) || messages.length === 0 || messages[messages.length - 1].role !== 'user') {
    return new Response(JSON.stringify({ error: 'messages must end with a user message' }), { status: 400 })
  }

  const encoder = new TextEncoder()

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let closed = false
      const emit = (event: ChatStreamEvent) => {
        if (closed) return
        controller.enqueue(encoder.encode(sseEncode(event)))
      }

      try {
        const { agent, state } = buildExpenseAgent({ snapshot, now: new Date(), emit })

        const sessionService = new InMemorySessionService()
        const runner = new Runner({ appName: APP_NAME, agent, sessionService })
        const sessionId = crypto.randomUUID()
        const session = await sessionService.createSession({ appName: APP_NAME, userId: uid, sessionId })

        // Seed prior turns as session history so follow-ups have context.
        const history = messages.slice(0, -1)
        for (const msg of history) {
          const role = msg.role === 'user' ? 'user' : 'model'
          await sessionService.appendEvent({
            session,
            event: createEvent({
              author: role,
              content: { role, parts: [{ text: msg.content }] },
            }),
          })
        }

        const newMessage: Content = { role: 'user', parts: [{ text: messages[messages.length - 1].content }] }

        let streamedText = false
        let lastFinalText = ''

        for await (const event of runner.runAsync({
          userId: uid,
          sessionId,
          newMessage,
          runConfig: { streamingMode: StreamingMode.SSE },
        })) {
          const text = partsText(event)
          if (text) {
            if (event.partial) {
              emit({ type: 'text-delta', delta: text })
              streamedText = true
            } else {
              lastFinalText = text
            }
          }
        }

        // Fallback if the model didn't stream partials for some reason.
        if (!streamedText && lastFinalText) emit({ type: 'text-delta', delta: lastFinalText })

        // If the agent asked for more data, the client re-POSTs — no 'done'.
        if (!state.expansionRequested) emit({ type: 'done' })
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err)
        console.error('Chat error:', message)
        emit({ type: 'error', message })
      } finally {
        closed = true
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  })
}
