import AuthForm from './AuthForm.jsx'

/** Halaman autentikasi mandiri untuk rute /login dan /register. */
export default function AuthPage({ mode, navigate, onAuthenticated }) {
  const isLogin = mode === 'login'
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h1 className="mb-1 text-2xl font-bold">{isLogin ? 'Masuk ke Delcom Blog' : 'Buat Akun Penulis'}</h1>
        <p className="mb-6 text-sm text-slate-600 dark:text-slate-400">
          {isLogin ? 'Kelola artikel dan buat draf dengan AI.' : 'Mulai menulis dan menerbitkan artikel Anda.'}
        </p>
        <AuthForm
          mode={mode}
          onSuccess={onAuthenticated}
          onSwitch={(next) => navigate(next === 'login' ? '/login' : '/register')}
        />
      </div>
    </div>
  )
}
