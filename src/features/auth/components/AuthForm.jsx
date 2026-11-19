import { useState } from 'react'
import useInput from '../../../hooks/useInput.js'
import { login, register } from '../api/authApi.js'

const inputClass =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/30 dark:border-slate-600 dark:bg-slate-800'

/**
 * Form login/registrasi bersama (dipakai AuthPage dan AuthModal).
 * Id wajib mode login: login-username, login-password, login-submit.
 */
export default function AuthForm({ mode, onSuccess, onSwitch }) {
  const isLogin = mode === 'login'
  const [username, onUsername] = useInput()
  const [email, onEmail] = useInput()
  const [password, onPassword] = useInput()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (!isLogin) await register(username, email, password)
      onSuccess(await login(username, password))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      {error && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {error}
        </p>
      )}

      <div>
        <label htmlFor={`${mode}-username`} className="mb-1 block text-sm font-medium">
          {isLogin ? 'Username atau Email' : 'Username'}
        </label>
        <input id={`${mode}-username`} value={username} onChange={onUsername} required className={inputClass} />
      </div>

      {!isLogin && (
        <div>
          <label htmlFor="register-email" className="mb-1 block text-sm font-medium">
            Email
          </label>
          <input id="register-email" type="email" value={email} onChange={onEmail} required className={inputClass} />
        </div>
      )}

      <div>
        <label htmlFor={`${mode}-password`} className="mb-1 block text-sm font-medium">
          Password
        </label>
        <input
          id={`${mode}-password`}
          type="password"
          value={password}
          onChange={onPassword}
          required
          className={inputClass}
        />
      </div>

      <button
        id={`${mode}-submit`}
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
      >
        {isLogin ? 'Masuk' : 'Daftar'}
      </button>

      <p className="text-center text-sm text-slate-600 dark:text-slate-400">
        {isLogin ? 'Belum punya akun?' : 'Sudah punya akun?'}{' '}
        <button
          type="button"
          onClick={() => onSwitch(isLogin ? 'register' : 'login')}
          className="font-semibold text-[var(--accent)] hover:underline"
        >
          {isLogin ? 'Daftar' : 'Masuk'}
        </button>
      </p>
    </form>
  )
}
