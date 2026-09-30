import type { ChatSnapshot } from '@/lib/types'

export function matchCategoryId(snapshot: ChatSnapshot, categoryId?: string, name?: string): string | null {
  if (categoryId && snapshot.categories.some((c) => c.id === categoryId)) return categoryId
  if (name) {
    const match = snapshot.categories.find((c) => c.name.toLowerCase() === name.toLowerCase().trim())
    if (match) return match.id
  }
  return null
}

export function resolveCategoryId(snapshot: ChatSnapshot, categoryId?: string, name?: string): string {
  const DEFAULT_CATEGORY_ID = 'cat-other'
  return matchCategoryId(snapshot, categoryId, name) ?? DEFAULT_CATEGORY_ID
}

export function resolveSpenderId(snapshot: ChatSnapshot, spenderId?: string, name?: string): string | undefined {
  if (spenderId && snapshot.spenders.some((s) => s.id === spenderId)) return spenderId
  if (name) {
    const match = snapshot.spenders.find((s) => s.name.toLowerCase() === name.toLowerCase().trim())
    if (match) return match.id
  }
  return undefined
}

export function hhmm(d: Date): string {
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

export function ymd(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
