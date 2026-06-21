import {
  useMutation,
  useQuery,
  useQueryClient,
  keepPreviousData,
} from '@tanstack/react-query'
import {
  createUser,
  deleteUser,
  listUsers,
  updateUser,
  type CreateUserPayload,
  type UpdateUserPayload,
} from '../api/users'
import type { PagedData, User } from '../api/types'

interface UsersQueryArgs {
  page: number
  search?: string
}

export function usersQueryKey({ page, search }: UsersQueryArgs) {
  return ['users', { page, search: search ?? '' }] as const
}

export function useUsers(args: UsersQueryArgs) {
  return useQuery({
    queryKey: usersQueryKey(args),
    queryFn: ({ signal }) => listUsers({ ...args, signal }),
    placeholderData: keepPreviousData,
  })
}

export function useUpdateUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateUserPayload }) =>
      updateUser(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] })
    },
  })
}

export function useCreateUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateUserPayload) => createUser(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] })
    },
  })
}

/**
 * Optimistically removes the user from the active page. The exact `[entity,
 * page, search]` key is captured in `onMutate` so a concurrent search or page
 * change doesn't cause the rollback to patch the wrong cache.
 *
 * We do NOT recompute `pages`/`next`/`prev` ourselves — the `onSettled`
 * invalidate triggers a refetch that does so correctly, and `keepPreviousData`
 * masks the flicker.
 */
export function useDeleteUser({ page, search }: UsersQueryArgs) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteUser(id),
    onMutate: async (id) => {
      const key = usersQueryKey({ page, search })
      await qc.cancelQueries({ queryKey: key })
      const previous = qc.getQueryData<PagedData<User>>(key)
      if (previous) {
        qc.setQueryData<PagedData<User>>(key, {
          ...previous,
          data: previous.data.filter((u) => u.id !== id),
        })
      }
      return { key, previous }
    },
    onError: (_err, _id, context) => {
      if (context?.previous && context.key) {
        qc.setQueryData(context.key, context.previous)
      }
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['users'] })
    },
  })
}
