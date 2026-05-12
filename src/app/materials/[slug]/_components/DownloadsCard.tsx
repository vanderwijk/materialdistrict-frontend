'use client'

/**
 * DownloadsCard
 * ----------------------------------------------------------------------
 * Sidebar-blok met downloadbare resources voor het material. Volgt de
 * mockup-stijl: titelbalk met icoon, daaronder een rij per download
 * met label, meta (type/size) en een actie-knop.
 *
 * Drie down-load-bronnen die we vandaag al hebben:
 *  - Product brochure (PDF) — geconstrueerd uit `datasheetUrl` als die
 *    bestaat. Naam is generiek "Product brochure" omdat WP geen aparte
 *    "brochure" levert.
 *  - Technical datasheet (PDF) — uit `datasheetUrl` (zelfde URL kan
 *    momenteel beide rollen vervullen — netter wordt het wanneer Johan
 *    twee aparte velden levert).
 *  - EPD (PDF) — uit `epdUrl`.
 *  - Product page (extern) — uit `productUrl`. Geen download maar wel
 *    een externe resource, dus past hier.
 *
 * Voorlopig houden we het simpel: één download-item per URL die WP
 * levert. Geen file-size meta (WP exposes die niet voor externe
 * resources). Zodra Johan brochures-array met type/size levert, kunnen
 * we deze component daarop laten rusten.
 *
 * Gating:
 *  - Niet-ingelogd:    knop = "Sign in"  → naar /sign-in
 *  - Ingelogd:         knop = "PDF" / "Open"  → direct
 *
 * Insider-only downloads (mockup heeft dat) zijn vandaag niet relevant
 * — geen WP-veld dat aangeeft "this download is insider-only". Wachten
 * tot Johan dat aanlevert.
 */

import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/providers/AuthContext'

export interface DownloadsCardProps {
  materialSlug: string
  datasheetUrl: string | null
  epdUrl: string | null
  productUrl: string | null
}

interface DownloadEntry {
  label: string
  href: string
  /** Vrije meta-string ("PDF", "External", etc.). */
  meta: string
  /** Is dit een externe link (geen PDF) — opent in new tab. */
  external?: boolean
}

export function DownloadsCard({
  materialSlug,
  datasheetUrl,
  epdUrl,
  productUrl,
}: DownloadsCardProps) {
  const router = useRouter()
  const { isLoggedIn } = useAuth()

  const entries: DownloadEntry[] = []
  if (datasheetUrl) {
    entries.push({ label: 'Technical datasheet', href: datasheetUrl, meta: 'PDF' })
  }
  if (epdUrl) {
    entries.push({ label: 'EPD', href: epdUrl, meta: 'PDF' })
  }
  if (productUrl) {
    entries.push({
      label: 'Product page',
      href: productUrl,
      meta: 'External',
      external: true,
    })
  }

  if (entries.length === 0) return null

  const signInHref = `/sign-in?next=${encodeURIComponent(`/materials/${materialSlug}`)}`

  const handleClick = (entry: DownloadEntry, e: React.MouseEvent) => {
    if (!isLoggedIn) {
      e.preventDefault()
      router.push(signInHref)
    }
    // Logged-in: laat default <a>-gedrag het overnemen.
  }

  return (
    <section className="mat-downloads-card" aria-labelledby="downloads-title">
      <header className="mat-downloads-card-header">
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
        </svg>
        <span id="downloads-title">Downloads</span>
      </header>

      <ul className="mat-downloads-card-list" role="list">
        {entries.map((entry) => (
          <li key={entry.href} className="mat-downloads-card-row">
            <div className="mat-downloads-card-info">
              <span className="mat-downloads-card-label">{entry.label}</span>
              <span className="mat-downloads-card-meta">{entry.meta}</span>
            </div>
            <a
              href={isLoggedIn ? entry.href : signInHref}
              target={entry.external && isLoggedIn ? '_blank' : undefined}
              rel={entry.external && isLoggedIn ? 'noreferrer' : undefined}
              className="mat-downloads-card-cta"
              onClick={(e) => handleClick(entry, e)}
            >
              {isLoggedIn ? (entry.external ? 'Open' : 'PDF') : 'Sign in'}
            </a>
          </li>
        ))}
      </ul>
    </section>
  )
}
