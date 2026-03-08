'use client'

import { useState, useEffect, useCallback } from 'react'
import type { User } from 'firebase/auth'
import {
  fsGetExpenses,
  fsSetExpenses,
  fsGetCategories,
  fsSetCategories,
  fsGetSpenders,
  fsSetSpenders,
  fsSeedDefaultCategories,
  fsSeedDefaultSpender,
} from '@/lib/firestore'
import type { Expense, Category, Spender } from '@/lib/types'
import { DEFAULT_CATEGORIES } from '@/lib/defaultData'

export interface DataState {
  expenses: Expense[]
  categories: Category[]
  spenders: Spender[]
  dataLoading: boolean
  setExpenses: (expenses: Expense[]) => void
  setCategories: (categories: Category[]) => void
  setSpenders: (spenders: Spender[]) => void
}

export function useDataContext(user: User): DataState {
  const uid = user.uid
  const [expenses, setExpensesState] = useState<Expense[]>([])
  const [categories, setCategoriesState] = useState<Category[]>([])
  const [spenders, setSpendersState] = useState<Spender[]>([])
  const [dataLoading, setDataLoading] = useState(true)

  useEffect(() => {
    Promise.all([fsGetExpenses(uid), fsGetCategories(uid), fsGetSpenders(uid)])
      .then(([fsExpenses, fsCategories, fsSpenders]) => {
        if (fsCategories.length === 0) {
          fsSeedDefaultCategories(uid).catch(console.error)
          setCategoriesState(DEFAULT_CATEGORIES)
        } else {
          setCategoriesState(fsCategories)
        }
        setExpensesState(fsExpenses)
        if (fsSpenders.length === 0) {
          const defaultSpender: Spender = {
            id: user.uid,
            name: user.displayName ?? user.email ?? 'Me',
            avatarColor: '#6366f1',
          }
          fsSeedDefaultSpender(uid, defaultSpender).catch(console.error)
          setSpendersState([defaultSpender])
        } else {
          setSpendersState(fsSpenders)
        }
        setDataLoading(false)
      })
      .catch(console.error)
  }, [uid])

  const setExpenses = useCallback(
    (next: Expense[]) => {
      setExpensesState(next)
      fsSetExpenses(uid, next).catch(console.error)
    },
    [uid]
  )

  const setCategories = useCallback(
    (next: Category[]) => {
      setCategoriesState(next)
      fsSetCategories(uid, next).catch(console.error)
    },
    [uid]
  )

  const setSpenders = useCallback(
    (next: Spender[]) => {
      setSpendersState(next)
      fsSetSpenders(uid, next).catch(console.error)
    },
    [uid]
  )

  return { expenses, categories, spenders, dataLoading, setExpenses, setCategories, setSpenders }
}
