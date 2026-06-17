/**
 * Select — pulldown met live validatie-indicator.
 *
 * Twee manieren om opties op te geven:
 *   1. `options={[{ value, label, disabled? }, ...]}` — generieke flat list
 *   2. children — voor <optgroup> hierarchies
 *
 * `placeholder` rendert als disabled first option (sessie 3 patroon).
 *
 * Status-indicator-cirkel komt rechts-boven, naast (boven) de chevron.
 * De chevron-positie blijft op rechts-mid (uit globals.css §39).
 */

'use client'

import {
  forwardRef,
  useEffect,
  useId,
  useState,
  type SelectHTMLAttributes,
  type ReactNode,
} from 'react'
import { FieldGroup } from './FieldGroup'
import { useFieldValidation } from './useFieldValidation'
import { useFormState } from './FormStateContext'

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

export interface SelectProps
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  label?: ReactNode
  helper?: ReactNode
  error?: string
  optional?: boolean
  /** Lege-state placeholder; rendert als disabled value="" first option. */
  placeholder?: string
  /** Generieke flat list. Als beide opgegeven, wint `children`. */
  options?: SelectOption[]
  children?: ReactNode
  showFilledState?: boolean
  validate?: (value: string) => boolean | string | undefined
  valid?: boolean
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  {
    label,
    helper,
    error,
    required,
    optional,
    placeholder,
    options,
    children,
    showFilledState,
    validate,
    valid,
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

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!isControlled) setInternalValue(e.target.value)
    onChange?.(e)
  }

  const wrapClassName = [
    'field-wrap',
    'is-select',
    validation.state === 'valid' && 'filled',
    validation.state === 'invalid' && 'error',
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
          <select
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
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {children ??
              options?.map((opt) => (
                <option
                  key={opt.value}
                  value={opt.value}
                  disabled={opt.disabled}
                >
                  {opt.label}
                </option>
              ))}
          </select>
        </div>
      )}
    </FieldGroup>
  )
})
