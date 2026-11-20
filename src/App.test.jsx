import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App.jsx'
import { login, logout } from './features/auth/api/authApi.js'
import { getToken, saveSession } from './helpers/apiHelper.js'

vi.mock('./features/auth/api/authApi.js', () => ({ login: vi.fn(), register: vi.fn(), logout: vi.fn() }))
vi.mock('./features/blog/components/PublicArticleList.jsx', () => ({ default: () => <div>stub-public</div> }))
vi.mock('./features/blog/components/PublicArticleDetail.jsx', () => ({
  default: ({ slug, dark }) => <div>{`stub-detail:${slug}:${dark}`}</div>,
}))
vi.mock('./features/blog/components/AuthorDashboard.jsx', () => ({ default: () => <div>stub-author</div> }))
vi.mock('./features/admin/components/AdminDashboard.jsx', () => ({ default: () => <div>stub-admin</div> }))

const member = { id: 2, username: 'budi', role: 'member' }
const admin = { id: 1, username: 'admin', role: 'admin' }
const at = (path) => window.history.pushState({}, '', path)
const fillLogin = async () => {
  await userEvent.type(document.getElementById('login-username'), 'u')
  await userEvent.type(document.getElementById('login-password'), 'p')
  await userEvent.click(document.getElementById('login-submit'))
}

beforeEach(() => {
  vi.clearAllMocks()
  at('/')
})

describe('App routing', () => {
  it('beranda publik untuk tamu', () => {
    render(<App />)
    expect(screen.getByText('stub-public')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Masuk' })).toBeInTheDocument()
  })

  it('/posts/:slug menerima slug dan status tema', async () => {
    at('/posts/halo-dunia')
    render(<App />)
    expect(await screen.findByText('stub-detail:halo-dunia:false')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Ganti tema' }))
    expect(await screen.findByText('stub-detail:halo-dunia:true')).toBeInTheDocument()
    expect(document.documentElement).toHaveClass('dark')
  })

  it('rute tidak dikenal menampilkan halaman 404 dengan tautan pulang', async () => {
    at('/tidak-ada')
    render(<App />)
    expect(screen.getByRole('heading', { name: 'Halaman tidak ditemukan' })).toBeInTheDocument()
    await userEvent.click(screen.getByRole('link', { name: 'Kembali ke beranda' }))
    expect(screen.getByText('stub-public')).toBeInTheDocument()
    expect(window.location.pathname).toBe('/')
  })

  it('/author tanpa login dialihkan ke /login', () => {
    at('/author')
    render(<App />)
    expect(window.location.pathname).toBe('/login')
    expect(screen.getByRole('heading', { name: 'Masuk ke Delcom Blog' })).toBeInTheDocument()
  })

  it('/admin oleh member dialihkan ke /author; oleh admin ditampilkan', async () => {
    saveSession('t', member)
    at('/admin')
    const { unmount } = render(<App />)
    expect(window.location.pathname).toBe('/author')
    expect(await screen.findByText('stub-author')).toBeInTheDocument()
    unmount()

    saveSession('t', admin)
    at('/admin')
    render(<App />)
    expect(await screen.findByText('stub-admin')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Admin' })).toBeInTheDocument()
  })

  it('pengguna yang sudah login membuka /register dialihkan ke beranda kerjanya', async () => {
    saveSession('t', admin)
    at('/register')
    render(<App />)
    expect(window.location.pathname).toBe('/admin')
    expect(await screen.findByText('stub-admin')).toBeInTheDocument()
  })

  it('tombol back/forward peramban (popstate) mengganti halaman', async () => {
    saveSession('t', member)
    render(<App />)
    expect(screen.getByText('stub-public')).toBeInTheDocument()
    at('/author')
    act(() => {
      window.dispatchEvent(new PopStateEvent('popstate'))
    })
    expect(await screen.findByText('stub-author')).toBeInTheDocument()
  })

  it('sesi kedaluwarsa (auth:expired) mengeluarkan pengguna ke /login', async () => {
    saveSession('t', member)
    at('/author')
    render(<App />)
    expect(await screen.findByText('stub-author')).toBeInTheDocument()
    act(() => {
      window.dispatchEvent(new Event('auth:expired'))
    })
    expect(window.location.pathname).toBe('/login')
    expect(await screen.findByRole('heading', { name: 'Masuk ke Delcom Blog' })).toBeInTheDocument()
  })
})

describe('App autentikasi', () => {
  it('login lewat modal navbar: sesi tersimpan, modal tertutup, menuju workspace', async () => {
    login.mockResolvedValue({ token: 'tok', user: member })
    render(<App />)
    await userEvent.click(screen.getByRole('button', { name: 'Masuk' }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    await fillLogin()

    expect(await screen.findByText('stub-author')).toBeInTheDocument()
    expect(getToken()).toBe('tok')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(window.location.pathname).toBe('/author')
    expect(screen.getByText('budi')).toBeInTheDocument()
  })

  it('modal dapat ditutup dan tombol Daftar membuka mode registrasi', async () => {
    render(<App />)
    await userEvent.click(screen.getByRole('button', { name: 'Daftar' }))
    expect(screen.getByRole('heading', { name: 'Daftar Akun' })).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Tutup' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('login lewat halaman /login oleh admin menuju /admin', async () => {
    login.mockResolvedValue({ token: 'tok', user: admin })
    at('/login')
    render(<App />)
    await fillLogin()
    expect(await screen.findByText('stub-admin')).toBeInTheDocument()
    expect(window.location.pathname).toBe('/admin')
  })

  it('logout membersihkan sesi dan kembali ke beranda', async () => {
    logout.mockResolvedValue({})
    saveSession('tok', member)
    at('/author')
    render(<App />)
    expect(await screen.findByText('stub-author')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Keluar' }))
    await waitFor(() => expect(screen.getByText('stub-public')).toBeInTheDocument())
    expect(logout).toHaveBeenCalled()
    expect(getToken()).toBeNull()
    expect(window.location.pathname).toBe('/')
  })

  it('logout tetap membersihkan sesi walau server gagal', async () => {
    logout.mockRejectedValue(new Error('offline'))
    saveSession('tok', member)
    render(<App />)
    await userEvent.click(screen.getByRole('button', { name: 'Keluar' }))
    await waitFor(() => expect(getToken()).toBeNull())
    expect(screen.getByRole('button', { name: 'Masuk' })).toBeInTheDocument()
  })
})