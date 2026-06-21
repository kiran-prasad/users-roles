import { forwardRef } from 'react'
import { TextField, IconButton } from '@radix-ui/themes'
import { Cross1Icon, MagnifyingGlassIcon } from '@radix-ui/react-icons'

interface Props {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  'aria-label'?: string
}

export const SearchInput = forwardRef<HTMLInputElement, Props>(function SearchInput(
  { value, onChange, placeholder, 'aria-label': ariaLabel },
  ref,
) {
  return (
    <TextField.Root
      ref={ref}
      size="2"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder ?? 'Search by first or last name...'}
      aria-label={ariaLabel ?? placeholder ?? 'Search'}
      style={{ flex: 1 }}
    >
      <TextField.Slot>
        <MagnifyingGlassIcon height="16" width="16" />
      </TextField.Slot>
      {value ? (
        <TextField.Slot>
          <IconButton
            variant="ghost"
            color="gray"
            size="1"
            onClick={() => onChange('')}
            aria-label="Clear search"
            className="search-clear"
          >
            <Cross1Icon height="14" width="14" />
          </IconButton>
        </TextField.Slot>
      ) : null}
    </TextField.Root>
  )
})
