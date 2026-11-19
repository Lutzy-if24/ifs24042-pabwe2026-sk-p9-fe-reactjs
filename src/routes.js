/** Memetakan path peramban ke nama rute SPA. */
export function matchRoute(path) {
  if (path === '/' || path === '/public') return { name: 'public' }
  if (path === '/author') return { name: 'author' }
  if (path === '/admin') return { name: 'admin' }
  if (path === '/login') return { name: 'login' }
  if (path === '/register') return { name: 'register' }
  const detail = path.match(/^\/posts\/([^/]+)$/)
  if (detail) return { name: 'detail', slug: decodeURIComponent(detail[1]) }
  return { name: 'notfound' }
}

export const homeFor = (user) => (user.role === 'admin' ? '/admin' : '/author')

/** Mengembalikan path tujuan bila rute perlu dialihkan, atau null bila boleh ditampilkan. */
export function resolveRedirect(route, user) {
  if (route.name === 'author') return user ? null : '/login'
  if (route.name === 'admin') {
    if (!user) return '/login'
    return user.role === 'admin' ? null : '/author'
  }
  if (route.name === 'login' || route.name === 'register') return user ? homeFor(user) : null
  return null
}
