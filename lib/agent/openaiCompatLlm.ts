import { BaseLlm, type BaseLlmConnection, type LlmRequest, type LlmResponse } from '@google/adk'
import type { Content, FunctionDeclaration, Part } from '@google/genai'
import OpenAI from 'openai'
import type {
  ChatCompletionMessageParam,
  ChatCompletionMessageToolCall,
  ChatCompletionTool,
} from 'openai/resources/chat/completions'

/** OpenAI-compatible providers, selected by AI_PROVIDER; AI_MODEL overrides the default model. */
const PROVIDERS: Record<string, { baseURL?: string; keyEnv: string; model: string }> = {
  // `openrouter/free` routes each call to an available free model that supports tool calling.
  openrouter: { baseURL: 'https://openrouter.ai/api/v1', keyEnv: 'OPENROUTER_API_KEY', model: 'openrouter/free' },
  groq: { baseURL: 'https://api.groq.com/openai/v1', keyEnv: 'GROQ_API_KEY', model: 'llama-3.3-70b-versatile' },
  openai: { keyEnv: 'OPENAI_API_KEY', model: 'gpt-4o-mini' },
}

/** Client settings + model for an OpenAI-compatible provider, or undefined (e.g. gemini, claude). */
export function compatProvider(
  provider = process.env.AI_PROVIDER ?? 'gemini'
): { baseURL?: string; apiKey: string; model: string } | undefined {
  const p = PROVIDERS[provider]
  if (!p) return undefined
  return { baseURL: p.baseURL, apiKey: process.env[p.keyEnv] ?? '', model: process.env.AI_MODEL || p.model }
}

/**
 * Lets the ADK agent run on any OpenAI-compatible endpoint (OpenRouter, Groq,
 * OpenAI, Ollama…). ADK speaks Gemini-shaped requests, so this translates
 * contents + function declarations to chat-completions messages + tools, and
 * translates the reply (text and tool calls) back.
 */
export class OpenAiCompatLlm extends BaseLlm {
  private readonly client: OpenAI

  constructor({ model, apiKey, baseURL }: { model: string; apiKey: string; baseURL?: string }) {
    super({ model })
    this.client = new OpenAI({ apiKey, baseURL })
  }

  async *generateContentAsync(
    llmRequest: LlmRequest,
    stream = false,
    abortSignal?: AbortSignal
  ): AsyncGenerator<LlmResponse, void> {
    const request = {
      model: this.model,
      messages: toMessages(llmRequest),
      tools: toTools(llmRequest),
    }

    if (!stream) {
      const res = await this.client.chat.completions.create(request, { signal: abortSignal })
      const msg = res.choices[0]?.message
      yield final(msg?.content ?? '', msg?.tool_calls ?? [])
      return
    }

    // Stream text as partials; tool-call arguments arrive in fragments, so collect them by index.
    let text = ''
    const calls: { id: string; name: string; args: string }[] = []
    const chunks = await this.client.chat.completions.create({ ...request, stream: true }, { signal: abortSignal })
    for await (const chunk of chunks) {
      const delta = chunk.choices[0]?.delta
      if (!delta) continue
      if (delta.content) {
        text += delta.content
        yield { content: { role: 'model', parts: [{ text: delta.content }] }, partial: true }
      }
      for (const tc of delta.tool_calls ?? []) {
        const call = (calls[tc.index] ??= { id: '', name: '', args: '' })
        if (tc.id) call.id = tc.id
        if (tc.function?.name) call.name += tc.function.name
        if (tc.function?.arguments) call.args += tc.function.arguments
      }
    }
    yield final(
      text,
      calls.filter(Boolean).map((c) => ({ id: c.id, type: 'function', function: { name: c.name, arguments: c.args } }))
    )
  }

  async connect(): Promise<BaseLlmConnection> {
    throw new Error('Live connections are not supported by OpenAiCompatLlm')
  }
}

function final(text: string, toolCalls: ChatCompletionMessageToolCall[]): LlmResponse {
  const parts: Part[] = []
  if (text) parts.push({ text })
  for (const tc of toolCalls) {
    if (tc.type !== 'function') continue
    parts.push({ functionCall: { id: tc.id, name: tc.function.name, args: parseArgs(tc.function.arguments) } })
  }
  return { content: { role: 'model', parts }, partial: false, turnComplete: true }
}

function parseArgs(raw: string): Record<string, unknown> {
  try {
    return raw ? (JSON.parse(raw) as Record<string, unknown>) : {}
  } catch {
    return {}
  }
}

function textOf(parts: Part[] | undefined): string {
  return (parts ?? [])
    .map((p) => p.text ?? '')
    .filter(Boolean)
    .join('\n')
}

function systemPrompt(req: LlmRequest): string {
  const si = req.config?.systemInstruction
  if (!si) return ''
  if (typeof si === 'string') return si
  if (Array.isArray(si)) return si.map((p) => (typeof p === 'string' ? p : (p.text ?? ''))).join('\n')
  if ('parts' in si) return textOf((si as Content).parts)
  return (si as Part).text ?? ''
}

export function toMessages(req: LlmRequest): ChatCompletionMessageParam[] {
  const messages: ChatCompletionMessageParam[] = []
  const system = systemPrompt(req)
  if (system) messages.push({ role: 'system', content: system })

  for (const content of req.contents) {
    const parts = content.parts ?? []
    if (content.role === 'model') {
      const toolCalls = parts
        .filter((p) => p.functionCall)
        .map((p) => ({
          id: p.functionCall!.id ?? p.functionCall!.name!,
          type: 'function' as const,
          function: { name: p.functionCall!.name!, arguments: JSON.stringify(p.functionCall!.args ?? {}) },
        }))
      const text = textOf(parts)
      if (text || toolCalls.length)
        messages.push({
          role: 'assistant',
          content: text || null,
          ...(toolCalls.length ? { tool_calls: toolCalls } : {}),
        })
      continue
    }
    // User turn: tool results become `tool` messages, plain text a `user` message.
    for (const p of parts) {
      if (p.functionResponse)
        messages.push({
          role: 'tool',
          tool_call_id: p.functionResponse.id ?? p.functionResponse.name!,
          content: JSON.stringify(p.functionResponse.response ?? {}),
        })
    }
    const text = textOf(parts)
    if (text) messages.push({ role: 'user', content: text })
  }
  return messages
}

export function toTools(req: LlmRequest): ChatCompletionTool[] | undefined {
  const decls: FunctionDeclaration[] = (req.config?.tools ?? []).flatMap((t) =>
    'functionDeclarations' in t ? (t.functionDeclarations ?? []) : []
  )
  if (!decls.length) return undefined
  return decls.map((d) => ({
    type: 'function',
    function: {
      name: d.name!,
      description: d.description,
      parameters:
        (d.parametersJsonSchema as Record<string, unknown>) ??
        (d.parameters ? toJsonSchema(d.parameters) : { type: 'object', properties: {} }),
    },
  }))
}

/** Gemini schemas use upper-case types (OBJECT, STRING…); JSON Schema wants lower-case. */
export function toJsonSchema(schema: unknown): Record<string, unknown> {
  if (Array.isArray(schema)) return schema.map(toJsonSchema) as unknown as Record<string, unknown>
  if (!schema || typeof schema !== 'object') return schema as Record<string, unknown>
  const out: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(schema)) {
    if (key === 'type' && typeof value === 'string') out.type = value.toLowerCase()
    else if (key === 'properties' && value && typeof value === 'object')
      out.properties = Object.fromEntries(Object.entries(value).map(([k, v]) => [k, toJsonSchema(v)]))
    else if (key === 'items' || key === 'anyOf') out[key] = toJsonSchema(value)
    else out[key] = value
  }
  return out
}

/**
 * The chat model: an OpenAI-compatible model when AI_PROVIDER names one
 * (openrouter, groq, openai), otherwise the Gemini model from config/agent.json.
 */
export function chatModel(geminiModel: string): string | BaseLlm {
  const compat = compatProvider()
  return compat ? new OpenAiCompatLlm(compat) : geminiModel
}
