import { ConfirmDestructiveDialog } from '../../components/ConfirmDestructiveDialog'
import type { Role } from '../../api/types'

interface Props {
  role: Role | null
  open: boolean
  isPending: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

export function DeleteRoleDialog({ role, open, isPending, onOpenChange, onConfirm }: Props) {
  return (
    <ConfirmDestructiveDialog
      open={open}
      isPending={isPending}
      onOpenChange={onOpenChange}
      onConfirm={onConfirm}
      title="Delete role"
      confirmLabel="Delete role"
      description={
        role ? (
          <>
            Are you sure? The role <strong>{role.name}</strong> will be permanently deleted. Any
            users currently assigned to it will be moved to the default role.
          </>
        ) : null
      }
    />
  )
}
