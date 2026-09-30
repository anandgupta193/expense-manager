import { LlmAgent } from '@google/adk'
import agentConfig from '@/config/agent.json'
import { buildTools, type ToolContext } from './tools'
import { buildPrompt } from './prompt'
import type { AgentAction, ChatSnapshot, ChatStreamEvent } from '@/lib/types'

export interface AgentBuildOptions {
  snapshot: ChatSnapshot
  now: Date
  emit: (event: ChatStreamEvent) => void
}

export interface AgentState {
  expansionRequested: boolean
}

export function buildExpenseAgent({ snapshot, now, emit }: AgentBuildOptions): {
  agent: LlmAgent
  state: AgentState
} {
  const state: AgentState = { expansionRequested: false }

  const pushAction = (action: AgentAction) => emit({ type: 'action', action })

  const toolContext: ToolContext = {
    snapshot,
    now,
    emit,
    pushAction,
    setExpansionRequested: (v: boolean) => {
      state.expansionRequested = v
    },
  }

  const tools = buildTools(toolContext)
  const instruction = buildPrompt(snapshot, now)

  const agent = new LlmAgent({
    name: 'expense_agent',
    model: agentConfig.model,
    instruction,
    tools,
  })

  return { agent, state }
}
