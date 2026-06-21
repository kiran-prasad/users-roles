import { useEffect, useState } from 'react'

export type Appearance = 'light' | 'dark'
type Preference = Appearance | 'system'

const STORAGE_KEY = 'theme-preference'

function readPreference(): Preference {
  if (typeof window === 'undefined') return 'system'
  const stored = window.localStorage.getItem(STORAGE_KEY)
  if (stored === 'light' || stored === 'dark' || stored === 'system') return stored
  return 'system'
}

function systemAppearance(): Appearance {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function useTheme() {
  const [preference, setPreferenceState] = useState<Preference>(readPreference)
  const [system, setSystem] = useState<Appearance>(systemAppearance)

  // Track the OS appearance so 'system' preference stays live.
  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (e: MediaQueryListEvent) => setSystem(e.matches ? 'dark' : 'light')
    media.addEventListener('change', handler)
    return () => media.removeEventListener('change', handler)
  }, [])

  const setPreference = (next: Preference) => {
    window.localStorage.setItem(STORAGE_KEY, next)
    setPreferenceState(next)
  }

  const appearance: Appearance = preference === 'system' ? system : preference

  return {
    appearance,
    preference,
    setPreference,
    toggle: () => setPreference(appearance === 'dark' ? 'light' : 'dark'),
  }
}
