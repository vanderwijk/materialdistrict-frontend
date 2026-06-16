'use client'

/**
 * BrandInfoCard
 * ----------------------------------------------------------------------
 * Sidebar-card met brand-info onder de Get in touch-card.
 *
 *  ┌─────────────────────────────────────┐
 *  │  [FN]  Forbo Netherlands       >    │
 *  │        Netherlands                  │
 *  ├─────────────────────────────────────┤
 *  │  Sign in to view full brand details │
 *  │  and contact information.           │
 *  │  [        Sign in        ]          │
 *  └─────────────────────────────────────┘
 *
 * Initialen-vierkant: simpele kleurvlakje + 1-2 letters uit brand-naam.
 * Klik op de hele bovenste rij → /brands/[slug]. Het onderste gated-blok
 * tonen we alleen voor niet-ingelogde users.
 *
 * Brand-slug is voorlopig de geslugifieerde brand-naam — zodra we de
 * echte slug uit WP krijgen kan deze component die direct gebruiken.
 */

import Link from 'next/link'
import { useAuth } from '@/components/providers/AuthContext'

export interface BrandInfoCardProps {
  brandName: string
  /** Voor de chevron-link: brand-slug. Wanneer null → niet linken. */
  brandSlug?: string | null
  /** Brand-country uit WP (niet altijd beschikbaar). */
  country?: string | null
  materialSlug: string
}

function getInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return '?'
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
  return (words[0][0] + words[1][0]).toUpperCase()
}

export function BrandInfoCard({
  brandName,
  brandSlug,
  country,
  materialSlug,
}: BrandInfoCardProps) {
  const { isLoggedIn } = useAuth()
  const initials = getInitials(brandName)
  const signInHref = `/sign-in?next=${encodeURIComponent(`/material/${materialSlug}`)}`

  const headerContent = (
    <>
      <span className="mat-brand-card-mark" aria-hidden="true">
        {initials}
      </span>
      <span className="mat-brand-card-text">
        <span className="mat-brand-card-name">{brandName}</span>
        {country && (
          <span className="mat-brand-card-country">{country}</span>
        )}
      </span>
      {brandSlug && (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="mat-brand-card-chevron"
          aria-hidden="true"
        >
          <polyline points="9 18 15 12 9 6" />
        </svg>
      )}
    </>
  )

  return (
    <section className="mat-brand-card" aria-label={`Brand: ${brandName}`}>
      {brandSlug ? (
        <Link href={`/brand/${brandSlug}`} className="mat-brand-card-header">
          {headerContent}
        </Link>
      ) : (
        <div className="mat-brand-card-header is-static">{headerContent}</div>
      )}

      {!isLoggedIn && (
        <div className="mat-brand-card-gated">
          <p className="mat-brand-card-gated-msg">
            Sign in to view full brand details, website and contact information.
          </p>
          <a href={signInHref} className="mat-brand-card-gated-cta">
            Sign in
          </a>
        </div>
      )}
    </section>
  )
}
