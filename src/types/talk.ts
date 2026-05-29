/**
 * Talk types
 * ----------------------------------------------------------------------
 * Domain-model voor talk-CPT (lezingen / video-content).
 *
 * Sessie 7 (29-05-2026): talk-meta uitgebouwd volgens Batch C-TALK
 * (database-uitbreidingen-instructie-johan.md §C-TALK), op basis van
 * Johan's WP-handoff 29-05:
 *  - insider_only  (C14) — meta.insider_only / _insider_only, talk-default true
 *  - vimeo_id      (C10) — meta.vimeo_id, embed-bron
 *  - talk_duration (C10) — meta.talk_duration ("mm:ss" / "h:mm:ss")
 *  - company_name  (C12) — meta.company_name, platte tekst (geen brand-link)
 *  - speakers      (C11) — top-level `speakers` (persons-taxonomy, {id,name,slug})
 *  - channels      (C13) — meta.channels; gemapt, zichtbare UI volgt in de
 *                          aparte channel-sessie
 * date (C9) komt uit WP-core (raw.date).
 */

import type { TaxonomyTerm } from './article'
import type { MediaImage } from './media'

/** Spreker op een talk (WP-taxonomy `persons`). Naam-only — role/photo vervallen (C11). */
export interface TalkSpeaker {
  id: number
  name: string
  slug: string
}

export interface TalkListItem {
  id: number
  slug: string
  link: string
  title: string
  excerptHtml: string
  hero: MediaImage | null
  date: string
  /** C14 — Insider-only gating (talk-default true). */
  insiderOnly: boolean
  /** C10 — Vimeo-id voor de video-embed; null als niet gezet. */
  vimeoId: string | null
  /** C10 — duur in seconden, geparset uit `talk_duration`; null bij leeg/ongeldig. */
  durationSeconds: number | null
  /** C12 — bedrijfsnaam, platte tekst; null als niet gezet. */
  companyName: string | null
  /** C11 — sprekers (persons-taxonomy). Lege array als geen. */
  speakers: TalkSpeaker[]
  /** C13 — channel-tags; gemapt maar zichtbare UI volgt later. */
  channels: TaxonomyTerm[]
}

export interface Talk {
  id: number
  slug: string
  link: string
  title: string
  contentHtml: string
  excerptHtml: string
  hero: MediaImage | null
  date: string
  modified: string
  /** C14 — Insider-only gating (talk-default true). */
  insiderOnly: boolean
  /** C10 — Vimeo-id voor de video-embed; null als niet gezet. */
  vimeoId: string | null
  /** C10 — duur in seconden, geparset uit `talk_duration`; null bij leeg/ongeldig. */
  durationSeconds: number | null
  /** C12 — bedrijfsnaam, platte tekst; null als niet gezet. */
  companyName: string | null
  /** C11 — sprekers (persons-taxonomy). Lege array als geen. */
  speakers: TalkSpeaker[]
  /** C13 — channel-tags; gemapt maar zichtbare UI volgt later. */
  channels: TaxonomyTerm[]
}
