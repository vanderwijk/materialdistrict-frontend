/**
 * TalkVideo — presentational Vimeo-embed (C10).
 *
 * Sessie 7. Rendert de Vimeo-player in een 16:9-wrapper (`.talk-video`).
 * Geen `vimeoId` → nette placeholder, geen lege iframe. Pure presentatie;
 * wordt aangeroepen vanuit de client-gate `TalkVideoGate`.
 */
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
        src={`https://player.vimeo.com/video/${encodeURIComponent(vimeoId)}`}
        title={title}
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
        loading="lazy"
      />
    </div>
  )
}
