/**
 * VideoEmbed — responsive iframe-player voor YouTube/Vimeo.
 *
 * Sessie 8.
 *
 * Detecteert de provider via `parseVideoUrl` (incl. Vimeo unlisted
 * `vimeo.com/{id}/{hash}`) en rendert een fill-de-container iframe. De
 * aspect-ratio/afmeting wordt door de parent bepaald (bv. de media-viewer op
 * de event-detailpagina). Onbekende provider → nette externe link i.p.v. een
 * lege iframe.
 *
 * Presentational (geen hooks) — bruikbaar in zowel server- als client-context.
 * `autoPlay` alleen inzetten na een expliciete user-actie (klik op play).
 */

import { parseVideoUrl, toEmbedSrc } from '@/lib/utils/video-embed'
import { cn } from '@/lib/utils/cn'

interface VideoEmbedProps {
  /** Video-URL (YouTube of Vimeo). */
  url: string
  /** Titel voor het iframe (a11y) + link-tekst bij fallback. */
  title?: string | null
  /** Autoplay — alleen na user-gesture (klik). Default false. */
  autoPlay?: boolean
  className?: string
}

export function VideoEmbed({ url, title, autoPlay = false, className }: VideoEmbedProps) {
  const source = parseVideoUrl(url)

  if (!source) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className={cn('video-embed-fallback', className)}
      >
        {title ? `Watch: ${title}` : 'Watch video'} ↗
      </a>
    )
  }

  return (
    <iframe
      className={cn('video-embed-iframe', className)}
      src={toEmbedSrc(source, { autoplay: autoPlay })}
      title={title ?? 'Video'}
      loading="lazy"
      referrerPolicy="strict-origin-when-cross-origin"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowFullScreen
    />
  )
}
