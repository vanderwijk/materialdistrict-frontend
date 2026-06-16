export { JsonLd } from './JsonLd'
export { buildPageMetadata } from './page-metadata'
export { canonicalPath, absolutePageUrl, getSiteOrigin } from './urls'
export {
  buildOrganization,
  buildBrandOrganization,
  buildWebSite,
  buildProduct,
  buildArticle,
  buildVideoObject,
  buildEvent,
  buildBook,
  buildBreadcrumbList,
  buildCollectionPage,
} from './structured-data'
export type {
  StructuredData,
  OrganizationSchema,
  WebSiteSchema,
  ProductSchema,
  ArticleSchema,
  VideoObjectSchema,
  EventSchema,
  BookSchema,
  BreadcrumbListSchema,
  CollectionPageSchema,
  PersonSchema,
} from './types'
