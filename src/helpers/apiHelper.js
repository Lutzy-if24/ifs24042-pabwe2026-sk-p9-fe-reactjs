const TOKEN_KEY = 'delcom_token'
const USER_KEY = 'delcom_user'

export class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export const getToken = () => localStorage.getItem(TOKEN_KEY)

export const getUser = () => {
  const raw = localStorage.getItem(USER_KEY)
  return raw ? JSON.parse(raw) : null
}

export const saveSession = (token, user) => {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export const clearSession = () => {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

/**
 * Wrapper fetch terpusat. Menyuntikkan Bearer token, mem-parsing envelope
 * {status, message, data} dan melempar ApiError bila status bukan "success".
 * Token yang ditolak server (401) menghapus sesi dan memicu event "auth:expired".
 */
export async function apiRequest(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { Accept: 'application/json' }
  const token = getToken()
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  if (auth && token) headers.Authorization = `Bearer ${token}`

  let res
  try {
    res = await fetch(`/api${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch {
    throw new ApiError('Tidak dapat terhubung ke server', 0)
  }

  let json = null
  try {
    json = await res.json()
  } catch {
    json = null
  }

  if (!res.ok || json?.status !== 'success') {
    if (res.status === 401 && auth && token) {
      clearSession()
      window.dispatchEvent(new Event('auth:expired'))
    }
    throw new ApiError(json?.message ?? 'Terjadi kesalahan pada server', res.status)
  }
  return json.data
}
