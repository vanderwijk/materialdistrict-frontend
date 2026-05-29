/**
 * Video-embed util
 * ----------------------------------------------------------------------
 * Detecteer de provider (YouTube / Vimeo) uit een willekeurige video-URL en
 * lever een genormaliseerde embed-URL + (waar mogelijk) een thumbnail.
 *
 * Sessie 8 — gebouwd voor de events-detail-media-viewer, maar bewust generiek
 * zodat material/brand/talk dezelfde util kunnen gebruiken.
 *
 * Ondersteunde vormen:
 *   YouTube : youtube.com/watch?v=ID · youtu.be/ID · youtube.com/embed/ID ·
 *             youtube.com/shorts/ID · m./nocookie-varianten
 *   Vimeo   : vimeo.com/ID · vimeo.com/ID/HASH (unlisted) ·
 *             vimeo.com/ID?h=HASH · player.vimeo.com/video/ID(?h=HASH)
 *
 * Vimeo unlisted vereist de hash in de embed: player.vimeo.com/video/ID?h=HASH
 * (Johan's sessie-8-handoff).
 */

export type VideoProvider = 'youtube' | 'vimeo'

export interface VideoSource {
  provider: VideoProvider
  /** Provider-specifieke video-ID. */
  id: string
  /** Vimeo unlisted-hash, indien aanwezig. */
  hash: string | null
  /** Embed-URL zonder autoplay (basis voor een <iframe src>). */
  embedUrl: string
  /**
   * Voorspelbare thumbnail-URL. Alleen YouTube (Vimeo vereist een API-call) —
   * `null` betekent: gebruik de meegeleverde `thumbnail` uit de content, of
   * een eigen fallback.
   */
  thumbnailUrl: string | null
}

const YOUTUBE_HOSTS = new Set([
  'youtube.com',
  'www.youtube.com',
  'm.youtube.com',
  'youtube-nocookie.com',
  'www.youtube-nocookie.com',
  'youtu.be',
])

const VIMEO_HOSTS = new Set(['vimeo.com', 'www.vimeo.com', 'player.vimeo.com'])

/** Strip een leidende host-prefix en geef een geldige `URL` terug, of null. */
function toUrl(raw: string): URL | null {
  const trimmed = raw.trim()
  if (!trimmed) return null
  try {
    return new URL(trimmed)
  } catch {
    // Zonder schema alsnog proberen (bv. "vimeo.com/123").
    try {
      return new URL(`https://${trimmed}`)
    } catch {
      return null
    }
  }
}

function hostname(url: URL): string {
  return url.hostname.toLowerCase()
}

/** YouTube-ID uit de diverse URL-vormen. */
function parseYouTube(url: URL): VideoSource | null {
  const host = hostname(url)
  let id: string | null = null

  if (host === 'youtu.be') {
    id = url.pathname.split('/').filter(Boolean)[0] ?? null
  } else {
    const v = url.searchParams.get('v')
    if (v) {
      id = v
    } else {
      // /embed/ID · /v/ID · /shorts/ID
      const segments = url.pathname.split('/').filter(Boolean)
      const idx = segments.findIndex((s) => s === 'embed' || s === 'v' || s === 'shorts')
      id = idx >= 0 ? segments[idx + 1] ?? null : null
    }
  }

  if (!id || !/^[\w-]{6,}$/.test(id)) return null
  return {
    provider: 'youtube',
    id,
    hash: null,
    embedUrl: `https://www.youtube-nocookie.com/embed/${id}?rel=0`,
    thumbnailUrl: `https://img.youtube.com/vi/${id}/hqdefault.jpg`,
  }
}

/** Vimeo-ID (+ optionele unlisted-hash) uit de diverse URL-vormen. */
function parseVimeo(url: URL): VideoSource | null {
  const segments = url.pathname.split('/').filter(Boolean)
  let id: string | null = null
  let hash: string | null = null

  if (segments[0] === 'video') {
    // player.vimeo.com/video/ID
    id = segments[1] ?? null
    hash = segments[2] ?? url.searchParams.get('h')
  } else {
    // vimeo.com/ID · vimeo.com/ID/HASH
    id = segments[0] ?? null
    hash = segments[1] ?? url.searchParams.get('h')
  }

  if (!id || !/^\d+$/.test(id)) return null
  const cleanHash = hash && /^[\w-]+$/.test(hash) ? hash : null
  const embedUrl = cleanHash
    ? `https://player.vimeo.com/video/${id}?h=${cleanHash}`
    : `https://player.vimeo.com/video/${id}`
  return {
    provider: 'vimeo',
    id,
    hash: cleanHash,
    // Vimeo-thumbnails vereisen een API-call → niet voorspelbaar.
    embedUrl,
    thumbnailUrl: null,
  }
}

/**
 * Parse een video-URL naar een `VideoSource`, of `null` als de provider niet
 * herkend wordt (caller toont dan een externe link).
 */
export function parseVideoUrl(raw: string): VideoSource | null {
  const url = toUrl(raw)
  if (!url) return null
  const host = hostname(url)
  if (YOUTUBE_HOSTS.has(host)) return parseYouTube(url)
  if (VIMEO_HOSTS.has(host)) return parseVimeo(url)
  return null
}

/**
 * Bouw de uiteindelijke `<iframe src>` uit een `VideoSource`, met optionele
 * autoplay (gebruik alleen na een expliciete user-actie — klik op play).
 */
export function toEmbedSrc(source: VideoSource, options: { autoplay?: boolean } = {}): string {
  if (!options.autoplay) return source.embedUrl
  const sep = source.embedUrl.includes('?') ? '&' : '?'
  // Beide providers gebruiken `autoplay=1`; muted niet nodig na user-gesture.
  return `${source.embedUrl}${sep}autoplay=1`
}
