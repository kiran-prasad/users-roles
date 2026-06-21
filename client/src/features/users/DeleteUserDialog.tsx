import { ConfirmDestructiveDialog } from '../../components/ConfirmDestructiveDialog'
import type { User } from '../../api/types'

interface Props {
  user: User | null
  open: boolean
  isPending: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

export function DeleteUserDialog({ user, open, isPending, onOpenChange, onConfirm }: Props) {
  return (
    <ConfirmDestructiveDialog
      open={open}
      isPending={isPending}
      onOpenChange={onOpenChange}
      onConfirm={onConfirm}
      title="Delete user"
      confirmLabel="Delete user"
      description={
        user ? (
          <>
            Are you sure? The user{' '}
            <strong>
              {user.first} {user.last}
            </strong>{' '}
            will be permanently deleted.
          </>
        ) : null
      }
    />
  )
}
