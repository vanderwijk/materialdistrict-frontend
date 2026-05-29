'use client'

/**
 * HomeHero — de gast-hero bovenaan de homepage (sessie 10).
 *
 * Client-component omdat de zichtbaarheid van `useAuth().isLoggedIn` afhangt
 * (alleen tonen voor uitgelogde bezoekers, mockup-gedrag) en omdat de
 * dismiss-knop in localStorage schrijft. AuthContext wordt server-side
 * gehydrateerd (sessie B1/B2, beslissing 66), dus voor een gast staat de
 * hero óók in de SSR-HTML — geen flash, LCP-vriendelijk.
 *
 * De canonieke <h1> van de pagina staat (visueel verborgen) in de
 * server-component page.tsx; de zichtbare hero-titel is daarom een <h2>.
 */

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/components/providers/AuthContext'

const DISMISS_KEY = 'md_hero_dismissed'

function formatCount(n: number): string {
  return new Intl.NumberFormat('en-US').format(n)
}

interface HomeHeroProps {
  /** Live material-telling voor de hero-copy ("3,200+"). */
  materialCount: number
}

export function HomeHero({ materialCount }: HomeHeroProps) {
  const { isLoggedIn } = useAuth()
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    try {
      if (window.localStorage.getItem(DISMISS_KEY) === '1') setDismissed(true)
    } catch {
      /* localStorage niet beschikbaar — hero gewoon tonen. */
    }
  }, [])

  if (isLoggedIn || dismissed) return null

  function dismiss() {
    try {
      window.localStorage.setItem(DISMISS_KEY, '1')
    } catch {
      /* negeren */
    }
    setDismissed(true)
  }

  return (
    <section className="hero" aria-label="MaterialDistrict introduction">
      <div className="hero-inner">
        <div className="hero-left">
          <p className="hero-eyebrow">Discover materials</p>
          <h2 className="hero-title">Where materials meet ideas.</h2>
          <p className="hero-desc">
            {formatCount(materialCount)}+ innovative and sustainable materials
            for architecture and interior design. Free to explore.
          </p>
          <div className="hero-actions">
            <Link href="/materials" className="btn btn-green btn-lg">
              Browse materials
            </Link>
            <Link href="/register" className="btn btn-lg btn-hero-ghost">
              Create free account
            </Link>
          </div>
        </div>
        <div className="hero-right">
          <button
            type="button"
            className="hero-dismiss"
            onClick={dismiss}
            aria-label="Dismiss manufacturer message"
          >
            ×
          </button>
          <p className="hero-eyebrow hero-eyebrow-muted">For manufacturers</p>
          <p className="hero-right-title">
            List your materials. Reach 80,000+ specifiers.
          </p>
          <p className="hero-desc">
            Add your materials, connect with architects and designers, and track
            every interaction.
          </p>
          <Link href="/register" className="btn btn-lg btn-hero-ghost">
            List your materials →
          </Link>
        </div>
      </div>
    </section>
  )
}
