const KEY = 'em-analyse-quota'

function getQuota(): { date: string; count: number } {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : { date: '', count: 0 }
  } catch {
    return { date: '', count: 0 }
  }
}

export function consumeAnalyse(limit: number): boolean {
  const today = new Date().toISOString().slice(0, 10)
  const q = getQuota()
  const count = q.date === today ? q.count : 0
  if (count >= limit) return false
  localStorage.setItem(KEY, JSON.stringify({ date: today, count: count + 1 }))
  return true
}
