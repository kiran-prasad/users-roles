import type { ReactNode } from 'react'
import { Box, Container, Flex, Tabs } from '@radix-ui/themes'
import { useNavigate, useRouterState } from '@tanstack/react-router'
import { ThemeToggle } from './components/ThemeToggle'
import { useThemeToggle } from './components/ThemeToggleProvider'

export function AppLayout({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const value: 'users' | 'roles' = pathname.startsWith('/roles') ? 'roles' : 'users'
  const { appearance, toggle } = useThemeToggle()
  const navigate = useNavigate()

  return (
    <Container size="3" py="7" px="2">
      <Box style={{ maxWidth: 850, marginInline: 'auto', position: 'relative' }}>
        <Flex justify="end" mb="3">
          <ThemeToggle appearance={appearance} onToggle={toggle} />
        </Flex>
        <Tabs.Root
          value={value}
          onValueChange={(v) =>
            void navigate({
              to: v === 'roles' ? '/roles' : '/users',
              search: { page: 1, search: undefined },
            })
          }
        >
          <Tabs.List>
            <Tabs.Trigger value="users">Users</Tabs.Trigger>
            <Tabs.Trigger value="roles">Roles</Tabs.Trigger>
          </Tabs.List>
          <Box mt="5">{children}</Box>
        </Tabs.Root>
      </Box>
    </Container>
  )
}
