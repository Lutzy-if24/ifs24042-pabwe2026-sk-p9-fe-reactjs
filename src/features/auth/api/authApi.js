import { apiRequest } from '../../../helpers/apiHelper.js'

export const login = (username, password) =>
  apiRequest('/auth/login', { method: 'POST', body: { username, password }, auth: false })

export const register = (username, email, password) =>
  apiRequest('/auth/register', { method: 'POST', body: { username, email, password }, auth: false })

export const logout = () => apiRequest('/auth/logout', { method: 'POST' })
