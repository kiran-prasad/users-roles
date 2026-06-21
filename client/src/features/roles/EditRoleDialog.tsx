import { useEffect, useState } from 'react'
import { Button, Dialog, Flex } from '@radix-ui/themes'
import type { Role } from '../../api/types'
import { RoleForm, type RoleFormValues } from './RoleForm'

interface Props {
  role: Role | null
  open: boolean
  isPending: boolean
  error: Error | null
  onOpenChange: (open: boolean) => void
  onSubmit: (payload: RoleFormValues) => void
}

export function EditRoleDialog({
  role,
  open,
  isPending,
  error,
  onOpenChange,
  onSubmit,
}: Props) {
  const [values, setValues] = useState<RoleFormValues>({
    name: '',
    description: '',
    isDefault: false,
  })

  useEffect(() => {
    if (role) {
      setValues({
        name: role.name,
        description: role.description ?? '',
        isDefault: role.isDefault,
      })
    }
  }, [role])

  const trimmed = {
    name: values.name.trim(),
    description: values.description.trim(),
    isDefault: values.isDefault,
  }
  const unchanged =
    !!role &&
    trimmed.name === role.name &&
    trimmed.description === (role.description ?? '') &&
    trimmed.isDefault === role.isDefault

  const canSubmit = trimmed.name.length > 0 && !unchanged && !isPending

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content size="2" maxWidth="520px" style={{ borderRadius: 12 }}>
        <Dialog.Title>Edit role</Dialog.Title>
        <Dialog.Description size="2" color="gray" mb="3">
          Update this role's details.
        </Dialog.Description>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            if (!canSubmit) return
            onSubmit(trimmed)
          }}
        >
          <RoleForm
            values={values}
            onChange={setValues}
            error={error}
            isCurrentlyDefault={role?.isDefault}
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
