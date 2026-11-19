import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import useTheme from './useTheme.js'

const prefersDark = (matches) =>
  (window.matchMedia = (query) => ({ matches, media: query, addEventListener() {}, removeEventListener() {} }))

describe('useTheme', () => {
  it('default terang dan aksen indigo', () => {
    prefersDark(false)
    const { result } = renderHook(() => useTheme())
    expect(result.current.theme).toBe('light')
    expect(result.current.accent).toBe('indigo')
    expect(document.documentElement.classList.contains('dark')).toBe(false)
    expect(document.documentElement.dataset.accent).toBe('indigo')
    expect(result.current.accents).toEqual(['indigo', 'emerald', 'rose'])
  })

  it('mengikuti preferensi sistem gelap', () => {
    prefersDark(true)
    const { result } = renderHook(() => useTheme())
    expect(result.current.theme).toBe('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('toggle tema bolak-balik dan tersimpan', () => {
    prefersDark(false)
    const { result } = renderHook(() => useTheme())
    act(() => result.current.toggleTheme())
    expect(result.current.theme).toBe('dark')
    expect(localStorage.getItem('delcom_theme')).toBe('dark')
    act(() => result.current.toggleTheme())
    expect(result.current.theme).toBe('light')
  })

  it('memakai tema & aksen tersimpan, aksen dapat diganti', () => {
    prefersDark(false)
    localStorage.setItem('delcom_theme', 'dark')
    localStorage.setItem('delcom_accent', 'rose')
    const { result } = renderHook(() => useTheme())
    expect(result.current.theme).toBe('dark')
    expect(result.current.accent).toBe('rose')
    act(() => result.current.setAccent('emerald'))
    expect(document.documentElement.dataset.accent).toBe('emerald')
    expect(localStorage.getItem('delcom_accent')).toBe('emerald')
  })
})
