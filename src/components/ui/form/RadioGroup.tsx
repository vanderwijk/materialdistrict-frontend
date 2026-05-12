/**
 * RadioGroup — set radio-buttons binnen een <fieldset>/<legend>.
 *
 * Verzorgt:
 *   - <fieldset>/<legend> met browser-default reset (border weg, padding 0,
 *     legend renders als eyebrow-style label) — zie globals.css §41.2
 *   - Gedeelde `name` automatisch geïnjecteerd op alle Radio-children via
 *     React.Children.map + cloneElement
 *   - Validation op groep-niveau: required → minimaal één optie geselecteerd
 *   - Status-indicator-cirkel rechts-boven het fieldset
 *
 * Werkt uncontrolled (defaultValue) of controlled (value + onChange).
 *
 * Bij `horizontal`-prop renderen de Radio's naast elkaar i.p.v. onder elkaar.
 */

'use client'

import {
  Children,
  cloneElement,
  isValidElement,
  useEffect,
  useId,
  useState,
  type ChangeEvent,
  type ReactElement,
  type ReactNode,
} from 'react'
import { FieldStatus } from './FieldStatus'
import { useFieldValidation } from './useFieldValidation'
import { useFormState } from './FormStateContext'
import type { RadioProps } from './Radio'

export interface RadioGroupProps {
  label: ReactNode
  /** Gedeelde name voor alle radios — verplicht voor correcte HTML-form-submit. */
  name: string
  required?: boolean
  optional?: boolean
  helper?: ReactNode
  error?: string
  validate?: (value: string) => boolean | string | undefined
  valid?: boolean
  /** Initiële geselecteerde value (uncontrolled). */
  defaultValue?: string
  /** Geselecteerde value (controlled). */
  value?: string
  /** Callback bij selectie-verandering. */
  onChange?: (value: string) => void
  /** Renderen als horizontale rij i.p.v. verticaal. */
  horizontal?: boolean
  className?: string
  children: ReactNode
}

export function RadioGroup({
  label,
  name,
  required,
  optional,
  helper,
  error,
  validate,
  valid,
  defaultValue,
  value: controlledValue,
  onChange,
  horizontal,
  className,
  children,
}: RadioGroupProps) {
  const reactId = useId()
  const fieldId = `${reactId}-radiogroup`
  const helperId = helper ? `${reactId}-helper` : undefined

  const isControlled = controlledValue !== undefined
  const [internalValue, setInternalValue] = useState<string>(defaultValue ?? '')
  const value = isControlled ? (controlledValue ?? '') : internalValue

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

  const handleRadioChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    if (!isControlled) setInternalValue(newValue)
    onChange?.(newValue)
  }

  const errorMessageId =
    validation.state === 'invalid' && validation.errorMessage
      ? `${reactId}-error`
      : undefined

  // Inject `name`, `checked` (controlled) and onChange on every Radio child.
  // Children that are not <Radio> (decorators, conditionals) are passed through.
  const radios = Children.map(children, (child) => {
    if (!isValidElement(child)) return child
    const childProps = child.props as RadioProps
    return cloneElement(child as ReactElement<RadioProps>, {
      name,
      checked: childProps.value !== undefined && childProps.value === value,
      onChange: (e: ChangeEvent<HTMLInputElement>) => {
        handleRadioChange(e)
        childProps.onChange?.(e)
      },
    })
  })

  const wrapperClassName = [
    'field-group',
    'is-choice-group',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  const groupClassName = [
    'choice-group',
    horizontal && 'is-horizontal',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={wrapperClassName}>
      <fieldset
        aria-invalid={validation.state === 'invalid' || undefined}
        aria-errormessage={errorMessageId}
        aria-describedby={helperId}
      >
        <legend>
          {label}
          {required && (
            <span className="field-required" aria-hidden="true">*</span>
          )}
          {optional && <span className="field-optional">(optional)</span>}
        </legend>
        <div className={groupClassName}>{radios}</div>
      </fieldset>
      {helper && (
        <p id={helperId} className="field-helper">
          {helper}
        </p>
      )}
      <FieldStatus
        state={validation.state}
        errorMessage={validation.errorMessage}
        statusId={errorMessageId}
      />
    </div>
  )
}
