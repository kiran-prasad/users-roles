import { IconButton, Tooltip } from '@radix-ui/themes'
import { MoonIcon, SunIcon } from '@radix-ui/react-icons'
import type { Appearance } from '../hooks/useTheme'

interface Props {
  appearance: Appearance
  onToggle: () => void
}

// Canonical Radix Themes theme-toggle pattern: IconButton ghost gray + the
// official sun/moon icons from @radix-ui/react-icons + a Tooltip for the
// accessible label. Matches the same shape used on radix-ui.com itself.
export function ThemeToggle({ appearance, onToggle }: Props) {
  const isDark = appearance === 'dark'
  return (
    <Tooltip content={isDark ? 'Switch to light mode' : 'Switch to dark mode'}>
      <IconButton
        variant="ghost"
        color="gray"
        onClick={onToggle}
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {isDark ? <SunIcon /> : <MoonIcon />}
      </IconButton>
    </Tooltip>
  )
}
