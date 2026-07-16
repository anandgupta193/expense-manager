import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // ADK and its Google GenAI deps are server-only and pull in native modules
  // (sqlite3, etc.) — keep them external so Next doesn't try to bundle them.
  serverExternalPackages: ['@google/adk', '@google/genai'],
  // Chat moved to the root; keep old links working with a real redirect.
  async redirects() {
    return [{ source: '/chat', destination: '/', permanent: false }]
  },
}

export default nextConfig
