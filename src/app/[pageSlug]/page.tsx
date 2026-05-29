/**
 * Generieke contentpagina-template — `/[pageSlug]`
 * ----------------------------------------------------------------------
 * Eén dynamische route voor de statische redactionele site-pagina's
 * (About, FAQ, Jobs, Become a partner, Privacy Statement). Gevoed door het
 * WP-core `page`-posttype.
 *
 * Beveiliging: alleen route-segmenten uit de allowlist
 * (`src/lib/config/static-pages.ts`) worden gefetcht en gegenereerd.
 * Onbekende of niet-toegestane segmenten → notFound(). Zo lekken
 * account-/systeempagina's (sign-in, invoices, …) nooit via deze template.
 *
 * Statische segmenten (/articles, /events, /materials, /brands, /talks,
 * /books, /contact) winnen in Next altijd van dit dynamische segment, dus
 * geen botsing — die slugs staan ook niet in de allowlist.
 *
 * Sessie 11 (29-05-2026). Bron: instructie-andere-agent-standaard-paginas.md.
 */

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPage } from '@/lib/api'
import { buildPageMetadata } from '@/lib/seo/page-metadata'
import { STATIC_PAGE_SLUGS, wpSlugForRoute } from '@/lib/config/static-pages'
// Hergebruikt de gedeelde prose-renderer (zelfde als de article-body).
import { MaterialBody } from '@/app/materials/[slug]/_components/MaterialBody'

interface StaticPageProps {
  params: Promise<{ pageSlug: string }>
}

/**
 * Alleen de allowlist-segmenten zijn geldige routes. Elk ander single-segment
 * pad krijgt zo Next's echte 404 (HTTP 404) zonder dat deze page-component
 * draait — dus geen soft-404 (HTTP 200) voor willekeurige paden, en deze
 * catch-all kapt geen onbekende paden af.
 */
export const dynamicParams = false

/**
 * Pre-render alle allowlist-pagina's op build-time. In combinatie met
 * `dynamicParams = false` is dit tevens de harde routegrens.
 */
export function generateStaticParams(): Array<{ pageSlug: string }> {
  return STATIC_PAGE_SLUGS.map((pageSlug) => ({ pageSlug }))
}

export async function generateMetadata({
  params,
}: StaticPageProps): Promise<Metadata> {
  const { pageSlug } = await params
  const wpSlug = wpSlugForRoute(pageSlug)
  if (!wpSlug) {
    return { title: 'Page not found', robots: { index: false, follow: false } }
  }

  const page = await getPage(wpSlug)
  if (!page) {
    return { title: 'Page not found', robots: { index: false, follow: false } }
  }

  return buildPageMetadata(page, `/${pageSlug}`)
}

export default async function StaticContentPage({ params }: StaticPageProps) {
  const { pageSlug } = await params

  // Allowlist-gate: niet-toegestane segmenten bestaan niet als contentpagina.
  const wpSlug = wpSlugForRoute(pageSlug)
  if (!wpSlug) notFound()

  const page = await getPage(wpSlug)
  if (!page) notFound()

  return (
    <main className="ov-wrap-single">
      <h1 className="page-title">{page.title}</h1>
      <MaterialBody html={page.contentHtml} />
    </main>
  )
}
