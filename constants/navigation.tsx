import { DashboardOutlined, PlusCircleOutlined, TagsOutlined, TeamOutlined, SettingOutlined } from '@ant-design/icons'

export const NAV_ITEMS = [
  { href: '/', label: 'Dashboard', icon: <DashboardOutlined /> },
  { href: '/add', label: 'Add Expense', icon: <PlusCircleOutlined /> },
  { href: '/spenders', label: 'Spenders', icon: <TeamOutlined /> },
  { href: '/categories', label: 'Categories', icon: <TagsOutlined /> },
  { href: '/settings', label: 'Settings', icon: <SettingOutlined /> },
]
