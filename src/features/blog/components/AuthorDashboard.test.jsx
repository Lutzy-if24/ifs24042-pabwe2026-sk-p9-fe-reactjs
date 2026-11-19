import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { showConfirmDialog, showErrorAlert, showSuccessAlert } from '../../../helpers/toolsHelper.js'
import { deletePost, getMyPost, getStats, listMyPosts, togglePublish } from '../api/blogApi.js'
import AuthorDashboard from './AuthorDashboard.jsx'

vi.mock('../api/blogApi.js', async (importOriginal) => ({
  ...(await importOriginal()),
  listMyPosts: vi.fn(),
  getStats: vi.fn(),
  getMyPost: vi.fn(),
  deletePost: vi.fn(),
  togglePublish: vi.fn(),
}))
vi.mock('../../../helpers/toolsHelper.js', async (importOriginal) => ({
  ...(await importOriginal()),
  showConfirmDialog: vi.fn(),
  showErrorAlert: vi.fn(),
  showSuccessAlert: vi.fn(),
}))
vi.mock('../modals/PostModal.jsx', () => ({
  default: ({ post, onClose, onSaved }) => (
    <div data-testid="post-modal">
      <span>{`modal:${post.title || 'kosong'}`}</span>
      <button onClick={onClose}>tutup-post</button>
      <button onClick={onSaved}>simpan-post</button>
    </div>
  ),
}))
vi.mock('../modals/AiPostGeneratorModal.jsx', () => ({
  default: ({ onClose, onApply }) => (
    <div data-testid="ai-modal">
      <button onClick={onClose}>tutup-ai</button>
      <button onClick={() => onApply({ title: 'Draf AI' })}>terapkan-ai</button>
    </div>
  ),
}))

const published = { id: 1, title: 'Artikel Terbit', slug: 'artikel-terbit', category: 'Teknologi', is_published: true, created_at: '2026-03-05T10:00:00Z', reading_time: 2 }
const draft = { id: 2, title: 'Artikel Draf', slug: 'artikel-draf', category: 'Umum', is_published: false, created_at: '2026-03-06T10:00:00Z', reading_time: 1 }
const stats = { total: 2, total_published: 1, total_draft: 1 }

const setup = async (posts = [published, draft]) => {
  listMyPosts.mockResolvedValue(posts)
  getStats.mockResolvedValue(stats)
  const navigate = vi.fn()
  render(<AuthorDashboard navigate={navigate} dark={false} />)
  await waitFor(() => expect(screen.queryByText('Memuat artikel…')).not.toBeInTheDocument())
  return { navigate }
}

const row = (title) => screen.getByText(title).closest('tr')

beforeEach(() => vi.clearAllMocks())

describe('AuthorDashboard', () => {
  it('menampilkan statistik dan tabel artikel (bukan card)', async () => {
    listMyPosts.mockResolvedValue([published, draft])
    getStats.mockResolvedValue(stats)
    render(<AuthorDashboard navigate={vi.fn()} dark={false} />)
    expect(screen.getByText('Memuat artikel…')).toBeInTheDocument()

    expect(await screen.findByText('Artikel Terbit')).toBeInTheDocument()
    expect(screen.getByRole('table')).toBeInTheDocument()
    expect(within(row('Artikel Terbit')).getByText('Terbit')).toBeInTheDocument()
    expect(within(row('Artikel Draf')).getByText('Draf')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Total Artikel/ })).toHaveTextContent('2')
  })

  it('keadaan kosong', async () => {
    await setup([])
    expect(screen.getByText('Belum ada artikel.')).toBeInTheDocument()
  })

  it('galat saat memuat ditampilkan lewat alert', async () => {
    listMyPosts.mockRejectedValue(new Error('gagal memuat'))
    getStats.mockResolvedValue(stats)
    render(<AuthorDashboard navigate={vi.fn()} dark={false} />)
    await waitFor(() => expect(showErrorAlert).toHaveBeenCalledWith('gagal memuat'))
    expect(await screen.findByText('Belum ada artikel.')).toBeInTheDocument()
  })

  it('kartu statistik memfilter tabel', async () => {
    await setup()
    await userEvent.click(screen.getByRole('button', { name: /Belum Selesai/ }))
    expect(screen.queryByText('Artikel Terbit')).not.toBeInTheDocument()
    expect(screen.getByText('Artikel Draf')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: /Total Terbit/ }))
    expect(screen.getByText('Artikel Terbit')).toBeInTheDocument()
    expect(screen.queryByText('Artikel Draf')).not.toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: /Total Artikel/ }))
    expect(screen.getByText('Artikel Draf')).toBeInTheDocument()
  })

  it('switch mengubah status publikasi dan memuat ulang; galat ditampilkan', async () => {
    await setup()
    togglePublish.mockResolvedValue({})
    await userEvent.click(screen.getByRole('switch', { name: 'Terbitkan Artikel Draf' }))
    await waitFor(() => expect(togglePublish).toHaveBeenCalledWith(2))
    await waitFor(() => expect(listMyPosts).toHaveBeenCalledTimes(2))

    togglePublish.mockRejectedValue(new Error('tidak ditemukan'))
    await userEvent.click(screen.getByRole('switch', { name: 'Terbitkan Artikel Terbit' }))
    await waitFor(() => expect(showErrorAlert).toHaveBeenCalledWith('tidak ditemukan'))
  })

  it('menu kebab: Lihat hanya untuk artikel terbit', async () => {
    const { navigate } = await setup()
    await userEvent.click(screen.getByRole('button', { name: 'Aksi Artikel Draf' }))
    expect(screen.queryByRole('menuitem', { name: 'Lihat' })).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Aksi Artikel Draf' }))

    await userEvent.click(screen.getByRole('button', { name: 'Aksi Artikel Terbit' }))
    await userEvent.click(screen.getByRole('menuitem', { name: 'Lihat' }))
    expect(navigate).toHaveBeenCalledWith('/posts/artikel-terbit')
  })

  it('menu kebab: Ubah membuka modal dengan data lengkap; galat ditampilkan', async () => {
    await setup()
    getMyPost.mockResolvedValueOnce({ id: 2, title: 'Draf Lengkap' })
    await userEvent.click(screen.getByRole('button', { name: 'Aksi Artikel Draf' }))
    await userEvent.click(screen.getByRole('menuitem', { name: 'Ubah' }))
    expect(await screen.findByText('modal:Draf Lengkap')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'tutup-post' }))
    expect(screen.queryByTestId('post-modal')).not.toBeInTheDocument()

    getMyPost.mockRejectedValueOnce(new Error('bukan milik Anda'))
    await userEvent.click(screen.getByRole('button', { name: 'Aksi Artikel Draf' }))
    await userEvent.click(screen.getByRole('menuitem', { name: 'Ubah' }))
    await waitFor(() => expect(showErrorAlert).toHaveBeenCalledWith('bukan milik Anda'))
  })

  it('menu kebab: Hapus dengan konfirmasi (batal, sukses, galat)', async () => {
    await setup()
    const openDelete = async () => {
      await userEvent.click(screen.getByRole('button', { name: 'Aksi Artikel Draf' }))
      await userEvent.click(screen.getByRole('menuitem', { name: 'Hapus' }))
    }

    showConfirmDialog.mockResolvedValueOnce(false)
    await openDelete()
    expect(deletePost).not.toHaveBeenCalled()

    showConfirmDialog.mockResolvedValueOnce(true)
    deletePost.mockResolvedValueOnce({})
    await openDelete()
    await waitFor(() => expect(deletePost).toHaveBeenCalledWith(2))
    expect(showConfirmDialog).toHaveBeenCalledWith('Hapus artikel "Artikel Draf"?')
    await waitFor(() => expect(showSuccessAlert).toHaveBeenCalledWith('Artikel berhasil dihapus'))
    await waitFor(() => expect(listMyPosts).toHaveBeenCalledTimes(2))

    showConfirmDialog.mockResolvedValueOnce(true)
    deletePost.mockRejectedValueOnce(new Error('gagal hapus'))
    await openDelete()
    await waitFor(() => expect(showErrorAlert).toHaveBeenCalledWith('gagal hapus'))
  })

  it('Tambah Artikel membuka modal kosong; simpan menutup dan memuat ulang', async () => {
    await setup()
    await userEvent.click(screen.getByRole('button', { name: /Tambah Artikel/ }))
    expect(screen.getByText('modal:kosong')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'simpan-post' }))
    expect(screen.queryByTestId('post-modal')).not.toBeInTheDocument()
    await waitFor(() => expect(listMyPosts).toHaveBeenCalledTimes(2))
  })

  it('AI Generator: tutup, lalu terapkan draf membuka modal artikel terisi', async () => {
    await setup()
    await userEvent.click(screen.getByRole('button', { name: /AI Generator/ }))
    await userEvent.click(screen.getByRole('button', { name: 'tutup-ai' }))
    expect(screen.queryByTestId('ai-modal')).not.toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: /AI Generator/ }))
    await userEvent.click(screen.getByRole('button', { name: 'terapkan-ai' }))
    expect(screen.queryByTestId('ai-modal')).not.toBeInTheDocument()
    expect(screen.getByText('modal:Draf AI')).toBeInTheDocument()
  })
})
