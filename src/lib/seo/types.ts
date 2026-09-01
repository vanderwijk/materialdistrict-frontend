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
  /** Fallback names Google may use when the preferred `name` is not chosen. */
  alternateName?: string | string[]
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
  sku?: string
  /** Voor materials in MaterialDistrict-context. */
  additionalProperty?: Array<{
    '@type': 'PropertyValue'
    name: string
    value: string | number
  }>
  /**
   * Google Product snippets eisen minstens één van `offers`, `review` of
   * `aggregateRating`. Zonder echte prijs of reviews gebruiken we dit type
   * niet — zie `ItemPageSchema`.
   */
  offers?: {
    '@type': 'Offer'
    url?: string
    price?: number | string
    priceCurrency?: string
    availability?: string
    seller?: { '@type': 'Organization'; name: string }
  }
}

/**
 * Material-detailpagina. `ItemPage` i.p.v. `Product`: Google eist bij
 * Product-snippets `offers`, `review` of `aggregateRating`, en materials
 * hebben geen verkoopprijs of reviews. `mainEntity` blijft een `Thing`
 * (geen Product-subtype) zodat Search Console dit niet als Productfragment
 * valideert.
 */
export interface ItemPageSchema extends BaseThing {
  '@type': 'ItemPage'
  isPartOf?: {
    '@type': 'WebSite'
    '@id'?: string
    name?: string
    url?: string
  }
  mainEntity?: {
    '@type': 'Thing'
    name: string
    url?: string
    image?: string | string[]
    description?: string
    sku?: string
    category?: string
    brand?: { '@type': 'Brand'; name: string; url?: string }
    additionalProperty?: Array<{
      '@type': 'PropertyValue'
      name: string
      value: string | number
    }>
  }
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

export interface VideoObjectSchema extends BaseThing {
  '@type': 'VideoObject'
  name: string
  /** ISO 8601 datum waarop de talk plaatsvond/geüpload werd. */
  uploadDate: string
  thumbnailUrl?: string
  /** Vimeo player-embed-URL, of first-party gated player voor Insider-talks. */
  embedUrl?: string
  contentUrl?: string
  /** ISO 8601 duur, bv. "PT23M55S". */
  duration?: string
  isAccessibleForFree?: boolean
  requiresSubscription?: boolean
  hasPart?: {
    '@type': 'WebPageElement'
    isAccessibleForFree: boolean
    cssSelector: string
  }
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
  /**
   * Alleen `Book` als er geen verkoopprijs is. Met prijs: `Product` + `Book`
   * zodat Google Product-snippets (prijs/voorraad) én boekvelden (ISBN,
   * auteur) kan gebruiken.
   */
  '@type': 'Book' | ['Product', 'Book']
  author?: PersonSchema | { '@type': 'Person'; name: string }
  isbn?: string
  gtin13?: string
  sku?: string
  numberOfPages?: number
  bookFormat?:
    | 'https://schema.org/Hardcover'
    | 'https://schema.org/Paperback'
    | 'https://schema.org/EBook'
  datePublished?: string
  publisher?: OrganizationSchema | { '@type': 'Organization'; name: string }
  inLanguage?: string
  offers?: {
    '@type': 'Offer'
    url?: string
    price: string
    priceCurrency: string
    availability?: string
    itemCondition?: string
    seller?: { '@type': 'Organization'; name: string; url?: string }
  }
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

/**
 * CollectionPage — voor hub/overzichtspagina's die een verzameling items
 * bundelen (stap 12: de channel-hubs). Optioneel een `ItemList` met de
 * getoonde items, zodat Google de pagina als collectie herkent.
 */
export interface CollectionPageSchema extends BaseThing {
  '@type': 'CollectionPage'
  isPartOf?: {
    '@type': 'WebSite'
    '@id'?: string
    name?: string
    url?: string
  }
  mainEntity?: {
    '@type': 'ItemList'
    numberOfItems?: number
    itemListElement: Array<{
      '@type': 'ListItem'
      position: number
      url: string
      name?: string
    }>
  }
}

export interface WebSiteSchema extends BaseThing {
  '@type': 'WebSite'
  potentialAction?: {
    '@type': 'SearchAction'
    target: { '@type': 'EntryPoint'; urlTemplate: string }
    'query-input': string
  }
}

/**
 * FAQPage — vraag/antwoord-paren die Google uitgeklapt in het resultaat
 * kan tonen. Antwoorden zijn platte tekst: Google accepteert beperkte
 * HTML, maar tags in JSON-LD leveren vooral parse-risico op.
 */
export interface FaqPageSchema extends BaseThing {
  '@type': 'FAQPage'
  mainEntity: Array<{
    '@type': 'Question'
    name: string
    acceptedAnswer: {
      '@type': 'Answer'
      text: string
    }
  }>
}

export type StructuredData =
  | OrganizationSchema
  | ProductSchema
  | ItemPageSchema
  | ArticleSchema
  | VideoObjectSchema
  | EventSchema
  | BookSchema
  | BreadcrumbListSchema
  | CollectionPageSchema
  | FaqPageSchema
  | WebSiteSchema
  | PersonSchema
