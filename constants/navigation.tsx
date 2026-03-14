import { DashboardOutlined, TagsOutlined, UnorderedListOutlined, SettingOutlined } from '@ant-design/icons'

export const NAV_ITEMS = [
  { href: '/', label: 'Dashboard', icon: <DashboardOutlined /> },
  { href: '/expenses', label: 'Expenses', icon: <UnorderedListOutlined /> },
  { href: '/categories', label: 'Categories', icon: <TagsOutlined /> },
  { href: '/settings', label: 'Settings', icon: <SettingOutlined /> },
]
