/**
 * FieldStatus — kleine status-indicator-cirkel voor form-validatie.
 *
 * Rendert een gekleurde cirkel rechts-boven het veld:
 *   - groen + IconCheck als de waarde correct is (state="valid")
 *   - rood + IconErrorMark als de waarde ongeldig is (state="invalid")
 *   - niets zichtbaar als state="idle" (default — lege required, of
 *     niet-geraakt optioneel veld)
 *
 * De positionering wordt gestuurd door de parent .field-group (zie
 * globals.css §41.1). Deze component zet alleen de juiste klassen.
 *
 * `errorMessage` is optioneel — wordt gebruikt voor sr-only accessible
 * messaging via .field-status-message. Zichtbaar voor screen readers,
 * niet visueel. De foutmelding zelf wordt nooit getoond op het scherm
 * (gebruikers-keuze sessie 3A: tekst-feedback komt alleen via de submit-knop).
 */

import { IconCheck, IconErrorMark } from '@/components/ui/icons'

export type FieldStatusState = 'idle' | 'valid' | 'invalid'

interface FieldStatusProps {
  state: FieldStatusState
  /**
   * Optionele foutmelding voor screen readers. Niet visueel zichtbaar.
   * Wordt gerenderd in een sr-only `<span>` met `id={statusId}` zodat
   * een veld het kan koppelen via `aria-errormessage={statusId}`.
   */
  errorMessage?: string
  /** id voor aria-errormessage-koppeling (alleen relevant bij invalid). */
  statusId?: string
}

export function FieldStatus({
  state,
  errorMessage,
  statusId,
}: FieldStatusProps) {
  const visible = state === 'valid' || state === 'invalid'

  // We renderen altijd het span-element zodat de field-group consistent
  // dezelfde DOM heeft. .is-visible zet de fade-in aan.
  const className = [
    'field-status',
    state === 'valid' && 'is-valid',
    state === 'invalid' && 'is-invalid',
    visible && 'is-visible',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <>
      <span className={className} aria-hidden="true">
        {state === 'valid' && <IconCheck />}
        {state === 'invalid' && <IconErrorMark />}
      </span>
      {/* sr-only message voor screen readers — alleen bij invalid en
          alleen als er een errorMessage is. */}
      {state === 'invalid' && errorMessage && statusId && (
        <span id={statusId} className="field-status-message" role="alert">
          {errorMessage}
        </span>
      )}
    </>
  )
}
