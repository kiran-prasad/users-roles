import { Avatar, Flex, Text } from '@radix-ui/themes'
import type { ColumnDef } from '../../components/DataTable'
import type { Role, User } from '../../api/types'
import { formatJoined, initials } from '../../lib/format'
import { UserRowMenu } from './UserRowMenu'

interface Options {
  rolesMap: Map<string, Role>
  rolesLoading: boolean
  onEdit: (user: User) => void
  onDelete: (user: User) => void
}

export function userColumns({
  rolesMap,
  rolesLoading,
  onEdit,
  onDelete,
}: Options): ColumnDef<User>[] {
  return [
    {
      id: 'user',
      header: 'User',
      width: 301,
      cell: (u) => (
        <Flex align="center" gap="2">
          <Avatar
            size="1"
            src={u.photo}
            fallback={initials(u.first, u.last)}
            radius="full"
            color="gray"
          />
          <Text size="2">
            {u.first} {u.last}
          </Text>
        </Flex>
      ),
    },
    {
      id: 'role',
      header: 'Role',
      width: 277,
      cell: (u) => {
        const role = rolesMap.get(u.roleId)
        if (role) return <Text size="2">{role.name}</Text>
        // While the roles map is still loading, or if the user's roleId isn't
        // present (e.g. a 500 hit during page-through), render a subtle dash
        // rather than blocking the table or surfacing a raw UUID.
        return (
          <Text size="2" color="gray">
            {rolesLoading ? '…' : '—'}
          </Text>
        )
      },
    },
    {
      id: 'joined',
      header: 'Joined',
      cell: (u) => (
        <Text size="2" color="gray">
          {formatJoined(u.createdAt)}
        </Text>
      ),
    },
    {
      id: 'actions',
      header: '',
      width: 36,
      align: 'end',
      cell: (u) => <UserRowMenu user={u} onEdit={onEdit} onDelete={onDelete} />,
    },
  ]
}
