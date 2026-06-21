import { render } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  createMemoryHistory,
  createRouter,
  createRootRoute,
  createRoute,
  Outlet,
  RouterProvider,
} from '@tanstack/react-router'
import { Theme } from '@radix-ui/themes'
import { z } from 'zod'
import type { ReactNode } from 'react'
import { ToasterProvider } from '../components/Toaster'

function makeRouter(initialPath: string, content: ReactNode) {
  const rootRoute = createRootRoute({ component: Outlet })
  const indexRoute = createRoute({
    path: '/',
    getParentRoute: () => rootRoute,
    component: () => <>{content}</>,
    validateSearch: z.object({
      page: z.number().int().min(1).catch(1).default(1),
      search: z.string().optional().catch(undefined),
    }),
  })
  return createRouter({
    routeTree: rootRoute.addChildren([indexRoute]),
    history: createMemoryHistory({ initialEntries: [initialPath] }),
  })
}

/**
 * Lightweight render helper for dialog / primitive tests that don't need the
 * router or query client — only the Radix Themes context.
 */
export function renderWithTheme(node: ReactNode) {
  return render(<Theme accentColor="iris" grayColor="gray" radius="small">{node}</Theme>)
}

export function renderApp(content: ReactNode, opts: { initialPath?: string } = {}) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  const router = makeRouter(opts.initialPath ?? '/', content)
  const utils = render(
    <Theme accentColor="iris" grayColor="gray" radius="small">
      <QueryClientProvider client={queryClient}>
        <ToasterProvider>
          <RouterProvider router={router as never} />
        </ToasterProvider>
      </QueryClientProvider>
    </Theme>,
  )
  return { ...utils, queryClient, router }
}
