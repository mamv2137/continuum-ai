'use client'

import PhoneInputWithCountry from 'react-phone-number-input'
import 'react-phone-number-input/style.css'
import { cn } from '@/lib/utils'

export interface PhoneInputProps {
  value: string | undefined
  onChange: (value: string | undefined) => void
  error?: boolean
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function PhoneInput({
  value,
  onChange,
  error,
  placeholder,
  disabled,
  className,
}: PhoneInputProps) {
  return (
    <PhoneInputWithCountry
      international
      defaultCountry="MX"
      countryCallingCodeEditable={false}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      className={cn(
        'phone-input-container',
        error && 'phone-input-error',
        className
      )}
      numberInputProps={{
        className: cn(
          'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background',
          'file:border-0 file:bg-transparent file:text-sm file:font-medium',
          'placeholder:text-muted-foreground',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-50',
          error && 'border-destructive focus-visible:ring-destructive'
        ),
      }}
    />
  )
}
