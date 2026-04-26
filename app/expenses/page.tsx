import { Suspense } from 'react'
import ExpenseTable from '@/components/ExpenseTable'

export default function ExpensesPage() {
  return (
    <Suspense>
      <ExpenseTable />
    </Suspense>
  )
}
