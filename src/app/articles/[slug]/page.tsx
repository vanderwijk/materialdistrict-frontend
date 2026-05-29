/**
 * `/articles/[slug]` — article/story-detailpagina.
 *
 * Sessie 6.
 *
 * Server Component. Haalt het article op (incl. hero), plus — parallel —
 * de buren (prev/next over de datum-gesorteerde lijst), de gerelateerde
 * articles (zelfde story-type) en een paar latest-materials voor de
 * sidebar. Rendert de detail-shell conform de mockup
 * `renderArticleDetail()`:
 *
 *   pub-wrap
 *     DetailHeader (article-tag · [Insider-tag] · titel · meta · actions)
 *     pub-layout
 *       main:  hero · summary-lead · gated body · author-footer ·
 *              prev/next · related
 *       aside: ArticleDetailSidebar
 *
 * Gating (D2): de body loopt via <ArticleBodyGate>. Voor Insider-only
 * articles ziet een niet-member de excerpt-preview + de InsiderGate-
 * paywall; members en niet-gated content zien de volledige body.
 * `insiderOnly` komt uit `meta.insider_only` (sessie 6b).
 *
 * Story-type (D1): het type stuurt de meta-label. Komt uit de WP-taxonomy
 * `story_type` via `meta._story_type` (sessie 6b).
 *
 * Related (D5): gemixte content (article/material/talk) uit het SearchWP-
 * Related-endpoint via `getRelatedContent()` (sessie 6b).
 *
 * Author (Q3, sessie 6): niet geresolved — byline is "Story by
 * MaterialDistrict", zoals de mockup. Author-resolve is een open issue.
 *
 * Body-rendering (Q2, sessie 6): contentHtml als één prose-blok via de
 * bestaande <MaterialBody> (hergebruik). Geen pull-quote/materials-
 * mentioned-injectie — die hangt aan gestructureerde body-data die we
 * nog niet hebben.
 *
 * JSON-LD: Article + BreadcrumbList. notFound() bij onbekende slug.
 */

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { DetailHeader } from '@/components/layout/DetailHeader'
import {
  getArticle,
  getRelatedContent,
  listArticles,
  listMaterials,
} from '@/lib/api'
import { JsonLd, buildArticle, buildBreadcrumbList } from '@/lib/seo'
import { STORY_TYPE_META } from '@/lib/config/story-types'
import { ArticleBodyGate } from './_components/ArticleBodyGate'
import { ArticleDetailActions } from './_components/ArticleDetailActions'
import {
  ArticleDetailSidebar,
  type ArticleSidebarMaterial,
} from './_components/ArticleDetailSidebar'
import {
  ArticlePrevNext,
  type ArticlePrevNextNeighbour,
} from './_components/ArticlePrevNext'
import { ArticleRelated } from './_components/ArticleRelated'

const SIDEBAR_MATERIALS = 3
const NEIGHBOUR_SCAN = 100
const WORDS_PER_MINUTE = 200

interface ArticleDetailPageProps {
  params: Promise<{ slug: string }>
}

function stripHtml(value: string): string {
  return value.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
}

/** Lees-tijd uit body-lengte (200 wpm). Min. 1 min. */
function readTimeLabel(html: string): string {
  const words = stripHtml(html).split(' ').filter(Boolean).length
  const minutes = Math.max(1, Math.round(words / WORDS_PER_MINUTE))
  return `${minutes} min`
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export async function generateMetadata({
  params,
}: ArticleDetailPageProps): Promise<Metadata> {
  const { slug } = await params
  const article = await getArticle(slug)

  if (!article) {
    return {
      title: 'Article not found',
      robots: { index: false, follow: false },
    }
  }

  const description = stripHtml(article.excerptHtml) || undefined

  return {
    title: article.title,
    description,
    alternates: { canonical: `/articles/${article.slug}` },
    openGraph: {
      title: article.title,
      description,
      type: 'article',
      url: `/articles/${article.slug}`,
      ...(article.hero?.sourceUrl ? { images: [article.hero.sourceUrl] } : {}),
    },
  }
}

/**
 * Prev/next-buren, berekend uit één datum-gesorteerde article-lijst.
 * Faalbestendig: bij een fout geen buren (de component rendert dan niets).
 * Lichte fetch (geen hero-resolve voor de buren-scan).
 *
 * Sessie 6b (D5): related zit NIET langer hier — dat komt nu via het
 * SearchWP-endpoint (`getRelatedContent`), parallel opgehaald in de page.
 */
async function getNeighbours(currentSlug: string): Promise<{
  prev: ArticlePrevNextNeighbour | null
  next: ArticlePrevNextNeighbour | null
}> {
  try {
    const { items } = await listArticles({
      perPage: NEIGHBOUR_SCAN,
      orderby: 'date',
      order: 'desc',
    })

    const idx = items.findIndex((a) => a.slug === currentSlug)
    const prevItem = idx > 0 ? items[idx - 1] : null
    const nextItem = idx >= 0 && idx < items.length - 1 ? items[idx + 1] : null

    return {
      prev: prevItem ? { slug: prevItem.slug, title: prevItem.title } : null,
      next: nextItem ? { slug: nextItem.slug, title: nextItem.title } : null,
    }
  } catch {
    return { prev: null, next: null }
  }
}

/** Latest materials voor de sidebar. Faalbestendig → lege lijst. */
async function getSidebarMaterials(): Promise<ArticleSidebarMaterial[]> {
  try {
    const { items } = await listMaterials({
      perPage: SIDEBAR_MATERIALS,
      resolveBrandName: true,
    })
    return items.map((m) => ({
      id: m.id,
      slug: m.slug,
      title: m.title,
      brandName: m.brandName,
      heroUrl: m.hero?.sizes?.medium?.url ?? m.hero?.sourceUrl,
    }))
  } catch {
    return []
  }
}

export default async function ArticleDetailPage({
  params,
}: ArticleDetailPageProps) {
  const { slug } = await params

  const article = await getArticle(slug)
  if (!article) notFound()

  const [{ prev, next }, related, sidebarMaterials] = await Promise.all([
    getNeighbours(slug),
    getRelatedContent(slug),
    getSidebarMaterials(),
  ])

  const typeMeta = STORY_TYPE_META[article.type]
  const publishedLabel = formatDate(article.date)
  const bodyHtml = article.contentHtml || article.excerptHtml
  const readLabel = readTimeLabel(bodyHtml)

  // Tags in de header: content-type-tag + (conditioneel) Insider-tag.
  const headerTags = [
    { type: 'content' as const, contentType: 'article' as const },
    ...(article.insiderOnly
      ? [{ type: 'insider' as const }]
      : []),
  ]

  return (
    <>
      <article className="pub-wrap">
        <DetailHeader
          backNode={
            <a href="/articles" className="article-detail-back">
              ← Stories
            </a>
          }
          tags={headerTags}
          title={article.title}
          meta={
            <>
              {typeMeta.label} · Story by{' '}
              <strong>MaterialDistrict</strong> · {publishedLabel} ·{' '}
              {readLabel} read
            </>
          }
          actions={
            <ArticleDetailActions
              articleId={article.id}
              articleSlug={article.slug}
              articleTitle={article.title}
            />
          }
        />

        <div className="pub-layout">
          {/* Main column */}
          <div>
            {/* Hero */}
            {article.hero?.sourceUrl ? (
              <img
                className="article-detail-hero"
                src={article.hero.sizes?.large?.url ?? article.hero.sourceUrl}
                alt={article.hero.alt || article.title}
              />
            ) : (
              <div className="article-detail-hero is-placeholder" aria-hidden="true" />
            )}

            {/* Summary lead */}
            {article.excerptHtml && (
              <div
                className="article-detail-lead"
                dangerouslySetInnerHTML={{ __html: article.excerptHtml }}
              />
            )}

            {/* Body — gated voor Insider-only (D2, Optie A) */}
            <ArticleBodyGate
              contentHtml={bodyHtml}
              insiderOnly={article.insiderOnly}
              previewHtml={article.excerptHtml || undefined}
            />

            {/* Author footer */}
            <footer className="article-detail-footer">
              <div className="article-detail-author">
                <span className="article-detail-author-avatar" aria-hidden="true">
                  MD
                </span>
                <span className="article-detail-author-text">
                  <span className="article-detail-author-name">
                    MaterialDistrict
                  </span>
                  <span className="article-detail-author-date">
                    {publishedLabel} · {readLabel} read
                  </span>
                </span>
              </div>
            </footer>

            <ArticlePrevNext prev={prev} next={next} />

            <ArticleRelated items={related} />
          </div>

          {/* Sidebar */}
          <ArticleDetailSidebar
            readTimeLabel={`${readLabel} read`}
            latestMaterials={sidebarMaterials}
          />
        </div>
      </article>

      <JsonLd
        data={[
          buildArticle({
            slug: article.slug,
            title: article.title,
            excerpt: stripHtml(article.excerptHtml) || undefined,
            heroImage: article.hero?.sizes?.large?.url ?? article.hero?.sourceUrl,
            publishedAt: article.date,
            modifiedAt: article.modified,
            category: typeMeta.label,
          }),
          buildBreadcrumbList([
            { label: 'Home', url: '/' },
            { label: 'Stories', url: '/articles' },
            { label: article.title },
          ]),
        ]}
      />
    </>
  )
}
