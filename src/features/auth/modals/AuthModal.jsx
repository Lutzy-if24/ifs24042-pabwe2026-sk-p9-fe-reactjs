import { useState } from 'react'
import { IconX } from '@tabler/icons-react'
import AuthForm from '../components/AuthForm.jsx'

/** Modal popup autentikasi; id wajib login: login-username, login-password, login-submit. */
export default function AuthModal({ mode: initialMode, onClose, onAuthenticated }) {
  const [mode, setMode] = useState(initialMode)
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div data-testid="auth-backdrop" className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl dark:bg-slate-900">
        <div className="flex items-center justify-between bg-[var(--accent)] px-6 py-4 text-white">
          <h2 className="text-lg font-semibold">{mode === 'login' ? 'Masuk' : 'Daftar Akun'}</h2>
          <button type="button" aria-label="Tutup" onClick={onClose} className="rounded p-1 hover:bg-white/20">
            <IconX size={20} />
          </button>
        </div>
        <div className="p-6">
          <AuthForm mode={mode} onSuccess={onAuthenticated} onSwitch={setMode} />
        </div>
      </div>
    </div>
  )
}
