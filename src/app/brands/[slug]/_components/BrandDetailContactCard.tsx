'use client'

/**
 * BrandDetailContactCard
 * ----------------------------------------------------------------------
 * Donkere CTA-card in de brand-detail-sidebar. Volgt de mockup
 * `renderBrandDetail()` (sidebar, navy panel):
 *
 *   [logo] Brand name
 *          Country
 *   GET IN TOUCH
 *   Contact [Brand]
 *   Request samples, catalogues or a meeting — through MaterialDistrict.
 *   [ Send message ]            ← ingelogd: opent modal
 *   [ Visit website ↗ ]          ← als website bekend
 *   [in] [x] [yt] ...            ← socials, als bekend
 *
 * Anoniem: knop wordt "Sign in to contact" → /sign-in?next=<brand-path>,
 * met kleine "Create a free account"-regel.
 *
 * Hergebruikt <GetInTouchModal> in brand-context (brandId i.p.v.
 * materialId). De modal is daarvoor in sessie 5 contextonafhankelijk
 * gemaakt.
 */

import { useState } from 'react'
import { useAuth } from '@/components/providers/AuthContext'
import { logInteractionEvent } from '@/lib/api/interactions'
import { GetInTouchModal } from '@/app/materials/[slug]/_components/GetInTouchModal'
import {
  IconLinkedin,
  IconX,
  IconFacebook,
  IconInstagram,
  IconYoutube,
} from '@/components/ui/icons'

export interface BrandDetailContactCardProps {
  brandId: number
  brandName: string
  brandSlug: string
  /** Leesbare landnaam — onder de brand-naam in de header. */
  country: string | null
  website: string | null
  socials: {
    facebook: string | null
    instagram: string | null
    linkedin: string | null
    twitter: string | null
    youtube: string | null
  }
}

function getInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return '?'
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
  return (words[0][0] + words[1][0]).toUpperCase()
}

export function BrandDetailContactCard({
  brandId,
  brandName,
  brandSlug,
  country,
  website,
  socials,
}: BrandDetailContactCardProps) {
  const { isLoggedIn } = useAuth()
  const [modalOpen, setModalOpen] = useState(false)
  const signInHref = `/sign-in?next=${encodeURIComponent(`/brands/${brandSlug}`)}`

  const socialLinks = [
    { url: socials.linkedin, label: 'LinkedIn', Icon: IconLinkedin },
    { url: socials.twitter, label: 'X', Icon: IconX },
    { url: socials.facebook, label: 'Facebook', Icon: IconFacebook },
    { url: socials.instagram, label: 'Instagram', Icon: IconInstagram },
    { url: socials.youtube, label: 'YouTube', Icon: IconYoutube },
  ].filter((s): s is { url: string; label: string; Icon: typeof IconLinkedin } =>
    Boolean(s.url),
  )

  return (
    <>
      <aside
        className="brand-contact-card"
        aria-labelledby="brand-contact-title"
      >
        <div className="brand-contact-head">
          <span className="brand-contact-mark" aria-hidden="true">
            {getInitials(brandName)}
          </span>
          <span className="brand-contact-head-text">
            <span className="brand-contact-head-name">{brandName}</span>
            {country && (
              <span className="brand-contact-head-country">{country}</span>
            )}
          </span>
        </div>

        <p className="brand-contact-eyebrow">Get in touch</p>
        <h2 id="brand-contact-title" className="brand-contact-title">
          Contact {brandName}
        </h2>
        <p className="brand-contact-body">
          Request samples, catalogues or a meeting — through MaterialDistrict.
        </p>

        {isLoggedIn ? (
          <>
            <button
              type="button"
              className="brand-contact-primary"
              onClick={() => setModalOpen(true)}
            >
              Send message
            </button>
            {website && (
              <a
                href={website}
                target="_blank"
                rel="noopener noreferrer"
                className="brand-contact-website"
                onClick={() =>
                  logInteractionEvent({ type: 'website_click', brandId })
                }
              >
                Visit website <span aria-hidden="true">↗</span>
              </a>
            )}
            {socialLinks.length > 0 && (
              <div className="brand-contact-socials">
                {socialLinks.map(({ url, label, Icon }) => (
                  <a
                    key={label}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="brand-contact-social"
                    aria-label={label}
                    title={label}
                  >
                    <Icon size={13} />
                  </a>
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            <a href={signInHref} className="brand-contact-primary">
              Sign in to contact
            </a>
            <p className="brand-contact-signin-hint">Create a free account</p>
          </>
        )}
      </aside>

      {isLoggedIn && (
        <GetInTouchModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          brandId={brandId}
          title={brandName}
          brandName={brandName}
        />
      )}
    </>
  )
}
