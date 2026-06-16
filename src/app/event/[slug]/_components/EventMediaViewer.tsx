'use client'

/**
 * EventMediaViewer — media-gallery op de event-detailpagina.
 *
 * Sessie 8.
 *
 * Voegt gallery-foto's en videos samen in één 16:7-viewer met een thumbnail-
 * strip (mockup-patroon `renderEventDetail`). De actieve tegel bepaalt wat de
 * hoofd-viewer toont: een foto, of de `VideoEmbed`-player. Autoplay alleen na
 * een expliciete klik op de video-tegel (user-gesture).
 *
 * Video-thumbnail: bij voorkeur de meegeleverde `thumbnail` uit het contract,
 * anders de voorspelbare YouTube-thumbnail, anders een donkere fallback-tegel.
 */

import { useState } from 'react'
import { VideoEmbed } from '@/components/ui'
import { parseVideoUrl } from '@/lib/utils/video-embed'
import type { MediaImage } from '@/types/media'
import type { EventVideo } from '@/types/event'

type MediaItem =
  | { kind: 'image'; image: MediaImage }
  | { kind: 'video'; video: EventVideo }

interface EventMediaViewerProps {
  images: MediaImage[]
  videos: EventVideo[]
  /** Titel van het event — alt/title-fallback. */
  title: string
}

function videoThumb(video: EventVideo): string | null {
  return video.thumbnail ?? parseVideoUrl(video.url)?.thumbnailUrl ?? null
}

export function EventMediaViewer({ images, videos, title }: EventMediaViewerProps) {
  const items: MediaItem[] = [
    ...images.map((image): MediaItem => ({ kind: 'image', image })),
    ...videos.map((video): MediaItem => ({ kind: 'video', video })),
  ]

  const [active, setActive] = useState(0)
  const [autoplay, setAutoplay] = useState(false)

  if (items.length === 0) return null

  const current = items[Math.min(active, items.length - 1)]

  const select = (index: number, withAutoplay: boolean) => {
    setActive(index)
    setAutoplay(withAutoplay)
  }
  const go = (delta: number) => {
    const next = (active + delta + items.length) % items.length
    select(next, items[next].kind === 'video')
  }

  const hasMultiple = items.length > 1

  return (
    <div className="event-media">
      <div className="event-media-main">
        {current.kind === 'image' ? (
          <>
            <img
              className="event-media-img"
              src={current.image.sizes?.large?.url ?? current.image.sourceUrl}
              alt={current.image.alt || title}
            />
            {hasMultiple && (
              <>
                <button
                  type="button"
                  className="event-media-nav is-prev"
                  onClick={() => go(-1)}
                  aria-label="Previous media"
                >
                  ‹
                </button>
                <button
                  type="button"
                  className="event-media-nav is-next"
                  onClick={() => go(1)}
                  aria-label="Next media"
                >
                  ›
                </button>
                <span className="event-media-counter" aria-hidden="true">
                  {active + 1} / {items.length}
                </span>
              </>
            )}
          </>
        ) : (
          <VideoEmbed url={current.video.url} title={current.video.title ?? title} autoPlay={autoplay} />
        )}
      </div>

      {hasMultiple && (
        <div className="event-media-strip" role="tablist" aria-label="Event media">
          {items.map((item, i) => {
            const isActive = i === active
            if (item.kind === 'image') {
              return (
                <button
                  key={`img-${item.image.id}`}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  className={`event-media-thumb${isActive ? ' is-active' : ''}`}
                  onClick={() => select(i, false)}
                >
                  <img
                    src={item.image.sizes?.thumbnail?.url ?? item.image.sourceUrl}
                    alt=""
                  />
                </button>
              )
            }
            const thumb = videoThumb(item.video)
            return (
              <button
                key={`vid-${i}`}
                type="button"
                role="tab"
                aria-selected={isActive}
                className={`event-media-thumb is-video${isActive ? ' is-active' : ''}`}
                onClick={() => select(i, true)}
                title={item.video.title ?? 'Video'}
              >
                {thumb && <img src={thumb} alt="" />}
                <span className="event-media-thumb-play" aria-hidden="true">▶</span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
