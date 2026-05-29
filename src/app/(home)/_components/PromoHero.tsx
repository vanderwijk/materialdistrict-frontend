'use client'

/**
 * PromoHero — de blauw/groene promoband bovenaan, alleen voor uitgelogde
 * bezoekers (sessie 10). Zichtbaarheid + dismiss lopen via HomeHeroProvider,
 * zodat wegklikken direct de FeaturedArticleHero toont.
 *
 * De canonieke <h1> van de pagina staat (visueel verborgen) in page.tsx; de
 * zichtbare hero-titel is daarom een <h2>.
 */

import Link from 'next/link'
import { useHomeHero } from './HomeHeroProvider'

function formatCount(n: number): string {
  return new Intl.NumberFormat('en-US').format(n)
}

interface PromoHeroProps {
  /** Live material-telling voor de hero-copy ("3,200+"). */
  materialCount: number
}

export function PromoHero({ materialCount }: PromoHeroProps) {
  const { showPromo, dismissPromo } = useHomeHero()
  if (!showPromo) return null

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
            onClick={dismissPromo}
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
