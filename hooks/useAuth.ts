'use client'

import { useEffect, useState } from 'react'
import { onAuthStateChanged, signInWithPopup, signOut as firebaseSignOut, type User } from 'firebase/auth'
import { getFirebaseAuth, googleProvider } from '@/lib/firebase'

export interface AuthState {
  user: User | null
  loading: boolean
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
}

export function useAuth(): AuthState {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(getFirebaseAuth(), (firebaseUser) => {
      setUser(firebaseUser)
      setLoading(false)
    })
    return unsubscribe
  }, [])

  async function signInWithGoogle() {
    setLoading(true)
    try {
      await signInWithPopup(getFirebaseAuth(), googleProvider)
      // onAuthStateChanged will handle the rest
    } catch {
      setLoading(false)
    }
  }

  async function signOut() {
    await firebaseSignOut(getFirebaseAuth())
  }

  return { user, loading, signInWithGoogle, signOut }
}
