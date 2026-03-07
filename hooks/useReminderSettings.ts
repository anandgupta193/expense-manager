'use client'

import { useState } from 'react'
import { message } from 'antd'
import dayjs from 'dayjs'
import { storage } from '@/lib/storage'
import type { ReminderConfig } from '@/lib/types'

export function useReminderSettings() {
  const [config, setConfig] = useState<ReminderConfig>(() => storage.getReminder())

  async function handleToggle(checked: boolean) {
    if (checked) {
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        message.warning('Notification permission denied. Enable it in browser settings.')
        return
      }
    }
    const next = { ...config, enabled: checked }
    setConfig(next)
    storage.setReminder(next)
  }

  function handleTimeChange(value: dayjs.Dayjs | null) {
    if (!value) return
    const next = { ...config, time: value.format('HH:mm') }
    setConfig(next)
    storage.setReminder(next)
  }

  return { config, handleToggle, handleTimeChange }
}
