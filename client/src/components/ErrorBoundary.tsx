import { Button, Callout, Flex } from '@radix-ui/themes'
import { ExclamationTriangleIcon } from '@radix-ui/react-icons'

interface Props {
  error: Error
  reset: () => void
}

export function ErrorBoundary({ error, reset }: Props) {
  return (
    <Flex direction="column" gap="3" p="6" style={{ maxWidth: 600, margin: '40px auto' }}>
      <Callout.Root color="red" role="alert">
        <Callout.Icon>
          <ExclamationTriangleIcon />
        </Callout.Icon>
        <Callout.Text>
          <strong>Something went wrong.</strong>
          <br />
          {error.message}
        </Callout.Text>
      </Callout.Root>
      <Flex justify="end">
        <Button onClick={reset}>Try again</Button>
      </Flex>
    </Flex>
  )
}
