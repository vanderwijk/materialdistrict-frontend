/**
 * Cache-tags — de brug tussen "opslaan in WordPress" en "meteen zichtbaar".
 *
 * §BETA-FIX-24-08 (H2).
 *
 * Achtergrond. Alle WP-fetches worden op tijd gecachet (materials 6 uur,
 * brands 24 uur, redactionele types 1 uur). Dat is snel en houdt de database
 * uit de wind, maar het betekende ook dat een net gepubliceerd materiaal pas
 * op de homepage verscheen wanneer díe cache toevallig verliep — terwijl het
 * overzicht een andere termijn had en dus wél al bijgewerkt was. Precies het
 * verschil dat de redactie zag.
 *
 * Oplossing in twee helften:
 *
 *  1. Elke gecachete fetch draagt een tag die zegt wélke WP-resource erin zit
 *     (`wp:material`, `wp:article`, `wp:media`, …). Dat gebeurt centraal in
 *     `wpFetch`, dus zonder dat de aanroepers iets hoeven te doen.
 *  2. WordPress belt bij het opslaan `/api/revalidate`, die de bijbehorende
 *     tags ongeldig verklaart en de geraakte pagina's opnieuw laat bakken.
 *
 * De tags zijn bewust grofmazig — per contenttype, niet per record. Een
 * tag-per-record zou preciezer zijn, maar dan moet elke lijst-fetch de tags
 * van álle records erin dragen, en dat is de complexiteit hier niet waard: het
 * opnieuw ophalen van één contenttype is een handvol WP-requests.
 */

/** Prefix zodat onze tags nooit botsen met tags van derden. */
const TAG_PREFIX = 'wp'

/**
 * WP REST-paden zien er zo uit:
 *   /wp/v2/material            → material
 *   /wp/v2/article?slug=x      → article
 *   /wp/v2/media               → media
 *   /md/v2/material-channels   → material-channels
 *   /wc/store/v1/products      → product
 *
 * We nemen het segment ná de namespace + versie. Onbekende vormen leveren
 * `null`; die fetch krijgt dan gewoon geen automatische tag en blijft
 * tijdgebaseerd — een ontbrekende tag mag nooit een fetch breken.
 */
const RESOURCE_ALIASES: Record<string, string> = {
  products: 'product',
  materials: 'material',
  articles: 'article',
  pages: 'page',
}

export function resourceCacheTag(path: string): string | null {
  const clean = path.split('?')[0].replace(/^\/+|\/+$/g, '')
  const parts = clean.split('/').filter(Boolean)
  let resource: string | undefined
  // Woo Store API: /wc/store/v1/products — anders zou het versiesegment
  // (`v1`) als resource-tag landen en nooit matchen met een product-ping.
  if (
    parts[0] === 'wc' &&
    parts[1] === 'store' &&
    parts.length >= 4 &&
    /^v\d+$/i.test(parts[2])
  ) {
    resource = parts[3]
  } else if (parts.length >= 3 && /^v\d+$/i.test(parts[1])) {
    // [namespace, version, resource, ...] — bv. ['wp', 'v2', 'material']
    resource = parts[2]
  } else {
    resource = parts[parts.length - 1]
  }
  if (!resource) return null
  // Losse record-id's (`/wp/v2/material/1234`) horen bij hetzelfde type.
  if (/^\d+$/.test(resource)) return null
  resource = RESOURCE_ALIASES[resource] ?? resource
  return `${TAG_PREFIX}:${resource}`
}

/** Bouwt de tag voor een contenttype, zoals `/api/revalidate` die gebruikt. */
export function contentTypeCacheTag(type: string): string {
  return `${TAG_PREFIX}:${type}`
}

/**
 * WordPress-posttype → de frontend-route waar dat type onder woont.
 * Gebruikt om na een wijziging de juiste detail- en overzichtspagina te
 * verversen. Types die hier niet in staan verversen alleen op tag.
 */
export const POST_TYPE_ROUTES: Record<string, string> = {
  material: '/material',
  article: '/article',
  post: '/article',
  brand: '/brand',
  event: '/event',
  talk: '/talk',
  book: '/book',
  product: '/book',
  theme: '/channel',
}

/**
 * Welke tags moeten weg bij een wijziging van dit posttype.
 *
 * Naast het type zelf altijd `media`: een vervangen of nieuw bijgesneden
 * afbeelding zit in de media-cache, niet in die van de post. Dat was de
 * tweede klacht — een aangepaste thumbnail die lang bleef hangen.
 */
export function tagsForPostType(type: string): string[] {
  const tags = new Set<string>([contentTypeCacheTag(type), contentTypeCacheTag('media')])
  // Een materiaal hangt onder een brand; het brandprofiel toont zijn
  // materialen. Beide kanten verversen, anders klopt één van de twee niet.
  if (type === 'material') tags.add(contentTypeCacheTag('brand'))
  if (type === 'brand') tags.add(contentTypeCacheTag('material'))
  if (type === 'book' || type === 'product') {
    tags.add(contentTypeCacheTag('book'))
    tags.add(contentTypeCacheTag('product'))
  }
  if (type === 'theme') tags.add(contentTypeCacheTag('material-channels'))
  return Array.from(tags)
}
