/**
 * Schema.org JSON-LD types — voor structured data.
 *
 * Generieke ophouwers; per content-type zijn er builder-functies in
 * `structured-data.ts` die deze types invullen op basis van onze
 * domain-types (Material, Article, etc.).
 *
 * Refererence: https://schema.org/docs/full.html
 */

interface BaseThing {
  '@context': 'https://schema.org'
  '@type': string
  '@id'?: string
  name?: string
  url?: string
  image?: string | string[]
  description?: string
}

export interface OrganizationSchema extends BaseThing {
  '@type': 'Organization'
  logo?: string
  sameAs?: string[]
}

export interface PersonSchema extends BaseThing {
  '@type': 'Person'
  jobTitle?: string
  worksFor?: OrganizationSchema | { '@type': 'Organization'; name: string }
}

export interface ProductSchema extends BaseThing {
  '@type': 'Product'
  brand?: { '@type': 'Brand'; name: string; url?: string }
  manufacturer?: OrganizationSchema | { '@type': 'Organization'; name: string }
  category?: string
  material?: string
  /** Voor materials in MaterialDistrict-context. */
  additionalProperty?: Array<{
    '@type': 'PropertyValue'
    name: string
    value: string | number
  }>
}

export interface ArticleSchema extends BaseThing {
  '@type': 'Article' | 'BlogPosting' | 'NewsArticle'
  headline: string
  datePublished: string
  dateModified?: string
  author?: PersonSchema | { '@type': 'Person'; name: string }
  publisher?: OrganizationSchema | { '@type': 'Organization'; name: string; logo?: { '@type': 'ImageObject'; url: string } }
  mainEntityOfPage?: { '@type': 'WebPage'; '@id': string }
  articleSection?: string
}

export interface EventSchema extends BaseThing {
  '@type': 'Event'
  startDate: string
  endDate?: string
  eventStatus?:
    | 'https://schema.org/EventScheduled'
    | 'https://schema.org/EventCancelled'
    | 'https://schema.org/EventPostponed'
    | 'https://schema.org/EventRescheduled'
    | 'https://schema.org/EventMovedOnline'
  eventAttendanceMode?:
    | 'https://schema.org/OfflineEventAttendanceMode'
    | 'https://schema.org/OnlineEventAttendanceMode'
    | 'https://schema.org/MixedEventAttendanceMode'
  location?: {
    '@type': 'Place' | 'VirtualLocation'
    name: string
    address?: string | {
      '@type': 'PostalAddress'
      streetAddress?: string
      addressLocality?: string
      postalCode?: string
      addressCountry?: string
    }
    url?: string
  }
  organizer?: OrganizationSchema | { '@type': 'Organization'; name: string; url?: string }
  offers?: {
    '@type': 'Offer'
    url?: string
    price?: string
    priceCurrency?: string
    availability?: string
  }
}

export interface BookSchema extends BaseThing {
  '@type': 'Book'
  author?: PersonSchema | { '@type': 'Person'; name: string }
  isbn?: string
  numberOfPages?: number
  bookFormat?:
    | 'https://schema.org/Hardcover'
    | 'https://schema.org/Paperback'
    | 'https://schema.org/EBook'
  datePublished?: string
  publisher?: OrganizationSchema | { '@type': 'Organization'; name: string }
  inLanguage?: string
}

export interface BreadcrumbListSchema {
  '@context': 'https://schema.org'
  '@type': 'BreadcrumbList'
  itemListElement: Array<{
    '@type': 'ListItem'
    position: number
    name: string
    item?: string
  }>
}

export interface WebSiteSchema extends BaseThing {
  '@type': 'WebSite'
  potentialAction?: {
    '@type': 'SearchAction'
    target: { '@type': 'EntryPoint'; urlTemplate: string }
    'query-input': string
  }
}

export type StructuredData =
  | OrganizationSchema
  | ProductSchema
  | ArticleSchema
  | EventSchema
  | BookSchema
  | BreadcrumbListSchema
  | WebSiteSchema
  | PersonSchema
