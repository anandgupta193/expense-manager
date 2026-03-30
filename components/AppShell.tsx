'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Avatar, Button, Dropdown, Spin, theme } from 'antd'
import { SunOutlined, MoonOutlined, LogoutOutlined, UserOutlined, ReloadOutlined } from '@ant-design/icons'
import type { User } from 'firebase/auth'
import { useTheme, useAuthContext, DataProvider, BudgetProvider, useAppData } from '@/app/providers'
import { useReminder } from '@/lib/useReminder'
import { NAV_ITEMS } from '@/constants/navigation'
import { useAppShell } from '@/hooks/useAppShell'
import SignInPage from '@/components/SignInPage'

// ── Authenticated shell (mounts after DataProvider) ───────────────────────────

function AuthenticatedShell({
  user,
  signOut,
  children,
}: {
  user: User
  signOut: () => Promise<void>
  children: React.ReactNode
}) {
  const { token } = theme.useToken()
  const { theme: appTheme, toggleTheme } = useTheme()
  const { dataLoading, refreshData } = useAppData()
  const pathname = usePathname()
  const [refreshing, setRefreshing] = useState(false)

  const handleRefresh = async () => {
    setRefreshing(true)
    await refreshData()
    setRefreshing(false)
  }
  useReminder()
  useAppShell()

  if (dataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: token.colorBgLayout }}>
        <Spin size="large" />
      </div>
    )
  }

  const userMenuItems = [
    {
      key: 'signout',
      icon: <LogoutOutlined />,
      label: 'Sign out',
      onClick: async () => {
        await signOut()
      },
    },
  ]

  return (
    <div style={{ minHeight: '100vh', background: token.colorBgLayout }} className="flex flex-col">
      {/* Top navigation bar */}
      <header
        style={{
          background: token.colorBgContainer,
          borderBottom: `1px solid ${token.colorBorderSecondary}`,
          boxShadow: '0 1px 12px rgba(0,0,0,0.05)',
        }}
        className="sticky top-0 z-50"
      >
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between relative">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 no-underline">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-base"
              style={{
                background: `linear-gradient(135deg, ${token.colorPrimary} 0%, #818cf8 100%)`,
                boxShadow: `0 3px 10px ${token.colorPrimary}45`,
                letterSpacing: '-0.5px',
              }}
            >
              ₹
            </div>
            <span
              style={{ color: token.colorText, fontWeight: 700, letterSpacing: '-0.01em' }}
              className="text-base hidden sm:block"
            >
              Expense Manager
            </span>
          </Link>

          {/* Mobile: current page title centered */}
          {(() => {
            const pageLabel = NAV_ITEMS.find((item) => item.href === pathname)?.label ?? 'Dashboard'
            return (
              <div className="md:hidden absolute left-0 right-0 flex justify-center pointer-events-none">
                <span style={{ color: token.colorText, fontWeight: 700, fontSize: 16 }}>{pageLabel}</span>
              </div>
            )
          })()}

          {/* Desktop nav links */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map((item) => {
              const active = pathname === item.href
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    type="text"
                    icon={item.icon}
                    className="flex items-center"
                    style={{
                      color: active ? token.colorPrimary : token.colorTextSecondary,
                      background: active ? `${token.colorPrimary}12` : 'transparent',
                      fontWeight: active ? 600 : 400,
                      borderRadius: 8,
                    }}
                  >
                    {item.label}
                  </Button>
                </Link>
              )
            })}
          </nav>

          {/* Right side: theme toggle + auth */}
          <div className="flex items-center gap-2">
            <Button
              type="text"
              shape="circle"
              icon={<ReloadOutlined spin={refreshing} />}
              onClick={handleRefresh}
              disabled={refreshing}
              title="Refresh data"
              style={{ color: token.colorTextSecondary }}
            />
            <Button
              type="text"
              shape="circle"
              icon={appTheme === 'dark' ? <SunOutlined /> : <MoonOutlined />}
              onClick={toggleTheme}
              title={appTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              style={{ color: token.colorTextSecondary }}
            />

            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" trigger={['click']}>
              <Avatar
                src={user.photoURL}
                icon={!user.photoURL ? <UserOutlined /> : undefined}
                style={{
                  cursor: 'pointer',
                  border: `2px solid ${token.colorPrimary}`,
                  boxShadow: `0 0 0 2px ${token.colorPrimary}20`,
                }}
                size={34}
              />
            </Dropdown>
          </div>
        </div>
      </header>

      {/* Page content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8 pb-24 md:pb-8">{children}</main>

      {/* Mobile bottom navigation */}
      <nav
        style={{
          background: token.colorBgContainer,
          borderTop: `1px solid ${token.colorBorderSecondary}`,
          boxShadow: '0 -2px 16px rgba(0,0,0,0.06)',
        }}
        className="md:hidden fixed bottom-0 left-0 right-0 flex z-50"
      >
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href
          return (
            <Link key={item.href} href={item.href} className="flex-1">
              <div
                className="flex flex-col items-center py-2.5 gap-1 relative"
                style={{
                  color: active ? token.colorPrimary : token.colorTextSecondary,
                }}
              >
                {/* Active indicator bar */}
                {active && (
                  <span
                    className="absolute top-0 rounded-b-full"
                    style={{
                      background: token.colorPrimary,
                      width: 24,
                      height: 2.5,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      boxShadow: `0 2px 8px ${token.colorPrimary}60`,
                    }}
                  />
                )}
                <span
                  className="text-xl"
                  style={{
                    transform: active ? 'scale(1.1)' : 'scale(1)',
                    transition: 'transform 0.15s ease',
                    display: 'block',
                  }}
                >
                  {item.icon}
                </span>
                <span className="text-xs" style={{ fontWeight: active ? 600 : 400 }}>
                  {item.label}
                </span>
              </div>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}

// ── AppShell — auth guard + data provider ─────────────────────────────────────

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { token } = theme.useToken()
  const { user, loading, signOut } = useAuthContext()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: token.colorBgLayout }}>
        <Spin size="large" />
      </div>
    )
  }

  if (!user) {
    return <SignInPage />
  }

  return (
    <DataProvider user={user}>
      <BudgetProvider user={user}>
        <AuthenticatedShell user={user} signOut={signOut}>
          {children}
        </AuthenticatedShell>
      </BudgetProvider>
    </DataProvider>
  )
}
