/**
 * API barrel
 * ----------------------------------------------------------------------
 * Pages en components importeren bij voorkeur uit `@/lib/api`:
 *
 *   import { getMaterial, listMaterials, fetchMaterials } from '@/lib/api'
 *
 * Lagen:
 *  - `content.ts`  — high-level domain (Material, Brand, ...) — meestal gebruik je deze
 *  - `wordpress.ts` — raw fetcher + raw response types — alleen als je low-level toegang nodig hebt
 *  - `facetwp.ts`  — FacetWP-client — voor de overzichtspagina /material met filtering
 *  - `woocommerce.ts` — WC-client — voor books (Fase 1) + orders (Fase 2)
 *  - `mappers.ts`  — pure raw→domain mappers — meestal indirect via content.ts
 */

// Domain API (gebruikelijk)
export {
  getArticle,
  getBrand,
  getEvent,
  getMaterial,
  getTalk,
  listArticles,
  listBrands,
  listEvents,
  listMaterials,
  listTalks,
} from './content'

// FacetWP — voor het hoofdoverzicht /material met filtering
export { fetchMaterials, facetwpFetch, FacetWPError } from './facetwp'

// WordPress raw — als je iets specifieks nodig hebt dat niet in content.ts staat
export {
  WP_API_URL,
  WordPressError,
  WordPressNotFoundError,
  getAttachmentsForPost,
  getMedia,
  getMediaBatch,
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
  mapBrand,
  mapBrandListItem,
  mapEvent,
  mapEventListItem,
  mapMaterial,
  mapMaterialListItem,
  mapMedia,
  mapTalk,
  mapTalkListItem,
  splitGallery,
} from './mappers'

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
