import { RowActionMenu } from '../../components/RowActionMenu'
import type { User } from '../../api/types'

interface Props {
  user: User
  onEdit: (user: User) => void
  onDelete: (user: User) => void
}

export function UserRowMenu({ user, onEdit, onDelete }: Props) {
  return (
    <RowActionMenu
      entityLabel={`${user.first} ${user.last}`}
      editLabel="Edit user"
      deleteLabel="Delete user"
      onEdit={() => onEdit(user)}
      onDelete={() => onDelete(user)}
    />
  )
}
