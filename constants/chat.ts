// Soft daily cap on chat messages (client-enforced; auth is the real guard).
export const DAILY_CHAT_LIMIT = 100

// Error messages for assistant timeouts and failures
export const ERROR_MESSAGES = {
  TIMEOUT: "The assistant isn't responding right now. You can still manage your expenses from the Dashboard.",
  NETWORK_ERROR: 'Request failed. You can still manage your expenses from the Dashboard.',
  EMPTY_RESPONSE: "The assistant didn't respond. You can still manage your expenses from the Dashboard.",
  GENERIC_ERROR: 'Something went wrong. You can still manage your expenses from the Dashboard.',
}

// Button labels for error recovery
export const ERROR_ACTIONS = {
  GO_TO_DASHBOARD: 'Go to Dashboard',
  TRY_AGAIN: 'Try again',
}
