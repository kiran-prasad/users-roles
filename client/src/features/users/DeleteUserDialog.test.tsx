import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { DeleteUserDialog } from './DeleteUserDialog'
import { renderWithTheme } from '../../test/renderApp'

const user = {
  id: 'u1',
  first: 'Mark',
  last: 'Tipton',
  roleId: 'r1',
  createdAt: '2024-08-27T23:16:10.554Z',
  updatedAt: '2024-08-27T23:16:10.554Z',
}

describe('DeleteUserDialog', () => {
  it('renders the user’s full name bolded inside the description', () => {
    renderWithTheme(
      <DeleteUserDialog
        user={user}
        open
        isPending={false}
        onOpenChange={vi.fn()}
        onConfirm={vi.fn()}
      />,
    )
    const dialog = screen.getByRole('alertdialog')
    expect(within(dialog).getByText(/will be permanently deleted/i)).toBeInTheDocument()
    const strong = within(dialog).getByText('Mark Tipton')
    expect(strong.tagName).toBe('STRONG')
  })

  it('calls onConfirm when Delete user is clicked', async () => {
    const u = userEvent.setup()
    const onConfirm = vi.fn()
    renderWithTheme(
      <DeleteUserDialog
        user={user}
        open
        isPending={false}
        onOpenChange={vi.fn()}
        onConfirm={onConfirm}
      />,
    )
    await u.click(screen.getByRole('button', { name: /^delete user$/i }))
    expect(onConfirm).toHaveBeenCalledOnce()
  })

  it('disables the destructive button while a delete is pending', () => {
    renderWithTheme(
      <DeleteUserDialog
        user={user}
        open
        isPending
        onOpenChange={vi.fn()}
        onConfirm={vi.fn()}
      />,
    )
    expect(screen.getByRole('button', { name: /delete user/i })).toBeDisabled()
  })
})
