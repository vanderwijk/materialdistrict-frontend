'use client'

/**
 * ArticleBodyGate — gating-laag rond de article-body (D2, Optie A).
 *
 * Sessie 6.
 *
 * Neemt het gating-besluit dat in de mockup in `renderArticleDetail()` →
 * `renderBody()` zit: `(insiderOnly) && !isMember`. Omdat dat besluit van
 * `useAuth().isMember` (client) afhangt, is dit een client-component; de
 * page eromheen blijft een server-component.
 *
 * Twee toestanden:
 *  - Toegang (niet-gated, of Insider-member): de volledige body via
 *    <MaterialBody> (prose + ?q=-highlighting hergebruikt).
 *  - Gated (insiderOnly && niet-member): een zichtbare preview (de
 *    excerpt/lead) gevolgd door <InsiderGate variant="paywall"
 *    feature="article"> — het article cut-off-patroon uit de mockup.
 *
 * Bewuste keuze (sessie 6, Q2): we splitsen de contentHtml-blob NIET op
 * `\n\n` zoals de mockup-stub doet — dat is broos op echte WP-HTML. In
 * plaats daarvan tonen we de redactionele `excerptHtml` als preview boven
 * de gate. Robuuster en redactioneel bedoeld als teaser.
 *
 * Optie A: zolang Johan `_insider_only` niet levert mapt `insiderOnly`
 * op `false` en valt dit altijd in de toegang-tak — geen gedragswijziging
 * voor bestaande content. Eén mapper-regel activeert de gating.
 */

import { useAuth } from '@/components/providers/AuthContext'
import { InsiderGate } from '@/components/ui'
import { MaterialBody } from '@/app/materials/[slug]/_components/MaterialBody'

export interface ArticleBodyGateProps {
  /** De volledige body-HTML (article.contentHtml, met excerpt-fallback). */
  contentHtml: string
  /** Of dit article Insider-only is (D2, voorbereid). */
  insiderOnly: boolean
  /** Preview-HTML boven de gate voor niet-members (article.excerptHtml). */
  previewHtml?: string
}

export function ArticleBodyGate({
  contentHtml,
  insiderOnly,
  previewHtml,
}: ArticleBodyGateProps) {
  const { isMember } = useAuth()

  const gated = insiderOnly && !isMember

  if (!gated) {
    return <MaterialBody html={contentHtml} />
  }

  return (
    <div className="article-paywall-wrap">
      {previewHtml && (
        <div
          className="article-paywall-preview"
          dangerouslySetInnerHTML={{ __html: previewHtml }}
        />
      )}
      <InsiderGate variant="paywall" feature="article" />
    </div>
  )
}
