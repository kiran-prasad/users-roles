import { Checkbox, Flex, Text, TextField } from '@radix-ui/themes'
import { ApiError } from '../../api/client'
import { ApiErrorText } from '../../components/ApiErrorText'

export interface RoleFormValues {
  name: string
  description: string
  isDefault: boolean
}

interface Props {
  values: RoleFormValues
  onChange: (next: RoleFormValues) => void
  error: Error | null
  /** When editing a role that's currently default: keep the checkbox checked
   *  and disabled (server returns 400 when unsetting). */
  isCurrentlyDefault?: boolean
  autoFocusFirst?: boolean
}

/**
 * Shared name/description/isDefault layout used by both Add and Edit role
 * dialogs. The parent dialog owns the form element, title, and submit/cancel
 * buttons.
 */
export function RoleForm({
  values,
  onChange,
  error,
  isCurrentlyDefault,
  autoFocusFirst,
}: Props) {
  const checkboxDisabled = !!isCurrentlyDefault
  const willReplaceDefault = !isCurrentlyDefault && values.isDefault

  // 400 collisions render against the name field for relevance.
  const isNameError =
    error instanceof ApiError && error.status === 400 && /name/i.test(error.message)
  const otherError: Error | null = error && !isNameError ? error : null

  return (
    <Flex direction="column" gap="3">
      <label>
        <Text as="div" size="2" weight="medium" mb="1">
          Name
        </Text>
        <TextField.Root
          value={values.name}
          onChange={(e) => onChange({ ...values, name: e.target.value })}
          required
          autoFocus={autoFocusFirst}
          aria-invalid={isNameError}
          aria-describedby={isNameError ? 'role-name-error' : undefined}
        />
        {isNameError ? (
          <Text id="role-name-error" size="1" color="red" mt="1" role="alert">
            {(error as ApiError).message}
          </Text>
        ) : null}
      </label>
      <label>
        <Text as="div" size="2" weight="medium" mb="1">
          Description
        </Text>
        <TextField.Root
          value={values.description}
          onChange={(e) => onChange({ ...values, description: e.target.value })}
        />
      </label>
      <label>
        <Flex align="center" gap="2">
          <Checkbox
            checked={values.isDefault}
            disabled={checkboxDisabled}
            onCheckedChange={(checked) =>
              onChange({ ...values, isDefault: checked === true })
            }
          />
          <Text size="2">Make this the default role</Text>
        </Flex>
        {willReplaceDefault ? (
          <Text size="1" color="gray" mt="1" as="div">
            This will replace the current default role.
          </Text>
        ) : null}
        {checkboxDisabled ? (
          <Text size="1" color="gray" mt="1" as="div">
            This is the default role. Make another role the default to change it.
          </Text>
        ) : null}
      </label>

      <ApiErrorText error={otherError} />
    </Flex>
  )
}
