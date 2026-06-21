import { QueryClient } from '@tanstack/react-query'
import { ApiError } from '../api/client'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Retry the 5% random 500s with capped exponential backoff. Don't retry
      // 4xx — those are intentional (e.g. 404 on a deleted user).
      retry: (failureCount, error) => {
        if (error instanceof ApiError && error.status >= 400 && error.status < 500) return false
        return failureCount < 2
      },
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 5000),
      staleTime: 30_000,
      retryOnMount: false,
      refetchOnWindowFocus: false,
    },
    mutations: {
      // Mutations are user-triggered; don't auto-retry, surface the error so
      // the toaster can offer a Retry button.
      retry: false,
    },
  },
})
