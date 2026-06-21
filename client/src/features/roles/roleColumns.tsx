import { Badge, Flex, Text } from '@radix-ui/themes'
import type { ColumnDef } from '../../components/DataTable'
import type { Role } from '../../api/types'
import { RoleRowMenu } from './RoleRowMenu'

interface Options {
  onEdit: (role: Role) => void
  onDelete: (role: Role) => void
}

export function roleColumns({ onEdit, onDelete }: Options): ColumnDef<Role>[] {
  return [
    {
      id: 'name',
      header: 'Name',
      width: 240,
      cell: (r) => (
        <Flex align="center" gap="2">
          <Text size="2">{r.name}</Text>
          {r.isDefault ? (
            <Badge color="gray" variant="soft" size="1">
              Default
            </Badge>
          ) : null}
        </Flex>
      ),
    },
    {
      id: 'description',
      header: 'Description',
      cell: (r) => (
        <Text size="2" color="gray">
          {r.description || '—'}
        </Text>
      ),
    },
    {
      id: 'actions',
      header: '',
      width: 36,
      align: 'end',
      cell: (r) => <RoleRowMenu role={r} onEdit={onEdit} onDelete={onDelete} />,
    },
  ]
}
