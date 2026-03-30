'use client'

import { useBudgetContext } from '@/app/providers'

export function useBudgetSettings() {
  const { budget: config, setBudget } = useBudgetContext()

  function handleLimitChange(value: number | null) {
    setBudget({ monthlyLimit: value ?? null })
  }

  return { config, handleLimitChange }
}
