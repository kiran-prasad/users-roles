import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { AddUserDialog } from './AddUserDialog'
import { ApiError } from '../../api/client'
import { renderWithTheme } from '../../test/renderApp'

const roles = [
  {
    id: 'r-eng',
    name: 'Engineering',
    description: '',
    isDefault: false,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'r-default',
    name: 'Member',
    description: '',
    isDefault: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
]

function renderDialog(props: Partial<React.ComponentProps<typeof AddUserDialog>> = {}) {
  const defaults: React.ComponentProps<typeof AddUserDialog> = {
    roles,
    rolesLoading: false,
    open: true,
    isPending: false,
    error: null,
    onOpenChange: vi.fn(),
    onSubmit: vi.fn(),
  }
  return renderWithTheme(<AddUserDialog {...defaults} {...props} />)
}

describe('AddUserDialog', () => {
  it('renders the Create user button and submits trimmed values with the default role', async () => {
    const u = userEvent.setup()
    const onSubmit = vi.fn()
    renderDialog({ onSubmit })

    await u.type(screen.getByLabelText(/first name/i), '  Mark  ')
    await u.type(screen.getByLabelText(/last name/i), 'Tipton')
    await u.click(screen.getByRole('button', { name: /create user/i }))

    expect(onSubmit).toHaveBeenCalledWith({
      first: 'Mark',
      last: 'Tipton',
      roleId: 'r-default',
    })
  })

  it('keeps the submit button disabled until first, last, and role are all set', () => {
    renderDialog({ roles: [], rolesLoading: false })
    expect(screen.getByRole('button', { name: /create user/i })).toBeDisabled()
  })

  it('surfaces an API error inline with role=alert', () => {
    renderDialog({ error: new ApiError(400, 'Missing required field: first') })
    expect(screen.getByRole('alert')).toHaveTextContent(/missing required field/i)
    // Dialog stays open
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })
})
