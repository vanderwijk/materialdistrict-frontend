import type { Metadata } from 'next'
import { DM_Sans, DM_Serif_Display } from 'next/font/google'
import { HeaderShell } from '@/components/layout/HeaderShell'
import { Footer } from '@/components/layout/Footer'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import { AuthProvider } from '@/components/providers/AuthContext'
import { getCurrentUser } from '@/lib/auth/server'
import '@/styles/globals.css'

/**
 * Fonts geladen via next/font/google — zelfgehost, geen externe requests.
 */
const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-body',
  display: 'swap',
})

const dmSerifDisplay = DM_Serif_Display({
  subsets: ['latin'],
  weight: ['400'],
  style: ['normal', 'italic'],
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
  icons: {
    icon: '/favicon.ico',
  },
}

/**
 * Inline script dat het theme zet vóór React hydrateert.
 * Voorkomt de "flash of wrong theme" wanneer een dark-mode user de pagina
 * laadt. Het script leest localStorage en valt terug op `prefers-color-scheme`.
 *
 * Het script is bewust klein en synchroon — moet uitgevoerd zijn vóór de body
 * gerenderd wordt.
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

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Server-side auth-hydratie: we vragen de huidige user op aan de hand van de
  // httpOnly session-cookie. Bij geen cookie of een verlopen JWT komt hier
  // null terug — geen exception, geen flicker.
  const initialUser = await getCurrentUser()

  return (
    <html
      lang="en"
      className={`${dmSans.variable} ${dmSerifDisplay.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="app-shell">
        <ThemeProvider>
          <AuthProvider initialUser={initialUser}>
            <HeaderShell />
            <main id="main">{children}</main>
            <Footer />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
