import fs from 'node:fs'

const phpPath =
  '/Users/johanvanderwijk/Local Sites/materialdistrict/app/public/wp-content/themes/materialdistrict-theme/inc/countries.php'
const outPath = new URL('../src/lib/config/countries.ts', import.meta.url)

const php = fs.readFileSync(phpPath, 'utf8')
const entries = [...php.matchAll(/"([^"]+)"\s*=>\s*"([^"]+)"/g)].filter((m) => m[1] !== '')
const lines = entries
  .map(([, code, label]) => `  ${code}: ${JSON.stringify(label)},`)
  .join('\n')

const out = `/**
 * Country list mirrored from materialdistrict-theme/inc/countries.php.
 * Stored WP user meta uses the code (e.g. NL); dashboard GET may return the label.
 */

export const COUNTRY_BY_CODE: Record<string, string> = {
${lines}
}

/** Select options: ISO-ish code as value, human label for display. */
export const COUNTRY_OPTIONS = Object.entries(COUNTRY_BY_CODE).map(([value, label]) => ({
  value,
  label,
}))

/** Map a stored code or label back to the select value (code). */
export function resolveCountryCode(stored: string): string {
  if (!stored) return ''
  if (COUNTRY_BY_CODE[stored]) return stored
  const match = COUNTRY_OPTIONS.find((o) => o.label === stored)
  return match?.value ?? stored
}

/** Human-readable label for a code or legacy stored value. */
export function countryLabel(stored: string): string {
  if (!stored) return ''
  if (COUNTRY_BY_CODE[stored]) return COUNTRY_BY_CODE[stored]
  const match = COUNTRY_OPTIONS.find((o) => o.label === stored)
  return match?.label ?? stored
}
`

fs.writeFileSync(outPath, out)
console.log(`wrote ${entries.length} countries`)
