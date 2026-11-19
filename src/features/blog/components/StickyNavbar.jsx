import { useState } from 'react'
import { IconMenu2, IconMoon, IconSun, IconX } from '@tabler/icons-react'
import Link from '../../../components/Link.jsx'

/** Navbar atas yang menempel (sticky) untuk seluruh halaman, tanpa sidebar. */
export default function StickyNavbar({ user, currentPath, navigate, theme, onLogout, onOpenAuth }) {
  const [menuOpen, setMenuOpen] = useState(false)

  const go = (to) => {
    setMenuOpen(false)
    navigate(to)
  }

  const links = [{ to: '/', label: 'Beranda' }]
  if (user) links.push({ to: '/author', label: 'Workspace Penulis' })
  if (user?.role === 'admin') links.push({ to: '/admin', label: 'Admin' })

  const navLinks = links.map((l) => (
    <Link
      key={l.to}
      to={l.to}
      navigate={go}
      className={`rounded-md px-3 py-2 text-sm font-medium ${
        currentPath === l.to
          ? 'bg-[var(--accent-soft)] text-[var(--accent)]'
          : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
      }`}
    >
      {l.label}
    </Link>
  ))

  const actions = user ? (
    <>
      <span className="text-sm text-slate-600 dark:text-slate-300">
        Halo, <strong>{user.username}</strong>
      </span>
      <button
        type="button"
        onClick={onLogout}
        className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium hover:bg-slate-100 dark:border-slate-600 dark:hover:bg-slate-800"
      >
        Keluar
      </button>
    </>
  ) : (
    <>
      <button
        type="button"
        onClick={() => onOpenAuth('login')}
        className="rounded-md px-3 py-1.5 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800"
      >
        Masuk
      </button>
      <button
        type="button"
        onClick={() => onOpenAuth('register')}
        className="rounded-md bg-[var(--accent)] px-3 py-1.5 text-sm font-semibold text-white hover:opacity-90"
      >
        Daftar
      </button>
    </>
  )

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-900/90">
      <div className="mx-auto flex h-16 w-full max-w-[96rem] items-center justify-between gap-4 px-4">
        <div className="flex items-center gap-6">
          <Link to="/" navigate={go} className="text-lg font-extrabold text-[var(--accent)]">
            Delcom Blog
          </Link>
          <nav className="hidden items-center gap-1 md:flex">{navLinks}</nav>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-1.5 sm:flex" role="group" aria-label="Aksen warna">
            {theme.accents.map((a) => (
              <button
                key={a}
                type="button"
                aria-label={`Aksen ${a}`}
                aria-pressed={theme.accent === a}
                onClick={() => theme.setAccent(a)}
                data-accent={a}
                className={`h-4 w-4 rounded-full border-2 ${
                  theme.accent === a ? 'border-slate-900 dark:border-white' : 'border-transparent'
                } ${a === 'indigo' ? 'bg-indigo-600' : a === 'emerald' ? 'bg-emerald-600' : 'bg-rose-600'}`}
              />
            ))}
          </div>
          <button
            type="button"
            aria-label="Ganti tema"
            onClick={theme.toggleTheme}
            className="rounded-md p-2 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            {theme.theme === 'dark' ? <IconSun size={18} /> : <IconMoon size={18} />}
          </button>
          <div className="hidden items-center gap-2 md:flex">{actions}</div>
          <button
            type="button"
            aria-label="Menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((o) => !o)}
            className="rounded-md p-2 hover:bg-slate-100 md:hidden dark:hover:bg-slate-800"
          >
            {menuOpen ? <IconX size={20} /> : <IconMenu2 size={20} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div data-testid="mobile-menu" className="space-y-2 border-t border-slate-200 px-4 py-3 md:hidden dark:border-slate-800">
          <nav className="flex flex-col gap-1">{navLinks}</nav>
          <div className="flex items-center gap-2">{actions}</div>
        </div>
      )}
    </header>
  )
}
