import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError, apiRequest, clearSession, getToken, getUser, saveSession } from './apiHelper.js'

const reply = (status, body, { json = true } = {}) => ({
  ok: status >= 200 && status < 300,
  status,
  json: json ? () => Promise.resolve(body) : () => Promise.reject(new Error('bad json')),
})

beforeEach(() => {
  global.fetch = vi.fn()
})
afterEach(() => vi.restoreAllMocks())

describe('session storage', () => {
  it('menyimpan, membaca dan menghapus sesi', () => {
    expect(getToken()).toBeNull()
    expect(getUser()).toBeNull()
    saveSession('tok', { id: 1, username: 'budi' })
    expect(getToken()).toBe('tok')
    expect(getUser()).toEqual({ id: 1, username: 'budi' })
    clearSession()
    expect(getToken()).toBeNull()
    expect(getUser()).toBeNull()
  })
})

describe('apiRequest', () => {
  it('GET tanpa token dan tanpa body', async () => {
    fetch.mockResolvedValue(reply(200, { status: 'success', data: [1] }))
    await expect(apiRequest('/public/posts')).resolves.toEqual([1])
    const [url, opts] = fetch.mock.calls[0]
    expect(url).toBe('/api/public/posts')
    expect(opts.method).toBe('GET')
    expect(opts.body).toBeUndefined()
    expect(opts.headers.Authorization).toBeUndefined()
    expect(opts.headers['Content-Type']).toBeUndefined()
  })

  it('POST dengan body dan Bearer token', async () => {
    saveSession('tok', {})
    fetch.mockResolvedValue(reply(201, { status: 'success', data: { id: 1 } }))
    await apiRequest('/posts', { method: 'POST', body: { a: 1 } })
    const opts = fetch.mock.calls[0][1]
    expect(opts.body).toBe('{"a":1}')
    expect(opts.headers.Authorization).toBe('Bearer tok')
    expect(opts.headers['Content-Type']).toBe('application/json')
  })

  it('auth:false tidak mengirim token', async () => {
    saveSession('tok', {})
    fetch.mockResolvedValue(reply(200, { status: 'success', data: null }))
    await apiRequest('/auth/login', { method: 'POST', body: {}, auth: false })
    expect(fetch.mock.calls[0][1].headers.Authorization).toBeUndefined()
  })

  it('melempar ApiError berisi pesan server', async () => {
    fetch.mockResolvedValue(reply(404, { status: 'fail', message: 'tidak ada' }))
    const err = await apiRequest('/x').catch((e) => e)
    expect(err).toBeInstanceOf(ApiError)
    expect(err.message).toBe('tidak ada')
    expect(err.status).toBe(404)
  })

  it('melempar ApiError bila status envelope bukan success walau HTTP 200', async () => {
    fetch.mockResolvedValue(reply(200, { status: 'fail', message: 'ditolak' }))
    await expect(apiRequest('/x')).rejects.toThrow('ditolak')
  })

  it('memakai pesan bawaan bila body bukan JSON', async () => {
    fetch.mockResolvedValue(reply(500, null, { json: false }))
    await expect(apiRequest('/x')).rejects.toThrow('Terjadi kesalahan pada server')
  })

  it('memakai pesan bawaan bila envelope tanpa message', async () => {
    fetch.mockResolvedValue(reply(500, { status: 'error' }))
    await expect(apiRequest('/x')).rejects.toThrow('Terjadi kesalahan pada server')
  })

  it('galat jaringan menjadi ApiError status 0', async () => {
    fetch.mockRejectedValue(new TypeError('network'))
    const err = await apiRequest('/x').catch((e) => e)
    expect(err.message).toBe('Tidak dapat terhubung ke server')
    expect(err.status).toBe(0)
  })

  it('401 pada permintaan berotentikasi menghapus sesi dan memicu auth:expired', async () => {
    saveSession('tok', { id: 1 })
    const onExpired = vi.fn()
    window.addEventListener('auth:expired', onExpired)
    fetch.mockResolvedValue(reply(401, { status: 'fail', message: 'kedaluwarsa' }))
    await expect(apiRequest('/posts')).rejects.toThrow('kedaluwarsa')
    expect(getToken()).toBeNull()
    expect(onExpired).toHaveBeenCalledTimes(1)
    window.removeEventListener('auth:expired', onExpired)
  })

  it('401 tanpa token (login salah) tidak memicu auth:expired', async () => {
    const onExpired = vi.fn()
    window.addEventListener('auth:expired', onExpired)
    fetch.mockResolvedValue(reply(401, { status: 'fail', message: 'salah' }))
    await expect(apiRequest('/auth/login', { auth: false })).rejects.toThrow('salah')
    saveSession('tok', {})
    await expect(apiRequest('/auth/login', { auth: false })).rejects.toThrow('salah')
    expect(onExpired).not.toHaveBeenCalled()
    window.removeEventListener('auth:expired', onExpired)
  })
})
