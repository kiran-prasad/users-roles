import { createContext, useContext, type ReactNode } from 'react'
import type { Appearance } from '../hooks/useTheme'

interface ThemeToggleValue {
  appearance: Appearance
  toggle: () => void
}

const ThemeToggleContext = createContext<ThemeToggleValue | null>(null)

export function ThemeToggleProvider({
  value,
  children,
}: {
  value: ThemeToggleValue
  children: ReactNode
}) {
  return <ThemeToggleContext.Provider value={value}>{children}</ThemeToggleContext.Provider>
}

export function useThemeToggle(): ThemeToggleValue {
  const ctx = useContext(ThemeToggleContext)
  if (!ctx) throw new Error('useThemeToggle must be used within ThemeToggleProvider')
  return ctx
}
