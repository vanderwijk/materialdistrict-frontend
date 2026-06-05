'use client'

/**
 * GetInTouchCard
 * ----------------------------------------------------------------------
 * Donkere CTA-card voor de detail-page-sidebar. Volgt de mockup-stijl
 * (`var(--navy)` achtergrond, witte typografie, prominente groene
 * primary-button).
 *
 * Twee gedrags-modes op basis van login-status:
 *  - Anoniem: knoppen linken naar /sign-in?next=<huidige path>, kleine
 *    link naar /register eronder.
 *  - Logged-in: knop opent de GetInTouchModal — een formulier met 5
 *    request-opties (Call me back, Send me a catalogue, Find a rep,
 *    Send me a sample, I have a different question) plus optionele
 *    message. POSTs naar /api/get-in-touch.
 *
 * Brand-naam:
 *  - Optioneel. Als ie er is: "Get in touch with [Brand]".
 *  - Anders: "Get in touch" (generiek). Werkt totdat Johan de
 *    brand-resolve klaar heeft.
 */

import { useState } from 'react'
import { useAuth } from '@/components/providers/AuthContext'
import { GetInTouchModal } from './GetInTouchModal'

export interface GetInTouchCardProps {
  materialSlug: string
  materialId: number
  materialTitle: string
  /** Brand-naam — alleen renderen als bekend. */
  brandName?: string | null
  /** Lead-routing + Insider-gate, doorgegeven aan de modal. */
  restrictToListedCountries?: boolean
  acceptedCountries?: string[]
  brandWebsite?: string | null
  sampleRequestsInsidersOnly?: boolean
}

export function GetInTouchCard({
  materialSlug,
  materialId,
  materialTitle,
  brandName,
  restrictToListedCountries,
  acceptedCountries,
  brandWebsite,
  sampleRequestsInsidersOnly,
}: GetInTouchCardProps) {
  const { isLoggedIn } = useAuth()
  const [modalOpen, setModalOpen] = useState(false)
  const signInHref = `/sign-in?next=${encodeURIComponent(`/materials/${materialSlug}`)}`

  const title = brandName
    ? `Get in touch with ${brandName}`
    : 'Get in touch'

  return (
    <>
      <aside className="mat-getintouch" aria-labelledby="getintouch-title">
        <p className="mat-getintouch-eyebrow">Interested in this material?</p>
        <h2 id="getintouch-title" className="mat-getintouch-title">
          {title}
        </h2>
        <p className="mat-getintouch-body">
          Request a sample, catalogue or call — organised through MaterialDistrict.
        </p>

        {isLoggedIn ? (
          <button
            type="button"
            className="mat-getintouch-primary"
            onClick={() => setModalOpen(true)}
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
          </button>
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

      <GetInTouchModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        materialId={materialId}
        materialTitle={materialTitle}
        brandName={brandName}
        restrictToListedCountries={restrictToListedCountries}
        acceptedCountries={acceptedCountries}
        brandWebsite={brandWebsite}
        sampleRequestsInsidersOnly={sampleRequestsInsidersOnly}
      />
    </>
  )
}
