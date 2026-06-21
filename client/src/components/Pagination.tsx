import { Button, Flex } from '@radix-ui/themes'

interface Props {
  prev: number | null
  next: number | null
  onPageChange: (page: number) => void
}

/**
 * Previous / Next pager that matches the Figma footer cell.
 * We use `aria-disabled` rather than the `disabled` attribute so screen readers
 * still announce the buttons at edges — handlers short-circuit on null so we
 * never POST a bad page param.
 */
export function Pagination({ prev, next, onPageChange }: Props) {
  const prevDisabled = prev === null
  const nextDisabled = next === null

  return (
    <Flex gap="2" justify="end" align="center">
      <Button
        variant={prevDisabled ? 'soft' : 'outline'}
        color="gray"
        size="1"
        aria-disabled={prevDisabled}
        onClick={() => {
          if (prev !== null) onPageChange(prev)
        }}
        style={{
          cursor: prevDisabled ? 'not-allowed' : undefined,
          color: prevDisabled ? 'var(--gray-a8)' : undefined,
        }}
      >
        Previous
      </Button>
      <Button
        variant={nextDisabled ? 'soft' : 'outline'}
        color="gray"
        size="1"
        aria-disabled={nextDisabled}
        onClick={() => {
          if (next !== null) onPageChange(next)
        }}
        style={{
          cursor: nextDisabled ? 'not-allowed' : undefined,
          color: nextDisabled ? 'var(--gray-a8)' : undefined,
        }}
      >
        Next
      </Button>
    </Flex>
  )
}
