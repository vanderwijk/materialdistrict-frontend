/**
 * FeaturedTalkBand — grote cinematische beeld-band voor één uitgelichte talk
 * (homepage, F2). Server Component: de hele band is één <Link> naar de talk;
 * de "Watch talk"-knop is daarom een <span>, geen geneste anchor.
 *
 * Krijgt één al-gemapt, serializeerbaar talk-VM van de server-page. Toont nu
 * de nieuwste talk; schakelt over op het `featured`-oormerk zodra dat in de
 * datalaag zit (losse follow-up). Rendert niets als er geen talk is.
 */

import Link from 'next/link'

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

  return (
    <section className="hp-section" aria-label="Featured talk">
      <div className="section-hd">
        <h2 className="section-title">Talks</h2>
        <Link href="/talk" className="section-link">
          All talks →
        </Link>
      </div>

      <Link
        href={talk.href}
        className="feature-band"
        style={
          talk.thumbUrl
            ? ({ backgroundImage: `url(${talk.thumbUrl})` } as React.CSSProperties)
            : undefined
        }
      >
        <span className="play" aria-hidden="true">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z" />
          </svg>
        </span>
        <div className="feature-band-inner">
          <p className="feature-band-eyebrow">Featured talk</p>
          <h3 className="feature-band-title">{talk.title}</h3>
          {talk.meta && <p className="feature-band-meta">{talk.meta}</p>}
          <span className="feature-band-actions">
            {talk.insiderOnly && (
              <span className="card-insider-pill is-on-photo">
                <svg
                  width="11"
                  height="11"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M12 2l2.9 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l7.1-1.01L12 2z" />
                </svg>
                Insider
              </span>
            )}
            <span className="btn btn-lg btn-on-photo">Watch talk →</span>
          </span>
        </div>
      </Link>
    </section>
  )
}
