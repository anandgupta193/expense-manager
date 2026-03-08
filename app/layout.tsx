import type { Metadata } from 'next'
import { Outfit } from 'next/font/google'
import { Providers } from './providers'
import AppShell from '@/components/AppShell'
import './globals.css'

// Variable name must match PRIMARY_FONT_CSS_VAR in config/fonts.ts
const outfit = Outfit({
  variable: '--font-primary',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Expense Manager',
  description: 'Track and manage your daily expenses',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Expense Manager',
  },
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${outfit.variable} antialiased`}>
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  )
}
