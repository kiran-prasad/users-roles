import type { ReactNode, Key } from 'react'
import { Box, Button, Flex, Table, Text } from '@radix-ui/themes'
import { ExclamationTriangleIcon } from '@radix-ui/react-icons'

export interface ColumnDef<T> {
  id: string
  header: ReactNode
  width?: string | number
  align?: 'start' | 'center' | 'end'
  cell: (row: T) => ReactNode
}

interface Props<T> {
  data: T[] | undefined
  columns: ColumnDef<T>[]
  getRowKey: (row: T) => Key
  isLoading: boolean
  isFetching?: boolean
  error?: Error | null
  onRetry?: () => void
  emptyState?: ReactNode
  /** Footer cell (e.g. pagination) is rendered in a single full-width row at the bottom. */
  footer?: ReactNode
}

const SKELETON_ROWS_ARRAY: readonly number[] = Array.from({ length: 10 }, (_, i) => i)

const CARD_STYLE = {
  borderRadius: 'var(--radius-3)',
  border: '1px solid var(--gray-6)',
  background: 'var(--color-panel-solid)',
  overflow: 'hidden',
} as const

const HEADER_ROW_STYLE = { background: 'var(--gray-2)' } as const
const EMPTY_BOX_STYLE = { textAlign: 'center' as const }
const FOOTER_CELL_STYLE = { background: 'transparent' } as const

function cellStyle<T>(col: ColumnDef<T>) {
  return { width: col.width, textAlign: col.align ?? 'start' }
}

type Mode = 'skeleton' | 'error' | 'empty' | 'rows'

function modeFor<T>(p: Pick<Props<T>, 'data' | 'isLoading' | 'error'>): Mode {
  if (p.isLoading && !p.data) return 'skeleton'
  if (p.error) return 'error'
  if (p.data && p.data.length === 0) return 'empty'
  return 'rows'
}

export function DataTable<T>({
  data,
  columns,
  getRowKey,
  isLoading,
  isFetching,
  error,
  onRetry,
  emptyState,
  footer,
}: Props<T>) {
  const mode = modeFor({ data, isLoading, error })

  return (
    <Box
      position="relative"
      style={CARD_STYLE}
      aria-busy={isFetching ? true : undefined}
    >
      {isFetching && !isLoading ? <div className="table-progress" role="presentation" /> : null}

      <Table.Root variant="ghost" size="2">
        <Table.Header>
          <Table.Row style={HEADER_ROW_STYLE}>
            {columns.map((col) => (
              <Table.ColumnHeaderCell key={col.id} style={cellStyle(col)}>
                {col.header}
              </Table.ColumnHeaderCell>
            ))}
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {mode === 'skeleton' &&
            SKELETON_ROWS_ARRAY.map((i) => (
              <Table.Row key={`skeleton-${i}`}>
                {columns.map((col) => (
                  <Table.Cell key={col.id}>
                    <SkeletonCell />
                  </Table.Cell>
                ))}
              </Table.Row>
            ))}

          {mode === 'error' && (
            <Table.Row>
              <Table.Cell colSpan={columns.length}>
                <Flex direction="column" align="center" gap="3" py="6" role="alert">
                  <Flex align="center" gap="2">
                    <ExclamationTriangleIcon color="var(--red-9)" />
                    <Text size="2" color="gray">
                      {error?.message || 'Something went wrong.'}
                    </Text>
                  </Flex>
                  {onRetry ? (
                    <Button variant="soft" size="2" onClick={onRetry}>
                      Try again
                    </Button>
                  ) : null}
                </Flex>
              </Table.Cell>
            </Table.Row>
          )}

          {mode === 'empty' && (
            <Table.Row>
              <Table.Cell colSpan={columns.length}>
                <Box py="6" style={EMPTY_BOX_STYLE}>
                  {emptyState ?? (
                    <Text size="2" color="gray">
                      No results.
                    </Text>
                  )}
                </Box>
              </Table.Cell>
            </Table.Row>
          )}

          {mode === 'rows' &&
            data!.map((row) => (
              <Table.Row key={getRowKey(row)}>
                {columns.map((col) => (
                  <Table.Cell key={col.id} style={cellStyle(col)}>
                    {col.cell(row)}
                  </Table.Cell>
                ))}
              </Table.Row>
            ))}

          {footer ? (
            <Table.Row>
              <Table.Cell colSpan={columns.length} style={FOOTER_CELL_STYLE}>
                {footer}
              </Table.Cell>
            </Table.Row>
          ) : null}
        </Table.Body>
      </Table.Root>
    </Box>
  )
}

function SkeletonCell() {
  return (
    <Box
      style={{
        height: 14,
        width: '60%',
        borderRadius: 4,
        background:
          'linear-gradient(90deg, var(--gray-3) 0%, var(--gray-4) 50%, var(--gray-3) 100%)',
        backgroundSize: '200% 100%',
        animation: 'skeleton-shimmer 1.6s ease-in-out infinite',
      }}
    />
  )
}
