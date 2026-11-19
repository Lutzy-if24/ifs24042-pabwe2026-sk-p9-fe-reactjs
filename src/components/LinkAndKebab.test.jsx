import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import Link from './Link.jsx'
import KebabMenu from './KebabMenu.jsx'

describe('Link', () => {
  it('menavigasi tanpa reload dan meneruskan atribut', async () => {
    const navigate = vi.fn()
    render(
      <Link to="/author" navigate={navigate} className="x">
        Penulis
      </Link>,
    )
    const a = screen.getByRole('link', { name: 'Penulis' })
    expect(a).toHaveAttribute('href', '/author')
    expect(a).toHaveClass('x')
    await userEvent.click(a)
    expect(navigate).toHaveBeenCalledWith('/author')
  })
})

describe('KebabMenu', () => {
  const setup = () => {
    const onEdit = vi.fn()
    const onDelete = vi.fn()
    render(
      <div>
        <span>luar</span>
        <KebabMenu
          label="Aksi"
          items={[
            { label: 'Ubah', onClick: onEdit },
            { label: 'Hapus', onClick: onDelete, danger: true },
          ]}
        />
      </div>,
    )
    return { onEdit, onDelete }
  }

  it('membuka, memilih item (menutup menu) dan menjalankan aksi', async () => {
    const { onEdit, onDelete } = setup()
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Aksi' }))
    expect(screen.getByRole('menu')).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: 'Hapus' })).toHaveClass('text-red-600')

    await userEvent.click(screen.getByRole('menuitem', { name: 'Ubah' }))
    expect(onEdit).toHaveBeenCalled()
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Aksi' }))
    await userEvent.click(screen.getByRole('menuitem', { name: 'Hapus' }))
    expect(onDelete).toHaveBeenCalled()
  })

  it('menutup saat klik di luar, tetap terbuka saat klik di dalam, dan toggle lewat tombol', async () => {
    setup()
    const trigger = screen.getByRole('button', { name: 'Aksi' })
    await userEvent.click(trigger)
    await userEvent.click(screen.getByRole('menu'))
    expect(screen.getByRole('menu')).toBeInTheDocument()

    await userEvent.click(screen.getByText('luar'))
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()

    await userEvent.click(trigger)
    await userEvent.click(trigger)
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })
})
