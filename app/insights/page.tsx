import { Suspense } from 'react'
import InsightsPage from '@/components/InsightsPage'

export default function Page() {
  return (
    <Suspense>
      <InsightsPage />
    </Suspense>
  )
}
