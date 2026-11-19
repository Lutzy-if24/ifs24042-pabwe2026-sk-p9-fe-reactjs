import { describe, expect, it } from 'vitest'
import { homeFor, matchRoute, resolveRedirect } from './routes.js'

describe('matchRoute', () => {
  it.each([
    ['/', { name: 'public' }],
    ['/public', { name: 'public' }],
    ['/author', { name: 'author' }],
    ['/admin', { name: 'admin' }],
    ['/login', { name: 'login' }],
    ['/register', { name: 'register' }],
    ['/posts/belajar-go', { name: 'detail', slug: 'belajar-go' }],
    ['/posts/a%20b', { name: 'detail', slug: 'a b' }],
    ['/posts/', { name: 'notfound' }],
    ['/tidak-ada', { name: 'notfound' }],
  ])('%s', (path, expected) => expect(matchRoute(path)).toEqual(expected))
})

describe('resolveRedirect', () => {
  const member = { role: 'member' }
  const admin = { role: 'admin' }

  it('homeFor', () => {
    expect(homeFor(admin)).toBe('/admin')
    expect(homeFor(member)).toBe('/author')
  })
  it('/author', () => {
    expect(resolveRedirect({ name: 'author' }, null)).toBe('/login')
    expect(resolveRedirect({ name: 'author' }, member)).toBeNull()
  })
  it('/admin', () => {
    expect(resolveRedirect({ name: 'admin' }, null)).toBe('/login')
    expect(resolveRedirect({ name: 'admin' }, member)).toBe('/author')
    expect(resolveRedirect({ name: 'admin' }, admin)).toBeNull()
  })
  it('/login dan /register', () => {
    expect(resolveRedirect({ name: 'login' }, null)).toBeNull()
    expect(resolveRedirect({ name: 'login' }, admin)).toBe('/admin')
    expect(resolveRedirect({ name: 'register' }, member)).toBe('/author')
    expect(resolveRedirect({ name: 'register' }, null)).toBeNull()
  })
  it('rute publik tidak dialihkan', () => {
    expect(resolveRedirect({ name: 'public' }, null)).toBeNull()
    expect(resolveRedirect({ name: 'notfound' }, member)).toBeNull()
  })
})
