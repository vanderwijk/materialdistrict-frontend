/**
 * Switch — universal on/off toggle with a label and optional description.
 *
 * One toggle pattern for the whole app (DRY): a controlled `role="switch"`
 * button plus a text block. Unlike `Checkbox` (a form field with validation
 * states), a Switch flips an action/setting and is always valid, so it skips
 * the FormState/validation plumbing.
 *
 * Controlled only: pass `checked` and handle `onCheckedChange`.
 *
 * `tone="insider"` recolors the control to the member teal — used for the
 * brand-level Insider gates; `tone="default"` (navy) adds an on-state frame to
 * the row for standalone toggles.
 *
 * @example
 *   <Switch
 *     checked={config.restrictToListedCountries}
 *     onCheckedChange={(v) => setConfig((c) => ({ ...c, restrictToListedCountries: v }))}
 *     label="Only accept requests from countries in my list"
 *     description="All other countries are blocked."
 *   />
 */

'use client'

import { useId, type ReactNode } from 'react'

export interface SwitchProps {
  /** Controlled on/off state. */
  checked: boolean
  /** Fired with the next state when the user toggles. */
  onCheckedChange: (checked: boolean) => void
  label: ReactNode
  description?: ReactNode
  disabled?: boolean
  /** Accent + framing: 'default' (navy) or 'insider' (member teal). */
  tone?: 'default' | 'insider'
  /** Optional id for the label element (for external aria wiring). */
  id?: string
  className?: string
}

export function Switch({
  checked,
  onCheckedChange,
  label,
  description,
  disabled,
  tone = 'default',
  id: providedId,
  className,
}: SwitchProps) {
  const reactId = useId()
  const labelId = providedId ?? `${reactId}-switch-label`
  const toneClass = tone === 'insider' ? 'tone-insider' : 'tone-default'

  const fieldClass = ['switch-field', toneClass, checked && 'is-on', className]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={fieldClass}>
      <span className="switch-text">
        <span className="switch-label" id={labelId}>
          {label}
        </span>
        {description && <span className="switch-desc">{description}</span>}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={labelId}
        disabled={disabled}
        onClick={() => onCheckedChange(!checked)}
        className={`switch ${toneClass}`}
      >
        <span className="switch-thumb" aria-hidden="true" />
      </button>
    </div>
  )
}
