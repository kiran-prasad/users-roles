import { DropdownMenu, IconButton } from '@radix-ui/themes'
import { DotsHorizontalIcon } from '@radix-ui/react-icons'

interface Props {
  entityLabel: string
  onEdit: () => void
  onDelete: () => void
  editLabel: string
  deleteLabel: string
  /** When set, the Delete item is disabled and this string is its native
   *  tooltip — matches the "Default role can't be deleted" UX. */
  deleteDisabledReason?: string
}

/**
 * Shared `...` row-action menu for the Users and Roles tables. The
 * aria-label on the trigger is `Actions for {entityLabel}` so screen readers
 * can disambiguate row menus and so `UsersTab` focus restoration can find
 * the next visible trigger by query.
 */
export function RowActionMenu({
  entityLabel,
  onEdit,
  onDelete,
  editLabel,
  deleteLabel,
  deleteDisabledReason,
}: Props) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        <IconButton
          variant="ghost"
          color="gray"
          size="1"
          aria-label={`Actions for ${entityLabel}`}
        >
          <DotsHorizontalIcon />
        </IconButton>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content align="end" size="1">
        <DropdownMenu.Item onSelect={onEdit}>{editLabel}</DropdownMenu.Item>
        <DropdownMenu.Item
          color="red"
          disabled={!!deleteDisabledReason}
          onSelect={onDelete}
          title={deleteDisabledReason}
        >
          {deleteLabel}
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  )
}
