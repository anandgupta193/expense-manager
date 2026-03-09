'use client'

import { Button, Typography, theme } from 'antd'
import { SyncOutlined, PieChartOutlined, TeamOutlined } from '@ant-design/icons'
import { useAuthContext } from '@/app/providers'

const FEATURES = [
  { icon: <SyncOutlined />, text: 'Sync across all your devices' },
  { icon: <PieChartOutlined />, text: 'Visual spending insights' },
  { icon: <TeamOutlined />, text: 'Track spending by person' },
]

function GoogleIcon() {
  return (
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
  )
}

export default function SignInPage() {
  const { loading, signInWithGoogle } = useAuthContext()
  const { token } = theme.useToken()

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: token.colorBgLayout }}
    >
      {/* Gradient mesh background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            radial-gradient(ellipse at 20% 45%, ${token.colorPrimary}18 0%, transparent 55%),
            radial-gradient(ellipse at 80% 15%, #818cf814 0%, transparent 50%),
            radial-gradient(ellipse at 55% 85%, ${token.colorWarning}0e 0%, transparent 50%)
          `,
        }}
      />

      {/* Subtle dot grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle, ${token.colorBorderSecondary} 1px, transparent 1px)`,
          backgroundSize: '28px 28px',
          opacity: 0.6,
        }}
      />

      {/* Card */}
      <div
        className="w-full max-w-sm relative z-10 scale-in"
        style={{
          background: token.colorBgContainer,
          border: `1px solid ${token.colorBorderSecondary}`,
          borderRadius: 20,
          boxShadow: `0 32px 80px rgba(0,0,0,0.12), 0 0 0 1px ${token.colorBorderSecondary}`,
          overflow: 'hidden',
        }}
      >
        {/* Top accent strip */}
        <div
          style={{
            height: 4,
            background: `linear-gradient(90deg, ${token.colorPrimary}, #818cf8, ${token.colorWarning})`,
          }}
        />

        <div className="p-8">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-2xl"
              style={{
                background: `linear-gradient(135deg, ${token.colorPrimary} 0%, #818cf8 100%)`,
                boxShadow: `0 12px 32px ${token.colorPrimary}45`,
                letterSpacing: '-1px',
              }}
            >
              ₹
            </div>
          </div>

          {/* Heading */}
          <div className="text-center mb-7">
            <Typography.Title level={3} style={{ marginBottom: 6, fontWeight: 700, fontSize: 22 }}>
              Expense Manager
            </Typography.Title>
            <Typography.Text type="secondary" style={{ fontSize: 14, lineHeight: 1.5 }}>
              Track, sync, and understand your spending
            </Typography.Text>
          </div>

          {/* Feature list */}
          <div
            className="rounded-xl p-4 mb-7 space-y-3"
            style={{ background: token.colorFillAlter, border: `1px solid ${token.colorBorderSecondary}` }}
          >
            {FEATURES.map((f, i) => (
              <div key={i} className="flex items-center gap-3">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: `${token.colorPrimary}18`, color: token.colorPrimary, fontSize: 13 }}
                >
                  {f.icon}
                </div>
                <Typography.Text style={{ fontSize: 13 }}>{f.text}</Typography.Text>
              </div>
            ))}
          </div>

          {/* CTA */}
          <Button
            type="primary"
            size="large"
            loading={loading}
            onClick={signInWithGoogle}
            className="w-full"
            icon={<GoogleIcon />}
            style={{
              height: 46,
              borderRadius: 10,
              fontWeight: 600,
              fontSize: 14,
              boxShadow: `0 4px 14px ${token.colorPrimary}40`,
            }}
          >
            Continue with Google
          </Button>

          <Typography.Text type="secondary" className="block text-center mt-4" style={{ fontSize: 11 }}>
            Your data is private and only accessible to you
          </Typography.Text>
        </div>
      </div>
    </div>
  )
}
