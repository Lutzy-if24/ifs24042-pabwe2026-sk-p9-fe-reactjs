import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { showErrorAlert, showSuccessAlert } from '../../../helpers/toolsHelper.js'
import { createPost, EMPTY_POST, generateWithAi, updatePost } from '../api/blogApi.js'
import AiPostGeneratorModal from './AiPostGeneratorModal.jsx'
import PostModal from './PostModal.jsx'

vi.mock('../api/blogApi.js', async (importOriginal) => ({
  ...(await importOriginal()),
  createPost: vi.fn(),
  updatePost: vi.fn(),
  generateWithAi: vi.fn(),
}))
vi.mock('../../../helpers/toolsHelper.js', () => ({ showErrorAlert: vi.fn(), showSuccessAlert: vi.fn() }))
vi.mock('../../../components/MarkdownEditor.jsx', () => ({
  default: ({ value, onChange, dark }) => (
    <textarea aria-label="editor" data-dark={String(dark)} value={value} onChange={(e) => onChange(e.target.value)} />
  ),
}))
vi.mock('../../../components/MarkdownViewer.jsx', () => ({
  default: ({ content }) => <div data-testid="viewer">{content}</div>,
}))

beforeEach(() => vi.clearAllMocks())

describe('PostModal', () => {
  const setup = (post = EMPTY_POST) => {
    const onClose = vi.fn()
    const onSaved = vi.fn()
    render(<PostModal post={post} dark onClose={onClose} onSaved={onSaved} />)
    return { onClose, onSaved }
  }

  it('membuat artikel baru dengan seluruh field dan terbit langsung', async () => {
    createPost.mockResolvedValue({})
    const { onSaved } = setup()
    expect(screen.getByRole('heading', { name: 'Tambah Artikel' })).toBeInTheDocument()
    expect(screen.getByLabelText('editor')).toHaveAttribute('data-dark', 'true')

    await userEvent.type(screen.getByLabelText('Judul'), '  Judul Baru ')
    await userEvent.selectOptions(screen.getByLabelText('Kategori'), 'Bisnis')
    await userEvent.type(screen.getByLabelText('Ringkasan (excerpt)'), 'ringkas')
    await userEvent.type(screen.getByLabelText('URL Gambar Sampul'), 'http://img/c.png')
    await userEvent.type(screen.getByLabelText('editor'), 'isi')
    await userEvent.click(screen.getByLabelText('Terbitkan langsung'))
    await userEvent.click(screen.getByRole('button', { name: 'Simpan' }))

    await waitFor(() => expect(onSaved).toHaveBeenCalled())
    expect(createPost).toHaveBeenCalledWith({
      title: 'Judul Baru',
      category: 'Bisnis',
      excerpt: 'ringkas',
      content: 'isi',
      cover_image_path: 'http://img/c.png',
      is_published: true,
    })
    expect(showSuccessAlert).toHaveBeenCalledWith('Artikel berhasil dibuat')
  })

  it('validasi: judul atau konten kosong ditolak, galat hilang setelah valid', async () => {
    createPost.mockResolvedValue({})
    const { onSaved } = setup()

    await userEvent.click(screen.getByRole('button', { name: 'Simpan' }))
    expect(screen.getByRole('alert')).toHaveTextContent('Judul dan konten wajib diisi')

    await userEvent.type(screen.getByLabelText('Judul'), 'Ada judul')
    await userEvent.click(screen.getByRole('button', { name: 'Simpan' }))
    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(createPost).not.toHaveBeenCalled()

    await userEvent.type(screen.getByLabelText('editor'), 'isi')
    await userEvent.click(screen.getByRole('button', { name: 'Simpan' }))
    await waitFor(() => expect(onSaved).toHaveBeenCalled())
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(createPost.mock.calls[0][0].is_published).toBe(false)
  })

  it('mode ubah memakai updatePost tanpa opsi terbit langsung', async () => {
    updatePost.mockResolvedValue({})
    const { onSaved } = setup({ id: 7, title: 'Lama', category: 'Opini', excerpt: 'e', content: 'c', cover_image_path: '' })
    expect(screen.getByRole('heading', { name: 'Ubah Artikel' })).toBeInTheDocument()
    expect(screen.queryByLabelText('Terbitkan langsung')).not.toBeInTheDocument()
    expect(screen.getByLabelText('Judul')).toHaveValue('Lama')

    await userEvent.click(screen.getByRole('button', { name: 'Simpan' }))
    await waitFor(() => expect(onSaved).toHaveBeenCalled())
    expect(updatePost).toHaveBeenCalledWith(7, {
      title: 'Lama', category: 'Opini', excerpt: 'e', content: 'c', cover_image_path: '',
    })
    expect(showSuccessAlert).toHaveBeenCalledWith('Artikel berhasil diperbarui')
  })

  it('galat server ditampilkan dan tombol aktif kembali', async () => {
    createPost.mockRejectedValue(new Error('kategori tidak valid'))
    const { onSaved } = setup({ ...EMPTY_POST, title: 'J', content: 'C' })
    await userEvent.click(screen.getByRole('button', { name: 'Simpan' }))
    await waitFor(() => expect(showErrorAlert).toHaveBeenCalledWith('kategori tidak valid'))
    expect(onSaved).not.toHaveBeenCalled()
    expect(screen.getByRole('button', { name: 'Simpan' })).toBeEnabled()
  })

  it('menampilkan status menyimpan saat proses berjalan', async () => {
    let finish
    createPost.mockImplementation(() => new Promise((r) => (finish = r)))
    setup({ ...EMPTY_POST, title: 'J', content: 'C' })
    await userEvent.click(screen.getByRole('button', { name: 'Simpan' }))
    expect(screen.getByRole('button', { name: 'Menyimpan…' })).toBeDisabled()
    await act(async () => finish({}))
  })

  it('Batal dan tombol X menutup modal', async () => {
    const { onClose } = setup()
    await userEvent.click(screen.getByRole('button', { name: 'Batal' }))
    await userEvent.click(screen.getByRole('button', { name: 'Tutup' }))
    expect(onClose).toHaveBeenCalledTimes(2)
  })
})

describe('AiPostGeneratorModal', () => {
  const result = (over = {}) => ({
    title: 'Judul AI',
    category: 'Teknologi',
    excerpt: 'Ringkasan AI',
    content: '## Isi AI',
    sources: [{ title: 'Sumber A', url: 'https://a.id', snippet: 's' }],
    used_web_search: true,
    ...over,
  })
  const setup = () => {
    const onClose = vi.fn()
    const onApply = vi.fn()
    render(<AiPostGeneratorModal dark={false} onClose={onClose} onApply={onApply} />)
    return { onClose, onApply }
  }

  it('topik terlalu pendek ditolak', async () => {
    setup()
    await userEvent.type(screen.getByLabelText('Topik artikel'), 'ab')
    await userEvent.click(screen.getByRole('button', { name: 'Buat Draf' }))
    expect(screen.getByRole('alert')).toHaveTextContent('Topik minimal 3 karakter')
    expect(generateWithAi).not.toHaveBeenCalled()
  })

  it('menghasilkan draf dengan sumber & peringatan lalu menerapkannya', async () => {
    generateWithAi.mockResolvedValue(result({ search_warning: 'Penelusuran web gagal' }))
    const { onApply } = setup()

    await userEvent.type(screen.getByLabelText('Topik artikel'), '  Masa depan AI ')
    await userEvent.selectOptions(screen.getByLabelText('Kategori'), 'Opini')
    await userEvent.click(screen.getByRole('button', { name: 'Buat Draf' }))

    expect(await screen.findByRole('heading', { name: 'Judul AI' })).toBeInTheDocument()
    expect(generateWithAi).toHaveBeenCalledWith({ topic: 'Masa depan AI', category: 'Opini', include_web_search: true })
    expect(screen.getByRole('status')).toHaveTextContent('Penelusuran web gagal')
    expect(screen.getByTestId('viewer')).toHaveTextContent('## Isi AI')
    expect(screen.getByRole('link', { name: 'Sumber A' })).toHaveAttribute('href', 'https://a.id')
    expect(screen.getByRole('button', { name: 'Buat Ulang' })).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Gunakan Draf' }))
    expect(onApply).toHaveBeenCalledWith({
      title: 'Judul AI',
      category: 'Teknologi',
      excerpt: 'Ringkasan AI',
      content: '## Isi AI',
      cover_image_path: '',
    })
  })

  it('tanpa penelusuran web: tidak ada sumber maupun peringatan', async () => {
    generateWithAi.mockResolvedValue(result({ sources: [], used_web_search: false }))
    setup()
    await userEvent.type(screen.getByLabelText('Topik artikel'), 'Topik biasa')
    await userEvent.click(screen.getByLabelText(/Sertakan penelusuran/))
    await userEvent.click(screen.getByRole('button', { name: 'Buat Draf' }))

    await screen.findByRole('heading', { name: 'Judul AI' })
    expect(generateWithAi).toHaveBeenCalledWith({ topic: 'Topik biasa', category: '', include_web_search: false })
    expect(screen.queryByText('Sumber Rujukan Mesin Pencari')).not.toBeInTheDocument()
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('menampilkan status loading dan galat dari server', async () => {
    let fail
    generateWithAi.mockImplementation(() => new Promise((_, reject) => (fail = reject)))
    setup()
    await userEvent.type(screen.getByLabelText('Topik artikel'), 'Topik biasa')
    await userEvent.click(screen.getByRole('button', { name: 'Buat Draf' }))
    expect(screen.getByRole('button', { name: 'Membuat artikel…' })).toBeDisabled()

    await act(async () => fail(new Error('layanan AI sedang tidak tersedia')))
    expect(showErrorAlert).toHaveBeenCalledWith('layanan AI sedang tidak tersedia')
    expect(screen.getByRole('button', { name: 'Buat Draf' })).toBeEnabled()
    expect(screen.queryByRole('button', { name: 'Gunakan Draf' })).not.toBeInTheDocument()
  })

  it('Batal dan tombol X menutup modal', async () => {
    const { onClose } = setup()
    await userEvent.click(screen.getByRole('button', { name: 'Batal' }))
    await userEvent.click(screen.getByRole('button', { name: 'Tutup' }))
    expect(onClose).toHaveBeenCalledTimes(2)
  })
})
