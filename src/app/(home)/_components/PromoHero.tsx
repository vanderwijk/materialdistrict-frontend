'use client'

/**
 * PromoHero — de split-hero bovenaan, alleen voor uitgelogde bezoekers
 * (sessie 10, herstijld in F2 naar "wit op canvas"). Eén bordered blok met
 * twee gelijkwaardige helften (50/50): links de discover-pitch (wit), rechts
 * de manufacturer-pitch (ink). Zichtbaarheid + dismiss lopen via
 * HomeHeroProvider, zodat wegklikken direct de FeaturedArticleHero toont.
 *
 * Concept (F2): twee groepen samengebracht, gelijke typografie aan beide
 * kanten; de koppen vormen een keten ideas -> materials -> specifiers.
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
    <section className="hp-hero" aria-label="MaterialDistrict introduction">
      <div className="hp-hero-block">
        <button
          type="button"
          className="hero-dismiss"
          onClick={dismissPromo}
          aria-label="Dismiss introduction"
        >
          ×
        </button>

        <div className="hero-left">
          <p className="hero-eyebrow">Discover materials</p>
          <h2 className="hero-title">Where ideas meet materials.</h2>
          <p className="hero-desc">
            {formatCount(materialCount)}+ innovative and sustainable materials
            for architecture and interior design. Free to explore.
          </p>
          <div className="hero-actions">
            <Link href="/register" className="btn btn-lg btn-ink">
              Create free account
            </Link>
            <Link href="/material" className="btn btn-lg btn-outline">
              Browse materials
            </Link>
          </div>
        </div>

        <div className="hero-mf">
          <p className="eyebrow">For manufacturers</p>
          <p className="t">Where materials meet specifiers.</p>
          <p>
            List your materials and connect with 80,000+ architects and
            designers.
          </p>
          <div className="hero-actions">
            <Link href="/become-a-partner" className="btn btn-lg btn-on-ink">
              List your materials →
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
