/**
 * Structured-data builders — converteren onze domain-types naar
 * Schema.org JSON-LD objecten.
 *
 * **Wanneer gebruiken:** elke detail-page die over een content-item gaat
 * (Material, Article, Event, Book) krijgt een `<JsonLd data={...} />`
 * in zijn JSX. Overzichtspagina's krijgen een `BreadcrumbList`.
 *
 * **Waarom belangrijk:** Schema.org structured data is een SEO-multiplier.
 * Google trekt rich snippets uit onze pages — review-sterren, prijs,
 * datum, auteur, locatie. Geen structured data = geen rich snippets.
 *
 * **Conventie:** elke builder is een puurfunctie zonder side-effects.
 * Geeft `null` terug als er niet genoeg data is voor een geldige entry,
 * zodat de aanroeper conditioneel kan renderen zonder ongeldige JSON-LD.
 */

import type {
  ArticleSchema,
  BookSchema,
  BreadcrumbListSchema,
  EventSchema,
  OrganizationSchema,
  ProductSchema,
  VideoObjectSchema,
  WebSiteSchema,
} from './types'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://materialdistrict.com'
const SITE_NAME = 'MaterialDistrict'

/**
 * Bouwt het basis Organization-schema voor MaterialDistrict.
 * Wordt typisch in de root layout geplaatst, één keer per page-load.
 */
export function buildOrganization(): OrganizationSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE_URL}/#organization`,
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/material-district-logo.svg`,
    sameAs: [
      'https://www.linkedin.com/company/materialdistrict',
      'https://www.instagram.com/materialdistrict',
    ],
  }
}

/**
 * Brand → Organization structured data (sessie 5).
 *
 * Een brand is in Schema.org-context een Organization. Geeft Google de
 * mogelijkheid een knowledge-panel / rich entity te tonen voor de
 * fabrikant. Puurfunctie: `null` als er onvoldoende data is (geen naam).
 *
 * `sameAs` verzamelt de ingevulde social-URLs — Google gebruikt dit om
 * de organisatie aan haar officiële profielen te koppelen.
 */
interface BrandForJsonLd {
  slug: string
  name: string
  description?: string
  logo?: string
  website?: string | null
  socials?: {
    facebook?: string | null
    instagram?: string | null
    linkedin?: string | null
    twitter?: string | null
    youtube?: string | null
  }
}

export function buildBrandOrganization(
  brand: BrandForJsonLd,
): OrganizationSchema | null {
  if (!brand.name || !brand.slug) return null

  const sameAs = brand.socials
    ? [
        brand.socials.linkedin,
        brand.socials.twitter,
        brand.socials.facebook,
        brand.socials.instagram,
        brand.socials.youtube,
      ].filter((url): url is string => Boolean(url))
    : []

  const schema: OrganizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE_URL}/brands/${brand.slug}#organization`,
    name: brand.name,
    // De canonieke URL van de brand binnen MaterialDistrict.
    url: `${SITE_URL}/brands/${brand.slug}`,
  }

  if (brand.description) schema.description = brand.description
  if (brand.logo) {
    schema.image = brand.logo
    schema.logo = brand.logo
  }
  // `website` (eigen brand-site) + socials samen in sameAs — verwijzen
  // allemaal naar dezelfde echte entiteit elders op het web.
  const external = [
    ...(brand.website ? [brand.website] : []),
    ...sameAs,
  ]
  if (external.length > 0) schema.sameAs = external

  return schema
}

/**
 * WebSite-schema met sitelinks search-box.
 * Eén keer per page in root layout.
 */
export function buildWebSite(): WebSiteSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    name: SITE_NAME,
    url: SITE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }
}

/**
 * Material → Product structured data.
 *
 * Materials zijn in Schema.org context Product, want Google geeft Products
 * rich snippets met prijs, brand, beschikbaarheid. Sample availability
 * mappen we naar `availability` als subtle hint.
 */
interface MaterialForJsonLd {
  slug: string
  title: string
  description?: string
  heroImage?: string
  brand?: { name: string; slug?: string }
  category?: string
  properties?: Array<{ name: string; value: string }>
}

export function buildProduct(material: MaterialForJsonLd): ProductSchema | null {
  if (!material.title || !material.slug) return null

  const url = `${SITE_URL}/materials/${material.slug}`
  const schema: ProductSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': url,
    name: material.title,
    url,
  }

  if (material.description) schema.description = material.description
  if (material.heroImage) schema.image = material.heroImage
  if (material.category) schema.category = material.category

  if (material.brand?.name) {
    schema.brand = {
      '@type': 'Brand',
      name: material.brand.name,
      ...(material.brand.slug ? { url: `${SITE_URL}/brands/${material.brand.slug}` } : {}),
    }
  }

  if (material.properties && material.properties.length > 0) {
    schema.additionalProperty = material.properties.map((p) => ({
      '@type': 'PropertyValue' as const,
      name: p.name,
      value: p.value,
    }))
  }

  return schema
}

/**
 * Article → Article structured data.
 *
 * Voor news en blog content. Google's E-E-A-T (expertise/authoritativeness)
 * leunt sterk op author + publisher + datePublished — alle drie meegeven
 * waar mogelijk.
 */
interface ArticleForJsonLd {
  slug: string
  title: string
  excerpt?: string
  heroImage?: string
  publishedAt: string
  modifiedAt?: string
  author?: { name: string }
  category?: string
}

export function buildArticle(article: ArticleForJsonLd): ArticleSchema | null {
  if (!article.title || !article.slug || !article.publishedAt) return null

  const url = `${SITE_URL}/articles/${article.slug}`
  const schema: ArticleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': url,
    headline: article.title,
    datePublished: article.publishedAt,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/material-district-logo.svg`,
      },
    },
  }

  if (article.excerpt) schema.description = article.excerpt
  if (article.heroImage) schema.image = article.heroImage
  if (article.modifiedAt) schema.dateModified = article.modifiedAt
  if (article.author?.name) {
    schema.author = { '@type': 'Person', name: article.author.name }
  }
  if (article.category) schema.articleSection = article.category

  return schema
}

/**
 * Talk → VideoObject structured data.
 *
 * Vereist `title` + `uploadDate`. `embedUrl` (Vimeo), `thumbnailUrl`,
 * `description` en `duration` (ISO 8601) zijn aanbevolen voor video-rich-
 * results. Retourneert null als titel of uploadDate ontbreekt.
 */
interface VideoForJsonLd {
  slug: string
  title: string
  description?: string
  thumbnailUrl?: string
  uploadDate: string
  vimeoId?: string | null
  durationSeconds?: number | null
}

/** Seconden → ISO 8601 duur (bv. 1435 → "PT23M55S"). */
function isoDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  let out = 'PT'
  if (h > 0) out += `${h}H`
  if (m > 0) out += `${m}M`
  if (s > 0 || (h === 0 && m === 0)) out += `${s}S`
  return out
}

export function buildVideoObject(
  video: VideoForJsonLd,
): VideoObjectSchema | null {
  if (!video.title || !video.uploadDate) return null

  const url = `${SITE_URL}/talks/${video.slug}`
  const schema: VideoObjectSchema = {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    '@id': url,
    name: video.title,
    uploadDate: video.uploadDate,
  }

  if (video.description) schema.description = video.description
  if (video.thumbnailUrl) schema.thumbnailUrl = video.thumbnailUrl
  if (video.vimeoId) {
    schema.embedUrl = `https://player.vimeo.com/video/${video.vimeoId}`
  }
  if (video.durationSeconds && video.durationSeconds > 0) {
    schema.duration = isoDuration(Math.round(video.durationSeconds))
  }

  return schema
}

/**
 * Event → Event structured data.
 *
 * Vereist `startDate` (ISO 8601). Location en organizer zijn sterk aanbevolen
 * voor event-snippets in Google search.
 */
interface EventForJsonLd {
  slug: string
  title: string
  description?: string
  heroImage?: string
  startsAt: string
  endsAt?: string
  location?: { name: string; city?: string; country?: string }
  organizer?: { name: string; url?: string }
  url?: string
}

export function buildEvent(event: EventForJsonLd): EventSchema | null {
  if (!event.title || !event.slug || !event.startsAt) return null

  const url = `${SITE_URL}/events/${event.slug}`
  const schema: EventSchema = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    '@id': url,
    name: event.title,
    url,
    startDate: event.startsAt,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
  }

  if (event.description) schema.description = event.description
  if (event.heroImage) schema.image = event.heroImage
  if (event.endsAt) schema.endDate = event.endsAt

  if (event.location?.name) {
    schema.location = {
      '@type': 'Place',
      name: event.location.name,
      ...(event.location.city
        ? {
            address: {
              '@type': 'PostalAddress',
              addressLocality: event.location.city,
              ...(event.location.country ? { addressCountry: event.location.country } : {}),
            },
          }
        : {}),
    }
  }

  if (event.organizer?.name) {
    schema.organizer = {
      '@type': 'Organization',
      name: event.organizer.name,
      ...(event.organizer.url ? { url: event.organizer.url } : {}),
    }
  }

  return schema
}

/**
 * Book → Book structured data.
 */
interface BookForJsonLd {
  slug: string
  title: string
  description?: string
  coverImage?: string
  author?: { name: string }
  isbn?: string
  pages?: number
  publishedAt?: string
  publisher?: { name: string }
  language?: string
}

export function buildBook(book: BookForJsonLd): BookSchema | null {
  if (!book.title || !book.slug) return null

  const url = `${SITE_URL}/books/${book.slug}`
  const schema: BookSchema = {
    '@context': 'https://schema.org',
    '@type': 'Book',
    '@id': url,
    name: book.title,
    url,
  }

  if (book.description) schema.description = book.description
  if (book.coverImage) schema.image = book.coverImage
  if (book.author?.name) schema.author = { '@type': 'Person', name: book.author.name }
  if (book.isbn) schema.isbn = book.isbn
  if (book.pages) schema.numberOfPages = book.pages
  if (book.publishedAt) schema.datePublished = book.publishedAt
  if (book.publisher?.name) {
    schema.publisher = { '@type': 'Organization', name: book.publisher.name }
  }
  if (book.language) schema.inLanguage = book.language

  return schema
}

/**
 * BreadcrumbList — uit een array van breadcrumb-items.
 *
 * Google toont breadcrumbs in search-resultaten boven de pagina-titel,
 * wat de CTR significant verhoogt op detail-pagina's.
 */
interface BreadcrumbInput {
  label: string
  url?: string
}

export function buildBreadcrumbList(items: BreadcrumbInput[]): BreadcrumbListSchema | null {
  if (items.length < 2) return null // minder dan 2 = geen pad

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, idx) => ({
      '@type': 'ListItem' as const,
      position: idx + 1,
      name: item.label,
      ...(item.url ? { item: item.url.startsWith('http') ? item.url : `${SITE_URL}${item.url}` } : {}),
    })),
  }
}
