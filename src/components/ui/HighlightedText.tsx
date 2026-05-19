/**
 * HighlightedText utility
 * ----------------------------------------------------------------------
 * Render een string met `<mark>`-tags rond matches van een zoek-term.
 * Case-insensitive, multi-word.
 *
 * Werkt op string-input only — voor HTML-content op de detail-page is
 * een aparte client-side DOM-walker nodig (zie body-highlighter elders).
 */

import type { ReactNode } from 'react'

export interface HighlightedTextProps {
  /** De string om te renderen. */
  text: string
  /** De zoek-term (multi-word toegestaan). Lege string = geen highlight. */
  term: string
  /** className op het `<mark>`-element (default: `search-mark`). */
  markClassName?: string
}

/**
 * Escape regex-special-characters zodat de term veilig in een RegExp kan.
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Split de term op whitespace en bouw één regex die alle woorden matcht.
 * Lege query = null → geen split nodig.
 */
function buildPattern(term: string): RegExp | null {
  const words = term
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map(escapeRegex)
  if (words.length === 0) return null
  return new RegExp(`(${words.join('|')})`, 'gi')
}

export function HighlightedText({
  text,
  term,
  markClassName = 'search-mark',
}: HighlightedTextProps): ReactNode {
  const pattern = buildPattern(term)
  if (!pattern) return text

  // `String.split(regex with capturing group)` retourneert
  // [non-match, match, non-match, match, ...]. Match-delen staan op
  // odd indices. Geen state-side-effects van `.test()`.
  const parts = text.split(pattern)
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <mark key={i} className={markClassName}>
        {part}
      </mark>
    ) : (
      part
    ),
  )
}
