/**
 * Media types
 * ----------------------------------------------------------------------
 * Domain-model voor WP-attachments. Gemodelleerd op de werkelijke
 * `/wp/v2/media?parent=<id>` response (sessie 2 verkenning, OBRO post).
 *
 * Onderscheid:
 * - `WPMediaRaw` — raw API-shape (in `lib/api/wordpress.ts` als WPMediaResponse)
 * - `MediaImage` — domain-shape voor de UI (compact, alleen wat we gebruiken)
 * - `MediaSize` — één rendition (thumbnail / medium / large / full / etc.)
 *
 * Image-sizes die in productie aanwezig zijn (bevestigd op OBRO):
 *   thumbnail (320×200), medium (600×400), medium_large (768×512),
 *   large (960×640), 1536x1536 (1536×1024), full (2000×1333),
 *   listing-article (660×300, custom MD-size, andere aspect-ratio)
 */

/** Bekende image-size sleutels uit de WP-installatie. */
export type ImageSizeKey =
  | 'thumbnail'
  | 'medium'
  | 'medium_large'
  | 'large'
  | '1536x1536'
  | 'full'
  | 'listing-article'

/** Eén renditie van een afbeelding. */
export interface MediaSize {
  url: string
  width: number
  height: number
  /** Bytes. Niet altijd aanwezig in `full` (WP-eigenaardigheid). */
  filesize?: number
  mimeType: string
}

/**
 * Domain-shape voor één image-attachment.
 * Verkleinde, gestructureerde versie van `WPMediaResponse`.
 */
export interface MediaImage {
  id: number
  /** Toegankelijkheid. Lege string als niet ingevuld in WP — frontend moet fallback hebben. */
  alt: string
  /** Caption uit WP, mogelijk leeg. HTML-rendered. */
  caption: string
  /** Beschrijving uit WP, mogelijk leeg. HTML-rendered. */
  description: string
  mimeType: string
  /** Volledige resolutie als convenience-veld. Identiek aan `sizes.full.url`. */
  sourceUrl: string
  /** Originele afmetingen. */
  width: number
  height: number
  /**
   * Beschikbare renditions. Niet elke key is altijd aanwezig — afhankelijk
   * van de origineel-grootte en WP-config. Frontend gebruikt `pickSize()`
   * om veilig de gewenste renditie te kiezen met fallback.
   */
  sizes: Partial<Record<ImageSizeKey, MediaSize>>
  /** ID van de post waaraan deze attachment hangt. */
  parentPostId: number
  /** Voor sortering — uit `menu_order` als gevraagd, anders 0. */
  menuOrder?: number
}

/**
 * Een opgeloste gallery: hero + thumbs.
 * Output van `splitGallery()` in `lib/api/wordpress.ts`.
 */
export interface Gallery {
  /** Hero / eerste afbeelding. Null als de post geen attachments heeft. */
  hero: MediaImage | null
  /**
   * Overige afbeeldingen, in volgorde (`menu_order` asc).
   * Lege array als de post slechts één attachment heeft (= alleen hero).
   */
  thumbs: MediaImage[]
  /** Totaal aantal afbeeldingen (= hero + thumbs.length, of 0). */
  total: number
}
