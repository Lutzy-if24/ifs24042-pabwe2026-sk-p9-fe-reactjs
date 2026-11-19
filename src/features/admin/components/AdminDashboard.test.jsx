import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { showErrorAlert } from '../../../helpers/toolsHelper.js'
import { listAllPosts, listUserPosts, listUsers } from '../api/adminApi.js'
import AdminDashboard from './AdminDashboard.jsx'

vi.mock('../api/adminApi.js', () => ({ listUsers: vi.fn(), listAllPosts: vi.fn(), listUserPosts: vi.fn() }))
vi.mock('../../../helpers/toolsHelper.js', async (importOriginal) => ({
  ...(await importOriginal()),
  showErrorAlert: vi.fn(),
}))

const users = [
  { id: 1, username: 'admin', email: 'admin@delcom.org', role: 'admin', total_posts: 0, total_published: 0 },
  { id: 2, username: 'budi', email: 'budi@mail.id', role: 'member', total_posts: 3, total_published: 2 },
]
const post = (id, title, author, published) => ({
  id, title, category: 'Umum', is_published: published, created_at: '2026-03-05T10:00:00Z', author: { username: author },
})

beforeEach(() => vi.clearAllMocks())

describe('AdminDashboard', () => {
  it('menampilkan ringkasan, direktori pengguna dan arsip artikel', async () => {
    listUsers.mockResolvedValue(users)
    listAllPosts.mockResolvedValue([post(1, 'Artikel Satu', 'budi', true), post(2, 'Artikel Dua', 'budi', false)])
    render(<AdminDashboard />)
    expect(screen.getByText('Memuat pengguna…')).toBeInTheDocument()

    expect(await screen.findByText('budi@mail.id')).toBeInTheDocument()
    expect(screen.getByText('Total Pengguna').nextSibling).toHaveTextContent('2')
    expect(screen.getByText('Total Artikel').nextSibling).toHaveTextContent('3')
    expect(screen.getByText('Total Terbit').nextSibling).toHaveTextContent('2')
    expect(screen.getByText('member')).toBeInTheDocument()
    expect(screen.getByText('Arsip Seluruh Artikel')).toBeInTheDocument()
    expect(within(screen.getByText('Artikel Satu').closest('tr')).getByText('Terbit')).toBeInTheDocument()
    expect(within(screen.getByText('Artikel Dua').closest('tr')).getByText('Draf')).toBeInTheDocument()
  })

  it('melihat artikel milik pengguna tertentu lalu kembali ke semua', async () => {
    listUsers.mockResolvedValue(users)
    listAllPosts.mockResolvedValue([post(1, 'Milik Budi', 'budi', true), post(9, 'Milik Admin', 'admin', true)])
    listUserPosts.mockResolvedValue([post(1, 'Milik Budi', 'budi', true)])
    render(<AdminDashboard />)
    await screen.findByText('budi@mail.id')

    await userEvent.click(screen.getByRole('button', { name: 'Lihat artikel budi' }))
    expect(await screen.findByText('Artikel budi')).toBeInTheDocument()
    expect(listUserPosts).toHaveBeenCalledWith(2)
    expect(screen.queryByText('Milik Admin')).not.toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Tampilkan semua' }))
    expect(screen.getByText('Milik Admin')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Tampilkan semua' })).not.toBeInTheDocument()
  })

  it('galat saat memuat pengguna artikel ditampilkan dan pilihan tidak berubah', async () => {
    listUsers.mockResolvedValue(users)
    listAllPosts.mockResolvedValue([])
    listUserPosts.mockRejectedValue(new Error('gagal memuat artikel'))
    render(<AdminDashboard />)
    await screen.findByText('budi@mail.id')
    expect(screen.getAllByText('Belum ada artikel.')).toHaveLength(1)

    await userEvent.click(screen.getByRole('button', { name: 'Lihat artikel budi' }))
    await waitFor(() => expect(showErrorAlert).toHaveBeenCalledWith('gagal memuat artikel'))
    expect(screen.getByText('Arsip Seluruh Artikel')).toBeInTheDocument()
  })

  it('keadaan kosong dan galat awal', async () => {
    listUsers.mockRejectedValue(new Error('akses ditolak'))
    listAllPosts.mockResolvedValue([])
    render(<AdminDashboard />)
    await waitFor(() => expect(showErrorAlert).toHaveBeenCalledWith('akses ditolak'))
    expect(await screen.findByText('Belum ada pengguna.')).toBeInTheDocument()
  })
})
