/**
 * `/` — Homepage (build-order stap 10, sessie 10).
 *
 * Staat in route-group `(home)` zodat de homepage-`loading.tsx` alleen voor de
 * homepage geldt en niet app-breed een Suspense-boundary maakt (anders soft-404
 * op `[pageSlug]`/auth-routes — zie Johan-instructie 29-05). De route-group
 * verandert de URL niet: dit serveert nog steeds `/`.
 *
 * Server Component. Aggregeert de content-types tot één "magazine"-pagina. Eén
 * Promise.all (materials/articles/events); books volgt zodra de Books-domeinlaag
 * er is (nu placeholder).
 *
 * Hero-bovenkant: gast ziet de promo-band (PromoHero); klikt die weg → dan
 * verschijnt de FeaturedArticleHero. Ingelogde users zien meteen de
 * FeaturedArticleHero. De wissel loopt via HomeHeroProvider (gedeelde state).
 *
 * SEO: één canonieke <h1> (visueel verborgen, altijd aanwezig — de promo-hero
 * kan verborgen zijn), section-koppen als <h2>, WebSite + Organization JSON-LD.
 */

import type { Metadata } from 'next'
import Link from 'next/link'
import { ContentCard } from '@/components/ui'
import { listMaterials, listArticles, listEvents } from '@/lib/api'
import { JsonLd, buildWebSite, buildOrganization } from '@/lib/seo'
import { STORY_TYPE_META } from '@/lib/config/story-types'
import { sortEventsByDate } from '@/app/events/_lib/events-order'
import { EventCard } from '@/app/events/_components/EventCard'
import { HomeHeroProvider } from './_components/HomeHeroProvider'
import { PromoHero } from './_components/PromoHero'
import {
  FeaturedArticleHero,
  type FeaturedArticleVM,
} from './_components/FeaturedArticleHero'
import { InsiderCtaBlock } from './_components/InsiderCtaBlock'
import {
  TopStoriesWidget,
  type StoryListItem,
} from './_components/TopStoriesWidget'

/** Aggregatie ververst elke 10 min (overzicht-cadence uit de kwaliteitseisen). */
export const revalidate = 600

/** Brede enkele fetch — voedt latest + featured + count in één call. */
const MATERIALS_FETCH = 24
const ARTICLES_FETCH = 12
const EVENTS_FETCH = 100
/** Terugval voor de hero-telling als de count onverwacht 0/onbekend is. */
const MATERIALS_COUNT_FALLBACK = 3200

/** Statische marketing-content (geen WP-bron in v1; zie open-issues S10.x). */
const QUOTES = [
  {
    quote:
      'MaterialDistrict is the first place I look when I need a material that is both beautiful and responsible.',
    name: 'Sofie Janssen',
    role: 'Interior architect',
  },
  {
    quote:
      'A single platform to discover, compare and request samples. It saved my studio days of research.',
    name: 'Marc de Vries',
    role: 'Product designer',
  },
  {
    quote:
      'The stories connect materials to real projects and people. That context is what makes it stick.',
    name: 'Elena Rossi',
    role: 'Architect',
  },
] as const

/** Placeholder-partners tot er een echte partners-bron is (open issue S10.x). */
const PARTNERS = [
  'Partner One',
  'Partner Two',
  'Partner Three',
  'Partner Four',
  'Partner Five',
  'Partner Six',
] as const

export const metadata: Metadata = {
  title: { absolute: 'MaterialDistrict — Where materials meet ideas' },
  description:
    '3,200+ innovative and sustainable materials for architecture and interior design, plus stories, events and books. Free to explore.',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'MaterialDistrict — Where materials meet ideas',
    description:
      '3,200+ innovative and sustainable materials for architecture and interior design.',
    type: 'website',
    url: '/',
  },
}

/** Datumlabel — en-GB, consistent met de overzicht/detail-pages. */
function formatDate(value: string): string {
  return new Date(value).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export default async function HomePage() {
  const [matRes, artRes, eventRes] = await Promise.all([
    listMaterials({ perPage: MATERIALS_FETCH }),
    listArticles({ perPage: ARTICLES_FETCH }),
    listEvents({ perPage: EVENTS_FETCH }),
  ])

  // --- Materials: één fetch, meerdere afgeleiden -------------------------
  const materialCount =
    matRes.total > 0 ? matRes.total : MATERIALS_COUNT_FALLBACK
  const latestMaterials = matRes.items.slice(0, 3)
  const featuredPool = matRes.items.filter((m) => m.featured)
  const featuredMaterials = (
    featuredPool.length > 0 ? featuredPool : matRes.items
  ).slice(0, 3)

  // --- Articles ----------------------------------------------------------
  const latestStories = artRes.items.slice(0, 3)

  // Featured-article hero = het nieuwste/eerste artikel (= top story).
  const lead = artRes.items[0] ?? null
  const featuredArticle: FeaturedArticleVM | null = lead
    ? {
        href: `/articles/${lead.slug}`,
        title: lead.title,
        thumbUrl: lead.hero?.sourceUrl,
        meta: `${formatDate(lead.date)} · Article`,
      }
    : null

  // --- Events: featured & aankomend eerst, anders eerstvolgende ----------
  const orderedEvents = sortEventsByDate(eventRes.items)
  const upcoming = orderedEvents.filter((e) => !e.isPast)
  const featuredEvent = upcoming.find((e) => e.featured) ?? upcoming[0] ?? null

  // --- Sidebar (Top stories): articles + materials, al gemapt ------------
  const sidebarArticles: StoryListItem[] = artRes.items.slice(0, 5).map((a) => ({
    href: `/articles/${a.slug}`,
    thumbUrl: a.hero?.sourceUrl,
    label: `${formatDate(a.date)} — ${STORY_TYPE_META[a.type].label}`,
    title: a.title,
  }))
  const sidebarMaterials: StoryListItem[] = matRes.items.slice(0, 4).map((m) => ({
    href: `/materials/${m.slug}`,
    thumbUrl: m.hero?.sourceUrl,
    label: m.brandName ?? 'Material',
    title: m.title,
  }))

  return (
    <HomeHeroProvider>
      <div className="fade-in">
        <h1 className="sr-only">
          MaterialDistrict — materials, stories, events and books
        </h1>

        <PromoHero materialCount={materialCount} />

        {/* Categorierij — minimale strip (volledige carousel = follow-up S10.x). */}
        <nav className="hp-cats" aria-label="Material categories">
          <div className="hp-cats-inner">
            <Link href="/materials" className="hp-cat-link">
              All materials
            </Link>
          </div>
        </nav>

        <div className="hp-main">
          <div className="hp-content">
            {/* Featured-article hero (verschijnt als de promo-hero weg is) */}
            <FeaturedArticleHero article={featuredArticle} />

            {/* Latest materials */}
            <section className="hp-section">
              <div className="section-hd">
                <h2 className="section-title">Latest materials</h2>
                <Link href="/materials" className="section-link">
                  All materials →
                </Link>
              </div>
              <div className="grid-3">
                {latestMaterials.map((m) => (
                  <ContentCard
                    key={m.id}
                    href={`/materials/${m.slug}`}
                    contentType="material"
                    thumbSrc={m.hero?.sourceUrl}
                    thumbAlt={m.hero?.alt ?? m.title}
                    eyebrow={m.brandName ?? undefined}
                    title={m.title}
                  />
                ))}
              </div>
            </section>

            {/* Latest stories */}
            <section className="hp-section">
              <div className="section-hd">
                <h2 className="section-title">Latest stories</h2>
                <Link href="/articles" className="section-link">
                  All articles →
                </Link>
              </div>
              <div className="grid-3">
                {latestStories.map((a) => (
                  <ContentCard
                    key={a.id}
                    href={`/articles/${a.slug}`}
                    contentType="article"
                    thumbSrc={a.hero?.sourceUrl}
                    thumbAlt={a.hero?.alt ?? a.title}
                    eyebrow={formatDate(a.date)}
                    title={a.title}
                    tagLabel={STORY_TYPE_META[a.type].label}
                    channelTags={a.channels.map((c) => c.label)}
                    isInsiderOnly={a.insiderOnly}
                  />
                ))}
              </div>
            </section>

            {/* Featured materials */}
            <section className="hp-section">
              <div className="section-hd">
                <h2 className="section-title">Featured materials</h2>
                <Link href="/materials" className="section-link">
                  All materials →
                </Link>
              </div>
              <div className="grid-3">
                {featuredMaterials.map((m) => (
                  <ContentCard
                    key={m.id}
                    href={`/materials/${m.slug}`}
                    contentType="material"
                    thumbSrc={m.hero?.sourceUrl}
                    thumbAlt={m.hero?.alt ?? m.title}
                    eyebrow={m.brandName ?? undefined}
                    title={m.title}
                  />
                ))}
              </div>
            </section>

            {/* Events + Books */}
            <section className="hp-section">
              <div className="grid-2">
                <div>
                  <div className="section-hd">
                    <h2 className="section-title">Events</h2>
                    <Link href="/events" className="section-link">
                      All events →
                    </Link>
                  </div>
                  {featuredEvent ? (
                    <EventCard event={featuredEvent} />
                  ) : (
                    <p className="hp-empty">No featured events at this time.</p>
                  )}
                </div>
                <div>
                  <div className="section-hd">
                    <h2 className="section-title">Books</h2>
                    <Link href="/books" className="section-link">
                      All books →
                    </Link>
                  </div>
                  {/* Placeholder — Books-domeinlaag (type/listBooks/membership)
                      nog niet beschikbaar. Wordt aangehaakt zodra die er zijn. */}
                  <p className="hp-empty">Featured books are coming soon.</p>
                </div>
              </div>
            </section>

            {/* Insider-CTA (verborgen voor actieve Insiders) */}
            <InsiderCtaBlock />

            {/* What users say (statisch in v1) */}
            <section className="hp-section">
              <div className="section-hd">
                <h2 className="section-title">What users say</h2>
              </div>
              <div className="quote-grid">
                {QUOTES.map((q) => (
                  <figure className="quote-card" key={q.name}>
                    <div className="quote-mark" aria-hidden="true">
                      &ldquo;
                    </div>
                    <blockquote className="quote-text">{q.quote}</blockquote>
                    <div className="quote-divider" aria-hidden="true" />
                    <figcaption>
                      <div className="quote-name">{q.name}</div>
                      <div className="quote-role">{q.role}</div>
                    </figcaption>
                  </figure>
                ))}
              </div>
            </section>

            {/* Featured partners (placeholder-bron in v1 — open issue S10.x) */}
            <section className="hp-section">
              <div className="section-hd">
                <h2 className="section-title">Featured partners</h2>
              </div>
              <div className="partner-grid">
                {PARTNERS.map((p) => (
                  <div className="partner-card" key={p}>
                    {p}
                  </div>
                ))}
              </div>
            </section>
          </div>

          <aside className="hp-sidebar" aria-label="More from MaterialDistrict">
            <TopStoriesWidget
              articles={sidebarArticles}
              materials={sidebarMaterials}
            />

            {/* Manufacturer-promo */}
            <div className="sidebar-cta">
              <p className="sidebar-cta-eyebrow">For manufacturers</p>
              <p className="sidebar-cta-title">
                Show your material to architects &amp; specifiers
              </p>
              <p className="sidebar-cta-desc">
                Add your materials to the platform and become visible in a
                curated guide for sustainable architecture.
              </p>
              <Link href="/register" className="btn btn-green">
                Add your materials →
              </Link>
            </div>

            {/* Books-sidebarwidget volgt met de Books-domeinlaag. */}
          </aside>
        </div>

        <JsonLd data={[buildWebSite(), buildOrganization()]} />
      </div>
    </HomeHeroProvider>
  )
}
