// Quick-action chips shown in the chat. Tapping one sends `prompt` as a user
// message, so it flows through the agent like anything the user types.
export interface QuickAction {
  label: string
  prompt: string
}

export const QUICK_ACTIONS: QuickAction[] = [
  { label: 'Last added expense', prompt: 'What was my last added expense?' },
  { label: "This month's status", prompt: 'Give me a summary of my spending this month.' },
  { label: 'Budget left', prompt: 'How much of my monthly budget is left?' },
  { label: 'Top category', prompt: 'Which category did I spend the most on this month?' },
]
