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
import { useCreateUser, useDeleteUser, useUpdateUser, useUsers } from '../../hooks/useUsers'
import { useRolesMap } from '../../hooks/useRoles'
import type { User } from '../../api/types'
import { userColumns } from './userColumns'
import { DeleteUserDialog } from './DeleteUserDialog'
import { EditUserDialog } from './EditUserDialog'
import { AddUserDialog } from './AddUserDialog'

const getUserRowKey = (u: User) => u.id

export function UsersTab() {
  const navigate = useNavigate({ from: '/users' })
  const { page, search } = useSearch({ from: '/users' })

  const [searchInput, setSearchInput] = useState(search ?? '')
  const [debouncedSearch] = useDebounce(searchInput.trim(), 250)

  // Sync the debounced search back into the URL; reset page on search change.
  useEffect(() => {
    const next = debouncedSearch || undefined
    if (next === search) return
    void navigate({ search: { page: 1, search: next } })
  }, [debouncedSearch, search, navigate])

  // If the URL changes externally (back/forward), reflect it back into the input.
  useEffect(() => {
    setSearchInput(search ?? '')
  }, [search])

  const usersQuery = useUsers({ page, search: debouncedSearch || undefined })
  const { map: rolesMap, list: rolesList, isLoading: rolesLoading } = useRolesMap()
  const deleteMutation = useDeleteUser({ page, search: debouncedSearch || undefined })
  const updateMutation = useUpdateUser()
  const createMutation = useCreateUser()

  const toaster = useToaster()

  // Dialog state
  const [editing, setEditing] = useState<User | null>(null)
  const [deleting, setDeleting] = useState<User | null>(null)
  const [creating, setCreating] = useState(false)
  const focusRestore = useFocusRestore()
  const tableRef = useRef<HTMLDivElement>(null)

  // Search input shortcut wiring
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
    (user: User) => {
      focusRestore.save()
      setEditing(user)
    },
    [focusRestore],
  )
  const openDelete = useCallback(
    (user: User) => {
      focusRestore.save()
      setDeleting(user)
    },
    [focusRestore],
  )
  const columns = useMemo(
    () => userColumns({ rolesMap, rolesLoading, onEdit: openEdit, onDelete: openDelete }),
    [rolesMap, rolesLoading, openEdit, openDelete],
  )

  const handleRetry = useCallback(() => void usersQuery.refetch(), [usersQuery])
  const handlePageChange = useCallback(
    (p: number) => void navigate({ search: (prev) => ({ ...prev, page: p }) }),
    [navigate],
  )

  const confirmDelete = () => {
    if (!deleting) return
    const target = deleting
    deleteMutation.mutate(target.id, {
      onSuccess: () => {
        toaster.success(`Deleted ${target.first} ${target.last}`)
      },
      onError: (err) => {
        toaster.error(`Couldn't delete ${target.first} ${target.last}`, {
          description: err.message,
          action: {
            label: 'Retry',
            onSelect: () => deleteMutation.mutate(target.id),
          },
        })
      },
      onSettled: () => {
        setDeleting(null)
        // Focus restoration: the row no longer exists — anchor on the table card.
        requestAnimationFrame(() => {
          const nextMenu = tableRef.current?.querySelector<HTMLElement>('[aria-label^="Actions for"]')
          focusRestore.restore(nextMenu)
        })
      },
    })
  }

  return (
    <Box>
      <Flex gap="2" mb="3" align="center">
        <SearchInput
          ref={searchInputRef}
          value={searchInput}
          onChange={setSearchInput}
          placeholder="Search by first or last name..."
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
          Add user
        </Button>
      </Flex>

      <div ref={tableRef}>
        <DataTable
          data={usersQuery.data?.data}
          columns={columns}
          getRowKey={getUserRowKey}
          isLoading={usersQuery.isLoading}
          isFetching={usersQuery.isFetching}
          error={usersQuery.error}
          onRetry={handleRetry}
          emptyState={
            <Text size="2" color="gray">
              {debouncedSearch
                ? `No users match “${debouncedSearch}”.`
                : 'No users yet.'}
            </Text>
          }
          footer={
            usersQuery.data && usersQuery.data.pages > 1 ? (
              <Pagination
                prev={usersQuery.data.prev}
                next={usersQuery.data.next}
                onPageChange={handlePageChange}
              />
            ) : null
          }
        />
      </div>

      <DeleteUserDialog
        user={deleting}
        open={!!deleting}
        isPending={deleteMutation.isPending}
        onOpenChange={(open) => {
          if (!open) {
            setDeleting(null)
            focusRestore.restore()
          }
        }}
        onConfirm={confirmDelete}
      />

      <EditUserDialog
        user={editing}
        roles={rolesList}
        rolesLoading={rolesLoading}
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
                toaster.success(`Updated ${payload.first} ${payload.last}`)
                setEditing(null)
                updateMutation.reset()
                focusRestore.restore()
              },
              // Errors render inline in the dialog.
            },
          )
        }}
      />

      <AddUserDialog
        roles={rolesList}
        rolesLoading={rolesLoading}
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
              toaster.success(`Created ${payload.first} ${payload.last}`)
              setCreating(false)
              createMutation.reset()
              focusRestore.restore()
            },
            // Errors render inline in the dialog.
          })
        }}
      />
    </Box>
  )
}
