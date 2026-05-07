'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'

type Theme = 'light' | 'dark'

interface ThemeContextValue {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

const STORAGE_KEY = 'md-theme'

/**
 * ThemeProvider — beheert dark/light mode, leest initial van het
 * `data-theme` attribuut op <html> (gezet door het inline script in <head>),
 * en persisteert wijzigingen naar localStorage.
 *
 * Het inline script in app/layout.tsx voorkomt FOUC (flash of unstyled content)
 * door het thema te zetten vóór React hydrateert.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('light')

  // Bij mount: lees het thema dat het inline script in <html data-theme=...> heeft gezet
  useEffect(() => {
    const current = document.documentElement.getAttribute('data-theme') as Theme | null
    if (current === 'dark' || current === 'light') {
      setThemeState(current)
    }
  }, [])

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next)
    document.documentElement.setAttribute('data-theme', next)
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // localStorage kan onbeschikbaar zijn (private browsing, SSR-edge cases)
    }
  }, [])

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }, [theme, setTheme])

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

/**
 * Hook om de huidige theme + setters te lezen.
 * Throwt als hij buiten een ThemeProvider gebruikt wordt.
 */
export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return ctx
}
