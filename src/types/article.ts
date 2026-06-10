/**
 * Article types
 * ----------------------------------------------------------------------
 * Domain-model voor article-CPT (redactionele content / stories).
 *
 * Meta-velden uit developer-handover:
 *   _featured (alleen)
 *
 * Auteurs / categorieën komen via standaard WP `author` en `categories`
 * (taxonomieën), niet via meta.
 *
 * Sessie 6b — drie velden zijn nu LIVE ontsloten door de backend
 * (Johan-antwoord 29-05), niet langer Optie-A-voorbereid:
 *
 *  - `type` (D1): story-segmentatie (news/people/collaborations/projects/
 *    partner). WP-taxonomy `story_type`, geëxposeerd op `meta.story_type`
 *    (`{id,slug,label}[]`) met `meta._story_type` als platte canonieke slug.
 *    De mapper leest `meta._story_type` met fallback op `meta.story_type[0]`.
 *  - `insiderOnly` (D2): Insider-only gating. Meta-veld `meta.insider_only`
 *    (boolean) met alias `meta._insider_only`. Article-default `false`.
 *  - `channels` (D3): channel-tags op de cards (witte pills). Meta-veld
 *    `meta.channels` (`{id,slug,label}[]`), zelfde patroon als `story_type`.
 *
 * Zie `src/lib/config/story-types.ts` voor de StoryType-config.
 */

import type { StoryType } from '@/lib/config/story-types'
import type { Gallery, MediaImage } from './media'

/**
 * Een taxonomy-term zoals WP die exposeert op `meta.<taxonomy>`:
 * `{ id, slug, label }`. Gedeeld door story_type (D1) en channels (D3).
 *
 * NB DRY: als `@/types/shared` later een equivalent term-type blijkt te
 * exposeren, hier re-exporteren i.p.v. dupliceren (te verifiëren bij
 * integratie tegen de echte repo — `shared.ts` zat niet in de 28-05-zip).
 */
export interface TaxonomyTerm {
  id: number
  slug: string
  label: string
}

export interface ArticleMeta {
  _featured?: boolean
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
  /** Story-segmentatie (D1): WP-taxonomy `story_type` via `meta._story_type`. */
  type: StoryType
  /** Insider-only gating (D2): `meta.insider_only` / `meta._insider_only`. */
  insiderOnly: boolean
  /** Channel-tags (D3): `meta.channels`. Voedt de witte pills op de cards. */
  channels: TaxonomyTerm[]
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
  /** §F2.8 punt 4: foto-set uit de aan-de-post-gehangen media (hero + thumbs). */
  gallery: Gallery
  authorId: number
  authorName: string | null
  categoryIds: number[]
  tagIds: number[]
  featured: boolean
  /** Story-segmentatie (D1): WP-taxonomy `story_type` via `meta._story_type`. */
  type: StoryType
  /** Insider-only gating (D2): `meta.insider_only` / `meta._insider_only`. */
  insiderOnly: boolean
  /** Channel-tags (D3): `meta.channels`. Voedt de witte pills op de cards. */
  channels: TaxonomyTerm[]
  date: string
  modified: string
}

/**
 * Related content (D5) — gemixte items uit het SearchWP-Related-endpoint
 * `GET /wp-json/md/v2/articles/{slug}/related`. Eén platte shape voor de
 * drie content-types die het endpoint teruggeeft.
 */
export type RelatedContentType = 'article' | 'material' | 'talk'

export interface RelatedItem {
  type: RelatedContentType
  id: number
  slug: string
  title: string
  /** Thumbnail-URL; `null` als het item er geen heeft. */
  thumbnail: string | null
  /** Door WP geleverde permalink (fallback-href voor types zonder route). */
  link: string
}
