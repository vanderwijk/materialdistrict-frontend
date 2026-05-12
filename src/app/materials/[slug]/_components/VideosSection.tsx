'use client'

/**
 * VideosSection
 * ----------------------------------------------------------------------
 * Renders een "Videos"-sectie met play-thumbnails. Vandaag heeft het
 * Material-domain maar één `videoUrl: string | null`, dus we tonen één
 * placeholder die naar de externe URL navigeert.
 *
 * Zodra Johan een `videos: Array<{ url, title }>` aanlevert, breiden we
 * dit uit naar een grid met meerdere previews — de mockup-stijl staat
 * al klaar.
 *
 * Inline play behaviour valt buiten sessie 4: we kunnen YouTube/Vimeo
 * detecteren en embedden, maar dat is een aparte iteratie. Voor nu:
 * klik = open externe URL in nieuw tabblad.
 */

export interface VideosSectionProps {
  /** Eerste (en momenteel enige) video-URL. Null = sectie niet renderen. */
  videoUrl: string | null
  /** Voor a11y — beschrijft welk material dit is. */
  materialTitle: string
}

export function VideosSection({ videoUrl, materialTitle }: VideosSectionProps) {
  if (!videoUrl) return null

  return (
    <section className="mat-videos" aria-labelledby="videos-title">
      <h2 id="videos-title" className="mat-section-title">
        Videos
      </h2>
      <a
        href={videoUrl}
        target="_blank"
        rel="noreferrer"
        className="mat-video-tile mat-video-tile--single"
        aria-label={`Watch the ${materialTitle} product film (opens in a new tab)`}
      >
        <span className="mat-video-tile-play" aria-hidden="true">
          <svg width="22" height="22" fill="currentColor" viewBox="0 0 24 24">
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
        </span>
        <span className="mat-video-tile-caption">
          <span className="mat-video-tile-title">Product film</span>
          <span className="mat-video-tile-hint">Click to play</span>
        </span>
      </a>
    </section>
  )
}
