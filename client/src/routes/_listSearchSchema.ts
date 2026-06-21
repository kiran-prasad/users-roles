import { z } from 'zod'

/**
 * Shared `?page=&search=` schema used by `/users` and `/roles`. TanStack Router
 * needs `validateSearch` declared per-route, but the two routes happen to
 * share the same shape — extract it so it can't drift.
 */
export const listSearchSchema = z.object({
  page: z.number().int().min(1).catch(1).default(1),
  search: z.string().optional().catch(undefined),
})
