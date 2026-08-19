import type { Metadata } from 'next'
import { Schibsted_Grotesk } from 'next/font/google'
import { AppChrome } from '@/components/layout/AppChrome'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import { JsonLd, buildOrganization, buildWebSite, openGraphSite } from '@/lib/seo'
import { FeedbackButton } from '@/components/feedback/FeedbackButton'
import { ConsentBar } from '@/components/consent/ConsentBar'
import { ConsentBootstrap } from '@/components/consent/ConsentBootstrap'
import { RegionBootstrap } from '@/components/consent/RegionBootstrap'
import { GptLoader } from '@/components/ads/GptLoader'
import { PlausibleAnalytics } from '@/components/analytics/PlausibleAnalytics'
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
      ...openGraphSite,
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

/**
 * Google Consent Mode v2 defaults — must run before any Google tag.
 * Returning visitors with md_consent=granted get an immediate update so GPT
 * does not fire a limited-ads request while React hydrates.
 */
const consentModeInitScript = `
(function() {
  window.dataLayer = window.dataLayer || [];
  function gtag(){window.dataLayer.push(arguments);}
  window.gtag = gtag;
  gtag('consent', 'default', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'denied',
    wait_for_update: 500
  });
  try {
    var match = document.cookie.match(/(?:^|; )md_consent=([^;]*)/);
    if (match && match[1] === 'granted') {
      gtag('consent', 'update', {
        ad_storage: 'granted',
        ad_user_data: 'granted',
        ad_personalization: 'granted',
        analytics_storage: 'granted'
      });
    }
  } catch (e) {}
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
        <script dangerouslySetInnerHTML={{ __html: consentModeInitScript }} />
      </head>
      <body className="app-shell">
        <a href="#main" className="skip-link">
          Skip to main content
        </a>
        <ConsentBootstrap />
        <RegionBootstrap />
        <GptLoader />
        <ThemeProvider>
          {/*
            No Suspense around `{children}`: a fallback there commits HTTP
            200 before `notFound()` can set 404 (soft-404) — e.g.
            `/wp-login.php` and unknown `/[pageSlug]` URLs showed the 404 UI
            with status 200. Footer still has its own Suspense inside
            AppChrome.

            This layout deliberately awaits nothing and reads no cookies or
            headers. That is what keeps every route below it statically
            renderable and cacheable at the edge; auth is resolved in the
            browser (see AuthContext).
          */}
          <AppChrome>{children}</AppChrome>
        </ThemeProvider>
        {/* Global structured data — Organization + WebSite on every page.
            Per-page entities (Product/Article/Event/Book) live in the
            individual page.tsx files. */}
        <JsonLd data={[buildOrganization(), buildWebSite()]} />
        {/* Soft-launch reporter — visible to everyone, signed in or not.
            Remove this line when the test month ends. */}
        <FeedbackButton />
        {/* Consent bar — renders only until the visitor has chosen. */}
        <ConsentBar />
        {/* Plausible — always on (cookieless / AVG-compliant). */}
        <PlausibleAnalytics />
      </body>
    </html>
  )
}
