import type { Category, Expense, Spender } from '@/lib/types'

export function exportExpensesToCSV(
  expenses: Expense[],
  catMap: Record<string, Category>,
  spenderMap: Record<string, Spender>,
  filename: string
): void {
  const header = ['Date', 'Description', 'Category', 'Spent By', 'Amount (INR)', 'Notes']
  const rows = expenses.map((e) => [
    e.date,
    e.description,
    catMap[e.categoryId]?.name ?? '',
    e.spenderId ? (spenderMap[e.spenderId]?.name ?? '') : '',
    e.amount.toFixed(2),
    e.notes ?? '',
  ])
  const csv = [header, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n')

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
