import type { Metadata } from 'next'
import { Suspense } from 'react'
import { Schibsted_Grotesk } from 'next/font/google'
import { AppChrome } from '@/components/layout/AppChrome'
import { AuthenticatedAppShell } from '@/components/layout/AuthenticatedAppShell'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import { JsonLd, buildOrganization, buildWebSite } from '@/lib/seo'
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

/** Preview / local builds must not be indexed; production domain is indexed. */
function shouldBlockIndexing(): boolean {
  if (process.env.NODE_ENV === 'development') return true
  return process.env.VERCEL_ENV !== 'production'
}

export async function generateMetadata(): Promise<Metadata> {
  const blockIndexing = shouldBlockIndexing()

  return {
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
    twitter: {
      card: 'summary_large_image',
      site: '@materialdistrct',
    },
    robots: blockIndexing
      ? { index: false, follow: false, googleBot: { index: false, follow: false } }
      : { index: true, follow: true },
    // Favicons via App Router file convention: icon.svg, favicon.ico, apple-icon.png.
  }
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
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
          {/*
            Auth + footer in Suspense: main content can stream before cookie
            hydration and footer channel-catalog (Vercel cold-start guidance).
            Fallback renders logged-out chrome — no flash for anonymous users.
          */}
          {/*
            Fallback mag géén {children} bevatten — anders streamt Next.js de
            pagina-inhoud dubbel (fallback-shell + opgeloste shell) en zie je
            op o.a. /channel/[slug] hero + strips twee keer in de HTML.
          */}
          <Suspense fallback={<AppChrome initialUser={null} />}>
            <AuthenticatedAppShell>{children}</AuthenticatedAppShell>
          </Suspense>
        </ThemeProvider>
        {/* Global structured data — Organization + WebSite on every page.
            Per-page entities (Product/Article/Event/Book) live in the
            individual page.tsx files. */}
        <JsonLd data={[buildOrganization(), buildWebSite()]} />
      </body>
    </html>
  )
}
