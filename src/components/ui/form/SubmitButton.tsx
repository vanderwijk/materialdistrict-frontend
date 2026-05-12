/**
 * SubmitButton — submit-knop die luistert naar FormStateContext.
 *
 * Gedrag:
 *   - Bij klik: roept `triggerSubmit()` aan op de form-context, wat alle
 *     velden dwingt zichzelf te valideren.
 *   - Als er invalid velden zijn na een submit-poging: tekst verandert naar
 *     "Please fill in all required fields", knop kleurt rood (variant
 *     `formError` op de onderliggende Button via .is-form-error klasse).
 *   - Zodra alle velden valid zijn: tekst en kleur keren terug naar normaal.
 *   - Buiten een FormStateProvider werkt deze als een gewone Button met
 *     type="submit".
 *
 * Render-strategie: deze component wrapt geen `<Button>` als afhankelijkheid
 * (die staat in een andere directory en ik wil hier geen circular imports
 * triggeren). In plaats daarvan zetten we de juiste klassen direct op een
 * native button. De Button-component zelf krijgt parallel een `formError`-
 * prop voor cases waar de gebruiker liever Button gebruikt.
 *
 * Belangrijke voetnoot uit sessie 3A:
 *   "Tekst is statisch — altijd 'Please fill in all required fields' (ook
 *    als probleem in optioneel veld zit; gebruiker accepteert deze imperfectie)"
 *   — zie README batch 1. Dat is hier geïmplementeerd.
 */

'use client'

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { useFormState } from './FormStateContext'

export interface SubmitButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type'> {
  /** Normale label van de submit-knop. */
  children: ReactNode
  /**
   * Tekst die getoond wordt wanneer de form ongeldig is bij submit-poging.
   * Default: "Please fill in all required fields".
   */
  errorLabel?: string
  /** Button-variant in normaal-state. Default: primary. */
  variant?: 'primary' | 'green' | 'blue' | 'navy'
  /** Button size. Default: md. */
  size?: 'sm' | 'md' | 'lg'
}

export const SubmitButton = forwardRef<HTMLButtonElement, SubmitButtonProps>(
  function SubmitButton(
    {
      children,
      errorLabel = 'Please fill in all required fields',
      variant = 'primary',
      size = 'md',
      onClick,
      disabled,
      className,
      ...rest
    },
    ref,
  ) {
    const formState = useFormState()
    const inErrorState = formState?.hasFormError ?? false

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      formState?.triggerSubmit()
      onClick?.(e)
    }

    const btnClassName = [
      'btn',
      `btn-${variant}`,
      `btn-${size}`,
      inErrorState && 'is-form-error',
      className,
    ]
      .filter(Boolean)
      .join(' ')

    return (
      <button
        ref={ref}
        type="submit"
        className={btnClassName}
        onClick={handleClick}
        disabled={disabled}
        aria-live="polite"
        {...rest}
      >
        {inErrorState ? errorLabel : children}
      </button>
    )
  },
)
