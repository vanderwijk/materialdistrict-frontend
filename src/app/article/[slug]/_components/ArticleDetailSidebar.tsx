'use client'

/**
 * ArticleDetailSidebar
 * ----------------------------------------------------------------------
 * Sticky sidebar voor de article-detailpagina, conform de mockup
 * (`renderArticleDetail()` aside): reading-progress, "Latest materials",
 * newsletter-signup en — alleen voor niet-members — een Insider-upsell.
 *
 * Sessie 6.
 *
 * Client-component omdat (a) de Insider-upsell van `useAuth().isMember`
 * afhangt en (b) de newsletter-input interactief is. De latest-materials
 * komen als props mee uit de server-fetch op de page (geen client-fetch).
 *
 * Bewust GEPARKEERD t.o.v. de mockup-sidebar (genoteerd in open-issues):
 *  - De compare-toggle op de latest-materials-items: compare is een
 *    material-feature; in een article-sidebar voegt het ruis toe. De
 *    items zijn hier read-only links naar de material-detail.
 *  - De "Reading tip: book"-kaart met Insider-korting: hangt aan
 *    WooCommerce + de Insider-kortinglogica (sessie 9). Parkeren tot dan.
 *
 * Reading-progress is in v1 statisch (zoals de mockup: een vaste 35%).
 * Een echte scroll-gekoppelde progress kan later — geen blocker.
 */

import { useAuth } from '@/components/providers/AuthContext'
import { Button } from '@/components/ui'

export interface ArticleSidebarMaterial {
  id: number
  slug: string
  title: string
  brandName: string | null
  heroUrl?: string
}

export interface ArticleDetailSidebarProps {
  latestMaterials: ArticleSidebarMaterial[]
}

export function ArticleDetailSidebar({
  latestMaterials,
}: ArticleDetailSidebarProps) {
  const { isMember } = useAuth()

  return (
    <aside className="article-detail-sidebar">
      {/* Latest materials */}
      {latestMaterials.length > 0 && (
        <div className="article-side-card is-list">
          <div className="article-side-list-head">Latest materials</div>
          <ul className="article-side-list" role="list">
            {latestMaterials.map((m) => (
              <li key={m.id}>
                <a
                  href={`/material/${m.slug}`}
                  className="article-side-list-item"
                >
                  <span
                    className="article-side-list-thumb"
                    style={
                      m.heroUrl
                        ? { backgroundImage: `url(${m.heroUrl})` }
                        : undefined
                    }
                    aria-hidden="true"
                  />
                  <span className="article-side-list-text">
                    <span className="article-side-list-title">{m.title}</span>
                    {m.brandName && (
                      <span className="article-side-list-sub">
                        {m.brandName}
                      </span>
                    )}
                  </span>
                </a>
              </li>
            ))}
          </ul>
          <a href="/material" className="article-side-list-all">
            All materials →
          </a>
        </div>
      )}

      {/* Newsletter */}
      <div className="article-side-newsletter">
        <div className="article-side-newsletter-eyebrow">Newsletter</div>
        <div className="article-side-newsletter-title">
          Twice-weekly materials digest
        </div>
        <p className="article-side-newsletter-body">
          New materials and articles twice a week. No spam.
        </p>
        <div className="article-side-newsletter-row">
          <label
            className="u-visually-hidden"
            htmlFor="article-newsletter-email"
          >
            Your email
          </label>
          <input
            id="article-newsletter-email"
            type="email"
            placeholder="Your email"
            className="article-side-newsletter-input"
            autoComplete="email"
          />
          <Button variant="green" size="sm">
            Sign up
          </Button>
        </div>
      </div>

      {/* Insider upsell — alleen voor niet-members */}
      {!isMember && (
        <div className="article-side-upsell">
          <div className="article-side-upsell-eyebrow">Unlock all articles</div>
          <div className="article-side-upsell-title">
            Read every in-depth story
          </div>
          <p className="article-side-upsell-body">
            Insiders read every in-depth article, get quarterly trend reports
            and 1 free event entry per year.
          </p>
          <Button
            as="link"
            href="/membership"
            variant="insider"
            size="sm"
            className="article-side-upsell-btn"
          >
            Become an Insider — €10/mo
          </Button>
        </div>
      )}
    </aside>
  )
}
