/**
 * Talk types
 * ----------------------------------------------------------------------
 * Domain-model voor talk-CPT (lezingen / video-content).
 *
 * Geen specifieke meta-velden in de developer-handover.
 * Verwachte velden voor de detailpagina (uit mockup):
 *  - speaker(s) — vermoedelijk via auteur of een aparte taxonomie
 *  - video-URL — vermoedelijk in body-HTML als embed
 *
 * BLOCKER (sessie 7): bevestigen welke meta-velden talks WERKELIJK
 * gebruiken. Voor nu: kale CPT-shape met featured_media als hero.
 */

import type { MediaImage } from './media'

export interface TalkMeta {
  /**
   * Geen specifieke meta-velden bekend uit de handover.
   * Wordt aangevuld zodra developer talk-meta ontsluit (sessie 7-blocker).
   */
}

export interface TalkListItem {
  id: number
  slug: string
  link: string
  title: string
  excerptHtml: string
  hero: MediaImage | null
  date: string
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
}
