import { beforeEach, describe, expect, it, vi } from 'vitest'
import { apiRequest } from '../helpers/apiHelper.js'
import * as authApi from './auth/api/authApi.js'
import * as blogApi from './blog/api/blogApi.js'
import * as adminApi from './admin/api/adminApi.js'

vi.mock('../helpers/apiHelper.js', () => ({ apiRequest: vi.fn(() => Promise.resolve('ok')) }))

beforeEach(() => vi.clearAllMocks())

describe('authApi', () => {
  it('login & register tidak memakai token', async () => {
    await authApi.login('budi', 'rahasia')
    expect(apiRequest).toHaveBeenLastCalledWith('/auth/login', { method: 'POST', body: { username: 'budi', password: 'rahasia' }, auth: false })
    await authApi.register('budi', 'b@x.id', 'rahasia')
    expect(apiRequest).toHaveBeenLastCalledWith('/auth/register', {
      method: 'POST',
      body: { username: 'budi', email: 'b@x.id', password: 'rahasia' },
      auth: false,
    })
  })
  it('logout', async () => {
    await authApi.logout()
    expect(apiRequest).toHaveBeenLastCalledWith('/auth/logout', { method: 'POST' })
  })
})

describe('blogApi', () => {
  it('listPublicPosts membangun query string', async () => {
    await blogApi.listPublicPosts({ q: '', category: 'Semua' })
    expect(apiRequest).toHaveBeenLastCalledWith('/public/posts', { auth: false })
    await blogApi.listPublicPosts({ q: 'go lang', category: '' })
    expect(apiRequest).toHaveBeenLastCalledWith('/public/posts?q=go+lang', { auth: false })
    await blogApi.listPublicPosts({ q: '', category: 'Bisnis' })
    expect(apiRequest).toHaveBeenLastCalledWith('/public/posts?category=Bisnis', { auth: false })
    await blogApi.listPublicPosts({ q: 'x', category: 'Opini' })
    expect(apiRequest).toHaveBeenLastCalledWith('/public/posts?q=x&category=Opini', { auth: false })
  })
  it('endpoint publik dan penulis', async () => {
    await blogApi.getPublicPost('a b')
    expect(apiRequest).toHaveBeenLastCalledWith('/public/posts/a%20b', { auth: false })
    await blogApi.listMyPosts()
    expect(apiRequest).toHaveBeenLastCalledWith('/posts')
    await blogApi.getStats()
    expect(apiRequest).toHaveBeenLastCalledWith('/posts/stats')
    await blogApi.getMyPost(3)
    expect(apiRequest).toHaveBeenLastCalledWith('/posts/3')
    await blogApi.createPost({ t: 1 })
    expect(apiRequest).toHaveBeenLastCalledWith('/posts', { method: 'POST', body: { t: 1 } })
    await blogApi.updatePost(3, { t: 2 })
    expect(apiRequest).toHaveBeenLastCalledWith('/posts/3', { method: 'PUT', body: { t: 2 } })
    await blogApi.deletePost(3)
    expect(apiRequest).toHaveBeenLastCalledWith('/posts/3', { method: 'DELETE' })
    await blogApi.togglePublish(3)
    expect(apiRequest).toHaveBeenLastCalledWith('/posts/3/toggle-publish', { method: 'PATCH' })
    await blogApi.generateWithAi({ topic: 'AI' })
    expect(apiRequest).toHaveBeenLastCalledWith('/posts/ai-generate', { method: 'POST', body: { topic: 'AI' } })
  })
  it('konstanta', () => {
    expect(blogApi.CATEGORIES).toContain('Teknologi')
    expect(blogApi.EMPTY_POST.category).toBe('Umum')
  })
})

describe('adminApi', () => {
  it('endpoint admin', async () => {
    await adminApi.listUsers()
    expect(apiRequest).toHaveBeenLastCalledWith('/admin/users')
    await adminApi.listAllPosts()
    expect(apiRequest).toHaveBeenLastCalledWith('/admin/posts')
    await adminApi.listUserPosts(5)
    expect(apiRequest).toHaveBeenLastCalledWith('/admin/users/5/posts')
  })
})
