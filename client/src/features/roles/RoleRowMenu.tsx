import { RowActionMenu } from '../../components/RowActionMenu'
import type { Role } from '../../api/types'

interface Props {
  role: Role
  onEdit: (role: Role) => void
  onDelete: (role: Role) => void
}

export function RoleRowMenu({ role, onEdit, onDelete }: Props) {
  return (
    <RowActionMenu
      entityLabel={role.name}
      editLabel="Edit role"
      deleteLabel="Delete role"
      onEdit={() => onEdit(role)}
      onDelete={() => onDelete(role)}
      deleteDisabledReason={role.isDefault ? "Default role can't be deleted" : undefined}
    />
  )
}
