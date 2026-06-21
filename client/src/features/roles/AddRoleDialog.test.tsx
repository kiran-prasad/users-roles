import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { AddRoleDialog } from './AddRoleDialog'
import { ApiError } from '../../api/client'
import { renderWithTheme } from '../../test/renderApp'

function renderDialog(props: Partial<React.ComponentProps<typeof AddRoleDialog>> = {}) {
  const defaults: React.ComponentProps<typeof AddRoleDialog> = {
    open: true,
    isPending: false,
    error: null,
    onOpenChange: vi.fn(),
    onSubmit: vi.fn(),
  }
  return renderWithTheme(<AddRoleDialog {...defaults} {...props} />)
}

describe('AddRoleDialog', () => {
  it('submits a trimmed name + description with isDefault false by default', async () => {
    const u = userEvent.setup()
    const onSubmit = vi.fn()
    renderDialog({ onSubmit })

    await u.type(screen.getByLabelText(/^name$/i), '  Senior Engineering  ')
    await u.type(screen.getByLabelText(/^description$/i), '  Senior engineers ')
    await u.click(screen.getByRole('button', { name: /create role/i }))

    expect(onSubmit).toHaveBeenCalledWith({
      name: 'Senior Engineering',
      description: 'Senior engineers',
      isDefault: false,
    })
  })

  it('keeps Create role disabled until a name is entered', async () => {
    const u = userEvent.setup()
    renderDialog()
    const submit = screen.getByRole('button', { name: /create role/i })
    expect(submit).toBeDisabled()
    await u.type(screen.getByLabelText(/^name$/i), 'Sales')
    expect(submit).not.toBeDisabled()
  })

  it('surfaces a 400 name collision inline against the Name field', () => {
    renderDialog({ error: new ApiError(400, 'Role with given name already exists') })
    const alert = screen.getByRole('alert')
    expect(alert).toHaveTextContent(/already exists/i)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })
})
