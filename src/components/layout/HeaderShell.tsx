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
 * Pages waar het GEEN zin heeft om "next=" mee te geven naar /sign-in.
 * Als je vanaf /sign-in zelf op "Login" klikt → niet zichzelf als next
 * meegeven. Idem voor /register en /forgot-password.
 */
function shouldCaptureNext(pathname: string): boolean {
  if (pathname === '/sign-in') return false
  if (pathname === '/register') return false
  if (pathname === '/forgot-password') return false
  if (pathname.startsWith('/reset-password')) return false
  return true
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

  function handleLoginClick() {
    // Capture the current page as ?next= so the user lands back where
    // they started after signing in. Skipped for auth pages themselves
    // (no point in bouncing /sign-in → /sign-in?next=/sign-in).
    if (shouldCaptureNext(pathname)) {
      router.push(`/sign-in?next=${encodeURIComponent(pathname)}`)
    } else {
      router.push('/sign-in')
    }
  }

  return (
    <Header
      currentSection={getCurrentSection(pathname)}
      isLoggedIn={isLoggedIn}
      isMember={isMember}
      theme={theme}
      onThemeToggle={toggleTheme}
      onLoginClick={handleLoginClick}
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
