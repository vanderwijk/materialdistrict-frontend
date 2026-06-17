'use client'

import { useState } from 'react'
import { IconClose } from '@/components/ui/icons'

interface ChannelPickerProps {
  options: readonly string[]
  value: string[]
  onChange: (next: string[]) => void
  /** Maximum aantal te kiezen kanalen; standaard 3. */
  max?: number
  /** Optionele toelichting onder de chips (bv. de "binnen 24 uur"-regel). */
  note?: string
}

/**
 * ChannelPicker — gedeelde kanaal-kiezer voor het merk- én materiaalformulier.
 *
 * Eén component i.p.v. twee losse implementaties:
 *   - Klik op een chip = toggle (aan/uit).
 *   - Een geselecteerde chip toont een × (klik = verwijderen), niet meer een ✓.
 *   - Klik je een extra chip aan boven het maximum, dan verschijnt een nette
 *     melding i.p.v. dat de overige chips stilletjes uitgrijzen.
 *   - Geen aparte "Active channel links"-lijst meer (die was dubbelop met de
 *     reeds-geselecteerde chips).
 */
export function ChannelPicker({
  options,
  value,
  onChange,
  max = 3,
  note,
}: ChannelPickerProps) {
  const [limitHit, setLimitHit] = useState(false)

  function toggle(channel: string) {
    if (value.includes(channel)) {
      onChange(value.filter((c) => c !== channel))
      setLimitHit(false)
      return
    }
    if (value.length >= max) {
      setLimitHit(true)
      return
    }
    onChange([...value, channel])
    setLimitHit(false)
  }

  return (
    <div className="channel-picker">
      <span className="field-subhead">Select up to {max} channels</span>
      <div className="chip-group">
        {options.map((channel) => {
          const selected = value.includes(channel)
          return (
            <button
              key={channel}
              type="button"
              className={selected ? 'chip is-on' : 'chip'}
              aria-pressed={selected}
              onClick={() => toggle(channel)}
            >
              {channel}
              {selected && (
                <IconClose size={12} className="chip-x" aria-hidden="true" />
              )}
            </button>
          )
        })}
      </div>
      {limitHit && (
        <p className="field-helper is-error" role="status">
          You can select up to {max} channels.
        </p>
      )}
      {note && <p className="field-helper">{note}</p>}
    </div>
  )
}
