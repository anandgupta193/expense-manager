import type { ReminderConfig, Theme } from './types'
import reminderJson from '../config/reminder.json'

const KEYS = {
  theme: 'em-theme',
} as const

function get<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = localStorage.getItem(key)
    return raw !== null ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function set(key: string, value: unknown): void {
  localStorage.setItem(key, JSON.stringify(value))
}

export const storage = {
  getTheme: (): Theme => get<Theme>(KEYS.theme, 'light'),
  setTheme: (theme: Theme): void => set(KEYS.theme, theme),

  getReminder: (): ReminderConfig => get<ReminderConfig>('em-reminder', reminderJson as ReminderConfig),
  setReminder: (r: ReminderConfig): void => set('em-reminder', r),
}
