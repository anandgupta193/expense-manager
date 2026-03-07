'use client'

import { useEffect } from 'react'

export function useAppShell() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {})
    }
  }, [])
}
