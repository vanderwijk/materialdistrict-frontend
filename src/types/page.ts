/**
 * Page types
 * ----------------------------------------------------------------------
 * Domain-model voor het WP-core `page`-posttype — de statische,
 * redactionele site-pagina's (About, FAQ, Jobs, Become a partner,
 * Privacy Statement). Eén generiek template voedt zich hiermee.
 *
 * Sessie 11 (29-05-2026): toegevoegd voor de standaard-pagina-template.
 * WordPress vereist geen wijziging — core `/wp/v2/pages` is REST-enabled
 * inclusief Yoast (`yoast_head_json`). Zie
 * `instructie-andere-agent-standaard-paginas.md`.
 */

/**
 * Genormaliseerde SEO-velden, afgeleid uit Yoast `yoast_head_json`.
 * Alles nullable: ontbrekende velden vallen in `buildPageMetadata` terug
 * op de paginatitel / geen waarde.
 */
export interface PageSeo {
  title: string | null
  description: string | null
  ogTitle: string | null
  ogDescription: string | null
  ogImage: string | null
  /**
   * De Yoast-canonical (wijst naar het oude WP-domein). NIET als canonical
   * gebruiken — de frontend-route is de echte canonical. Bewaard voor
   * debugging / referentie.
   */
  yoastCanonical: string | null
  /** Indexeerbaarheid uit Yoast-robots; default true als niet gezet. */
  index: boolean
  follow: boolean
}

export interface Page {
  id: number
  slug: string
  title: string
  contentHtml: string
  modified: string
  seo: PageSeo
}
