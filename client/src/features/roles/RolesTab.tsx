import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Box, Button, Flex, Text } from '@radix-ui/themes'
import { PlusIcon } from '@radix-ui/react-icons'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { useDebounce } from 'use-debounce'
import { SearchInput } from '../../components/SearchInput'
import { Pagination } from '../../components/Pagination'
import { DataTable } from '../../components/DataTable'
import { useToaster } from '../../components/Toaster'
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts'
import { useFocusRestore } from '../../hooks/useFocusRestore'
import {
  useCreateRole,
  useDeleteRole,
  useRoles,
  useUpdateRole,
} from '../../hooks/useRoles'
import type { Role } from '../../api/types'
import { roleColumns } from './roleColumns'
import { AddRoleDialog } from './AddRoleDialog'
import { EditRoleDialog } from './EditRoleDialog'
import { DeleteRoleDialog } from './DeleteRoleDialog'

const getRoleRowKey = (r: Role) => r.id

export function RolesTab() {
  const navigate = useNavigate({ from: '/roles' })
  const { page, search } = useSearch({ from: '/roles' })

  const [searchInput, setSearchInput] = useState(search ?? '')
  const [debouncedSearch] = useDebounce(searchInput.trim(), 250)

  useEffect(() => {
    const next = debouncedSearch || undefined
    if (next === search) return
    void navigate({ search: { page: 1, search: next } })
  }, [debouncedSearch, search, navigate])

  useEffect(() => {
    setSearchInput(search ?? '')
  }, [search])

  const rolesQuery = useRoles({ page, search: debouncedSearch || undefined })
  const createMutation = useCreateRole()
  const updateMutation = useUpdateRole()
  const deleteMutation = useDeleteRole()
  const toaster = useToaster()

  const [creating, setCreating] = useState(false)
  const [editing, setEditing] = useState<Role | null>(null)
  const [deleting, setDeleting] = useState<Role | null>(null)
  const focusRestore = useFocusRestore()

  const searchInputRef = useRef<HTMLInputElement>(null)
  useKeyboardShortcuts({
    onSlash: () => searchInputRef.current?.focus(),
    onEscape: () => {
      if (document.activeElement === searchInputRef.current && searchInput) {
        setSearchInput('')
      }
    },
    onGoToUsers: () => void navigate({ to: '/users', search: { page: 1, search: undefined } }),
    onGoToRoles: () => void navigate({ to: '/roles', search: { page: 1, search: undefined } }),
  })

  const openEdit = useCallback(
    (role: Role) => {
      focusRestore.save()
      setEditing(role)
    },
    [focusRestore],
  )
  const openDelete = useCallback(
    (role: Role) => {
      focusRestore.save()
      setDeleting(role)
    },
    [focusRestore],
  )
  const columns = useMemo(
    () => roleColumns({ onEdit: openEdit, onDelete: openDelete }),
    [openEdit, openDelete],
  )

  const handleRetry = useCallback(() => void rolesQuery.refetch(), [rolesQuery])
  const handlePageChange = useCallback(
    (p: number) => void navigate({ search: (prev) => ({ ...prev, page: p }) }),
    [navigate],
  )

  return (
    <Box>
      <Flex gap="2" mb="3" align="center">
        <SearchInput
          ref={searchInputRef}
          value={searchInput}
          onChange={setSearchInput}
          placeholder="Search roles..."
        />
        <Button
          size="2"
          color="iris"
          onClick={() => {
            focusRestore.save()
            setCreating(true)
          }}
        >
          <PlusIcon />
          Add role
        </Button>
      </Flex>

      <DataTable
        data={rolesQuery.data?.data}
        columns={columns}
        getRowKey={getRoleRowKey}
        isLoading={rolesQuery.isLoading}
        isFetching={rolesQuery.isFetching}
        error={rolesQuery.error}
        onRetry={handleRetry}
        emptyState={
          <Text size="2" color="gray">
            {debouncedSearch ? `No roles match “${debouncedSearch}”.` : 'No roles yet.'}
          </Text>
        }
        footer={
          rolesQuery.data && rolesQuery.data.pages > 1 ? (
            <Pagination
              prev={rolesQuery.data.prev}
              next={rolesQuery.data.next}
              onPageChange={handlePageChange}
            />
          ) : null
        }
      />

      <AddRoleDialog
        open={creating}
        isPending={createMutation.isPending}
        error={createMutation.error}
        onOpenChange={(open) => {
          if (!open) {
            setCreating(false)
            createMutation.reset()
            focusRestore.restore()
          }
        }}
        onSubmit={(payload) => {
          createMutation.mutate(payload, {
            onSuccess: () => {
              toaster.success(`Created ${payload.name}`)
              setCreating(false)
              createMutation.reset()
              focusRestore.restore()
            },
          })
        }}
      />

      <EditRoleDialog
        role={editing}
        open={!!editing}
        isPending={updateMutation.isPending}
        error={updateMutation.error}
        onOpenChange={(open) => {
          if (!open) {
            setEditing(null)
            updateMutation.reset()
            focusRestore.restore()
          }
        }}
        onSubmit={(payload) => {
          if (!editing) return
          const target = editing
          updateMutation.mutate(
            { id: target.id, payload },
            {
              onSuccess: () => {
                toaster.success(`Updated ${payload.name}`)
                setEditing(null)
                updateMutation.reset()
                focusRestore.restore()
              },
            },
          )
        }}
      />

      <DeleteRoleDialog
        role={deleting}
        open={!!deleting}
        isPending={deleteMutation.isPending}
        onOpenChange={(open) => {
          if (!open) {
            setDeleting(null)
            deleteMutation.reset()
            focusRestore.restore()
          }
        }}
        onConfirm={() => {
          if (!deleting) return
          const target = deleting
          deleteMutation.mutate(target.id, {
            onSuccess: () => {
              toaster.success(`Deleted ${target.name}`)
              setDeleting(null)
              focusRestore.restore()
            },
            onError: (err) => {
              toaster.error(`Couldn't delete ${target.name}`, {
                description: err.message,
                action: {
                  label: 'Retry',
                  onSelect: () => deleteMutation.mutate(target.id),
                },
              })
              setDeleting(null)
              focusRestore.restore()
            },
          })
        }}
      />
    </Box>
  )
}
