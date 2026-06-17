/**
 * Input — single-line tekstveld met live validatie-indicator.
 *
 * API-veranderingen vs sessie 3 batch I-v3:
 *   - `error?: string` blijft bestaan maar rendert geen tekst meer onder het
 *     veld; wordt nu de externalError voor de validation-hook (sr-only +
 *     visuele cirkel rechts-boven).
 *   - Nieuwe `validate?: (value: string) => boolean | string | undefined` prop
 *     voor live custom validatie tijdens typen.
 *   - `showFilledState` blijft — toont groene border bij niet-lege waarde
 *     (combineert mooi met groene status-cirkel; gebruiker-keuze sessie 3A).
 *
 * Werkt in 2 modes:
 *   - Uncontrolled (defaultValue): live tracking via interne state.
 *   - Controlled (value + onChange): parent bepaalt waarde.
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
import { FieldGroup } from './FieldGroup'
import { useFieldValidation } from './useFieldValidation'
import { useFormState } from './FormStateContext'

export interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: ReactNode
  helper?: ReactNode
  /** Sr-only error message + invalid state (geen visuele tekst). */
  error?: string
  /** Markeer als optional in label */
  optional?: boolean
  /** Toont groene border zodra value niet leeg is (sessie 3 batch I-v3 prop). */
  showFilledState?: boolean
  /** Custom validator — runt live tijdens typen op niet-lege waardes. */
  validate?: (value: string) => boolean | string | undefined
  /** Forceert state="valid" — handig voor server-side bevestigde velden. */
  valid?: boolean
  /** Icon voor het veld (links). */
  iconBefore?: ReactNode
  /** Icon na het veld (rechts). Pas op: kan visueel met status-indicator botsen. */
  iconAfter?: ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    label,
    helper,
    error,
    required,
    optional,
    showFilledState,
    validate,
    valid,
    iconBefore,
    iconAfter,
    defaultValue,
    value: controlledValue,
    onChange,
    className,
    disabled,
    ...rest
  },
  ref,
) {
  const fieldId = useId()
  const isControlled = controlledValue !== undefined
  const [internalValue, setInternalValue] = useState<string>(
    String(defaultValue ?? ''),
  )
  const value = isControlled ? String(controlledValue ?? '') : internalValue

  const validation = useFieldValidation({
    value,
    required,
    validate,
    externalError: error,
    externalValid: valid,
  })

  // Register with FormStateContext (if present)
  const formState = useFormState()
  useEffect(() => {
    if (!formState) return
    return formState.registerField(fieldId, {
      forceValidate: validation.forceValidate,
      getState: () => validation.state,
    })
    // Re-register when forceValidate identity changes (it shouldn't, but safe).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formState, fieldId])

  useEffect(() => {
    if (!formState) return
    formState.reportFieldState(fieldId, validation.state)
  }, [formState, fieldId, validation.state])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isControlled) setInternalValue(e.target.value)
    onChange?.(e)
  }

  // Veld-staat stuurt het uiterlijk, niet langer een per-veld vlag:
  //   valid  → .filled (wit + groen randje + groen vinkje)
  //   invalid→ .error  (grijs + rode rand + rood kruisje)
  //   idle   → neutraal grijs
  // `showFilledState` blijft als prop bestaan (achterwaartse compat) maar is
  // nu een no-op; de gedeelde "goed ingevuld = groen" is overal standaard.
  const wrapClassName = [
    'field-wrap',
    validation.state === 'valid' && 'filled',
    validation.state === 'invalid' && 'error',
    iconBefore && 'has-icon-before',
    iconAfter && 'has-icon-after',
    disabled && 'is-disabled',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <FieldGroup
      label={label}
      required={required}
      optional={optional}
      helper={helper}
      status={validation.state}
      errorMessage={validation.errorMessage}
      className={className}
    >
      {({ inputId, describedBy, errorMessageId, invalid }) => (
        <div className={wrapClassName}>
          {iconBefore && (
            <span className="field-icon-before" aria-hidden="true">
              {iconBefore}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            value={value}
            onChange={handleChange}
            required={required}
            disabled={disabled}
            aria-invalid={invalid || undefined}
            aria-describedby={describedBy}
            aria-errormessage={errorMessageId}
            {...rest}
          />
          {iconAfter && (
            <span className="field-icon-after" aria-hidden="true">
              {iconAfter}
            </span>
          )}
        </div>
      )}
    </FieldGroup>
  )
})
