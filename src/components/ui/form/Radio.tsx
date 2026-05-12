/**
 * Radio — single radio-button binnen een RadioGroup.
 *
 * Geen eigen validatie of FormState-koppeling — alle validatie loopt op
 * group-niveau via RadioGroup. Radio zelf zet alleen de juiste DOM neer.
 *
 * RadioGroup injecteert de gedeelde `name` via React.Children.map +
 * cloneElement (zie RadioGroup.tsx).
 */

'use client'

import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react'

export interface RadioProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: ReactNode
  description?: ReactNode
  /** Wordt automatisch geïnjecteerd door RadioGroup; alleen overschrijven als je dat met opzet wilt. */
  name?: string
}

export const Radio = forwardRef<HTMLInputElement, RadioProps>(function Radio(
  { label, description, disabled, className, ...rest },
  ref,
) {
  return (
    <label
      className={['choice', className].filter(Boolean).join(' ')}
    >
      <input
        ref={ref}
        type="radio"
        className="u-sr-only"
        disabled={disabled}
        {...rest}
      />
      <span className="choice-indicator is-radio" aria-hidden="true" />
      <span>
        <span className="choice-label">{label}</span>
        {description && (
          <span className="choice-description">{description}</span>
        )}
      </span>
    </label>
  )
})
