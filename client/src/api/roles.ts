import { request } from './client'
import type { PagedData, Role } from './types'

export interface ListRolesParams {
  page?: number
  search?: string
  signal?: AbortSignal
}

export function listRoles({ page, search, signal }: ListRolesParams) {
  return request<PagedData<Role>>('/roles', {
    search: { page, search },
    signal,
  })
}

export interface UpdateRolePayload {
  name?: string
  description?: string
  isDefault?: boolean
}

export interface CreateRolePayload {
  name: string
  description?: string
  isDefault?: boolean
}

export function createRole(payload: CreateRolePayload) {
  return request<Role>('/roles', { method: 'POST', body: payload })
}

export function updateRole(id: string, payload: UpdateRolePayload) {
  return request<Role>(`/roles/${id}`, { method: 'PATCH', body: payload })
}

export function deleteRole(id: string) {
  return request<Role>(`/roles/${id}`, { method: 'DELETE' })
}
