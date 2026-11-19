import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { login, register } from './api/authApi.js'
import AuthForm from './components/AuthForm.jsx'
import AuthPage from './components/AuthPage.jsx'
import AuthModal from './modals/AuthModal.jsx'

vi.mock('./api/authApi.js', () => ({ login: vi.fn(), register: vi.fn() }))

const session = { token: 't', user: { id: 1, username: 'budi', role: 'member' } }

beforeEach(() => vi.clearAllMocks())

describe('AuthForm', () => {
  it('login: id wajib tersedia dan sukses memanggil onSuccess', async () => {
    login.mockResolvedValue(session)
    const onSuccess = vi.fn()
    render(<AuthForm mode="login" onSuccess={onSuccess} onSwitch={() => {}} />)

    expect(document.getElementById('login-username')).toBeInTheDocument()
    expect(document.getElementById('login-password')).toBeInTheDocument()
    expect(document.getElementById('login-submit')).toBeInTheDocument()
    expect(screen.queryByLabelText('Email')).not.toBeInTheDocument()

    await userEvent.type(document.getElementById('login-username'), 'budi')
    await userEvent.type(document.getElementById('login-password'), 'rahasia1')
    await userEvent.click(document.getElementById('login-submit'))

    await waitFor(() => expect(onSuccess).toHaveBeenCalledWith(session))
    expect(login).toHaveBeenCalledWith('budi', 'rahasia1')
    expect(register).not.toHaveBeenCalled()
  })

  it('login gagal menampilkan pesan galat lalu hilang saat submit ulang berhasil', async () => {
    login.mockRejectedValueOnce(new Error('username atau password salah')).mockResolvedValueOnce(session)
    const onSuccess = vi.fn()
    render(<AuthForm mode="login" onSuccess={onSuccess} onSwitch={() => {}} />)

    await userEvent.type(document.getElementById('login-username'), 'budi')
    await userEvent.type(document.getElementById('login-password'), 'salah')
    await userEvent.click(document.getElementById('login-submit'))
    expect(await screen.findByRole('alert')).toHaveTextContent('username atau password salah')
    expect(onSuccess).not.toHaveBeenCalled()

    await userEvent.click(document.getElementById('login-submit'))
    await waitFor(() => expect(onSuccess).toHaveBeenCalled())
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('register: mendaftar lalu login otomatis', async () => {
    register.mockResolvedValue({})
    login.mockResolvedValue(session)
    const onSuccess = vi.fn()
    render(<AuthForm mode="register" onSuccess={onSuccess} onSwitch={() => {}} />)

    await userEvent.type(document.getElementById('register-username'), 'budi')
    await userEvent.type(screen.getByLabelText('Email'), 'budi@mail.id')
    await userEvent.type(document.getElementById('register-password'), 'rahasia1')
    await userEvent.click(document.getElementById('register-submit'))

    await waitFor(() => expect(onSuccess).toHaveBeenCalledWith(session))
    expect(register).toHaveBeenCalledWith('budi', 'budi@mail.id', 'rahasia1')
    expect(login).toHaveBeenCalledWith('budi', 'rahasia1')
  })

  it('register gagal (username terpakai) tidak melanjutkan ke login', async () => {
    register.mockRejectedValue(new Error('username atau email sudah terdaftar'))
    render(<AuthForm mode="register" onSuccess={vi.fn()} onSwitch={() => {}} />)
    await userEvent.type(document.getElementById('register-username'), 'budi')
    await userEvent.type(screen.getByLabelText('Email'), 'budi@mail.id')
    await userEvent.type(document.getElementById('register-password'), 'rahasia1')
    await userEvent.click(document.getElementById('register-submit'))
    expect(await screen.findByRole('alert')).toHaveTextContent('sudah terdaftar')
    expect(login).not.toHaveBeenCalled()
  })

  it('tombol pindah mode memanggil onSwitch', async () => {
    const onSwitch = vi.fn()
    const { rerender } = render(<AuthForm mode="login" onSuccess={vi.fn()} onSwitch={onSwitch} />)
    await userEvent.click(screen.getByRole('button', { name: 'Daftar' }))
    expect(onSwitch).toHaveBeenLastCalledWith('register')

    rerender(<AuthForm mode="register" onSuccess={vi.fn()} onSwitch={onSwitch} />)
    await userEvent.click(screen.getByRole('button', { name: 'Masuk' }))
    expect(onSwitch).toHaveBeenLastCalledWith('login')
  })
})

describe('AuthPage', () => {
  it('mode login dan pindah ke /register', async () => {
    const navigate = vi.fn()
    render(<AuthPage mode="login" navigate={navigate} onAuthenticated={vi.fn()} />)
    expect(screen.getByRole('heading', { name: 'Masuk ke Delcom Blog' })).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Daftar' }))
    expect(navigate).toHaveBeenCalledWith('/register')
  })

  it('mode register dan pindah ke /login', async () => {
    const navigate = vi.fn()
    render(<AuthPage mode="register" navigate={navigate} onAuthenticated={vi.fn()} />)
    expect(screen.getByRole('heading', { name: 'Buat Akun Penulis' })).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Masuk' }))
    expect(navigate).toHaveBeenCalledWith('/login')
  })
})

describe('AuthModal', () => {
  it('berpindah mode di dalam modal, menutup lewat tombol X dan backdrop', async () => {
    const onClose = vi.fn()
    render(<AuthModal mode="login" onClose={onClose} onAuthenticated={vi.fn()} />)
    expect(screen.getByRole('heading', { name: 'Masuk' })).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Daftar' }))
    expect(screen.getByRole('heading', { name: 'Daftar Akun' })).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Tutup' }))
    await userEvent.click(screen.getByTestId('auth-backdrop'))
    expect(onClose).toHaveBeenCalledTimes(2)
  })

  it('login sukses meneruskan sesi', async () => {
    login.mockResolvedValue(session)
    const onAuthenticated = vi.fn()
    render(<AuthModal mode="login" onClose={vi.fn()} onAuthenticated={onAuthenticated} />)
    await userEvent.type(document.getElementById('login-username'), 'budi')
    await userEvent.type(document.getElementById('login-password'), 'rahasia1')
    await userEvent.click(document.getElementById('login-submit'))
    await waitFor(() => expect(onAuthenticated).toHaveBeenCalledWith(session))
  })
})
