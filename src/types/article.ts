/**
 * Article types
 * ----------------------------------------------------------------------
 * Domain-model voor article-CPT (redactionele content / blog).
 *
 * Meta-velden uit developer-handover:
 *   _featured (alleen)
 *
 * Insider-gating voor "Insider articles" gebeurt waarschijnlijk via een
 * extra meta-veld (bv. `_insider_only`) dat NOG NIET in de handover zit.
 * BLOCKER voor sessie 6 — niet voor sessie 2.
 *
 * Auteurs / categorieën komen via standaard WP `author` en `categories`
 * (taxonomieën), niet via meta.
 */

import type { MediaImage } from './media'

export interface ArticleMeta {
  _featured?: boolean
  /**
   * BLOCKER sessie 6: Insider-only gating.
   * Verwacht een veld zoals `_insider_only?: boolean` of een aparte
   * Insider-categorie. Bevestigen met opdrachtgever / developer.
   */
}

export interface ArticleListItem {
  id: number
  slug: string
  link: string
  title: string
  excerptHtml: string
  hero: MediaImage | null
  /** WP-author-ID. Voor naam-resolve: separate fetch via `/wp/v2/users/<id>`. */
  authorId: number
  /** Standaard WP-categorieën. */
  categoryIds: number[]
  /** Tags. */
  tagIds: number[]
  featured: boolean
  /** Voor Insider-only weergave (zodra gating-meta ontsloten is). */
  insiderOnly: boolean
  date: string
}

export interface Article {
  id: number
  slug: string
  link: string
  title: string
  contentHtml: string
  excerptHtml: string
  hero: MediaImage | null
  authorId: number
  authorName: string | null
  categoryIds: number[]
  tagIds: number[]
  featured: boolean
  insiderOnly: boolean
  date: string
  modified: string
}
