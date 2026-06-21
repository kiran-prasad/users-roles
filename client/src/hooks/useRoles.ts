import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  keepPreviousData,
} from '@tanstack/react-query'
import { useEffect } from 'react'
import {
  createRole,
  deleteRole,
  listRoles,
  updateRole,
  type CreateRolePayload,
  type UpdateRolePayload,
} from '../api/roles'
import type { PagedData, Role } from '../api/types'
import { useMemo } from 'react'


export function useRoles({ page, search }: { page: number; search?: string }) {
  return useQuery({
    queryKey: ['roles', { page, search: search ?? '' }],
    queryFn: ({ signal }) => listRoles({ page, search, signal }),
    placeholderData: keepPreviousData,
  })
}

/**
 * Pages through the entire roles list (the seed data is ~4 entries, so this
 * resolves in a single fetch in practice). Returns a Map<roleId, Role> for the
 * Users table's role-lookup column.
 *
 * Long staleTime keeps it warm; role mutations explicitly invalidate ['roles']
 * which catches this key too.
 */
export function useRolesMap() {
  const q = useInfiniteQuery({
    queryKey: ['roles', 'all'],
    queryFn: ({ signal, pageParam }) => listRoles({ page: pageParam, search: undefined, signal }),
    initialPageParam: 1 as number,
    getNextPageParam: (last: PagedData<Role>) => last.next ?? undefined,
    staleTime: 5 * 60_000,
  })

  // Auto-fetch subsequent pages until exhausted. Lives in an effect so we
  // don't trigger a state change from the render body. Pulling individual
  // fields out of the query object keeps the dep list narrow.
  const { hasNextPage, isFetchingNextPage, fetchNextPage } = q
  useEffect(() => {
    if (hasNextPage && !isFetchingNextPage) {
      void fetchNextPage()
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  const map = useMemo(() => {
    const m = new Map<string, Role>()
    q.data?.pages.forEach((pg) => pg.data.forEach((r) => m.set(r.id, r)))
    return m
  }, [q.data])

  return {
    map,
    list: useMemo(
      () => Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name)),
      [map],
    ),
    isLoading: q.isLoading,
    isFetching: q.isFetching,
  }
}

export function useCreateRole() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateRolePayload) => createRole(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['roles'] })
    },
  })
}

export function useUpdateRole() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateRolePayload }) =>
      updateRole(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['roles'] })
    },
  })
}

export function useDeleteRole() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteRole(id),
    onSuccess: () => {
      // Server reassigns affected users' roleId to the default role, so refresh
      // both caches.
      qc.invalidateQueries({ queryKey: ['roles'] })
      qc.invalidateQueries({ queryKey: ['users'] })
    },
  })
}
