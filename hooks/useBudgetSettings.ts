'use client'

import { useState } from 'react'
import { storage } from '@/lib/storage'
import type { BudgetConfig } from '@/lib/types'

export function useBudgetSettings() {
  const [config, setConfig] = useState<BudgetConfig>(() => storage.getBudget())

  function handleLimitChange(value: number | null) {
    const next: BudgetConfig = { monthlyLimit: value ?? null }
    setConfig(next)
    storage.setBudget(next)
  }

  return { config, handleLimitChange }
}
