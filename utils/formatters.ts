import type { Color } from 'antd/es/color-picker'

export function formatINR(amount: number): string {
  return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function resolveColor(color: Color | string): string {
  if (typeof color === 'string') return color
  return color.toHexString()
}
