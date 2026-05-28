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
 * Twee velden zijn VOORBEREID maar nog niet door de backend ontsloten
 * (Optie A, analoog aan het Country-filter in sessie 5):
 *
 *  - `insiderOnly` (D2): Insider-only gating. Verwacht een meta-veld zoals
 *    `_insider_only?: boolean`. De mapper vult voorlopig `false` in; één
 *    regel zodra Johan het veld bevestigt.
 *  - `type` (D1): story-segmentatie (news/people/collaborations/projects/
 *    partner). Verwacht het WP-veld `article.type` / taxonomy `story_type`.
 *    De mapper vult voorlopig de default `'news'` in.
 *
 * Zie `src/lib/config/story-types.ts` voor de StoryType-config en
 * `open-issues` (D1/D2) voor de openstaande backend-vraag.
 */

import type { StoryType } from '@/lib/config/story-types'
import type { MediaImage } from './media'

export interface ArticleMeta {
  _featured?: boolean
  /**
   * VOORBEREID (D2): Insider-only gating. Verwacht een veld zoals
   * `_insider_only?: boolean` of een aparte Insider-categorie. Tot dan
   * mapt de mapper `insiderOnly` als `false`.
   */
  /**
   * VOORBEREID (D1): story-type. Verwacht `article.type` of taxonomy
   * `story_type`. Tot dan mapt de mapper `type` als `'news'`.
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
  /** Story-segmentatie (D1, voorbereid — default 'news' tot Johan koppelt). */
  type: StoryType
  /** Voor Insider-only weergave (D2, voorbereid — default false tot Johan koppelt). */
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
  /** Story-segmentatie (D1, voorbereid — default 'news' tot Johan koppelt). */
  type: StoryType
  /** Insider-only gating (D2, voorbereid — default false tot Johan koppelt). */
  insiderOnly: boolean
  date: string
  modified: string
}
