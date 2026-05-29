/**
 * Formatteer een duur in seconden naar klok-notatie voor de UI.
 *  - < 1 uur → "M:SS"     (bv. 1435 → "23:55")
 *  - ≥ 1 uur → "H:MM:SS"  (bv. 4320 → "1:12:00")
 *
 * Null/undefined/0/negatief → null, zodat de aanroeper de duur kan weglaten
 * (geen "0:00" in de UI). Sessie 7 (C10).
 */
export function formatDuration(
  seconds: number | null | undefined,
): string | null {
  if (seconds == null || !Number.isFinite(seconds) || seconds <= 0) return null
  const total = Math.round(seconds)
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  const ss = String(s).padStart(2, '0')
  if (h > 0) {
    const mm = String(m).padStart(2, '0')
    return `${h}:${mm}:${ss}`
  }
  return `${m}:${ss}`
}
