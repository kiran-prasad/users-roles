import { Text } from '@radix-ui/themes'
import { ApiError } from '../api/client'

interface Props {
  error: Error | null
  id?: string
}

/**
 * Renders an ApiError's server-provided message inline as a polite alert.
 * Falls back to a generic message for non-ApiError errors so the user still
 * gets feedback when something unexpected happened.
 */
export function ApiErrorText({ error, id }: Props) {
  if (!error) return null
  const message = error instanceof ApiError ? error.message : 'Something went wrong.'
  return (
    <Text id={id} size="1" color="red" role="alert">
      {message}
    </Text>
  )
}
