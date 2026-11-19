import { useCallback, useEffect, useState } from 'react'

const THEME_KEY = 'delcom_theme'
const ACCENT_KEY = 'delcom_accent'
export const ACCENTS = ['indigo', 'emerald', 'rose']

const initialTheme = () =>
  localStorage.getItem(THEME_KEY) ||
  (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')

/** Tema terang/gelap (class .dark pada <html>) dan aksen warna (data-accent). */
export default function useTheme() {
  const [theme, setTheme] = useState(initialTheme)
  const [accent, setAccent] = useState(() => localStorage.getItem(ACCENT_KEY) || ACCENTS[0])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    localStorage.setItem(THEME_KEY, theme)
  }, [theme])

  useEffect(() => {
    document.documentElement.dataset.accent = accent
    localStorage.setItem(ACCENT_KEY, accent)
  }, [accent])

  const toggleTheme = useCallback(() => setTheme((t) => (t === 'dark' ? 'light' : 'dark')), [])

  return { theme, accent, accents: ACCENTS, toggleTheme, setAccent }
}
