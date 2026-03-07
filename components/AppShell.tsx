'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button, theme } from 'antd'
import {
  DashboardOutlined,
  PlusCircleOutlined,
  TagsOutlined,
  TeamOutlined,
  SettingOutlined,
  SunOutlined,
  MoonOutlined,
} from '@ant-design/icons'
import { useTheme } from '@/app/providers'
import { useReminder } from '@/lib/useReminder'

const NAV_ITEMS = [
  { href: '/', label: 'Dashboard', icon: <DashboardOutlined /> },
  { href: '/add', label: 'Add Expense', icon: <PlusCircleOutlined /> },
  { href: '/spenders', label: 'Spenders', icon: <TeamOutlined /> },
  { href: '/categories', label: 'Categories', icon: <TagsOutlined /> },
  { href: '/settings', label: 'Settings', icon: <SettingOutlined /> },
]

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { theme: appTheme, toggleTheme } = useTheme()
  const { token } = theme.useToken()
  useReminder()

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {})
    }
  }, [])

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

          {/* Theme toggle */}
          <Button
            type="text"
            shape="circle"
            icon={appTheme === 'dark' ? <SunOutlined /> : <MoonOutlined />}
            onClick={toggleTheme}
            title={appTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          />
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
