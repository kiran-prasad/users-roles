import { useCallback, useRef } from 'react'

/**
 * Saves the focused element when a dialog opens; restores it on close. If the
 * original trigger no longer exists (e.g. the row was just optimistically
 * deleted), falls back to a stable anchor passed by the caller.
 */
export function useFocusRestore() {
  const previousRef = useRef<HTMLElement | null>(null)

  const save = useCallback(() => {
    const el = document.activeElement
    previousRef.current = el instanceof HTMLElement ? el : null
  }, [])

  const restore = useCallback((fallback?: HTMLElement | null) => {
    const prev = previousRef.current
    if (prev && document.body.contains(prev)) {
      prev.focus()
      return
    }
    if (fallback && document.body.contains(fallback)) {
      fallback.focus()
      return
    }
    // Last resort: focus the first focusable element in the main region so the
    // user isn't dumped to <body>.
    const main = document.querySelector<HTMLElement>('main, [role="main"]')
    main?.focus?.()
  }, [])

  return { save, restore }
}
