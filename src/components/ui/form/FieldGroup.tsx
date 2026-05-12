/**
 * FieldGroup — gemeenschappelijke wrapper voor Input/Textarea/Select.
 *
 * Verzorgt:
 *   - <label> met required (*) of optional-marker
 *   - Helper-tekst onder het veld (neutraal)
 *   - Status-indicator rechts-boven via <FieldStatus>
 *   - ARIA-koppeling tussen label/helper/errormessage en het veld
 *
 * Geen `error`-tekst rendering meer (batch 2). De error-message wordt
 * sr-only beschikbaar via FieldStatus + aria-errormessage.
 *
 * `children` is een render-prop die de bouwer van het veld toegang geeft tot
 * de juiste id's en aria-attributen om aan zijn input/textarea/select te
 * binden.
 */

'use client'

import { useId, type ReactNode } from 'react'
import { FieldStatus, type FieldStatusState } from './FieldStatus'

export interface FieldGroupChildArgs {
  /** id voor de native input — moet aan het input-element gebonden worden. */
  inputId: string
  /** Komma-separated lijst voor aria-describedby (helper). */
  describedBy?: string
  /** Voor aria-errormessage; alleen als status="invalid" en errorMessage aanwezig. */
  errorMessageId?: string
  /** Voor aria-invalid op het input-element. */
  invalid: boolean
}

interface FieldGroupProps {
  label?: ReactNode
  required?: boolean
  optional?: boolean
  helper?: ReactNode
  /** Render-prop: krijgt id's en aria-attributen voor het veldelement. */
  children: (args: FieldGroupChildArgs) => ReactNode
  /** Validatie-state; bepaalt FieldStatus-rendering. */
  status?: FieldStatusState
  /** Sr-only error-bericht bij status="invalid". */
  errorMessage?: string
  /** Extra klassen op de wrapper. */
  className?: string
  /**
   * Marker dat de group geen visuele label heeft (alleen aria-label op input).
   * Plaatst de FieldStatus verticaal-gecentreerd op het veld i.p.v. top-right.
   */
  noLabel?: boolean
}

export function FieldGroup({
  label,
  required,
  optional,
  helper,
  children,
  status = 'idle',
  errorMessage,
  className,
  noLabel,
}: FieldGroupProps) {
  const reactId = useId()
  const inputId = `${reactId}-input`
  const helperId = helper ? `${reactId}-helper` : undefined
  const errorMessageId =
    status === 'invalid' && errorMessage ? `${reactId}-error` : undefined

  const describedBy = [helperId, errorMessageId].filter(Boolean).join(' ') || undefined

  const wrapperClassName = [
    'field-group',
    noLabel && 'is-no-label',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={wrapperClassName}>
      {label && !noLabel && (
        <label htmlFor={inputId} className="field-label">
          {label}
          {required && <span className="field-required" aria-hidden="true">*</span>}
          {optional && <span className="field-optional"> (optional)</span>}
        </label>
      )}
      {children({
        inputId,
        describedBy,
        errorMessageId,
        invalid: status === 'invalid',
      })}
      {helper && (
        <p id={helperId} className="field-helper">
          {helper}
        </p>
      )}
      <FieldStatus
        state={status}
        errorMessage={errorMessage}
        statusId={errorMessageId}
      />
    </div>
  )
}
