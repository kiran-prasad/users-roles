import { request } from './client'
import type { PagedData, User } from './types'

export interface ListUsersParams {
  page?: number
  search?: string
  signal?: AbortSignal
}

export function listUsers({ page, search, signal }: ListUsersParams) {
  return request<PagedData<User>>('/users', {
    search: { page, search },
    signal,
  })
}

export interface UpdateUserPayload {
  first?: string
  last?: string
  roleId?: string
}

export interface CreateUserPayload {
  first: string
  last: string
  roleId: string
}

export function createUser(payload: CreateUserPayload) {
  return request<User>('/users', { method: 'POST', body: payload })
}

export function updateUser(id: string, payload: UpdateUserPayload) {
  return request<User>(`/users/${id}`, { method: 'PATCH', body: payload })
}

export function deleteUser(id: string) {
  return request<User>(`/users/${id}`, { method: 'DELETE' })
}
