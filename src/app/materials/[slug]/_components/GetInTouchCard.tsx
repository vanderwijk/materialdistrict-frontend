'use client'

/**
 * GetInTouchCard
 * ----------------------------------------------------------------------
 * Donkere CTA-card voor de detail-page-sidebar. Volgt de mockup-stijl
 * (`var(--navy)` achtergrond, witte typografie, prominente groene
 * primary-button).
 *
 * Twee gedrags-modes op basis van login-status:
 *  - Anoniem: knop linkt naar /sign-in?next=<huidige path>, kleine link
 *    naar /register eronder.
 *  - Logged-in: knop opent (in een volgende sessie) de sample-request
 *    widget. Voor nu — totdat die widget bestaat — scrollen we naar de
 *    bestaande SampleRequestForm-section onder de gallery. Dat houdt
 *    het gedrag werkend zonder placeholder-ui.
 *
 * Brand-naam:
 *  - Optioneel. Als ie er is: "Get in touch with [Brand]".
 *  - Anders: "Get in touch" (generiek). Helpt totdat Johan de
 *    brand-resolve klaar heeft — kaart blijft werken.
 */

import { useAuth } from '@/components/providers/AuthContext'

export interface GetInTouchCardProps {
  materialSlug: string
  /** Brand-naam — alleen renderen als bekend. */
  brandName?: string | null
}

export function GetInTouchCard({ materialSlug, brandName }: GetInTouchCardProps) {
  const { isLoggedIn } = useAuth()
  const signInHref = `/sign-in?next=${encodeURIComponent(`/materials/${materialSlug}`)}`

  const title = brandName
    ? `Get in touch with ${brandName}`
    : 'Get in touch'

  return (
    <aside className="mat-getintouch" aria-labelledby="getintouch-title">
      <p className="mat-getintouch-eyebrow">Interested in this material?</p>
      <h2 id="getintouch-title" className="mat-getintouch-title">
        {title}
      </h2>
      <p className="mat-getintouch-body">
        Request a sample, catalogue or call — organised through MaterialDistrict.
      </p>

      {isLoggedIn ? (
        <a
          href="#sample-request"
          className="mat-getintouch-primary"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.63 3.4 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.82a16 16 0 0 0 6 6l.92-.92a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 16l.19.92z" />
          </svg>
          Get in touch
        </a>
      ) : (
        <>
          <a href={signInHref} className="mat-getintouch-primary">
            Sign in to get in touch
          </a>
          <a href="/register" className="mat-getintouch-secondary">
            Create a free account
          </a>
        </>
      )}
    </aside>
  )
}
