import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { EditRoleDialog } from './EditRoleDialog'
import { ApiError } from '../../api/client'
import { renderWithTheme } from '../../test/renderApp'

const baseRole = {
  id: 'r1',
  name: 'Engineering',
  description: 'Builds software',
  isDefault: false,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
}

function renderDialog(props: Partial<React.ComponentProps<typeof EditRoleDialog>> = {}) {
  const defaults: React.ComponentProps<typeof EditRoleDialog> = {
    role: baseRole,
    open: true,
    isPending: false,
    error: null,
    onOpenChange: vi.fn(),
    onSubmit: vi.fn(),
  }
  return renderWithTheme(<EditRoleDialog {...defaults} {...props} />)
}

describe('EditRoleDialog', () => {
  it('pre-fills name + description and submits a trimmed change', async () => {
    const u = userEvent.setup()
    const onSubmit = vi.fn()
    renderDialog({ onSubmit })

    const name = screen.getByDisplayValue('Engineering')
    await u.clear(name)
    await u.type(name, '  Platform  ')
    await u.click(screen.getByRole('button', { name: /save changes/i }))

    expect(onSubmit).toHaveBeenCalledWith({
      name: 'Platform',
      description: 'Builds software',
      isDefault: false,
    })
  })

  it('keeps Save disabled when nothing has changed', () => {
    renderDialog()
    expect(screen.getByRole('button', { name: /save changes/i })).toBeDisabled()
  })

  it('locks the default checkbox when the role is currently the default', () => {
    renderDialog({ role: { ...baseRole, isDefault: true } })
    const checkbox = screen.getByRole('checkbox', { name: /make this the default role/i })
    expect(checkbox).toBeDisabled()
    expect(checkbox).toBeChecked()
  })

  it('surfaces a 400 name collision inline against the Name field', () => {
    renderDialog({ error: new ApiError(400, 'Role with given name already exists') })
    expect(screen.getByRole('alert')).toHaveTextContent(/already exists/i)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })
})
