import { useCallback, useEffect, useState } from 'react'
import Link from './components/Link.jsx'
import AdminDashboard from './features/admin/components/AdminDashboard.jsx'
import { logout } from './features/auth/api/authApi.js'
import AuthPage from './features/auth/components/AuthPage.jsx'
import AuthModal from './features/auth/modals/AuthModal.jsx'
import AuthorDashboard from './features/blog/components/AuthorDashboard.jsx'
import PublicArticleDetail from './features/blog/components/PublicArticleDetail.jsx'
import PublicArticleList from './features/blog/components/PublicArticleList.jsx'
import StickyNavbar from './features/blog/components/StickyNavbar.jsx'
import { clearSession, getUser, saveSession } from './helpers/apiHelper.js'
import useTheme from './hooks/useTheme.js'
import { homeFor, matchRoute, resolveRedirect } from './routes.js'

/**
 * Orkestrator SPA: routing berbasis path peramban (pushState + popstate),
 * sesi login, navbar sticky dan modal autentikasi.
 */
export default function App() {
  const [path, setPath] = useState(() => window.location.pathname)
  const [user, setUser] = useState(getUser)
  const [authModal, setAuthModal] = useState(null)
  const theme = useTheme()
  const dark = theme.theme === 'dark'

  const navigate = useCallback((to, replace) => {
    window.history[replace ? 'replaceState' : 'pushState'](null, '', to)
    setPath(to)
  }, [])

  useEffect(() => {
    const onPop = () => setPath(window.location.pathname)
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  useEffect(() => {
    const onExpired = () => {
      setUser(null)
      navigate('/login', true)
    }
    window.addEventListener('auth:expired', onExpired)
    return () => window.removeEventListener('auth:expired', onExpired)
  }, [navigate])

  const route = matchRoute(path)
  const redirect = resolveRedirect(route, user)

  useEffect(() => {
    if (redirect) navigate(redirect, true)
  }, [redirect, navigate])

  const handleAuthenticated = ({ token, user: u }) => {
    saveSession(token, u)
    setUser(u)
    setAuthModal(null)
    navigate(homeFor(u))
  }

  const handleLogout = async () => {
    try {
      await logout()
    } catch {
      // sesi lokal tetap dibersihkan walau server tidak dapat dihubungi
    }
    clearSession()
    setUser(null)
    navigate('/')
  }

  let page = null
  if (!redirect) {
    switch (route.name) {
      case 'public':
        page = <PublicArticleList navigate={navigate} />
        break
      case 'detail':
        page = <PublicArticleDetail slug={route.slug} navigate={navigate} dark={dark} />
        break
      case 'author':
        page = <AuthorDashboard navigate={navigate} dark={dark} />
        break
      case 'admin':
        page = <AdminDashboard />
        break
      case 'login':
      case 'register':
        page = <AuthPage mode={route.name} navigate={navigate} onAuthenticated={handleAuthenticated} />
        break
      default:
        page = (
          <section className="px-4 py-20 text-center">
            <h1 className="text-3xl font-extrabold">Halaman tidak ditemukan</h1>
            <Link to="/" navigate={navigate} className="mt-4 inline-block text-[var(--accent)] hover:underline">
              Kembali ke beranda
            </Link>
          </section>
        )
    }
  }

  return (
    <div className="min-h-screen">
      <StickyNavbar
        user={user}
        currentPath={path}
        navigate={navigate}
        theme={theme}
        onLogout={handleLogout}
        onOpenAuth={setAuthModal}
      />
      <main>{page}</main>
      {authModal && (
        <AuthModal mode={authModal} onClose={() => setAuthModal(null)} onAuthenticated={handleAuthenticated} />
      )}
    </div>
  )
}
