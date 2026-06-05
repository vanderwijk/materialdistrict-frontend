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
import { logInteractionEvent } from '@/lib/api/interactions'
import type { MaterialDownload } from '@/types/material'

export interface DownloadsCardProps {
  materialSlug: string
  /** Material-id voor brochure_download-logging. */
  materialId: number
  /** Brand-id (optioneel) voor brochure_download-logging. */
  brandId: number | null
  /** Echte downloads-entiteit. Wanneer leeg → fallback op de losse url-velden. */
  downloads: MaterialDownload[]
  /** Brand-brede Insider-gate op downloads. */
  downloadsInsidersOnly: boolean
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
  /** Attachment-id voor brochure_download-logging (alleen echte downloads). */
  downloadId?: number
}

export function DownloadsCard({
  materialSlug,
  materialId,
  brandId,
  downloads,
  downloadsInsidersOnly,
  datasheetUrl,
  epdUrl,
  productUrl,
}: DownloadsCardProps) {
  const router = useRouter()
  const { isLoggedIn, isMember } = useAuth()

  // Prefer the real downloads entity; fall back to the legacy url fields
  // until WordPress delivers `downloads[]` for this material.
  const entries: DownloadEntry[] =
    downloads.length > 0
      ? downloads.map((d) => {
          const numericId = Number(d.id)
          return {
            label: d.title || 'Download',
            href: d.url,
            meta: d.type || 'PDF',
            downloadId: Number.isFinite(numericId) ? numericId : undefined,
          }
        })
      : []

  if (entries.length === 0) {
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
  }

  if (entries.length === 0) return null

  const signInHref = `/sign-in?next=${encodeURIComponent(`/materials/${materialSlug}`)}`
  // Logged-in non-Insiders hit the gate; logged-out users see "Sign in" first.
  const insiderLocked = downloadsInsidersOnly && isLoggedIn && !isMember

  const handleClick = (entry: DownloadEntry, e: React.MouseEvent) => {
    if (!isLoggedIn) {
      e.preventDefault()
      router.push(signInHref)
      return
    }
    // Logged-in download → best-effort brochure_download log. Alleen voor
    // echte downloads (met attachment-id); de legacy url-fallback heeft er geen.
    if (entry.downloadId != null) {
      void logInteractionEvent({
        type: 'brochure_download',
        materialId,
        ...(brandId != null ? { brandId } : {}),
        downloadId: entry.downloadId,
      })
    }
    // Laat default <a>-gedrag het overnemen.
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

      {insiderLocked && (
        <p className="mat-downloads-card-locked-note">
          Downloads for this brand are available to Insider members.{' '}
          <a href="/membership">Join Insider</a>
        </p>
      )}

      <ul className="mat-downloads-card-list" role="list">
        {entries.map((entry) => (
          <li key={entry.href} className="mat-downloads-card-row">
            <div className="mat-downloads-card-info">
              <span className="mat-downloads-card-label">{entry.label}</span>
              <span className="mat-downloads-card-meta">{entry.meta}</span>
            </div>
            {insiderLocked ? (
              <a href="/membership" className="mat-downloads-card-cta is-locked">
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                Insiders only
              </a>
            ) : (
              <a
                href={isLoggedIn ? entry.href : signInHref}
                target={entry.external && isLoggedIn ? '_blank' : undefined}
                rel={entry.external && isLoggedIn ? 'noreferrer' : undefined}
                className="mat-downloads-card-cta"
                onClick={(e) => handleClick(entry, e)}
              >
                {isLoggedIn ? (entry.external ? 'Open' : 'PDF') : 'Sign in'}
              </a>
            )}
          </li>
        ))}
      </ul>
    </section>
  )
}
