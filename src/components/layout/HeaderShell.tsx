'use client'

import { useRouter, usePathname } from 'next/navigation'
import { Header, type HeaderSection } from '@/components/layout/Header'
import { useTheme } from '@/components/providers/ThemeProvider'
import { useAuth } from '@/components/providers/AuthContext'

/**
 * Bepaal welke nav-section actief is op basis van het huidige pad.
 * Returns undefined op homepage en pages zonder match (dashboard, etc.).
 */
function getCurrentSection(pathname: string): HeaderSection | undefined {
  if (pathname.startsWith('/materials')) return 'materials'
  if (pathname.startsWith('/articles') || pathname.startsWith('/stories')) return 'articles'
  if (pathname.startsWith('/brands')) return 'brands'
  if (pathname.startsWith('/events')) return 'events'
  if (pathname.startsWith('/books')) return 'books'
  if (pathname.startsWith('/talks')) return 'talks'
  return undefined
}

/**
 * HeaderShell — connectie-laag tussen de pure presentational `<Header>`
 * en de runtime context (theme, auth, routing).
 *
 * Door deze splitsing kan `<Header>` zelf zonder Next.js context worden
 * getest of in Storybook gebruikt.
 */
export function HeaderShell() {
  const router = useRouter()
  const pathname = usePathname()
  const { theme, toggleTheme } = useTheme()
  const { isLoggedIn, isMember } = useAuth()

  return (
    <Header
      currentSection={getCurrentSection(pathname)}
      isLoggedIn={isLoggedIn}
      isMember={isMember}
      theme={theme}
      onThemeToggle={toggleTheme}
      onLoginClick={() => router.push('/login')}
      onDashboardClick={() => router.push('/dashboard')}
      onInsiderClick={() => router.push('/membership')}
      onSearch={(q) => {
        if (q.trim()) {
          router.push(`/search?q=${encodeURIComponent(q.trim())}`)
        }
      }}
    />
  )
}
