"use client";
/**
 * useFieldValidation — hook voor live form-validatie.
 *
 * Werking:
 *   1. Component roept hem op met `{ value, required, validate }`
 *   2. Hook geeft terug: `{ state: 'idle' | 'valid' | 'invalid', errorMessage? }`
 *   3. State update bij elke `value`-verandering (live tijdens typen)
 *
 * State-bepaling:
 *   - `idle`: required-veld dat nog niet gewijzigd is + leeg (geen indicator)
 *     OF: optioneel-veld dat leeg is (geen indicator)
 *   - `valid`: waarde voldoet aan validate() en is niet-leeg
 *   - `invalid`: required + leeg na interactie, OF validate() return false/string
 *
 * Touch-tracking:
 *   - We tracken of de user iets heeft gewijzigd via `hasInteracted`. Een leeg
 *     required-veld is `idle` totdat de user heeft getypt en weer leeg gemaakt.
 *   - Reset via `markUntouched()` (handig na succesvolle submit).
 *
 * Forceren:
 *   - `forceValidate()` schakelt direct naar invalid bij submit-poging zonder
 *     dat user heeft getypt — wordt aangeroepen door de form-context bij submit.
 *
 * Geen async-validatie in deze versie. Validate moet sync zijn. Async kan
 * later bovenop deze hook gestapeld worden.
 */

import { useEffect, useRef, useState, useCallback } from 'react'

export interface UseFieldValidationOptions {
  /** Huidige waarde van het veld. */
  value: string
  /** Of het veld required is. */
  required?: boolean
  /**
   * Optionele custom validator. Return:
   *   - `true` of `undefined` → geldig
   *   - `false` → ongeldig zonder boodschap
   *   - `string` → ongeldig met deze (sr-only) boodschap
   * Wordt alleen aangeroepen voor non-empty values (lege required
   * wordt al door `required` zelf afgehandeld).
   */
  validate?: (value: string) => boolean | string | undefined
  /**
   * Externe error-string. Forceert state="invalid" met deze boodschap.
   * Override't alle interne logica — handig voor server-side validation
   * of cross-field rules van een hoger niveau.
   */
  externalError?: string
  /**
   * Externe valid-flag. Forceert state="valid" wanneer true.
   * Als zowel externalError als externalValid gezet zijn, wint externalError.
   */
  externalValid?: boolean
}

export interface UseFieldValidationResult {
  state: 'idle' | 'valid' | 'invalid'
  /** sr-only foutmelding bij invalid. Undefined bij idle/valid. */
  errorMessage?: string
  /** Forceer state="invalid" als veld leeg+required is, ongeacht touch-status. */
  forceValidate: () => void
  /** Reset touch-tracking (gebruik na succesvolle submit). */
  markUntouched: () => void
  /** Helper om in onChange/onBlur aan te roepen. */
  markInteracted: () => void
}

export function useFieldValidation(
  options: UseFieldValidationOptions,
): UseFieldValidationResult {
  const { value, required, validate, externalError, externalValid } = options

  const [hasInteracted, setHasInteracted] = useState(false)
  const [forceShow, setForceShow] = useState(false)
  const previousValueRef = useRef(value)

  // Wanneer value verandert, mark als interacted (live validatie)
  useEffect(() => {
    if (value !== previousValueRef.current) {
      setHasInteracted(true)
      previousValueRef.current = value
    }
  }, [value])

  const markInteracted = useCallback(() => setHasInteracted(true), [])
  const markUntouched = useCallback(() => {
    setHasInteracted(false)
    setForceShow(false)
  }, [])
  const forceValidate = useCallback(() => setForceShow(true), [])

  // Externe override
  if (externalError) {
    return {
      state: 'invalid',
      errorMessage: externalError,
      forceValidate,
      markUntouched,
      markInteracted,
    }
  }
  if (externalValid) {
    return {
      state: 'valid',
      forceValidate,
      markUntouched,
      markInteracted,
    }
  }

  const isEmpty = value.trim() === ''
  const showState = hasInteracted || forceShow

  // Lege optionele velden: idle, geen indicator
  if (isEmpty && !required) {
    return { state: 'idle', forceValidate, markUntouched, markInteracted }
  }

  // Lege required velden: invalid pas na interactie of forceValidate
  if (isEmpty && required) {
    if (showState) {
      return {
        state: 'invalid',
        errorMessage: 'This field is required.',
        forceValidate,
        markUntouched,
        markInteracted,
      }
    }
    return { state: 'idle', forceValidate, markUntouched, markInteracted }
  }

  // Niet-lege waarde: validate() bepaalt
  if (validate) {
    const result = validate(value)
    if (result === false) {
      return {
        state: 'invalid',
        errorMessage: 'Invalid value.',
        forceValidate,
        markUntouched,
        markInteracted,
      }
    }
    if (typeof result === 'string') {
      return {
        state: 'invalid',
        errorMessage: result,
        forceValidate,
        markUntouched,
        markInteracted,
      }
    }
  }

  // Geen validate() of validate gaf true/undefined: valid
  return { state: 'valid', forceValidate, markUntouched, markInteracted }
}
