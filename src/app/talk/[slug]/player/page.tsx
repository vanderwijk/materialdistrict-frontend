/**
 * `/talk/[slug]/player` — first-party gated player for VideoObject `embedUrl`.
 *
 * Google wil een player-URL, niet de Vimeo-ID in publieke JSON-LD. Deze
 * pagina is `noindex` en hergebruikt <TalkVideoGate>: anonieme bezoekers
 * en Googlebot zien de paywall; alleen een ingelogde Insider krijgt de
 * embed via `/api/talks/{id}/embed`.
 */

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTalk } from '@/lib/api'
import { canonicalPath } from '@/lib/seo'
import { TalkVideoGate } from '../_components/TalkVideoGate'

export const dynamicParams = true

export async function generateStaticParams() {
  return []
}

export const revalidate = 3600

interface TalkPlayerPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({
  params,
}: TalkPlayerPageProps): Promise<Metadata> {
  const { slug } = await params
  const talk = await getTalk(slug)

  if (!talk) {
    return { title: 'Talk not found', robots: { index: false, follow: false } }
  }

  return {
    title: talk.title,
    robots: { index: false, follow: false },
    alternates: { canonical: canonicalPath(`/talk/${talk.slug}`) },
  }
}

export default async function TalkPlayerPage({ params }: TalkPlayerPageProps) {
  const { slug } = await params
  const talk = await getTalk(slug)
  if (!talk) notFound()

  return (
    <article className="pub-wrap talk-player-page">
      <h1 className="sr-only">{talk.title}</h1>
      <TalkVideoGate
        talkId={talk.id}
        vimeoId={talk.insiderOnly ? null : talk.vimeoId}
        title={talk.title}
        insiderOnly={talk.insiderOnly}
        posterUrl={talk.hero?.sizes?.large?.url ?? talk.hero?.sourceUrl}
      />
    </article>
  )
}
