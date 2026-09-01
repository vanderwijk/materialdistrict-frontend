/**
 * `/talk/[slug]` — talk-detailpagina.
 *
 * Sessie 7. Server Component. Haalt de talk op (incl. hero), plus — uit één
 * datum-gesorteerde talk-scan — de buren (prev/next) en "More talks"
 * (laatste, excl. huidige; er is geen talks-related-endpoint). Rendert de
 * detail-shell conform de mockup `renderTalkDetail()`:
 *
 *   pub-wrap
 *     DetailHeader (talk-tag · [Insider-tag] · titel · meta · actions)
 *     pub-layout
 *       main:  video (gated) · about · prev/next · more talks
 *       aside: TalkDetailSidebar (talk details · upsell)
 *
 * Gating (C14): alleen de VIDEO loopt via <TalkVideoGate>. Summary/metadata
 * blijven zichtbaar als teaser. `insiderOnly` komt uit `meta.insider_only`
 * (talk-default true). Voor Insider-only talks levert public REST geen
 * `vimeo_id`; members laden die client-side via `/api/talks/{id}/embed`.
 *
 * Speakers (C11): namen, getoond in de sidebar. Company (C12): platte tekst,
 * geen brand-link. Velden die WP niet levert (event, language, bio, topics,
 * related materials) worden weggelaten — frontend-fallback.
 *
 * JSON-LD: VideoObject + BreadcrumbList. notFound() bij onbekende slug.
 */

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import type { MediaImage } from '@/types/media'
import { DetailHeader } from '@/components/layout/DetailHeader'
import { DetailReadingTools } from '@/components/ui/DetailReadingTools'
import { RecentlyViewedTracker } from '@/lib/hooks/useRecentlyViewed'
import { ContentCard } from '@/components/ui'
import { getTalk, listTalks } from '@/lib/api'
import { JsonLd, buildBreadcrumbList, buildVideoObject, canonicalPath, openGraphSite } from '@/lib/seo'
import { ViewLogger } from '@/components/ui/ViewLogger'
import { MaterialBody } from '@/app/material/[slug]/_components/MaterialBody'
import { formatDuration } from '@/lib/utils/format-duration'
import { TalkVideoGate } from './_components/TalkVideoGate'
import { TalkDetailActions } from './_components/TalkDetailActions'
import { TalkDetailSidebar } from './_components/TalkDetailSidebar'
import { getDigestChannels } from '@/lib/api/digest-channels'
import {
  TalkPrevNext,
  type TalkPrevNextNeighbour,
} from './_components/TalkPrevNext'
import { PreferredSourceEndBlock } from '@/components/ui/PreferredSourceEndBlock'

/**
 * §BETA-FIX-24-08 (X1) — soft-404 opgelost.
 *
 * Deze route stond op `force-static`. Dat hield de pagina's op het CDN, maar
 * had een bijwerking die pas op de beta zichtbaar werd: een onbekende slug
 * kreeg wél de 404-pagina te zien, maar het antwoord was HTTP 200. Ook de
 * niet-gevonden-uitkomst werd namelijk voorgebakken, en een voorgebakken
 * antwoord kan geen 404-status meer meegeven. Voor Google is zo'n pagina een
 * geldige pagina — bij een migratie met veel oude inbound links precies wat je
 * niet wilt.
 *
 * `dynamicParams` + `revalidate` doen hetzelfde werk zonder die bijwerking:
 * onbekende slugs worden op verzoek gerenderd, daarna gecachet en op een timer
 * ververst (ISR), maar `notFound()` levert nu een echte 404. Het CDN blijft de
 * gevonden pagina's dus gewoon bewaren.
 *
 * Let op bij toekomstig werk: `force-static` was óók een vangnet tegen een
 * `cookies()`- of `headers()`-aanroep die de hele route stilletjes dynamisch
 * zou maken. Dat vangnet is hier weg — lees in deze subtree geen request-data
 * server-side; wat per bezoeker verschilt hoort in een client-component
 * (zoals de auth-hydratie nu al doet).
 */
export const dynamicParams = true

/**
 * Leeg, maar noodzakelijk. Samen met `dynamicParams` markeert dit de route als
 * statisch-met-ISR: pagina's worden op verzoek gebouwd, daarna op het CDN
 * bewaard en op de timer ververst. Zónder deze functie behandelt Next de route
 * als volledig dynamisch — dan rendert élke bezoeker (en élke crawler) de
 * pagina opnieuw en bevraagt WordPress opnieuw. Dat was de reden voor het
 * eerdere `force-static`; deze regel neemt die taak over, maar laat
 * `notFound()` wél een echte 404 geven. Geen build-time prerender: de lijst is
 * bewust leeg om een request-storm tijdens de Vercel-build te voorkomen.
 */
export async function generateStaticParams() {
  return []
}


/** ISR — mirrors the fetch-level revalidate for this type (1 h). */
export const revalidate = 3600


const NEIGHBOUR_SCAN = 100
const MORE_TALKS = 3

interface TalkDetailPageProps {
  params: Promise<{ slug: string }>
}

interface MoreTalk {
  id: number
  slug: string
  title: string
  date: string
  hero?: MediaImage | null
  heroAlt: string
  speakerNames: string[]
  insiderOnly: boolean
}

function stripHtml(value: string): string {
  return value.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
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
}: TalkDetailPageProps): Promise<Metadata> {
  const { slug } = await params
  const talk = await getTalk(slug)

  if (!talk) {
    return { title: 'Talk not found', robots: { index: false, follow: false } }
  }

  const description =
    stripHtml(talk.excerptHtml) || stripHtml(talk.contentHtml) || undefined
  const path = canonicalPath(`/talk/${talk.slug}`)

  return {
    title: talk.title,
    description,
    alternates: { canonical: path },
    openGraph: {
      ...openGraphSite,
      title: talk.title,
      description,
      type: 'video.other',
      url: path,
      ...(talk.hero?.sourceUrl ? { images: [talk.hero.sourceUrl] } : {}),
    },
  }
}

/**
 * Buren (prev/next) + "More talks" uit één datum-gesorteerde scan.
 * Faalbestendig: bij een fout geen buren en geen more-talks.
 */
async function getTalkContext(currentSlug: string): Promise<{
  prev: TalkPrevNextNeighbour | null
  next: TalkPrevNextNeighbour | null
  more: MoreTalk[]
}> {
  try {
    const { items } = await listTalks({
      perPage: NEIGHBOUR_SCAN,
      orderby: 'date',
      order: 'desc',
    })

    const idx = items.findIndex((t) => t.slug === currentSlug)
    const prevItem = idx > 0 ? items[idx - 1] : null
    const nextItem = idx >= 0 && idx < items.length - 1 ? items[idx + 1] : null

    const more: MoreTalk[] = items
      .filter((t) => t.slug !== currentSlug)
      .slice(0, MORE_TALKS)
      .map((t) => ({
        id: t.id,
        slug: t.slug,
        title: t.title,
        date: t.date,
        hero: t.hero,
        heroAlt: t.hero?.alt ?? t.title,
        speakerNames: t.speakers.map((s) => s.name),
        insiderOnly: t.insiderOnly,
      }))

    return {
      prev: prevItem ? { slug: prevItem.slug, title: prevItem.title } : null,
      next: nextItem ? { slug: nextItem.slug, title: nextItem.title } : null,
      more,
    }
  } catch {
    return { prev: null, next: null, more: [] }
  }
}

export default async function TalkDetailPage({ params }: TalkDetailPageProps) {
  const digestChannels = await getDigestChannels()
  const { slug } = await params

  const talk = await getTalk(slug)
  if (!talk) notFound()

  const { prev, next, more } = await getTalkContext(slug)

  const publishedLabel = formatDate(talk.date)
  const durationLabel = formatDuration(talk.durationSeconds)
  const speakerNames = talk.speakers.map((s) => s.name)
  const bodyHtml = talk.contentHtml || talk.excerptHtml
  const videoDescription =
    stripHtml(talk.excerptHtml) || stripHtml(talk.contentHtml) || talk.title

  // §F2.8 punt 1: content-type-badge weg; alleen nog de insider-badge.
  const headerTags = [
    ...(talk.insiderOnly ? [{ type: 'insider' as const }] : []),
  ]

  return (
    <>
      <article className="pub-wrap">
        <RecentlyViewedTracker
          type="talks"
          slug={talk.slug}
          title={talk.title}
          subtitle={speakerNames[0] ?? null}
          thumbnailUrl={talk.hero?.sourceUrl ?? null}
          href={`/talk/${talk.slug}`}
        />
        <div className="pub-layout">
          <div className="detail-back-row">
            <a href="/talk" className="article-detail-back">
              ← Talks
            </a>
          </div>
          <div className="detail-sheet">
        <DetailHeader
          tags={headerTags}
          channels={talk.channels.map((c) => ({ id: c.id, slug: c.slug, label: c.label }))}
          title={talk.title}
          meta={
            <>
              {durationLabel ? <>{durationLabel} · </> : null}
              {publishedLabel}
            </>
          }
          actions={
            <TalkDetailActions
              talkId={talk.id}
              talkSlug={talk.slug}
              talkTitle={talk.title}
            />
          }
        />

          {/* Main column */}
          <div>
            <TalkVideoGate
              talkId={talk.id}
              vimeoId={talk.insiderOnly ? null : talk.vimeoId}
              title={talk.title}
              insiderOnly={talk.insiderOnly}
              posterUrl={talk.hero?.sizes?.large?.url ?? talk.hero?.sourceUrl}
            />

            {/* About this talk */}
            {bodyHtml && (
              <>
                {/* §F2.9 P1: leeshulp links boven de body. */}
                <DetailReadingTools />
                <section className="talk-about">
                  <div className="talk-about-eyebrow">About this talk</div>
                  <MaterialBody html={bodyHtml} />
                </section>
              </>
            )}

            {/* Google Preferred Source CTA — binnen het witte content-vel. */}
            <PreferredSourceEndBlock placement="talk" />

          </div>
          </div>

          {/* Sidebar */}
          <TalkDetailSidebar
            speakerNames={speakerNames}
            companyName={talk.companyName}
            dateLabel={publishedLabel}
            durationLabel={durationLabel}
            channels={digestChannels}
          />

          <div className="detail-related-row">
            {more.length > 0 && (
              <section className="talk-more" aria-label="More talks">
                <h2 className="talk-more-head t-display-md">More talks</h2>
                <div className="talk-more-grid">
                  {more.map((t) => (
                    <ContentCard
                      key={t.id}
                      href={`/talk/${t.slug}`}
                      contentType="talk"
                      thumbImage={t.hero}
                      thumbAlt={t.heroAlt}
                      eyebrow={formatDate(t.date)}
                      title={t.title}
                      meta={t.speakerNames.length > 0 ? t.speakerNames : undefined}
                      isInsiderOnly={t.insiderOnly}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>

                  <div className="detail-prevnext-row">
            <TalkPrevNext prev={prev} next={next} />
          </div>

        </div>
      </article>

      <ViewLogger objectType="talk" objectId={talk.id} />
      <JsonLd
        data={[
          buildVideoObject({
            slug: talk.slug,
            title: talk.title,
            description: videoDescription,
            thumbnailUrl: talk.hero?.sizes?.large?.url ?? talk.hero?.sourceUrl,
            uploadDate: talk.dateGmt || talk.date,
            // Never put the player URL in public JSON-LD for Insider-only talks.
            vimeoId: talk.insiderOnly ? null : talk.vimeoId,
            durationSeconds: talk.durationSeconds,
            insiderOnly: talk.insiderOnly,
          }),
          buildBreadcrumbList([
            { label: 'Home', url: '/' },
            { label: 'Talks', url: '/talk' },
            { label: talk.title },
          ]),
        ]}
      />
    </>
  )
}
