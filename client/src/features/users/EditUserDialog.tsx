import { useEffect, useState } from 'react'
import { Button, Dialog, Flex } from '@radix-ui/themes'
import type { Role, User } from '../../api/types'
import { UserForm, type UserFormValues } from './UserForm'

interface Props {
  user: User | null
  roles: Role[]
  rolesLoading: boolean
  open: boolean
  isPending: boolean
  error: Error | null
  onOpenChange: (open: boolean) => void
  onSubmit: (payload: UserFormValues) => void
}

export function EditUserDialog({
  user,
  roles,
  rolesLoading,
  open,
  isPending,
  error,
  onOpenChange,
  onSubmit,
}: Props) {
  const [values, setValues] = useState<UserFormValues>({ first: '', last: '', roleId: '' })

  // Reset form whenever a fresh user is loaded into the dialog.
  useEffect(() => {
    if (user) setValues({ first: user.first, last: user.last, roleId: user.roleId })
  }, [user])

  const canSubmit =
    values.first.trim().length > 0 &&
    values.last.trim().length > 0 &&
    values.roleId.length > 0 &&
    !isPending

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content size="2" maxWidth="520px" style={{ borderRadius: 12 }}>
        <Dialog.Title>Edit user</Dialog.Title>
        <Dialog.Description size="2" color="gray" mb="3">
          Update this user's details.
        </Dialog.Description>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            if (!canSubmit) return
            onSubmit({
              first: values.first.trim(),
              last: values.last.trim(),
              roleId: values.roleId,
            })
          }}
        >
          <UserForm
            values={values}
            onChange={setValues}
            roles={roles}
            rolesLoading={rolesLoading}
            error={error}
            autoFocusFirst
          />

          <Flex gap="3" mt="4" justify="end">
            <Dialog.Close>
              <Button variant="outline" color="gray" type="button">
                Cancel
              </Button>
            </Dialog.Close>
            <Button type="submit" disabled={!canSubmit} loading={isPending}>
              Save changes
            </Button>
          </Flex>
        </form>
      </Dialog.Content>
    </Dialog.Root>
  )
}
