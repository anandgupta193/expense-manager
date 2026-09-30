import agentConfig from '@/config/agent.json'
import type { ChatSnapshot } from '@/lib/types'
import { ymd } from './toolHelpers'

export const APP_NAME = 'expense-manager'

export function buildPrompt(snapshot: ChatSnapshot, now: Date): string {
  return [
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
}
