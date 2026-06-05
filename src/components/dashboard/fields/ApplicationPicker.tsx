'use client'

/**
 * ApplicationPicker — shared 3-level (Main → Sub → Type) application/sector
 * picker. Used by the brand profile form ("Sectors & applications") and the
 * material form ("Material applications"). One option source
 * (`MATERIAL_APPLICATIONS`), one component → no drift between the two forms.
 *
 * Selections are `MaterialCategoryPath[]` (max 3). Each picked path gets a
 * stable local `app:` id until WordPress maps it to a real term id; the write
 * mapper drops local ids, so persistence is a server-side follow-up.
 */

import { useState } from 'react'
import { Select } from '@/components/ui/form'
import { IconAdd, IconClose, IconChevronRight } from '@/components/ui/icons'
import type { MaterialCategoryPath } from '@/types/dashboard'
import {
  applicationMains,
  applicationSubs,
  applicationTypes,
  applicationPathId,
} from '@/lib/config/material-applications'

export interface ApplicationPickerProps {
  value: MaterialCategoryPath[]
  onChange: (next: MaterialCategoryPath[]) => void
  /** Maximum number of paths (default 3). */
  max?: number
}

export function ApplicationPicker({ value, onChange, max = 3 }: ApplicationPickerProps) {
  const [main, setMain] = useState('')
  const [sub, setSub] = useState('')
  const [type, setType] = useState('')
  const [hint, setHint] = useState<string | null>(null)

  const subOptions = main ? applicationSubs(main) : []
  const typeOptions = main && sub ? applicationTypes(main, sub) : []

  const atMax = value.length >= max
  const canAdd = Boolean(main && sub && type) && !atMax

  function reset() {
    setMain('')
    setSub('')
    setType('')
  }

  function add() {
    if (!main || !sub || !type) return
    if (atMax) {
      setHint(`Maximum ${max} applications.`)
      return
    }
    const id = applicationPathId(main, sub, type)
    if (value.some((p) => applicationPathId(p.l1, p.l2, p.l3) === id)) {
      setHint('That application is already added.')
      return
    }
    setHint(null)
    onChange([...value, { id, l1: main, l2: sub, l3: type }])
    reset()
  }

  function remove(index: number) {
    onChange(value.filter((_, i) => i !== index))
    setHint(null)
  }

  return (
    <div className="app-picker">
      <div className="app-cascade">
        <Select
          aria-label="Main application"
          value={main}
          placeholder="Main application"
          options={applicationMains().map((m) => ({ value: m, label: m }))}
          disabled={atMax}
          onChange={(e) => {
            setMain(e.target.value)
            setSub('')
            setType('')
          }}
        />
        <Select
          aria-label="Sub application"
          value={sub}
          placeholder="Sub application"
          options={subOptions.map((s) => ({ value: s, label: s }))}
          disabled={!main || atMax}
          onChange={(e) => {
            setSub(e.target.value)
            setType('')
          }}
        />
        <Select
          aria-label="Type"
          value={type}
          placeholder="Type"
          options={typeOptions.map((t) => ({ value: t, label: t }))}
          disabled={!sub || atMax}
          onChange={(e) => setType(e.target.value)}
        />
        <button
          type="button"
          className="btn btn-primary"
          onClick={add}
          disabled={!canAdd}
        >
          <IconAdd size={16} /> Add
        </button>
      </div>

      {hint && <p className="field-helper is-error">{hint}</p>}
      {atMax && !hint && (
        <p className="field-helper">You&apos;ve added the maximum of {max} applications.</p>
      )}

      {value.length > 0 && (
        <ul className="app-path-list">
          {value.map((p, i) => (
            <li key={p.id || `${p.l1}-${p.l2}-${p.l3}-${i}`} className="app-path">
              <span className="app-path-crumbs">
                <span className="app-path-crumb">{p.l1}</span>
                <IconChevronRight size={10} />
                <span className="app-path-crumb">{p.l2}</span>
                <IconChevronRight size={10} />
                <strong className="app-path-leaf">{p.l3}</strong>
              </span>
              <button
                type="button"
                className="icon-btn is-sm is-ghost app-path-remove"
                onClick={() => remove(i)}
                aria-label={`Remove ${p.l1} ${p.l2} ${p.l3}`}
              >
                <IconClose size={14} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
