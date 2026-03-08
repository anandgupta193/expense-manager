'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Avatar, Button, Dropdown, Spin, theme } from 'antd'
import { SunOutlined, MoonOutlined, LogoutOutlined, UserOutlined } from '@ant-design/icons'
import type { User } from 'firebase/auth'
import { useTheme, useAuthContext, DataProvider, useAppData } from '@/app/providers'
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
  const { dataLoading } = useAppData()
  const pathname = usePathname()
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
        }}
        className="sticky top-0 z-50"
      >
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 no-underline">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-base"
              style={{ background: token.colorPrimary }}
            >
              ₹
            </div>
            <span style={{ color: token.colorText }} className="font-bold text-base hidden sm:block">
              Expense Manager
            </span>
          </Link>

          {/* Desktop nav links */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button
                  type={pathname === item.href ? 'primary' : 'text'}
                  icon={item.icon}
                  className="flex items-center"
                >
                  {item.label}
                </Button>
              </Link>
            ))}
          </nav>

          {/* Right side: theme toggle + auth */}
          <div className="flex items-center gap-2">
            <Button
              type="text"
              shape="circle"
              icon={appTheme === 'dark' ? <SunOutlined /> : <MoonOutlined />}
              onClick={toggleTheme}
              title={appTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            />

            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" trigger={['click']}>
              <Avatar
                src={user.photoURL}
                icon={!user.photoURL ? <UserOutlined /> : undefined}
                style={{ cursor: 'pointer', border: `2px solid ${token.colorPrimary}` }}
                size={36}
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
        }}
        className="md:hidden fixed bottom-0 left-0 right-0 flex z-50"
      >
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href
          return (
            <Link key={item.href} href={item.href} className="flex-1">
              <div
                className="flex flex-col items-center py-3 gap-1"
                style={{
                  color: active ? token.colorPrimary : token.colorTextSecondary,
                }}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="text-xs font-medium">{item.label}</span>
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
      <AuthenticatedShell user={user} signOut={signOut}>
        {children}
      </AuthenticatedShell>
    </DataProvider>
  )
}
