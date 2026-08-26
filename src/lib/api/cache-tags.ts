/**
 * Cache-tags — de brug tussen "opslaan in WordPress" en "meteen zichtbaar".
 *
 * §BETA-FIX-24-08 (H2) — opzet.
 * §CACHE-FIX-26-08     — herzien naar tags per record.
 *
 * Achtergrond. Alle WP-fetches worden op tijd gecachet (materials 6 uur,
 * brands 24 uur, redactioneel 1 uur). WordPress belt bij het opslaan
 * `/api/revalidate`, dat de bijbehorende tags ongeldig verklaart zodat een
 * publicatie binnen seconden zichtbaar is.
 *
 * ---------------------------------------------------------------------------
 * Waarom deze herziening
 * ---------------------------------------------------------------------------
 * De eerste opzet gebruikte één tag per contenttype (`wp:material`,
 * `wp:media`, …) met als redenering: "het opnieuw ophalen van één contenttype
 * is een handvol WP-requests". Die aanname klopt niet. `wpFetch` hangt de tag
 * automatisch aan *elke* gecachete fetch, dus `wp:material` zat aan de
 * homepage, alle overzichten, álle detailpagina's en de channel-hubs
 * tegelijk. Eén opslag ontcachete daarmee in de praktijk de hele site.
 *
 * Erger nog: `tagsForPostType()` voegde `wp:media` toe bij *ieder* posttype,
 * dus ook het opslaan van een talk gooide alle media-fetches weg — inclusief
 * de `?parent=`-aanroepen van 100 items per detailpagina.
 *
 * Gevolg op 24-08-2026: een bulk-import (79 talks, 77 products) plus normaal
 * redactiewerk hield de cache permanent leeg. Elke bezoeker viel terug op
 * WordPress; de CMS-server liep op load 20 bij 4 vCPU.
 *
 * ---------------------------------------------------------------------------
 * De opzet nu
 * ---------------------------------------------------------------------------
 * Drie soorten tags, van fijn naar grof:
 *
 *   wp:material:slug:alucobond   één record, opgevraagd via `?slug=`
 *   wp:material:id:1234          één record, opgevraagd via id of `?include=`
 *   wp:material:list             elke lijst-/query-fetch van dit type
 *   wp:material:all              ontsnappingsluik voor een handmatige flush
 *
 * Bij het opslaan van één materiaal gaan alleen de tag van dát record en de
 * lijst-tag weg. De duizenden andere detailpagina's en álle media blijven
 * staan. De oorspronkelijke klacht (publicatie niet zichtbaar op de homepage)
 * blijft opgelost: de homepage leest zijn materialen via een lijst-fetch en
 * draagt dus `wp:material:list`.
 *
 * `wp:<type>:all` hangt aan elke fetch maar wordt nooit door een gewone
 * opslag ongeldig verklaard — alleen als de ping expliciet `scope: "all"`
 * meestuurt. Zo houden we een knop om één contenttype volledig te legen
 * zonder daar dagelijks de prijs voor te betalen.
 */

/** Prefix zodat onze tags nooit botsen met tags van derden. */
const TAG_PREFIX = 'wp'

/**
 * WP REST-paden zien er zo uit:
 *   /wp/v2/material            → material
 *   /wp/v2/media               → media
 *   /md/v2/material-channels   → material-channels
 *   /wc/store/v1/products      → product
 *
 * We nemen het segment ná de namespace + versie. Onbekende vormen leveren
 * `null`; die fetch krijgt dan geen automatische tag en blijft tijdgebaseerd —
 * een ontbrekende tag mag nooit een fetch breken.
 */
const RESOURCE_ALIASES: Record<string, string> = {
  products: 'product',
  materials: 'material',
  articles: 'article',
  pages: 'page',
}

/** Query-params zoals `wpFetch` ze meekrijgt (zie `WPFetchOptions.params`). */
export type CacheTagParams = Record<
  string,
  string | number | boolean | string[] | number[] | undefined | null
>

/**
 * Resource + eventueel record-id uit het pad.
 *
 * `/wp/v2/media/1234` → `{ resource: 'media', id: 1234 }`
 * `/wp/v2/material`   → `{ resource: 'material' }`
 */
function parsePath(path: string): { resource: string; id?: number } | null {
  const clean = path.split('?')[0].replace(/^\/+|\/+$/g, '')
  const parts = clean.split('/').filter(Boolean)
  if (parts.length === 0) return null

  let rest: string[]
  // Woo Store API: /wc/store/v1/products — anders zou het versiesegment (`v1`)
  // als resource landen en nooit matchen met een product-ping.
  if (
    parts[0] === 'wc' &&
    parts[1] === 'store' &&
    parts.length >= 4 &&
    /^v\d+$/i.test(parts[2])
  ) {
    rest = parts.slice(3)
  } else if (parts.length >= 3 && /^v\d+$/i.test(parts[1])) {
    // [namespace, version, resource, ...] — bv. ['wp', 'v2', 'material']
    rest = parts.slice(2)
  } else {
    rest = parts.slice(-1)
  }

  const raw = rest[0]
  if (!raw || /^\d+$/.test(raw)) return null

  const resource = RESOURCE_ALIASES[raw] ?? raw
  // Een trailing getal is het record-id: /wp/v2/media/1234
  const tail = rest[1]
  const id = tail && /^\d+$/.test(tail) ? Number(tail) : undefined

  return id !== undefined ? { resource, id } : { resource }
}

/** `wp:material` → grondslag voor alle tags van dit type. */
function base(resource: string): string {
  return `${TAG_PREFIX}:${resource}`
}

export function recordTagBySlug(resource: string, slug: string): string {
  return `${base(resource)}:slug:${slug}`
}

export function recordTagById(resource: string, id: number | string): string {
  return `${base(resource)}:id:${id}`
}

export function listTag(resource: string): string {
  return `${base(resource)}:list`
}

export function allTag(resource: string): string {
  return `${base(resource)}:all`
}

/** Normaliseert een param naar een lijst met waarden. */
function toValues(
  value: CacheTagParams[string],
): ReadonlyArray<string | number> {
  if (value === undefined || value === null) return []
  if (Array.isArray(value)) return value
  if (typeof value === 'boolean') return []
  return [value]
}

/**
 * De tags voor één gecachete fetch.
 *
 * Vraagt de fetch één specifiek record op (`?slug=`, `?include=`, of een id in
 * het pad), dan krijgt hij de record-tags. In alle andere gevallen is het een
 * lijst of een query en krijgt hij de lijst-tag. `wp:<type>:all` gaat er altijd
 * bij als handmatig ontsnappingsluik.
 *
 * Let op: params komen bij `wpFetch` los binnen (`options.params`), niet in het
 * pad — daarom neemt deze functie ze apart aan.
 */
export function resourceCacheTags(
  path: string,
  params?: CacheTagParams,
): string[] {
  const parsed = parsePath(path)
  if (!parsed) return []

  const { resource, id } = parsed
  const tags = new Set<string>([allTag(resource)])

  // 1. Id in het pad: /wp/v2/media/1234
  if (id !== undefined) {
    tags.add(recordTagById(resource, id))
    return Array.from(tags)
  }

  const slugs = toValues(params?.slug)
  const includes = toValues(params?.include)
  const parents = toValues(params?.parent)

  // 2. Losse records via ?slug= of ?include=
  if (slugs.length > 0 || includes.length > 0) {
    for (const slug of slugs) tags.add(recordTagBySlug(resource, String(slug)))
    for (const one of includes) tags.add(recordTagById(resource, one))
    return Array.from(tags)
  }

  // 3. Bijlagen van één post: /wp/v2/media?parent=1234
  //    Eigen tag, zodat een upload alleen de media van díe post raakt.
  if (parents.length > 0) {
    for (const parent of parents) {
      tags.add(`${base(resource)}:parent:${parent}`)
    }
    return Array.from(tags)
  }

  // 4. Al het overige is een lijst of een filter-query.
  tags.add(listTag(resource))
  return Array.from(tags)
}

/**
 * WordPress-posttype → de frontend-route waar dat type onder woont.
 * Types die hier niet in staan verversen alleen op tag.
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

/** Wat WordPress over een wijziging meestuurt. */
export interface RevalidateTarget {
  type: string
  slug?: string
  postId?: number
  brandSlug?: string
  /** Attachment-id, alleen bij een media-ping. */
  mediaId?: number
  /** Post waar de attachment onder hangt, alleen bij een media-ping. */
  parentId?: number
  /** `'all'` leegt het hele contenttype — alleen op expliciet verzoek. */
  scope?: 'record' | 'all'
}

/**
 * Welke tags weg moeten bij een wijziging.
 *
 * Het uitgangspunt is: zo min mogelijk. Bij een gewone opslag zijn dat de tag
 * van het record zelf en de lijst-tag van het type — niet meer. Media komen
 * alleen aan bod bij een échte media-wijziging, en dan alleen de betrokken
 * attachment en de post waar hij onder hangt.
 *
 * Zonder `postId`/`slug` (oudere plugin die die velden nog niet meestuurt)
 * valt het terug op de lijst-tag. Dat is minder precies maar nooit breder dan
 * één contenttype, en het blijft correct.
 */
export function tagsForTarget(target: RevalidateTarget): string[] {
  const { type, slug, postId, brandSlug, mediaId, parentId, scope } = target
  const tags = new Set<string>()

  if (scope === 'all') {
    tags.add(allTag(type))
    tags.add(listTag(type))
    return Array.from(tags)
  }

  // Media: alleen de betrokken attachment en zijn ouder.
  if (type === 'media') {
    if (mediaId !== undefined) tags.add(recordTagById('media', mediaId))
    if (parentId !== undefined) tags.add(`${base('media')}:parent:${parentId}`)
    // Niets bekend? Dan alleen de media-lijst, niet de hele mediacache.
    if (tags.size === 0) tags.add(listTag('media'))
    return Array.from(tags)
  }

  // Het record zelf.
  if (slug) tags.add(recordTagBySlug(type, slug))
  if (postId !== undefined) tags.add(recordTagById(type, postId))

  // De lijsten waar het record in voorkomt.
  tags.add(listTag(type))

  // `post` en `article` zijn in de frontend één ding.
  if (type === 'post') tags.add(listTag('article'))
  if (type === 'article') tags.add(listTag('post'))

  // Books staan als Woo-product én als book in de cache.
  if (type === 'book' || type === 'product') {
    tags.add(listTag('book'))
    tags.add(listTag('product'))
  }

  // Een materiaal hangt onder een brand; het brandprofiel toont zijn
  // materialen. Alleen dát brandprofiel verversen — niet alle brands.
  if (type === 'material' && brandSlug) {
    tags.add(recordTagBySlug('brand', brandSlug))
  }

  // Channel-tellingen (eigen REST-resource) veranderen mee met materialen.
  if (type === 'material') {
    tags.add(listTag('material-channels'))
  }

  // Een thema verandert de samenstelling van de channel-hubs. Die lezen
  // materials en articles via lijst-fetches, dus de lijst-tags volstaan.
  if (type === 'theme') {
    tags.add(listTag('material-channels'))
    tags.add(listTag('material'))
    tags.add(listTag('article'))
  }

  return Array.from(tags)
}
