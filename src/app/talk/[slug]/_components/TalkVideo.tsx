/**
 * TalkVideo — presentational Vimeo-embed (C10).
 *
 * Sessie 7. Rendert de Vimeo-player in een 16:9-wrapper (`.talk-video`).
 * Geen `vimeoId` → nette placeholder, geen lege iframe. Pure presentatie;
 * wordt aangeroepen vanuit de client-gate `TalkVideoGate`.
 *
 * Player chrome: URL-params spiegelen Vimeo embed preset
 * "materialdistrict.com" (121194095) — title/byline/portrait/badge uit.
 */
import { buildVimeoEmbedUrl } from '@/lib/utils/video-embed'

export interface TalkVideoProps {
  vimeoId: string | null
  title: string
}

export function TalkVideo({ vimeoId, title }: TalkVideoProps) {
  if (!vimeoId) {
    return (
      <div className="talk-video is-placeholder">
        <span className="talk-video-placeholder-label">Video coming soon</span>
      </div>
    )
  }

  return (
    <div className="talk-video">
      <iframe
        src={buildVimeoEmbedUrl(vimeoId)}
        title={title}
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
        loading="lazy"
      />
    </div>
  )
}
