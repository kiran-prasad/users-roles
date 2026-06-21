import { useEffect, useRef } from 'react'

interface Handlers {
  onSlash?: () => void
  onEscape?: () => void
  onGoToUsers?: () => void
  onGoToRoles?: () => void
}

const GO_TIMEOUT = 700

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  const tag = target.tagName
  return (
    tag === 'INPUT' ||
    tag === 'TEXTAREA' ||
    tag === 'SELECT' ||
    target.isContentEditable
  )
}

export function useKeyboardShortcuts(handlers: Handlers) {
  // Callers pass a fresh handlers object every render; stash it in a ref so
  // we can bind the document listener once for the app's lifetime.
  const handlersRef = useRef(handlers)
  handlersRef.current = handlers

  useEffect(() => {
    let goPending = false
    let goTimer: ReturnType<typeof setTimeout> | null = null

    const clearGo = () => {
      goPending = false
      if (goTimer) {
        clearTimeout(goTimer)
        goTimer = null
      }
    }

    const onKeyDown = (e: KeyboardEvent) => {
      const h = handlersRef.current
      // Don't fire any global shortcut while typing in an input field, except
      // for Esc-clear which we handle on the input itself.
      const inEditable = isEditableTarget(e.target)

      if (e.key === '/' && !inEditable && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault()
        h.onSlash?.()
        clearGo()
        return
      }

      if (e.key === 'Escape') {
        h.onEscape?.()
        clearGo()
        return
      }

      if (inEditable) return

      if (e.key === 'g') {
        goPending = true
        if (goTimer) clearTimeout(goTimer)
        goTimer = setTimeout(clearGo, GO_TIMEOUT)
        return
      }

      if (goPending && e.key === 'u') {
        e.preventDefault()
        h.onGoToUsers?.()
        clearGo()
        return
      }

      if (goPending && e.key === 'r') {
        e.preventDefault()
        h.onGoToRoles?.()
        clearGo()
        return
      }

      if (goPending) clearGo()
    }

    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      if (goTimer) clearTimeout(goTimer)
    }
  }, [])
}
