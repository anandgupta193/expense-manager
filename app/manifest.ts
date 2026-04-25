import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Expense Manager',
    short_name: 'Expenses',
    description: 'Track and manage your daily expenses',
    start_url: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#f9fafb',
    theme_color: '#6366f1',
    icons: [
      {
        src: '/icons/icon-192.svg',
        sizes: '192x192',
        type: 'image/svg+xml',
        purpose: 'maskable',
      },
      {
        src: '/icons/icon-512.svg',
        sizes: '512x512',
        type: 'image/svg+xml',
        purpose: 'any',
      },
    ],
    shortcuts: [
      {
        name: 'Add Expense',
        short_name: 'Add',
        url: '/?action=add',
        icons: [{ src: '/icons/icon-192.svg', sizes: '192x192', type: 'image/svg+xml' }],
      },
    ],
  }
}
