'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { App, ConfigProvider, theme as antTheme } from 'antd'
import { storage } from '@/lib/storage'
import type { Theme } from '@/lib/types'
import { FONT_FAMILY_CSS_VAR } from '@/config/fonts'
import { useAuth, type AuthState } from '@/hooks/useAuth'
import { useDataContext, type DataState } from '@/hooks/useDataContext'

// ── Theme context ─────────────────────────────────────────────────────────────

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  toggleTheme: () => {},
})

export const useTheme = () => useContext(ThemeContext)

// ── Auth context ──────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthState>({
  user: null,
  loading: true,
  signInWithGoogle: async () => {},
  signOut: async () => {},
})

export const useAuthContext = () => useContext(AuthContext)

// ── Inner provider (has access to AuthContext for theme sync) ─────────────────

function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light')

  useEffect(() => {
    const saved = storage.getTheme()
    setTheme(saved)
    document.documentElement.classList.toggle('dark', saved === 'dark')
  }, [])

  useEffect(() => {
    storage.setTheme(theme)
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  const toggleTheme = () => setTheme((t) => (t === 'light' ? 'dark' : 'light'))

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <ConfigProvider
        theme={{
          algorithm: theme === 'dark' ? antTheme.darkAlgorithm : antTheme.defaultAlgorithm,
          token: {
            colorPrimary: '#6366f1',
            borderRadius: 8,
            fontFamily: `var(${FONT_FAMILY_CSS_VAR})`,
          },
        }}
      >
        <App>{children}</App>
      </ConfigProvider>
    </ThemeContext.Provider>
  )
}

// ── Data context ──────────────────────────────────────────────────────────────

const DataContext = createContext<DataState>({
  expenses: [],
  categories: [],
  spenders: [],
  dataLoading: true,
  setExpenses: () => {},
  setCategories: () => {},
  setSpenders: () => {},
})

export const useAppData = () => useContext(DataContext)

export function DataProvider({ user, children }: { user: import('firebase/auth').User; children: React.ReactNode }) {
  const data = useDataContext(user)
  return <DataContext.Provider value={data}>{children}</DataContext.Provider>
}

// ── Root provider ─────────────────────────────────────────────────────────────

function AuthProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuth()
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ThemeProvider>{children}</ThemeProvider>
    </AuthProvider>
  )
}
