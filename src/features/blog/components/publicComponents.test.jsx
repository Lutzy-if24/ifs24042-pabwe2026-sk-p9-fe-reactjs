import { act, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getPublicPost, listPublicPosts } from '../api/blogApi.js'
import PostStats from './PostStats.jsx'
import PublicArticleDetail from './PublicArticleDetail.jsx'
import PublicArticleList from './PublicArticleList.jsx'
import StickyNavbar from './StickyNavbar.jsx'

vi.mock('../api/blogApi.js', async (importOriginal) => ({
  ...(await importOriginal()),
  listPublicPosts: vi.fn(),
  getPublicPost: vi.fn(),
}))
vi.mock('../../../components/MarkdownViewer.jsx', () => ({
  default: ({ content, dark }) => <div data-testid="viewer">{`${content}|${dark}`}</div>,
}))

beforeEach(() => vi.clearAllMocks())

const post = (over = {}) => ({
  id: 1,
  title: 'Belajar Golang',
  slug: 'belajar-golang',
  category: 'Teknologi',
  excerpt: 'Ringkasan',
  cover_image_path: '',
  published_at: '2026-03-05T10:00:00Z',
  reading_time: 3,
  author: { id: 1, username: 'budi' },
  content: '# Isi',
  ...over,
})

// ---------- StickyNavbar ----------

describe('StickyNavbar', () => {
  const theme = (over = {}) => ({
    theme: 'light',
    accent: 'indigo',
    accents: ['indigo', 'emerald', 'rose'],
    toggleTheme: vi.fn(),
    setAccent: vi.fn(),
    ...over,
  })
  const props = (over = {}) => ({
    user: null,
    currentPath: '/',
    navigate: vi.fn(),
    theme: theme(),
    onLogout: vi.fn(),
    onOpenAuth: vi.fn(),
    ...over,
  })

  it('tamu: hanya Beranda, tombol Masuk/Daftar membuka modal auth', async () => {
    const p = props()
    render(<StickyNavbar {...p} />)
    expect(screen.queryByRole('link', { name: 'Workspace Penulis' })).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Masuk' }))
    expect(p.onOpenAuth).toHaveBeenLastCalledWith('login')
    await userEvent.click(screen.getByRole('button', { name: 'Daftar' }))
    expect(p.onOpenAuth).toHaveBeenLastCalledWith('register')
  })

  it('member: tampil workspace, nama pengguna, tombol Keluar; link aktif ditandai', async () => {
    const p = props({ user: { username: 'budi', role: 'member' }, currentPath: '/author' })
    render(<StickyNavbar {...p} />)
    expect(screen.getByRole('link', { name: 'Workspace Penulis' })).toHaveClass('text-[var(--accent)]')
    expect(screen.getByRole('link', { name: 'Beranda' })).not.toHaveClass('text-[var(--accent)]')
    expect(screen.queryByRole('link', { name: 'Admin' })).not.toBeInTheDocument()
    expect(screen.getByText('budi')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Keluar' }))
    expect(p.onLogout).toHaveBeenCalled()
  })

  it('admin: menu Admin tersedia dan navigasi berjalan', async () => {
    const p = props({ user: { username: 'admin', role: 'admin' } })
    render(<StickyNavbar {...p} />)
    await userEvent.click(screen.getByRole('link', { name: 'Admin' }))
    expect(p.navigate).toHaveBeenCalledWith('/admin')
  })

  it('tema dan aksen warna', async () => {
    const t = theme()
    const { rerender } = render(<StickyNavbar {...props({ theme: t })} />)
    await userEvent.click(screen.getByRole('button', { name: 'Ganti tema' }))
    expect(t.toggleTheme).toHaveBeenCalled()
    await userEvent.click(screen.getByRole('button', { name: 'Aksen emerald' }))
    expect(t.setAccent).toHaveBeenCalledWith('emerald')
    expect(screen.getByRole('button', { name: 'Aksen indigo' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'Aksen rose' })).toHaveClass('bg-rose-600')

    rerender(<StickyNavbar {...props({ theme: theme({ theme: 'dark', accent: 'rose' }) })} />)
    expect(screen.getByRole('button', { name: 'Aksen rose' })).toHaveAttribute('aria-pressed', 'true')
  })

  it('menu hamburger mobile: buka, navigasi menutup menu, tutup lewat tombol', async () => {
    const p = props({ user: { username: 'budi', role: 'member' } })
    render(<StickyNavbar {...p} />)
    expect(screen.queryByTestId('mobile-menu')).not.toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Menu' }))
    const menu = screen.getByTestId('mobile-menu')
    await userEvent.click(within(menu).getByRole('link', { name: 'Workspace Penulis' }))
    expect(p.navigate).toHaveBeenCalledWith('/author')
    expect(screen.queryByTestId('mobile-menu')).not.toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Menu' }))
    await userEvent.click(screen.getByRole('button', { name: 'Menu' }))
    expect(screen.queryByTestId('mobile-menu')).not.toBeInTheDocument()
  })
})

// ---------- PostStats ----------

describe('PostStats', () => {
  it('menampilkan 3 kartu dan memfilter saat diklik', async () => {
    const onSelect = vi.fn()
    render(<PostStats stats={{ total: 5, total_published: 3, total_draft: 2 }} active="published" onSelect={onSelect} />)
    expect(screen.getByText('5')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Total Terbit/ })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: /Total Artikel/ })).toHaveAttribute('aria-pressed', 'false')
    await userEvent.click(screen.getByRole('button', { name: /Belum Selesai/ }))
    expect(onSelect).toHaveBeenCalledWith('draft')
  })
})

// ---------- PublicArticleList ----------

describe('PublicArticleList', () => {
  it('memuat artikel, menampilkan kartu dan tautan detail', async () => {
    listPublicPosts.mockResolvedValue([post(), post({ id: 2, slug: 'b', title: 'Dua', cover_image_path: 'http://img/x.png' })])
    const navigate = vi.fn()
    render(<PublicArticleList navigate={navigate} />)
    expect(screen.getByText('Memuat artikel…')).toBeInTheDocument()

    expect(await screen.findByRole('link', { name: 'Belajar Golang' })).toHaveAttribute('href', '/posts/belajar-golang')
    expect(screen.getAllByText(/menit baca/)).toHaveLength(2)
    expect(screen.getByAltText('Dua')).toHaveAttribute('src', 'http://img/x.png')
    expect(screen.queryByAltText('Belajar Golang')).not.toBeInTheDocument()

    await userEvent.click(screen.getByRole('link', { name: 'Dua' }))
    expect(navigate).toHaveBeenCalledWith('/posts/b')
  })

  it('pencarian langsung dan filter kategori memicu permintaan baru', async () => {
    listPublicPosts.mockResolvedValue([post()])
    render(<PublicArticleList navigate={vi.fn()} />)
    await screen.findByText('Belajar Golang')
    expect(listPublicPosts).toHaveBeenLastCalledWith({ q: '', category: 'Semua' })

    await userEvent.type(screen.getByLabelText('Cari artikel'), 'go')
    await waitFor(() => expect(listPublicPosts).toHaveBeenLastCalledWith({ q: 'go', category: 'Semua' }))

    await userEvent.click(screen.getByRole('button', { name: 'Bisnis' }))
    await waitFor(() => expect(listPublicPosts).toHaveBeenLastCalledWith({ q: 'go', category: 'Bisnis' }))
    expect(screen.getByRole('button', { name: 'Bisnis' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'Semua' })).toHaveAttribute('aria-pressed', 'false')
  })

  it('keadaan kosong dan galat (galat hilang setelah berhasil)', async () => {
    listPublicPosts.mockResolvedValueOnce([])
    render(<PublicArticleList navigate={vi.fn()} />)
    expect(await screen.findByText('Belum ada artikel yang cocok.')).toBeInTheDocument()

    listPublicPosts.mockRejectedValueOnce(new Error('server mati'))
    await userEvent.click(screen.getByRole('button', { name: 'Opini' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('server mati')

    listPublicPosts.mockResolvedValueOnce([post()])
    await userEvent.click(screen.getByRole('button', { name: 'Umum' }))
    expect(await screen.findByText('Belajar Golang')).toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('mengabaikan respons basi saat filter sudah berganti', async () => {
    let resolveStale
    listPublicPosts.mockImplementationOnce(() => new Promise((r) => (resolveStale = r)))
    listPublicPosts.mockResolvedValue([post({ title: 'Terbaru' })])
    render(<PublicArticleList navigate={vi.fn()} />)

    await waitFor(() => expect(listPublicPosts).toHaveBeenCalledTimes(1))
    await userEvent.click(screen.getByRole('button', { name: 'Bisnis' }))
    await screen.findByText('Terbaru')

    await act(async () => resolveStale([post({ title: 'Basi' })]))
    expect(screen.queryByText('Basi')).not.toBeInTheDocument()
  })
})

// ---------- PublicArticleDetail ----------

describe('PublicArticleDetail', () => {
  it('menampilkan artikel lengkap dengan viewer Markdown', async () => {
    getPublicPost.mockResolvedValue(post({ cover_image_path: 'http://img/c.png' }))
    const navigate = vi.fn()
    render(<PublicArticleDetail slug="belajar-golang" navigate={navigate} dark />)
    expect(screen.getByText('Memuat artikel…')).toBeInTheDocument()

    expect(await screen.findByRole('heading', { name: 'Belajar Golang' })).toBeInTheDocument()
    expect(screen.getByText('Oleh budi')).toBeInTheDocument()
    expect(screen.getByText(/3 menit baca/)).toBeInTheDocument()
    expect(screen.getByAltText('Belajar Golang')).toBeInTheDocument()
    expect(screen.getByTestId('viewer')).toHaveTextContent('# Isi|true')
    expect(getPublicPost).toHaveBeenCalledWith('belajar-golang')

    await userEvent.click(screen.getByRole('link', { name: /Kembali ke beranda/ }))
    expect(navigate).toHaveBeenCalledWith('/')
  })

  it('tanpa gambar sampul', async () => {
    getPublicPost.mockResolvedValue(post())
    render(<PublicArticleDetail slug="x" navigate={vi.fn()} dark={false} />)
    await screen.findByRole('heading', { name: 'Belajar Golang' })
    expect(screen.queryByAltText('Belajar Golang')).not.toBeInTheDocument()
  })

  it('artikel tidak ditemukan', async () => {
    getPublicPost.mockRejectedValue(new Error('artikel tidak ditemukan'))
    render(<PublicArticleDetail slug="hilang" navigate={vi.fn()} dark={false} />)
    expect(await screen.findByRole('alert')).toHaveTextContent('artikel tidak ditemukan')
    expect(screen.getByRole('link', { name: /Kembali ke beranda/ })).toBeInTheDocument()
  })

  it('mengabaikan respons basi saat slug berganti', async () => {
    let resolveStale
    getPublicPost.mockImplementationOnce(() => new Promise((r) => (resolveStale = r)))
    getPublicPost.mockResolvedValue(post({ title: 'Slug Baru' }))
    const { rerender } = render(<PublicArticleDetail slug="lama" navigate={vi.fn()} dark={false} />)
    rerender(<PublicArticleDetail slug="baru" navigate={vi.fn()} dark={false} />)
    await screen.findByRole('heading', { name: 'Slug Baru' })

    await act(async () => resolveStale(post({ title: 'Slug Lama' })))
    expect(screen.queryByRole('heading', { name: 'Slug Lama' })).not.toBeInTheDocument()
  })
})
