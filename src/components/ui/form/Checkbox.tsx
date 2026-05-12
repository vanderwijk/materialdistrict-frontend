/**
 * Checkbox — single checkbox met label en optionele description.
 *
 * Voor required-checkboxes (typisch: "I accept the terms") werkt validation
 * net iets anders dan bij Input:
 *   - "Leeg" = unchecked. Bij `required && !checked` na interactie/submit:
 *     state="invalid".
 *   - "Gevuld" = checked. Geen automatische valid-cirkel — dat zou
 *     overlappen met de visuele checkbox-tick zelf.
 *
 * Daarom rendert Checkbox standaard ALLEEN de invalid-state-cirkel.
 * Custom `validate` blijft mogelijk voor exotische gevallen.
 *
 * Layout: indicator zit rechts-boven .field-group-wrapper. Wanneer de
 * checkbox kort is en niet veel omringende ruimte heeft, kun je
 * `showValidWhenChecked` zetten om alsnog de groene tick-cirkel te tonen.
 */

'use client'

import {
  forwardRef,
  useEffect,
  useId,
  useState,
  type InputHTMLAttributes,
  type ReactNode,
} from 'react'
import { FieldStatus } from './FieldStatus'
import { useFieldValidation } from './useFieldValidation'
import { useFormState } from './FormStateContext'

export interface CheckboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: ReactNode
  description?: ReactNode
  /** Sr-only error message + invalid state (geen visuele tekst). */
  error?: string
  /**
   * Optionele custom validator. Krijgt de checked-state als "true"/"false"
   * string voor consistentie met andere velden.
   */
  validate?: (value: string) => boolean | string | undefined
  valid?: boolean
  /** Toon óók de groene valid-cirkel als checkbox is aangevinkt. Default: false. */
  showValidWhenChecked?: boolean
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  function Checkbox(
    {
      label,
      description,
      error,
      required,
      validate,
      valid,
      showValidWhenChecked,
      defaultChecked,
      checked: controlledChecked,
      onChange,
      disabled,
      className,
      id: providedId,
      ...rest
    },
    ref,
  ) {
    const reactId = useId()
    const fieldId = providedId || `${reactId}-checkbox`
    const isControlled = controlledChecked !== undefined
    const [internalChecked, setInternalChecked] = useState<boolean>(
      defaultChecked ?? false,
    )
    const checked = isControlled
      ? Boolean(controlledChecked)
      : internalChecked

    // Voor de hook: value="true" als checked, "" als unchecked.
    // Op die manier triggert required+leeg-logica correct.
    const value = checked ? 'true' : ''

    const validation = useFieldValidation({
      value,
      required,
      validate,
      externalError: error,
      externalValid: valid,
    })

    const formState = useFormState()
    useEffect(() => {
      if (!formState) return
      return formState.registerField(fieldId, {
        forceValidate: validation.forceValidate,
        getState: () => validation.state,
      })
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formState, fieldId])

    useEffect(() => {
      if (!formState) return
      formState.reportFieldState(fieldId, validation.state)
    }, [formState, fieldId, validation.state])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!isControlled) setInternalChecked(e.target.checked)
      onChange?.(e)
    }

    // Verberg de groene cirkel bij valid (dubbele tick-feedback zou overdreven
    // zijn) tenzij showValidWhenChecked expliciet gevraagd is.
    const visibleStatus =
      validation.state === 'valid' && !showValidWhenChecked
        ? 'idle'
        : validation.state

    const wrapClassName = ['field-group', 'is-choice-single', className]
      .filter(Boolean)
      .join(' ')

    const errorMessageId =
      validation.state === 'invalid' && validation.errorMessage
        ? `${reactId}-error`
        : undefined

    return (
      <div className={wrapClassName}>
        <label className="choice" htmlFor={fieldId}>
          <input
            ref={ref}
            id={fieldId}
            type="checkbox"
            className="u-sr-only"
            checked={checked}
            onChange={handleChange}
            required={required}
            disabled={disabled}
            aria-invalid={validation.state === 'invalid' || undefined}
            aria-errormessage={errorMessageId}
            {...rest}
          />
          <span
            className="choice-indicator is-checkbox"
            aria-hidden="true"
          />
          <span>
            <span className="choice-label">{label}</span>
            {description && (
              <span className="choice-description">{description}</span>
            )}
          </span>
        </label>
        <FieldStatus
          state={visibleStatus}
          errorMessage={validation.errorMessage}
          statusId={errorMessageId}
        />
      </div>
    )
  },
)
