import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import * as Toast from '@radix-ui/react-toast'
import { Button, Flex, Text } from '@radix-ui/themes'
import { CheckCircledIcon, CrossCircledIcon } from '@radix-ui/react-icons'

type Variant = 'success' | 'error'

interface ToastSpec {
  id: number
  variant: Variant
  title: string
  description?: string
  action?: { label: string; onSelect: () => void }
}

interface ToastApi {
  success: (title: string, description?: string) => void
  error: (
    title: string,
    opts?: { description?: string; action?: { label: string; onSelect: () => void } },
  ) => void
}

const ToastContext = createContext<ToastApi | null>(null)

export function useToaster(): ToastApi {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToaster must be used within ToasterProvider')
  return ctx
}

export function ToasterProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastSpec[]>([])

  const push = useCallback((spec: Omit<ToastSpec, 'id'>) => {
    setToasts((prev) => [...prev, { ...spec, id: Date.now() + Math.random() }])
  }, [])

  const api: ToastApi = useMemo(
    () => ({
      success: (title, description) => push({ variant: 'success', title, description }),
      error: (title, opts) =>
        push({ variant: 'error', title, description: opts?.description, action: opts?.action }),
    }),
    [push],
  )

  return (
    <ToastContext.Provider value={api}>
      <Toast.Provider swipeDirection="right" duration={4000}>
        {children}
        {toasts.map((t) => (
          <Toast.Root
            key={t.id}
            onOpenChange={(open) => {
              if (!open) setToasts((prev) => prev.filter((x) => x.id !== t.id))
            }}
            style={{
              background: 'var(--color-panel-solid)',
              border: '1px solid var(--gray-6)',
              borderRadius: 'var(--radius-3)',
              padding: 12,
              boxShadow: 'var(--shadow-4)',
              minWidth: 280,
            }}
          >
            <Flex gap="2" align="start">
              {t.variant === 'success' ? (
                <CheckCircledIcon color="var(--green-9)" />
              ) : (
                <CrossCircledIcon color="var(--red-9)" />
              )}
              <Flex direction="column" gap="1" style={{ flex: 1 }}>
                <Toast.Title asChild>
                  <Text size="2" weight="medium">
                    {t.title}
                  </Text>
                </Toast.Title>
                {t.description ? (
                  <Toast.Description asChild>
                    <Text size="1" color="gray">
                      {t.description}
                    </Text>
                  </Toast.Description>
                ) : null}
              </Flex>
              {t.action ? (
                <Toast.Action asChild altText={t.action.label}>
                  <Button
                    size="1"
                    variant="soft"
                    onClick={() => {
                      t.action!.onSelect()
                      setToasts((prev) => prev.filter((x) => x.id !== t.id))
                    }}
                  >
                    {t.action.label}
                  </Button>
                </Toast.Action>
              ) : null}
            </Flex>
          </Toast.Root>
        ))}
        <Toast.Viewport
          style={{
            position: 'fixed',
            bottom: 0,
            right: 0,
            display: 'flex',
            flexDirection: 'column',
            padding: 24,
            gap: 8,
            width: 360,
            maxWidth: '100vw',
            margin: 0,
            listStyle: 'none',
            outline: 'none',
            zIndex: 2147483647,
          }}
        />
      </Toast.Provider>
    </ToastContext.Provider>
  )
}
