import { apiRequest } from '../../../helpers/apiHelper.js'

export const CATEGORIES = ['Teknologi', 'Pendidikan', 'Gaya Hidup', 'Bisnis', 'Opini', 'Umum']

export const EMPTY_POST = { title: '', category: 'Umum', excerpt: '', content: '', cover_image_path: '' }

export function listPublicPosts({ q, category }) {
  const params = new URLSearchParams()
  if (q) params.set('q', q)
  if (category && category !== 'Semua') params.set('category', category)
  const qs = params.toString()
  return apiRequest(`/public/posts${qs ? `?${qs}` : ''}`, { auth: false })
}

export const getPublicPost = (slug) => apiRequest(`/public/posts/${encodeURIComponent(slug)}`, { auth: false })

export const listMyPosts = () => apiRequest('/posts')
export const getStats = () => apiRequest('/posts/stats')
export const getMyPost = (id) => apiRequest(`/posts/${id}`)
export const createPost = (payload) => apiRequest('/posts', { method: 'POST', body: payload })
export const updatePost = (id, payload) => apiRequest(`/posts/${id}`, { method: 'PUT', body: payload })
export const deletePost = (id) => apiRequest(`/posts/${id}`, { method: 'DELETE' })
export const togglePublish = (id) => apiRequest(`/posts/${id}/toggle-publish`, { method: 'PATCH' })
export const generateWithAi = (payload) => apiRequest('/posts/ai-generate', { method: 'POST', body: payload })
