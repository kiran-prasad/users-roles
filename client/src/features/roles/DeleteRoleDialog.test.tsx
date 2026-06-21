import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { DeleteRoleDialog } from './DeleteRoleDialog'
import { renderWithTheme } from '../../test/renderApp'

const role = {
  id: 'r1',
  name: 'Support',
  description: '',
  isDefault: false,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
}

describe('DeleteRoleDialog', () => {
  it('renders the bolded role name + the user-reassignment sentence', () => {
    renderWithTheme(
      <DeleteRoleDialog
        role={role}
        open
        isPending={false}
        onOpenChange={vi.fn()}
        onConfirm={vi.fn()}
      />,
    )
    const dialog = screen.getByRole('alertdialog')
    expect(within(dialog).getByText(/will be permanently deleted/i)).toBeInTheDocument()
    expect(within(dialog).getByText(/moved to the default role/i)).toBeInTheDocument()
    const strong = within(dialog).getByText('Support')
    expect(strong.tagName).toBe('STRONG')
  })

  it('calls onConfirm when Delete role is clicked', async () => {
    const u = userEvent.setup()
    const onConfirm = vi.fn()
    renderWithTheme(
      <DeleteRoleDialog
        role={role}
        open
        isPending={false}
        onOpenChange={vi.fn()}
        onConfirm={onConfirm}
      />,
    )
    await u.click(screen.getByRole('button', { name: /^delete role$/i }))
    expect(onConfirm).toHaveBeenCalledOnce()
  })

  it('disables the destructive button while a delete is pending', () => {
    renderWithTheme(
      <DeleteRoleDialog
        role={role}
        open
        isPending
        onOpenChange={vi.fn()}
        onConfirm={vi.fn()}
      />,
    )
    expect(screen.getByRole('button', { name: /delete role/i })).toBeDisabled()
  })
})
