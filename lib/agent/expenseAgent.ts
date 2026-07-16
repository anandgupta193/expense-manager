import { LlmAgent, FunctionTool } from '@google/adk'
import { z } from 'zod'
import agentConfig from '@/config/agent.json'
import type {
  AgentAction,
  Category,
  ChatSnapshot,
  ChatStreamEvent,
  Expense,
  PendingExpense,
  Spender,
} from '@/lib/types'

export const APP_NAME = 'expense-manager'

const DEFAULT_COLOR = '#6366f1'
const DEFAULT_CATEGORY_ID = 'cat-other'

export interface AgentBuildOptions {
  snapshot: ChatSnapshot
  now: Date
  emit: (event: ChatStreamEvent) => void
}

export interface AgentState {
  /** Set when the agent asks for data outside the provided window. */
  expansionRequested: boolean
}

// Strict: returns the id of an existing category, or null if none matches.
// Category is mandatory on chat adds — there is no cat-other fallback here.
function matchCategoryId(snapshot: ChatSnapshot, categoryId?: string, name?: string): string | null {
  if (categoryId && snapshot.categories.some((c) => c.id === categoryId)) return categoryId
  if (name) {
    const match = snapshot.categories.find((c) => c.name.toLowerCase() === name.toLowerCase().trim())
    if (match) return match.id
  }
  return null
}

// Lenient (used by edits): falls back to cat-other when unmatched.
function resolveCategoryId(snapshot: ChatSnapshot, categoryId?: string, name?: string): string {
  return matchCategoryId(snapshot, categoryId, name) ?? DEFAULT_CATEGORY_ID
}

function resolveSpenderId(snapshot: ChatSnapshot, spenderId?: string, name?: string): string | undefined {
  if (spenderId && snapshot.spenders.some((s) => s.id === spenderId)) return spenderId
  if (name) {
    const match = snapshot.spenders.find((s) => s.name.toLowerCase() === name.toLowerCase().trim())
    if (match) return match.id
  }
  return undefined
}

function hhmm(d: Date): string {
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

function ymd(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/**
 * Builds the per-request expense agent. Mutation tools push structured
 * AgentActions to the SSE stream via `emit`; the client is the source of truth
 * and applies them. Adds apply immediately client-side; edits and deletes are
 * gated behind a user Confirm, so their tools return `pending_confirmation`
 * and the instruction tells the model not to claim completion.
 */
export function buildExpenseAgent({ snapshot, now, emit }: AgentBuildOptions): {
  agent: LlmAgent
  state: AgentState
} {
  const state: AgentState = { expansionRequested: false }

  const pushAction = (action: AgentAction) => emit({ type: 'action', action })

  const tools = [
    new FunctionTool({
      name: 'add_expense',
      description: 'Record a new expense for the user. Applies immediately.',
      parameters: z.object({
        description: z.string().describe('What the expense was for'),
        amount: z.number().describe('Amount in INR'),
        categoryId: z.string().optional().describe('Category id from context (preferred)'),
        category: z.string().optional().describe('Category name, if id unknown'),
        date: z.string().optional().describe('YYYY-MM-DD; defaults to today'),
        time: z.string().optional().describe('HH:mm; defaults to now'),
        spenderId: z.string().optional(),
        spender: z.string().optional().describe('Spender name, if id unknown'),
        notes: z.string().optional(),
      }),
      execute: (input) => {
        const pending: PendingExpense = {
          id: crypto.randomUUID(),
          description: input.description.trim(),
          amount: input.amount,
          date: input.date || ymd(now),
          time: input.time || hhmm(now),
          ...(input.notes ? { notes: input.notes.trim() } : {}),
          ...(() => {
            const sid = resolveSpenderId(snapshot, input.spenderId, input.spender)
            return sid ? { spenderId: sid } : {}
          })(),
        }
        const categoryId = matchCategoryId(snapshot, input.categoryId, input.category)
        if (categoryId) {
          const expense: Expense = { ...pending, categoryId }
          pushAction({ type: 'add_expense', expense })
          return { status: 'added', expense }
        }
        // Category is mandatory but unknown — let the user pick a chip client-side.
        emit({ type: 'choose_category', prompt: `Which category for "${pending.description}"?`, pending })
        return { status: 'awaiting_category' }
      },
    }),

    new FunctionTool({
      name: 'update_expense',
      description:
        'Propose an edit to an existing expense (target by id). Requires user confirmation — do not claim it is done.',
      parameters: z.object({
        id: z.string(),
        description: z.string().optional(),
        amount: z.number().optional(),
        categoryId: z.string().optional(),
        category: z.string().optional(),
        date: z.string().optional(),
        time: z.string().optional(),
        spenderId: z.string().optional(),
        spender: z.string().optional(),
        notes: z.string().optional(),
      }),
      execute: (input) => {
        const patch: Partial<Omit<Expense, 'id'>> = {}
        if (input.description !== undefined) patch.description = input.description.trim()
        if (input.amount !== undefined) patch.amount = input.amount
        if (input.categoryId !== undefined || input.category !== undefined)
          patch.categoryId = resolveCategoryId(snapshot, input.categoryId, input.category)
        if (input.date !== undefined) patch.date = input.date
        if (input.time !== undefined) patch.time = input.time
        if (input.spenderId !== undefined || input.spender !== undefined)
          patch.spenderId = resolveSpenderId(snapshot, input.spenderId, input.spender)
        if (input.notes !== undefined) patch.notes = input.notes.trim()
        pushAction({ type: 'update_expense', id: input.id, patch })
        return { status: 'pending_user_confirmation' }
      },
    }),

    new FunctionTool({
      name: 'delete_expense',
      description: 'Propose deleting an expense (target by id). Requires user confirmation — do not claim it is done.',
      parameters: z.object({ id: z.string() }),
      execute: (input) => {
        pushAction({ type: 'delete_expense', id: input.id })
        return { status: 'pending_user_confirmation' }
      },
    }),

    new FunctionTool({
      name: 'add_category',
      description: 'Create a new expense category. Applies immediately.',
      parameters: z.object({
        name: z.string(),
        color: z.string().optional().describe('Hex color, e.g. #6366f1'),
      }),
      execute: (input) => {
        const category: Category = {
          id: `cat-${crypto.randomUUID()}`,
          name: input.name.trim(),
          color: input.color || DEFAULT_COLOR,
        }
        pushAction({ type: 'add_category', category })
        return { status: 'added', category }
      },
    }),

    new FunctionTool({
      name: 'update_category',
      description: 'Propose renaming/recoloring a category (by id). Requires user confirmation.',
      parameters: z.object({ id: z.string(), name: z.string().optional(), color: z.string().optional() }),
      execute: (input) => {
        const patch: Partial<Omit<Category, 'id'>> = {}
        if (input.name !== undefined) patch.name = input.name.trim()
        if (input.color !== undefined) patch.color = input.color
        pushAction({ type: 'update_category', id: input.id, patch })
        return { status: 'pending_user_confirmation' }
      },
    }),

    new FunctionTool({
      name: 'delete_category',
      description: 'Propose deleting a category (by id). Requires user confirmation.',
      parameters: z.object({ id: z.string() }),
      execute: (input) => {
        pushAction({ type: 'delete_category', id: input.id })
        return { status: 'pending_user_confirmation' }
      },
    }),

    new FunctionTool({
      name: 'add_spender',
      description: 'Add a new spender/person. Applies immediately.',
      parameters: z.object({ name: z.string(), avatarColor: z.string().optional() }),
      execute: (input) => {
        const spender: Spender = {
          id: crypto.randomUUID(),
          name: input.name.trim(),
          avatarColor: input.avatarColor || DEFAULT_COLOR,
        }
        pushAction({ type: 'add_spender', spender })
        return { status: 'added', spender }
      },
    }),

    new FunctionTool({
      name: 'update_spender',
      description: 'Propose editing a spender (by id). Requires user confirmation.',
      parameters: z.object({ id: z.string(), name: z.string().optional(), avatarColor: z.string().optional() }),
      execute: (input) => {
        const patch: Partial<Omit<Spender, 'id'>> = {}
        if (input.name !== undefined) patch.name = input.name.trim()
        if (input.avatarColor !== undefined) patch.avatarColor = input.avatarColor
        pushAction({ type: 'update_spender', id: input.id, patch })
        return { status: 'pending_user_confirmation' }
      },
    }),

    new FunctionTool({
      name: 'delete_spender',
      description: 'Propose deleting a spender (by id). Requires user confirmation.',
      parameters: z.object({ id: z.string() }),
      execute: (input) => {
        pushAction({ type: 'delete_spender', id: input.id })
        return { status: 'pending_user_confirmation' }
      },
    }),

    new FunctionTool({
      name: 'set_budget',
      description: "Set the user's monthly budget limit in INR. Applies immediately.",
      parameters: z.object({ monthlyLimit: z.number().describe('Monthly limit in INR') }),
      execute: (input) => {
        pushAction({ type: 'set_budget', monthlyLimit: input.monthlyLimit })
        return { status: 'set', monthlyLimit: input.monthlyLimit }
      },
    }),

    new FunctionTool({
      name: 'show_spending_summary',
      description:
        'Render a compact spending-breakdown card in the chat, alongside your text answer. Use when presenting totals by category/spender/period.',
      parameters: z.object({
        title: z.string(),
        total: z.number(),
        breakdown: z.array(z.object({ label: z.string(), amount: z.number() })),
      }),
      execute: (input) => {
        emit({ type: 'card', card: { kind: 'spending_summary', ...input } })
        return { status: 'shown' }
      },
    }),

    new FunctionTool({
      name: 'request_more_data',
      description:
        'Request expenses outside the current-month window (for historical questions or editing older expenses). The app will re-run this turn with that data. Call this and stop; do not answer yet.',
      parameters: z.object({
        from: z.string().describe('Range start YYYY-MM-DD'),
        to: z.string().describe('Range end YYYY-MM-DD'),
      }),
      execute: (input) => {
        state.expansionRequested = true
        emit({ type: 'need_data', range: { from: input.from, to: input.to } })
        return { status: 'fetching' }
      },
    }),
  ]

  const context = [
    agentConfig.chatInstruction,
    '',
    `Current date: ${ymd(now)}`,
    `Data window in context: ${snapshot.range.from} .. ${snapshot.range.to}`,
    '',
    'DATA (JSON):',
    `categories: ${JSON.stringify(snapshot.categories)}`,
    `spenders: ${JSON.stringify(snapshot.spenders)}`,
    `budget: ${JSON.stringify(snapshot.budget)}`,
    `expenses_in_window: ${JSON.stringify(snapshot.expenses)}`,
  ].join('\n')

  const agent = new LlmAgent({
    name: 'expense_agent',
    model: agentConfig.model,
    instruction: context,
    tools,
  })

  return { agent, state }
}
