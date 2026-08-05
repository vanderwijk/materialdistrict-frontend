/**
 * FeaturedTalkBand — grote cinematische beeld-band voor één uitgelichte talk
 * (homepage, F2). Server Component: de hele band is één <Link> naar de talk;
 * de "Watch talk"-knop is daarom een <span>, geen geneste anchor.
 *
 * Krijgt één al-gemapt, serializeerbaar talk-VM van de server-page. Toont nu
 * de nieuwste talk; schakelt over op het `featured`-oormerk zodra dat in de
 * datalaag zit (losse follow-up). Rendert niets als er geen talk is.
 */

import Image from 'next/image'
import Link from 'next/link'
import { InsiderMark } from '@/components/ui'
import { normalizeMediaUrl } from '@/lib/utils/normalize-media-url'

export interface FeaturedTalkVM {
  href: string
  title: string
  thumbUrl?: string
  /** Bv. "Dr. Anna Meijer · 32 min". Lege string is toegestaan. */
  meta: string
  /** Insider-only talk → toont de Insider-pill. */
  insiderOnly?: boolean
}

interface FeaturedTalkBandProps {
  talk: FeaturedTalkVM | null
}

export function FeaturedTalkBand({ talk }: FeaturedTalkBandProps) {
  if (!talk) return null

  const thumbSrc = talk.thumbUrl
    ? normalizeMediaUrl(talk.thumbUrl) ?? talk.thumbUrl
    : undefined

  return (
    <section className="hp-section" aria-label="Featured talk">
      <div className="section-hd">
        <h2 className="section-title">Talks</h2>
        <Link href="/talk" className="section-link">
          All talks →
        </Link>
      </div>

      <Link href={talk.href} className="feature-band">
        {thumbSrc && (
          <Image
            src={thumbSrc}
            alt=""
            fill
            sizes="(max-width: 900px) 100vw, 70vw"
            className="feature-band-img"
          />
        )}
        <span className="play" aria-hidden="true">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z" />
          </svg>
        </span>
        <div className="feature-band-inner">
          <p className="feature-band-eyebrow">Featured talk</p>
          <h3 className="feature-band-title">
            {talk.insiderOnly && (
              <span className="content-card-insider" title="Insider">
                <InsiderMark size="md" ariaLabel="Insider" />
              </span>
            )}
            {talk.title}
          </h3>
          {talk.meta && <p className="feature-band-meta">{talk.meta}</p>}
          <span className="btn btn-lg btn-on-photo">Watch talk →</span>
        </div>
      </Link>
    </section>
  )
}
