import type { Metadata } from 'next'
import { cache, Suspense } from 'react'
import { Schibsted_Grotesk } from 'next/font/google'
import { HeaderShell } from '@/components/layout/HeaderShell'
import { Footer } from '@/components/layout/Footer'
import { ScrollToTop } from '@/components/layout/ScrollToTop'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import { AuthProvider } from '@/components/providers/AuthContext'
import { BookmarksProvider } from '@/lib/hooks/useBookmarks'
import { GateNoticeProvider } from '@/components/ui'
import { JsonLd, buildOrganization, buildWebSite } from '@/lib/seo'
import {
  getCurrentUser,
  WordPressAuthError,
} from '@/lib/api/wordpress'
import { clearAuthCookie, getAuthCookie } from '@/lib/auth/cookies'
import type { User } from '@/types/shared'
import '@/styles/globals.css'

/**
 * Fonts loaded via next/font/google — self-hosted, no external requests.
 * Eén grotesk-familie (Schibsted Grotesk) voor zowel body als display.
 */
const groteskBody = Schibsted_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-body',
  display: 'swap',
})

const groteskDisplay = Schibsted_Grotesk({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-display',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://materialdistrict.com'),
  title: {
    default: 'MaterialDistrict',
    template: '%s | MaterialDistrict',
  },
  description:
    'MaterialDistrict — discover sustainable and innovative materials, brands, articles, talks and events.',
  openGraph: {
    type: 'website',
    siteName: 'MaterialDistrict',
    locale: 'en_US',
  },
  robots: {
    index: true,
    follow: true,
  },
  // Favicons via App Router file convention: icon.svg, favicon.ico, apple-icon.png.
}

/**
 * Inline script that sets the theme before React hydrates.
 * Prevents the "flash of wrong theme" when a dark-mode user loads the
 * page. The script reads localStorage and falls back to
 * `prefers-color-scheme`.
 *
 * Intentionally small and synchronous — must execute before the body
 * is rendered.
 */
const themeInitScript = `
(function() {
  try {
    var stored = localStorage.getItem('md-theme');
    var theme = stored || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', theme);
  } catch (e) {
    document.documentElement.setAttribute('data-theme', 'light');
  }
})();
`

/**
 * Server-side auth hydration.
 *
 * Wrapped in React.cache() so multiple components within the same render
 * (layout + page + RSC subtree) can call `getInitialUser()` and only one
 * WordPress request is actually issued. `cache()` resets between renders,
 * so there is no staleness — each new request fetches fresh data.
 *
 * Error handling:
 *  - No cookie → `null` (anonymous visitor).
 *  - Cookie present but rejected by WordPress (`WordPressAuthError`) →
 *    clear the cookie and return `null`. The next request is a clean
 *    anonymous state.
 *  - Unexpected backend failure (`WordPressError` or worse) → return
 *    `null` and log. The site stays up; the user appears logged out
 *    rather than seeing an error page for an auxiliary call.
 */
const getInitialUser = cache(async (): Promise<User | null> => {
  const token = await getAuthCookie()
  if (!token) return null

  try {
    const auth = await getCurrentUser(token)
    return auth.user
  } catch (err) {
    if (err instanceof WordPressAuthError) {
      await clearAuthCookie()
      return null
    }
    console.error('[layout] auth hydration failed', err)
    return null
  }
})

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const initialUser = await getInitialUser()

  return (
    <html
      lang="en"
      className={`${groteskBody.variable} ${groteskDisplay.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="app-shell">
        <a href="#main" className="skip-link">
          Skip to main content
        </a>
        <ThemeProvider>
          <AuthProvider initialUser={initialUser}>
            <BookmarksProvider>
              <GateNoticeProvider>
              {/* Sessie 7 fix Punt 17: ScrollToTop reset window-scroll
                  bij elke client-side route-change (PUSH/REPLACE).
                  Bij browser back/forward laat hij het over aan de
                  browser's native scroll-restoration. Eigen Suspense
                  omdat de component `useSearchParams()` gebruikt — in
                  Next.js 15+ moet die binnen een Suspense-boundary
                  staan. */}
              <Suspense fallback={null}>
                <ScrollToTop />
              </Suspense>
              <HeaderShell />
              <main id="main">{children}</main>
              <Footer />
              </GateNoticeProvider>
            </BookmarksProvider>
          </AuthProvider>
        </ThemeProvider>
        {/* Global structured data — Organization + WebSite on every page.
            Per-page entities (Product/Article/Event/Book) live in the
            individual page.tsx files. */}
        <JsonLd data={[buildOrganization(), buildWebSite()]} />
      </body>
    </html>
  )
}
