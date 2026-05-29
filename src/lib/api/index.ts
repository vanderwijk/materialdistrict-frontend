/**
 * API barrel
 * ----------------------------------------------------------------------
 * Pages en components importeren bij voorkeur uit `@/lib/api`:
 *
 *   import { getMaterial, listMaterialsWithFacets } from '@/lib/api'
 *
 * Lagen:
 *  - `content.ts`  — high-level domain (Material, Brand, ...) — meestal gebruik je deze
 *  - `wordpress.ts` — raw fetcher + raw response types — alleen als je low-level toegang nodig hebt
 *  - `facetwp.ts`  — FacetWP-client — voor de overzichtspagina /materials met filtering
 *  - `woocommerce.ts` — WC-client — voor books (Fase 1) + orders (Fase 2)
 *  - `mappers.ts`  — pure raw→domain mappers — meestal indirect via content.ts
 */

// Domain API (gebruikelijk)
export {
  getArticle,
  getArticleStoryTypeOptions,
  getArticleTotalCount,
  getBrand,
  getBrandCountryOptions,
  getEvent,
  getMaterial,
  getMaterialDetail,
  getPage,
  getRelatedContent,
  getTalk,
  listArticles,
  listBrands,
  listEvents,
  listMaterials,
  listMaterialsByBrand,
  listMaterialsWithFacets,
  listTalks,
} from './content'
export type {
  BrandCountryOption,
  ListMaterialsByBrandParams,
  ListMaterialsResult,
  ListMaterialsWithFacetsParams,
  ListMaterialsWithFacetsResult,
  MaterialCategoryTerm,
  MaterialDetailResult,
  MaterialKeyword,
  StoryTypeOption,
} from './content'

// FacetWP — voor het hoofdoverzicht /materials met filtering
export {
  facetwpFetch,
  FacetWPError,
  fetchMaterials,
  fetchMaterialsFiltered,
  fetchMaterialFacetsBaseline,
  parseFacetSelectionFromSearchParams,
  facetSelectionToSearchParams,
} from './facetwp'
export type {
  FetchMaterialsFilteredParams,
  ParsedSearchParams,
} from './facetwp'

// WordPress raw — als je iets specifieks nodig hebt dat niet in content.ts staat
export {
  WP_API_URL,
  WordPressError,
  WordPressNotFoundError,
  getAttachmentsForPost,
  getMedia,
  getMediaBatch,
  getPageBySlug,
  getTerm,
  getTerms,
  wpFetch,
  wpFetchOrNull,
  wpFetchPaginated,
} from './wordpress'

// Mappers — voor wanneer je raw data hebt en domain-shape wilt (zelden direct gebruikt)
export {
  mapArticle,
  mapArticleListItem,
  mapAuthMeResponse,
  mapBrand,
  mapBrandListItem,
  mapBrandMembership,
  mapEvent,
  mapEventListItem,
  mapFacetWPToFilterSections,
  mapMaterial,
  mapMaterialListItem,
  mapMedia,
  mapPage,
  mapTalk,
  mapTalkListItem,
  splitGallery,
} from './mappers'
export type { MaterialFilterSection } from './mappers'

// WooCommerce — voor books
export {
  WC_API_URL,
  WooCommerceError,
  getProductById,
  getProductBySlug,
  listBooks,
  listProducts,
  wcFetch,
} from './woocommerce'
