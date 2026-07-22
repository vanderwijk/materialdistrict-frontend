/**
 * `/` — Homepage (build-order stap 10, sessie 10).
 *
 * Staat in route-group `(home)` zodat de homepage-`loading.tsx` alleen voor de
 * homepage geldt en niet app-breed een Suspense-boundary maakt (anders soft-404
 * op `[pageSlug]`/auth-routes — zie Johan-instructie 29-05). De route-group
 * verandert de URL niet: dit serveert nog steeds `/`.
 *
 * Server Component. Aggregeert de content-types tot één "magazine"-pagina. Eén
 * Promise.all (materials/articles/events/talks/brands/channels/featured-book).
 * Het featured boek (native WC featured-vlag) verschijnt als tegel naast de
 * featured event; de sidebar-books-widget blijft geparkeerd.
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
import { ContentCard, CardBookmarkButton, CardCompareButton } from '@/components/ui'
import {
  listMaterials,
  listArticles,
  listEvents,
  listTalks,
  listBrands,
  getTerms,
  getChannelsIndex,
  listMaterialsWithFacets,
} from '@/lib/api'
import { decodeHtmlEntities } from '@/lib/utils/decode-html-entities'
import { JsonLd, buildWebSite, buildOrganization, canonicalPath } from '@/lib/seo'
import { STORY_TYPE_META } from '@/lib/config/story-types'
import { sortEventsByDate } from '@/app/event/_lib/events-order'
import { EventCard } from '@/app/event/_components/EventCard'
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
import {
  FeaturedTalkBand,
  type FeaturedTalkVM,
} from './_components/FeaturedTalkBand'
import { type MaterialCategoryLink } from './_components/MaterialCategoryStrip'
import { HomeChannelBar } from './_components/HomeChannelBar'
import { FeaturedPartners } from './_components/FeaturedPartners'
import { SidebarBooks } from './_components/SidebarBooks'
import {
  FeaturedChannel,
  toChannelPlainText,
  type FeaturedChannelVM,
} from './_components/FeaturedChannel'
import { BookCard } from '@/app/book/_components/BookCard'
import { listBooks, listFeaturedBooks } from '@/lib/api/books'
import type { BrandListItem } from '@/types/brand'
import { AdSlot } from '@/components/ads/AdSlot'

const pagePath = canonicalPath('/')

export const metadata: Metadata = {
  title: { absolute: 'MaterialDistrict — Where materials meet ideas' },
  description:
    '3,200+ innovative and sustainable materials for architecture and interior design, plus stories, events and books. Free to explore.',
  alternates: { canonical: pagePath },
  openGraph: {
    title: 'MaterialDistrict — Where materials meet ideas',
    description:
      '3,200+ innovative and sustainable materials for architecture and interior design.',
    type: 'website',
    url: pagePath,
  },
}

/** Aggregatie ververst elke 10 min (overzicht-cadence uit de kwaliteitseisen). */
export const revalidate = 600

/** Brede enkele fetch — voedt latest + featured + count in één call. */
const MATERIALS_FETCH = 24
const ARTICLES_FETCH = 12
const EVENTS_FETCH = 24
const TALKS_FETCH = 12
/** Terugval voor de hero-telling als de count onverwacht 0/onbekend is. */
const MATERIALS_COUNT_FALLBACK = 3200

/** Ad-containers (GAM) — aangesloten op GPT (network 85712959, ad units van
    Johan, 22-07). De slots renderen via <AdSlot/>; ongeboekte posities klappen
    in (collapseEmptyDivs). Zet op false om ze pagina-breed uit te schakelen. */
const ADS_ENABLED = true

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

/** Datumlabel — en-GB, consistent met de overzicht/detail-pages. */
function formatDate(value: string): string {
  return new Date(value).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export default async function HomePage() {
  const [
    matRes,
    artRes,
    eventRes,
    talkRes,
    catTerms,
    brandRes,
    channelsIndex,
    bookRes,
    latestBookRes,
  ] = await Promise.all([
      listMaterials({ perPage: MATERIALS_FETCH }),
      listArticles({ perPage: ARTICLES_FETCH }),
      listEvents({ perPage: EVENTS_FETCH }),
      listTalks({ perPage: TALKS_FETCH }),
      // Material-categorieën voor de snelmenu-strip. Defensief: faalt de
      // taxonomie-fetch, dan degradeert de strip tot alleen "All materials"
      // i.p.v. de hele homepage te laten vallen.
      getTerms('material_category', { perPage: 100, hide_empty: true }).catch(
        () => [],
      ),
      // Brands voor het "Featured brands"-blok. Ruim ophalen zodat we Partner-
      // tier kunnen filteren én kunnen aanvullen. Faalt het → leeg blok.
      listBrands({ perPage: 24 }).catch(() => ({
        items: [],
        total: 0,
        totalPages: 0,
      })),
      // Channels (featured-first gesorteerd) voor het spotlight-blok.
      getChannelsIndex().catch(() => []),
      // Featured boek (native WC featured-vlag, Store API featured=true) voor
      // het tegeltje naast de featured event. Geen featured boek → leeg.
      listFeaturedBooks().catch(() => ({ items: [], total: 0, totalPages: 0 })),
      // Nieuwste boeken voor het sidebar-blokje (rechterkolom). Geen → leeg.
      listBooks({ perPage: 4 }).catch(() => ({ items: [], total: 0, totalPages: 0 })),
    ])

  // --- Material-categorieën: snelmenu-strip (deeplinkt naar het filter) ---
  // Op aantal aflopend (zoals de FacetWP-facet), label HTML-gedecodeerd. De
  // slug matcht de `material_category`-facetwaarde, dus
  // `/material?material_category=<slug>` filtert direct.
  const materialCategories: MaterialCategoryLink[] = catTerms
    .filter((t) => t.slug)
    .map((t) => ({
      label: decodeHtmlEntities(t.name),
      slug: t.slug,
      count: t.count,
    }))

  // --- Channels: navigatie-strip naar /channel/<slug> (Homepage-1, vervangt
  //     de oude material_category-pillen). channelsIndex is featured-first
  //     gesorteerd; labels zijn al gedecodeerd bij de bron. ---
  const channelNav = [...channelsIndex]
    .sort((a, b) => b.count - a.count)
    .map((c) => ({ slug: c.slug, label: c.label }))

  // --- Featured brands: Partner-tier eerst, aangevuld met brands met ≥3
  // materialen. Binnen Partner-tier: handmatige `featured`-vlag vooraan
  // (WP-checkbox; geen rotatielogica in de frontend). Max 6. -----------------
  const partnerBrands = brandRes.items
    .filter((b) => b.partner)
    .sort((a, b) => Number(b.featured) - Number(a.featured))
  const topupBrands = brandRes.items.filter(
    (b) => !b.partner && b.materialCount >= 3,
  )
  // Vul aan tot zes: Partner-tier eerst, dan ≥3-materialen, dan eventueel de
  // resterende brands — gededupliceerd, zodat het blok altijd zes toont
  // (mits er zes brands zijn).
  const seenBrandIds = new Set<number>()
  const featuredPartners: BrandListItem[] = []
  for (const b of [...partnerBrands, ...topupBrands, ...brandRes.items]) {
    if (seenBrandIds.has(b.id)) continue
    seenBrandIds.add(b.id)
    featuredPartners.push(b)
    if (featuredPartners.length === 6) break
  }

  // --- Featured channel: het featured-first kanaal + zijn recente materialen.
  // `getChannelsIndex` levert het kanaal (label/description/thumb, featured
  // eerst). Voor de materiaalrij halen we ALLEEN de materialen van dat kanaal
  // op (i.p.v. de volledige channel-hub met alle 5 content-types) — scheelt
  // 5 van de 6 fetches en houdt de static-generation snel.
  const spotlightChannel = channelsIndex[0] ?? null
  const spotlightMaterials = spotlightChannel
    ? await listMaterialsWithFacets({
        selection: { theme: [spotlightChannel.slug] },
        perPage: 10,
      }).catch(() => null)
    : null
  const featuredChannel: FeaturedChannelVM | null = spotlightChannel
    ? {
        slug: spotlightChannel.slug,
        label: spotlightChannel.label,
        description: toChannelPlainText(spotlightChannel.description),
        thumbnailUrl: spotlightChannel.thumbnailUrl,
        count: spotlightChannel.count,
      }
    : null
  const featuredChannelMaterials = (spotlightMaterials?.items ?? []).filter(
    (m) => m.publication.isOnline,
  )

  // --- Books: het featured boek voor het tegeltje naast de featured event --
  const featuredBook = bookRes.items[0] ?? null
  // Nieuwste boeken voor het sidebar-blokje (rechterkolom).
  const latestBooks = latestBookRes.items.slice(0, 4)
  // Boek voor de Events/Books-rij: het featured boek, anders het nieuwste.
  const eventsRowBook = featuredBook ?? latestBooks[0] ?? null

  // --- Materials: één fetch, meerdere afgeleiden -------------------------
  const materialCount =
    matRes.total > 0 ? matRes.total : MATERIALS_COUNT_FALLBACK
  // Alleen online materialen tonen: WP kan een material op offline zetten
  // (`publication.isOnline:false`) terwijl het wel als `publish` in de REST
  // zit. De fetch filtert daar niet op, dus hier defensief uitfilteren.
  // (Placeholder-publication = isOnline:true, blijft dus staan.)
  const onlineMaterials = matRes.items.filter((m) => m.publication.isOnline)
  const latestMaterials = onlineMaterials.slice(0, 3)
  // Featured-materialen = uitsluitend materialen met de WP `featured`-vlag.
  // GEEN terugval op de nieuwste: anders toont het blok dezelfde tegels als
  // "Latest materials". Leeg → het blok wordt verborgen (zie render).
  const featuredMaterials = onlineMaterials.filter((m) => m.featured).slice(0, 3)

  // --- Articles ----------------------------------------------------------
  const latestStories = artRes.items.slice(0, 3)

  // Featured-article hero = het nieuwste/eerste artikel (= top story).
  const lead = artRes.items[0] ?? null
  const featuredArticle: FeaturedArticleVM | null = lead
    ? {
        href: `/article/${lead.slug}`,
        title: lead.title,
        thumbUrl: lead.hero?.sourceUrl,
        meta: `${formatDate(lead.date)} · Article`,
      }
    : null

  // --- Events: featured & aankomend eerst, anders eerstvolgende ----------
  const orderedEvents = sortEventsByDate(eventRes.items)
  const upcoming = orderedEvents.filter((e) => !e.isPast)
  const featuredEvent = upcoming.find((e) => e.featured) ?? upcoming[0] ?? null

  // --- Featured talk (homepage band) -------------------------------------
  // Featured-eerst (WP talk-CPT checkbox via meta.featured); valt terug op de
  // nieuwste talk als er niets featured is.
  const talkLead =
    talkRes.items.find((t) => t.featured) ?? talkRes.items[0] ?? null
  const featuredTalk: FeaturedTalkVM | null = talkLead
    ? {
        href: `/talk/${talkLead.slug}`,
        title: talkLead.title,
        thumbUrl: talkLead.hero?.sourceUrl,
        meta: [
          talkLead.speakers[0]?.name,
          talkLead.durationSeconds
            ? `${Math.round(talkLead.durationSeconds / 60)} min`
            : null,
        ]
          .filter(Boolean)
          .join(' · '),
        insiderOnly: talkLead.insiderOnly,
      }
    : null

  // --- Sidebar (Top stories): articles + materials, al gemapt ------------
  const sidebarArticles: StoryListItem[] = artRes.items.slice(0, 5).map((a) => ({
    href: `/article/${a.slug}`,
    thumbUrl: a.hero?.sourceUrl,
    label: `${formatDate(a.date)} — ${STORY_TYPE_META[a.type].label}`,
    title: a.title,
  }))
  const sidebarMaterials: StoryListItem[] = onlineMaterials.slice(0, 4).map((m) => ({
    href: `/material/${m.slug}`,
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

        {ADS_ENABLED && (
          <div className="ad-billboard">
            <AdSlot name="billboard" />
          </div>
        )}

        <PromoHero materialCount={materialCount} />

        {/* Channel-navigatie — vervangt het oude material_category-snelmenu.
            Dezelfde balk-styling als de overzichtspagina's, maar als navigatie
            naar /channel/<slug> (zonder zoek/view-toggle). */}
        <HomeChannelBar channels={channelNav} />

        <div className="hp-main">
          <div className="hp-content">
            {/* Featured-article hero (verschijnt als de promo-hero weg is) */}
            <FeaturedArticleHero article={featuredArticle} />

            {/* Latest materials */}
            <section className="hp-section">
              <div className="section-hd">
                <h2 className="section-title">Latest materials</h2>
                <Link href="/material" className="section-link">
                  All materials →
                </Link>
              </div>
              <div className="grid-3">
                {latestMaterials.map((m) => (
                  <ContentCard
                    key={m.id}
                    href={`/material/${m.slug}`}
                    contentType="material"
                    showTypeBadge={false}
                    thumbSrc={m.hero?.sourceUrl}
                    thumbAlt={m.hero?.alt ?? m.title}
                    eyebrow={m.brandName ?? undefined}
                    title={m.title}
                    actions={<><CardBookmarkButton type="materials" itemId={m.id} /><CardCompareButton material={m} /></>}
                  />
                ))}
              </div>
            </section>

            {ADS_ENABLED && (
              <div className="ad-leaderboard">
                <AdSlot name="leaderboard" />
              </div>
            )}

            {/* Latest stories */}
            <section className="hp-section">
              <div className="section-hd">
                <h2 className="section-title">Latest stories</h2>
                <Link href="/article" className="section-link">
                  All articles →
                </Link>
              </div>
              <div className="grid-3">
                {latestStories.map((a) => (
                  <ContentCard
                    key={a.id}
                    href={`/article/${a.slug}`}
                    contentType="article"
                    thumbSrc={a.hero?.sourceUrl}
                    thumbAlt={a.hero?.alt ?? a.title}
                    eyebrow={formatDate(a.date)}
                    title={a.title}
                    showTypeBadge={false}
                    typeBadge={{
                      label: STORY_TYPE_META[a.type].label,
                      color: STORY_TYPE_META[a.type].color,
                    }}
                    channelTags={a.channels.map((c) => c.label)}
                    isInsiderOnly={a.insiderOnly}
                    actions={<CardBookmarkButton type="articles" itemId={a.id} />}
                  />
                ))}
              </div>
            </section>

            {/* Featured talk (grote beeld-band) */}
            <FeaturedTalkBand talk={featuredTalk} />

            {/* Featured materials — alleen tonen als er echt featured zijn */}
            {featuredMaterials.length > 0 && (
              <section className="hp-section">
                <div className="section-hd">
                  <h2 className="section-title">Featured materials</h2>
                  <Link href="/material" className="section-link">
                    All materials →
                  </Link>
                </div>
                <div className="grid-3">
                  {featuredMaterials.map((m) => (
                    <ContentCard
                      key={m.id}
                      href={`/material/${m.slug}`}
                      contentType="material"
                      showTypeBadge={false}
                      thumbSrc={m.hero?.sourceUrl}
                      thumbAlt={m.hero?.alt ?? m.title}
                      eyebrow={m.brandName ?? undefined}
                      title={m.title}
                      actions={<><CardBookmarkButton type="materials" itemId={m.id} /><CardCompareButton material={m} /></>}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Featured channel — uitgelicht kanaal + recente materialen */}
            <FeaturedChannel
              channel={featuredChannel}
              materials={featuredChannelMaterials}
            />

            {/* Events + Books — twee gelabelde helften */}
            <section className="hp-section">
              <div className="hp-events-books">
                <div className="hp-eb-col">
                  <div className="section-hd">
                    <h2 className="section-title">Events</h2>
                    <Link href="/event" className="section-link">
                      All events →
                    </Link>
                  </div>
                  {featuredEvent ? (
                    <EventCard
                      event={featuredEvent}
                      variant="home"
                      ticketUrl={featuredEvent.externalWebsite}
                    />
                  ) : (
                    <p className="hp-empty">No upcoming events at this time.</p>
                  )}
                </div>
                <div className="hp-eb-col">
                  <div className="section-hd">
                    <h2 className="section-title">Books</h2>
                    <Link href="/book" className="section-link">
                      All books →
                    </Link>
                  </div>
                  {eventsRowBook ? (
                    <BookCard book={eventsRowBook} variant="home" />
                  ) : (
                    <p className="hp-empty">No new books at this time.</p>
                  )}
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

            {/* Featured brands — Partner-tier (+ aanvulling), lichter tegel-
                uiterlijk in een carrousel. */}
            <FeaturedPartners partners={featuredPartners} />
          </div>

          <aside className="hp-sidebar" aria-label="More from MaterialDistrict">
            <TopStoriesWidget
              articles={sidebarArticles}
              materials={sidebarMaterials}
            />

            {ADS_ENABLED && <AdSlot name="mrec" />}

            {/* Manufacturer-promo */}
            <div className="sidebar-cta">
              <p className="sidebar-cta-eyebrow">For manufacturers</p>
              <p className="sidebar-cta-title">
                Show your material to architects &amp; specifiers
              </p>
              <p className="sidebar-cta-desc">
                List your materials on the platform and become visible in a
                curated guide for sustainable architecture.
              </p>
              <Link href="/become-a-partner" className="btn btn-green">
                List your materials →
              </Link>
            </div>

            {/* Nieuwste boeken — vult de rechterkolom (zoals in de demo). */}
            <SidebarBooks books={latestBooks} />
          </aside>
        </div>

        <JsonLd data={[buildWebSite(), buildOrganization()]} />
      </div>
    </HomeHeroProvider>
  )
}
