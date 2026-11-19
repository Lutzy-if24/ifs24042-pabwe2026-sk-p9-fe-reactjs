import { apiRequest } from '../../../helpers/apiHelper.js'

export const listUsers = () => apiRequest('/admin/users')
export const listAllPosts = () => apiRequest('/admin/posts')
export const listUserPosts = (id) => apiRequest(`/admin/users/${id}/posts`)
