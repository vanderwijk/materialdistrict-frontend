/**
 * HTML entity decoder
 * ----------------------------------------------------------------------
 * WP REST API levert titels en andere text-velden als HTML-encoded
 * strings (bv. `&amp;`, `&#8216;`, `&#8217;`, `&#8211;`). Wanneer we die
 * waarden plain-text renderen (zonder dangerouslySetInnerHTML) blijven
 * de entities zichtbaar. Deze helper decodeert ze.
 *
 * Idempotent: kan veilig op al-gedecodeerde strings draaien. Behandelt
 * tot 3 lagen van dubbele encoding (bv. `&amp;amp;` → `&amp;` → `&`)
 * zoals soms voorkomt wanneer WP zelf al een keer geëncodeerd heeft
 * voordat REST doet hetzelfde.
 *
 * NIET gebruiken op velden die als HTML gerendered worden via
 * `dangerouslySetInnerHTML` — de browser decodeert die dan zelf.
 */

const NAMED_ENTITIES: Record<string, string> = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&apos;': "'",
  '&nbsp;': ' ',
  '&hellip;': '…',
  '&ndash;': '–',
  '&mdash;': '—',
  '&laquo;': '«',
  '&raquo;': '»',
  '&copy;': '©',
  '&reg;': '®',
  '&trade;': '™',
  '&deg;': '°',
  '&middot;': '·',
  '&bull;': '•',
  '&eacute;': 'é',
  '&egrave;': 'è',
  '&aacute;': 'á',
  '&agrave;': 'à',
  '&iacute;': 'í',
  '&oacute;': 'ó',
  '&uacute;': 'ú',
  '&ntilde;': 'ñ',
  '&uuml;': 'ü',
  '&ouml;': 'ö',
  '&auml;': 'ä',
}

/**
 * Eén pass decode. Idempotent als input al gedecodeerd is.
 */
function decodeOnce(input: string): string {
  let out = input

  // Numerieke entities — decimal (&#NNNN;)
  out = out.replace(/&#(\d+);/g, (_match, code: string) => {
    const num = parseInt(code, 10)
    if (Number.isFinite(num) && num >= 0 && num <= 0x10ffff) {
      try {
        return String.fromCodePoint(num)
      } catch {
        return _match
      }
    }
    return _match
  })

  // Numerieke entities — hex (&#xHHHH;)
  out = out.replace(/&#x([0-9a-fA-F]+);/g, (_match, hex: string) => {
    const num = parseInt(hex, 16)
    if (Number.isFinite(num) && num >= 0 && num <= 0x10ffff) {
      try {
        return String.fromCodePoint(num)
      } catch {
        return _match
      }
    }
    return _match
  })

  // Named entities
  for (const [entity, char] of Object.entries(NAMED_ENTITIES)) {
    if (out.includes(entity)) {
      out = out.split(entity).join(char)
    }
  }

  return out
}

/**
 * Decode HTML entities in a string. Handles double-encoding (e.g.
 * `&amp;amp;` → `&amp;` → `&`) by repeating up to 3 times.
 *
 * Returns the input unchanged if no entities are present.
 */
export function decodeHtmlEntities(input: string): string {
  if (!input || (typeof input !== 'string') || !input.includes('&')) {
    return input
  }

  let current = input
  // Max 3 passes for nested encoding. Bail early when nothing changes.
  for (let i = 0; i < 3; i++) {
    const next = decodeOnce(current)
    if (next === current) break
    current = next
  }
  return current
}
