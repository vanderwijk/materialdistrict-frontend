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
 * Statische segmenten (/article, /event, /material, /brand, /talk,
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
import { MaterialBody } from '@/app/material/[slug]/_components/MaterialBody'

interface StaticPageProps {
  params: Promise<{ pageSlug: string }>
}

// Alleen de allowlist-segmenten zijn geldige params. Defense-in-depth naast
// de notFound()-gate in de component zelf.
export const dynamicParams = false

// BELANGRIJK: deze route heeft bewust GEEN loading.tsx. Een loading-boundary
// maakt een Suspense-shell die direct als HTTP 200 wordt gestreamd; een
// daarna aangeroepen notFound() kan de status dan niet meer naar 404 zetten
// (soft-404). Zonder loading.tsx commit notFound() vóór het streamen, dus
// onbekende slugs krijgen een echte HTTP 404.

/** Pre-render alle allowlist-pagina's op build-time. */
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
