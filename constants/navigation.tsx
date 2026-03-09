import { DashboardOutlined, TagsOutlined, TeamOutlined, SettingOutlined } from '@ant-design/icons'

export const NAV_ITEMS = [
  { href: '/', label: 'Dashboard', icon: <DashboardOutlined /> },
  { href: '/spenders', label: 'Spenders', icon: <TeamOutlined /> },
  { href: '/categories', label: 'Categories', icon: <TagsOutlined /> },
  { href: '/settings', label: 'Settings', icon: <SettingOutlined /> },
]
