import ReminderSettings from '@/components/ReminderSettings'
import BudgetSettings from '@/components/BudgetSettings'

export default function SettingsPage() {
  return (
    <div className="max-w-lg mx-auto">
      <h1 className="hidden sm:block text-2xl font-bold mb-6">Settings</h1>
      <div className="space-y-4">
        <BudgetSettings />
        <ReminderSettings />
      </div>
    </div>
  )
}
