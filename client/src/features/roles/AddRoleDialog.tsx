import { useEffect, useState } from 'react'
import { Button, Dialog, Flex } from '@radix-ui/themes'
import { RoleForm, type RoleFormValues } from './RoleForm'

interface Props {
  open: boolean
  isPending: boolean
  error: Error | null
  onOpenChange: (open: boolean) => void
  onSubmit: (payload: RoleFormValues) => void
}

const EMPTY: RoleFormValues = { name: '', description: '', isDefault: false }

export function AddRoleDialog({ open, isPending, error, onOpenChange, onSubmit }: Props) {
  const [values, setValues] = useState<RoleFormValues>(EMPTY)

  useEffect(() => {
    if (open) setValues(EMPTY)
  }, [open])

  const canSubmit = values.name.trim().length > 0 && !isPending

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content size="2" maxWidth="520px" style={{ borderRadius: 12 }}>
        <Dialog.Title>Add role</Dialog.Title>
        <Dialog.Description size="2" color="gray" mb="3">
          Create a new role.
        </Dialog.Description>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            if (!canSubmit) return
            onSubmit({
              name: values.name.trim(),
              description: values.description.trim(),
              isDefault: values.isDefault,
            })
          }}
        >
          <RoleForm values={values} onChange={setValues} error={error} autoFocusFirst />

          <Flex gap="3" mt="4" justify="end">
            <Dialog.Close>
              <Button variant="outline" color="gray" type="button">
                Cancel
              </Button>
            </Dialog.Close>
            <Button type="submit" disabled={!canSubmit} loading={isPending}>
              Create role
            </Button>
          </Flex>
        </form>
      </Dialog.Content>
    </Dialog.Root>
  )
}
