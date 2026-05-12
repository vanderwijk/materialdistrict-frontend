/**
 * Textarea — multi-line tekstveld met live validatie-indicator.
 *
 * Identieke API als Input, alleen rendert het een <textarea>. Default rows=4.
 * Geen iconBefore/iconAfter — niet zinvol op multi-line velden.
 */

'use client'

import {
  forwardRef,
  useEffect,
  useId,
  useState,
  type TextareaHTMLAttributes,
  type ReactNode,
} from 'react'
import { FieldGroup } from './FieldGroup'
import { useFieldValidation } from './useFieldValidation'
import { useFormState } from './FormStateContext'

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: ReactNode
  helper?: ReactNode
  error?: string
  optional?: boolean
  showFilledState?: boolean
  validate?: (value: string) => boolean | string | undefined
  valid?: boolean
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea(
    {
      label,
      helper,
      error,
      required,
      optional,
      showFilledState,
      validate,
      valid,
      defaultValue,
      value: controlledValue,
      onChange,
      className,
      disabled,
      rows = 4,
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

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (!isControlled) setInternalValue(e.target.value)
      onChange?.(e)
    }

    const wrapClassName = [
      'field-wrap',
      showFilledState && value.trim() !== '' && validation.state !== 'invalid' && 'filled',
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
            <textarea
              ref={ref}
              id={inputId}
              value={value}
              onChange={handleChange}
              required={required}
              disabled={disabled}
              rows={rows}
              aria-invalid={invalid || undefined}
              aria-describedby={describedBy}
              aria-errormessage={errorMessageId}
              {...rest}
            />
          </div>
        )}
      </FieldGroup>
    )
  },
)
