/**
 * FeaturedTalkBand — grote cinematische beeld-band voor één uitgelichte talk
 * (homepage, F2). Server Component: de hele band is één <Link> naar de talk;
 * de "Watch talk"-knop is daarom een <span>, geen geneste anchor.
 */

import Link from 'next/link'
import { InsiderMark, MdImage } from '@/components/ui'
import type { MediaImage } from '@/types/media'

export interface FeaturedTalkVM {
  href: string
  title: string
  hero?: MediaImage | null
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

      {/* §BETA-FIX-24-08 (H5): geen tekstlaag meer over het beeld. De talk-
          thumbnails dragen de titel en de sprekersnaam al in het beeld zelf
          (vast format), waardoor de overlay er dwars doorheen liep en beide
          onleesbaar werden. De titel blijft bestaan voor schermlezers en zoek-
          machines via het aria-label op de link en de visueel verborgen h3 —
          alleen de zichtbare dubbeling verdwijnt. */}
      <Link
        href={talk.href}
        className="feature-band"
        aria-label={
          talk.meta ? `${talk.title} — ${talk.meta}` : talk.title
        }
      >
        {talk.hero && (
          <MdImage
            image={talk.hero}
            role="listing-wide"
            alt=""
            fill
            className="feature-band-img"
          />
        )}
        <span className="play" aria-hidden="true">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z" />
          </svg>
        </span>
        <h3 className="sr-only">
          {talk.insiderOnly ? `Insider — ${talk.title}` : talk.title}
        </h3>
        <div className="feature-band-inner feature-band-inner--cta-only">
          {talk.insiderOnly && (
            <span className="content-card-insider" title="Insider">
              <InsiderMark size="md" ariaLabel="Insider" />
            </span>
          )}
          <span className="btn btn-lg btn-on-photo">Watch talk →</span>
        </div>
      </Link>
    </section>
  )
}
