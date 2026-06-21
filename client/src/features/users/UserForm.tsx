import { Flex, Select, Text, TextField } from '@radix-ui/themes'
import type { Role } from '../../api/types'
import { ApiErrorText } from '../../components/ApiErrorText'

export interface UserFormValues {
  first: string
  last: string
  roleId: string
}

interface Props {
  values: UserFormValues
  onChange: (next: UserFormValues) => void
  roles: Role[]
  rolesLoading: boolean
  error: Error | null
  /** Renders `autoFocus` on the first input only when this is the first dialog opening. */
  autoFocusFirst?: boolean
}

/**
 * Shared first/last/role layout used by both Add and Edit user dialogs. The
 * parent dialog owns the form element, title, and submit/cancel buttons.
 */
export function UserForm({ values, onChange, roles, rolesLoading, error, autoFocusFirst }: Props) {
  return (
    <Flex direction="column" gap="3">
      <label>
        <Text as="div" size="2" weight="medium" mb="1">
          First name
        </Text>
        <TextField.Root
          value={values.first}
          onChange={(e) => onChange({ ...values, first: e.target.value })}
          required
          autoFocus={autoFocusFirst}
        />
      </label>
      <label>
        <Text as="div" size="2" weight="medium" mb="1">
          Last name
        </Text>
        <TextField.Root
          value={values.last}
          onChange={(e) => onChange({ ...values, last: e.target.value })}
          required
        />
      </label>
      <label>
        <Text as="div" size="2" weight="medium" mb="1">
          Role
        </Text>
        <Select.Root
          value={values.roleId || undefined}
          onValueChange={(v) => onChange({ ...values, roleId: v })}
          disabled={rolesLoading || roles.length === 0}
        >
          <Select.Trigger placeholder={rolesLoading ? 'Loading roles…' : 'Select a role'} />
          <Select.Content>
            {roles.map((r) => (
              <Select.Item key={r.id} value={r.id}>
                {r.name}
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Root>
      </label>

      <ApiErrorText error={error} />
    </Flex>
  )
}
