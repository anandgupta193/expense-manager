import type { Rule } from 'antd/es/form'

export function requiredRule(message: string): Rule {
  return { required: true, message }
}

export function minAmountRule(): Rule {
  return { type: 'number', min: 0.01, message: 'Must be greater than 0' }
}

export function uniqueNameRule(existingNames: string[], fieldLabel: string): Rule {
  return {
    validator: (_: unknown, value: string) => {
      if (value && existingNames.some((n) => n.toLowerCase() === value.trim().toLowerCase())) {
        return Promise.reject(`A ${fieldLabel} with this name already exists`)
      }
      return Promise.resolve()
    },
  }
}
