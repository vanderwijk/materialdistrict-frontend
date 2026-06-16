/**
 * `/article` — articles/stories-overzichtspagina met story-type-filter,
 * search, grid en paginatie.
 *
 * Sessie 6.
 *
 * Server Component. Leest searchParams (q, story_type, page), haalt
 * articles + story-type-opties op, en rendert de overzichts-shell rond een
 * `ContentCard`-grid. Volgt dezelfde shell als /brands en /materials
 * (design-system §6.1): `ov-page-header` + `ov-wrap`.
 *
 * URL-structuur:
 *   /articles?q=timber&story_type=people&page=2
 *
 * Story-type-filter (D1): de selectie gaat als `?story_type=` naar WP en
 * filtert server-side (WP-taxonomy `story_type`, tax_query). De sidebar-
 * counts zijn live (sessie 6b).
 *
 * Insider-only (D2): `article.insiderOnly` komt uit `meta.insider_only`;
 * cards tonen de InsiderMark voor Insider-only articles (sessie 6b).
 *
 * Channels (D3): `article.channels` voedt de witte channel-pills onderaan
 * de card-thumb (`channelTags`), zelfde patroon als materials (sessie 6b).
 *
 * EmptyState bij 0 resultaten — geen 404 (een filter/zoek met 0 matches is
 * een geldige query). Twee varianten: met of zonder actieve filters.
 *
 * §F2.10 P8: story-tegels tonen een gekleurd story-type-badge linksboven
 * (STORY_TYPE_META kleur/label) via de nieuwe ContentCard `typeBadge`-prop.
 */

import type { Metadata } from 'next'
import { Suspense } from 'react'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { Button, ChannelBarNav, ContentCard, EmptyState } from '@/components/ui'
import {
  getArticleStoryTypeOptions,
  getArticleTotalCount,
  getChannelCatalog,
  listArticles,
  resolveChannelId,
} from '@/lib/api'
import { JsonLd, buildBreadcrumbList, canonicalPath } from '@/lib/seo'
import {
  STORY_TYPE_META,
  isStoryType,
  type StoryType,
} from '@/lib/config/story-types'
import { ArticlesTypeFilter } from './_components/ArticlesTypeFilter'
import { RecentlyViewedRail } from '@/components/ui'
import { CardBookmarkButton } from '@/components/ui/CardBookmarkButton'
import { ArticlesPagination } from './_components/ArticlesPagination'

const ARTICLES_PER_PAGE = 12

/**
 * Staat van de backend-koppeling voor `story_type` (D1). Sinds sessie 6b
 * `true`: WP filtert server-side op de `story_type`-taxonomy en de sidebar-
 * counts zijn live. Eén plek om te flippen als de koppeling ooit wegvalt.
 */
const STORY_TYPE_BACKEND_CONNECTED = true

const pagePath = canonicalPath('/article')

export const metadata: Metadata = {
  title: 'Stories',
  description:
    'News, people, collaborations, projects and partner stories — all connected through materials. Read the latest from MaterialDistrict.',
  alternates: { canonical: pagePath },
  openGraph: {
    title: 'Stories | MaterialDistrict',
    description:
      'News, people, collaborations, projects and partner stories — all connected through materials.',
    type: 'website',
    url: pagePath,
  },
}

interface ArticlesPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

/** Parse `?page=` naar een 1-based paginanummer (default 1). */
function parsePage(raw: string | string[] | undefined): number {
  const value = Array.isArray(raw) ? raw[0] : raw
  const n = Number.parseInt(value ?? '1', 10)
  return Number.isFinite(n) && n > 0 ? n : 1
}

/** Parse `?story_type=` naar een geldige StoryType of null. */
function parseStoryType(raw: string | string[] | undefined): StoryType | null {
  const value = Array.isArray(raw) ? raw[0] : raw
  return isStoryType(value) ? value : null
}

/** Datumlabel — en-GB, consistent met de andere detail/overzicht-pages. */
function formatDate(value: string): string {
  return new Date(value).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export default async function ArticlesPage({ searchParams }: ArticlesPageProps) {
  const params = await searchParams

  const search =
    (Array.isArray(params.q) ? params.q[0] : params.q)?.trim() || undefined
  const selectedType = parseStoryType(params.story_type)
  const channelSlug =
    (Array.isArray(params.channel) ? params.channel[0] : params.channel)?.trim() ||
    undefined
  const page = parsePage(params.page)

  const channels = await getChannelCatalog()
  const themeId = resolveChannelId(channels, channelSlug) ?? undefined

  // Articles + story-type-opties + totaal-count parallel. Type-counts komen
  // uit `getStoryTypeCounts()` (X-WP-Total per story_type-filter, gelijk aan
  // wat je ziet na klikken op News/People/…). Totaal "All" apart via
  // `getArticleTotalCount()`.
  const [result, typeOptions, totalArticleCount] = await Promise.all([
    listArticles({
      perPage: ARTICLES_PER_PAGE,
      page,
      search,
      storyType: selectedType ?? undefined,
      theme: themeId,
    }),
    getArticleStoryTypeOptions(),
    getArticleTotalCount(),
  ])

  const hasActiveFilters =
    selectedType !== null || Boolean(search) || Boolean(channelSlug)
  const total = result.total
  const activeMeta = selectedType ? STORY_TYPE_META[selectedType] : null

  // Featured = eerste item; rest in het grid (mockup-patroon).
  const [featured, ...rest] = result.items

  return (
    <>
      <header className="ov-page-header">
        <div className="ov-page-header-main">
          <Breadcrumb items={[{ label: 'Stories' }]} />
          <h1 className="t-display-lg">Stories</h1>
        </div>
      </header>

      <ChannelBarNav
        channels={channels}
        activeSlug={channelSlug}
        initialSearch={search ?? ''}
        searchPlaceholder={
          total > 0 ? `Search ${total.toLocaleString('en-US')} stories` : 'Search stories…'
        }
      />

      <div className="ov-wrap">
        <div className="articles-sidebar-col">
          <ArticlesTypeFilter
            options={typeOptions}
            selectedType={selectedType}
            totalCount={totalArticleCount}
            pendingBackend={!STORY_TYPE_BACKEND_CONNECTED}
          />

          {/* People CTA */}
          <div className="articles-cta articles-cta-people">
            <div className="articles-cta-eyebrow">People</div>
            <div className="articles-cta-title">
              Know someone driving the transition?
            </div>
            <p className="articles-cta-body">
              Nominate a person for a People story.
            </p>
            <Button
              as="link"
              href="#nominate"
              variant="green"
              size="sm"
              className="articles-cta-btn"
            >
              Nominate →
            </Button>
          </div>

          {/* Partner CTA */}
          <div className="articles-cta articles-cta-partner">
            <div className="articles-cta-eyebrow articles-cta-eyebrow-navy">
              Partner stories
            </div>
            <div className="articles-cta-title articles-cta-title-dark">
              Tell your brand story
            </div>
            <p className="articles-cta-body articles-cta-body-muted">
              Partner members get 1 brand story per year, distributed to
              80,000+ specifiers.
            </p>
            <Button
              as="link"
              href="/membership"
              variant="outline"
              size="sm"
              className="articles-cta-btn"
            >
              View Partner →
            </Button>
          </div>
        </div>

        <div>
          {/* Type-intro-banner wanneer een type actief is (mockup-patroon) */}
          {activeMeta && selectedType && (
            <div className="articles-type-intro" data-story-type={selectedType}>
              <span
                className="articles-type-intro-icon"
                aria-hidden="true"
                dangerouslySetInnerHTML={{ __html: activeMeta.icon }}
              />
              <span className="articles-type-intro-text">
                <span className="articles-type-intro-label">{activeMeta.label}</span>
                <span className="articles-type-intro-desc">{activeMeta.desc}</span>
              </span>
              <Button
                as="link"
                href="/article"
                variant="outline"
                size="sm"
                className="articles-type-intro-clear"
              >
                × Clear
              </Button>
            </div>
          )}

          {result.items.length === 0 ? (
            hasActiveFilters ? (
              <EmptyState
                title="No stories match these filters"
                description="Try a different story type or clear your search to see more."
                actions={
                  <Button as="link" href="/article" variant="outline" size="sm">
                    Clear filters
                  </Button>
                }
              />
            ) : (
              <EmptyState
                title="No stories available"
                description="There are currently no stories to show. Please check back later."
              />
            )
          ) : (
            <>
              <Suspense fallback={null}>
                {/* Featured (eerste item) — volle breedte */}
                {featured && (
                  <div className="articles-featured">
                    <ContentCard
                      href={`/article/${featured.slug}`}
                      contentType="article"
                      showTypeBadge={false}
                      typeBadge={{
                        label: STORY_TYPE_META[featured.type].label,
                        color: STORY_TYPE_META[featured.type].color,
                      }}
                      thumbSrc={featured.hero?.sourceUrl}
                      thumbAlt={featured.hero?.alt ?? featured.title}
                      thumbRatio="landscape"
                      eyebrow={formatDate(featured.date)}
                      title={featured.title}
                      meta={STORY_TYPE_META[featured.type].label}
                      tagLabel={STORY_TYPE_META[featured.type].label}
                      channelTags={featured.channels.map((c) => c.label)}
                      isInsiderOnly={featured.insiderOnly}
                      titleAs="h2"
                      actions={<CardBookmarkButton type="articles" itemId={featured.id} />}
                    />
                  </div>
                )}

                {rest.length > 0 && (
                  <div className="ov-grid-3">
                    {rest.map((article) => (
                      <ContentCard
                        key={article.id}
                        href={`/article/${article.slug}`}
                        contentType="article"
                        showTypeBadge={false}
                        typeBadge={{
                          label: STORY_TYPE_META[article.type].label,
                          color: STORY_TYPE_META[article.type].color,
                        }}
                        thumbSrc={article.hero?.sourceUrl}
                        thumbAlt={article.hero?.alt ?? article.title}
                        eyebrow={formatDate(article.date)}
                        title={article.title}
                        meta={STORY_TYPE_META[article.type].label}
                        tagLabel={STORY_TYPE_META[article.type].label}
                        channelTags={article.channels.map((c) => c.label)}
                        isInsiderOnly={article.insiderOnly}
                        actions={<CardBookmarkButton type="articles" itemId={article.id} />}
                      />
                    ))}
                  </div>
                )}
              </Suspense>

              {result.totalPages > 1 && (
                <div className="ov-pagination">
                  <ArticlesPagination
                    currentPage={page}
                    totalPages={result.totalPages}
                  />
                </div>
              )}
            </>
          )}

          <RecentlyViewedRail entity="articles" variant="inline" />

          {/* Nominate-sectie (mockup-patroon). Statisch in v1 — de submit
              is nog niet aan een endpoint gekoppeld; zie open-issues. */}
          <section id="nominate" className="articles-nominate">
            <div className="articles-nominate-intro">
              <div className="articles-cta-eyebrow articles-cta-eyebrow-navy">
                Nominate a person
              </div>
              <h2 className="t-display-md">
                Know someone driving the transition?
              </h2>
              <p className="t-body">
                A People story is about the individual — their choices, their
                convictions, their work. We select based on impact, not
                profile. You can nominate yourself or someone else.
              </p>
              <p className="articles-nominate-note">
                Every nomination is reviewed by the MaterialDistrict editorial
                team. We reach out personally.
              </p>
            </div>
          </section>
        </div>
      </div>

      <JsonLd
        data={[
          buildBreadcrumbList([
            { label: 'Home', url: '/' },
            { label: 'Stories' },
          ]),
        ]}
      />
    </>
  )
}
