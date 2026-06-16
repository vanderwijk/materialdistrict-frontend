/**
 * Story types — UI-config voor article-segmentatie
 * ----------------------------------------------------------------------
 * Articles/stories worden gesegmenteerd in subtypen. Op het `/article`
 * overzicht stuurt dit de type-filter-sidebar en de type-pills; op de
 * detailpagina de category-pill in de header.
 *
 * Bron-van-waarheid voor de presentatie (label, kleur, pale, icon, desc):
 * de mockup `MaterialDistrict_MockUp_DEF.html` → `STORY_TYPE_META`. De
 * waarden hieronder zijn 1-op-1 daaruit overgenomen.
 *
 * BACKEND-STATUS (sessie 6b — live): het WP-veld is ontsloten als de
 * taxonomy `story_type`, geëxposeerd op `meta.story_type` (`{id,slug,label}[]`)
 * met `meta._story_type` als platte canonieke slug. De mapper leest die
 * slug, de filter-sidebar/pills renderen en `?story_type=` filtert server-
 * side. `'news'` blijft de mapper-default voor onbekende/ontbrekende slugs.
 *
 * De vijf types matchen Johan's D1-spec exact:
 *   news · people · collaborations · projects · partner
 */

/**
 * De vijf canonieke story-types. Komt overeen met het WP-veld
 * `article.type` (D1). `'news'` is tevens de migratie-/mapper-default.
 */
export type StoryType =
  | 'news'
  | 'people'
  | 'collaborations'
  | 'projects'
  | 'partner'

/** Fallback-default voor articles met een onbekende/ontbrekende type-slug. */
export const DEFAULT_STORY_TYPE: StoryType = 'news'

/**
 * Presentatie-metadata per story-type. Leidend voor de UI; niet uit de
 * API af te leiden. 1-op-1 uit de mockup `STORY_TYPE_META`.
 *
 * Kleuren voor filter/intro in CSS: `globals.css` (`.articles-type-btn` /
 * `.articles-type-intro` + `data-story-type`) — houd die tokens in sync
 * met `color` / `pale` hieronder.
 *
 * - `label`  — presentatie-naam (let op: `partner` → "Partner stories")
 * - `color`  — accentkleur voor pills, sidebar-actief, type-intro
 * - `pale`   — zachte achtergrond voor de type-intro-banner
 * - `icon`   — inline SVG (currentColor), zoals in de mockup
 * - `desc`   — korte omschrijving voor de type-intro op het overzicht
 */
export interface StoryTypeMeta {
  label: string
  color: string
  pale: string
  /** Inline SVG-markup met `currentColor`. Render via dangerouslySetInnerHTML. */
  icon: string
  desc: string
}

export const STORY_TYPE_META: Record<StoryType, StoryTypeMeta> = {
  news: {
    label: 'News',
    color: '#185FA5',
    pale: '#e6f1fb',
    icon: `<svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/><path d="M18 14h-8M15 18h-5M10 6h8v4h-8z"/></svg>`,
    desc: 'Editorial reporting, analysis and opinion on materials and the built environment.',
  },
  people: {
    label: 'People',
    color: '#183E90',
    pale: '#e8f0fb',
    icon: `<svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
    desc: 'Portraits of the people driving the transition to a more sustainable built environment.',
  },
  collaborations: {
    label: 'Collaborations',
    color: '#006878',
    pale: '#e0f3f6',
    icon: `<svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
    desc: 'Stories of manufacturers and designers who worked together — and what they made possible.',
  },
  projects: {
    label: 'Projects',
    color: '#3A6B10',
    pale: '#eaf3de',
    icon: `<svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
    desc: 'Built projects that showcase what is possible when sustainable materials are specified with intent.',
  },
  partner: {
    label: 'Partner stories',
    color: '#7A3800',
    pale: '#fff3e0',
    icon: `<svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
    desc: 'Brand stories from Partner members — their materials, their process, their point of view.',
  },
}

/** De vijf types in UI-volgorde (zoals de mockup ze in de sidebar toont). */
export const STORY_TYPES: readonly StoryType[] = [
  'news',
  'people',
  'collaborations',
  'projects',
  'partner',
]

/** Type-guard: is een willekeurige string een geldige StoryType? */
export function isStoryType(value: unknown): value is StoryType {
  return (
    typeof value === 'string' &&
    (STORY_TYPES as readonly string[]).includes(value)
  )
}

/**
 * Normaliseer een ruwe waarde naar een StoryType. Onbekende of lege
 * waarden vallen terug op de default (`'news'`). Gebruikt door de mapper
 * zodra Johan het veld koppelt — tot dan levert de mapper sowieso de
 * default.
 */
export function toStoryType(value: unknown): StoryType {
  return isStoryType(value) ? value : DEFAULT_STORY_TYPE
}

/** Veilige meta-lookup met fallback op de news-meta. */
export function storyTypeMeta(type: StoryType): StoryTypeMeta {
  return STORY_TYPE_META[type] ?? STORY_TYPE_META.news
}

/** Het label voor een story-type (bv. `'partner'` → `'Partner stories'`). */
export function storyTypeLabel(type: StoryType): string {
  return storyTypeMeta(type).label
}
