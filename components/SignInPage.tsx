'use client'

import { Button, Card, theme, Typography } from 'antd'
import { useAuthContext } from '@/app/providers'

export default function SignInPage() {
  const { loading, signInWithGoogle } = useAuthContext()
  const { token } = theme.useToken()

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: token.colorBgLayout }}>
      <Card className="w-full max-w-sm text-center" style={{ borderColor: token.colorBorderSecondary }}>
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-xl mx-auto mb-4"
          style={{ background: token.colorPrimary }}
        >
          ₹
        </div>
        <Typography.Title level={3} style={{ marginBottom: 4 }}>
          Expense Manager
        </Typography.Title>
        <Typography.Text type="secondary" className="block mb-8">
          Sign in to sync your expenses across devices
        </Typography.Text>

        <Button
          type="primary"
          size="large"
          loading={loading}
          onClick={signInWithGoogle}
          className="w-full"
          icon={
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908C16.658 14.195 17.64 11.87 17.64 9.2z"
                fill="#fff"
              />
              <path
                d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"
                fill="#fff"
              />
              <path
                d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
                fill="#fff"
              />
              <path
                d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
                fill="#fff"
              />
            </svg>
          }
        >
          Sign in with Google
        </Button>

        <Typography.Text type="secondary" className="block mt-6 text-xs">
          Your data is private and only accessible to you
        </Typography.Text>
      </Card>
    </div>
  )
}
