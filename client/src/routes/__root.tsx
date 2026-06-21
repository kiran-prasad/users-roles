import { createRootRoute, Outlet } from '@tanstack/react-router'
import { Suspense, lazy } from 'react'
import { ErrorBoundary } from '../components/ErrorBoundary'
import { AppLayout } from '../App'

const ReactQueryDevtools = import.meta.env.DEV
  ? lazy(() =>
      import('@tanstack/react-query-devtools').then((m) => ({ default: m.ReactQueryDevtools })),
    )
  : () => null

export const Route = createRootRoute({
  component: () => (
    <>
      <AppLayout>
        <Outlet />
      </AppLayout>
      {import.meta.env.DEV ? (
        <Suspense fallback={null}>
          <ReactQueryDevtools buttonPosition="bottom-left" />
        </Suspense>
      ) : null}
    </>
  ),
  errorComponent: ({ error, reset }) => <ErrorBoundary error={error} reset={reset} />,
  notFoundComponent: () => (
    <AppLayout>
      <p>Page not found.</p>
    </AppLayout>
  ),
})
