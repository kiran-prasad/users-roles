import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Pagination } from './Pagination'
import { renderWithTheme } from '../test/renderApp'

describe('Pagination', () => {
  it('disables Previous at the first page via aria-disabled (not the DOM disabled attr)', () => {
    const onPageChange = vi.fn()
    renderWithTheme(<Pagination prev={null} next={2} onPageChange={onPageChange} />)
    const prev = screen.getByRole('button', { name: /previous/i })
    expect(prev).toHaveAttribute('aria-disabled', 'true')
    expect(prev).not.toHaveAttribute('disabled')
  })

  it('disables Next at the last page', () => {
    renderWithTheme(<Pagination prev={2} next={null} onPageChange={vi.fn()} />)
    const next = screen.getByRole('button', { name: /next/i })
    expect(next).toHaveAttribute('aria-disabled', 'true')
  })

  it('does not fire onPageChange when clicking a disabled edge button (handler short-circuit)', async () => {
    const user = userEvent.setup()
    const onPageChange = vi.fn()
    renderWithTheme(<Pagination prev={null} next={null} onPageChange={onPageChange} />)
    await user.click(screen.getByRole('button', { name: /previous/i }))
    await user.click(screen.getByRole('button', { name: /next/i }))
    expect(onPageChange).not.toHaveBeenCalled()
  })

  it('navigates when an enabled button is clicked', async () => {
    const user = userEvent.setup()
    const onPageChange = vi.fn()
    renderWithTheme(<Pagination prev={1} next={3} onPageChange={onPageChange} />)
    await user.click(screen.getByRole('button', { name: /next/i }))
    expect(onPageChange).toHaveBeenCalledWith(3)
    await user.click(screen.getByRole('button', { name: /previous/i }))
    expect(onPageChange).toHaveBeenCalledWith(1)
  })
})
