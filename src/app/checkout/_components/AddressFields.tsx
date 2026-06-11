'use client'

/**
 * AddressFields — herbruikbare, controlled adresvelden voor de checkout.
 * Landkeuze beperkt tot de zones die de winkel bedient (NL / BE+DE / EU / RoW
 * worden server-side als verzendzones afgehandeld; hier een praktische lijst).
 */

import type { StoreAddress } from '@/lib/api/cart'

const COUNTRIES: Array<[string, string]> = [
  ['NL', 'Netherlands'],
  ['BE', 'Belgium'],
  ['DE', 'Germany'],
  ['FR', 'France'],
  ['LU', 'Luxembourg'],
  ['AT', 'Austria'],
  ['ES', 'Spain'],
  ['IT', 'Italy'],
  ['DK', 'Denmark'],
  ['SE', 'Sweden'],
  ['IE', 'Ireland'],
  ['GB', 'United Kingdom'],
  ['US', 'United States'],
]

interface AddressFieldsProps {
  value: StoreAddress
  onChange: (next: StoreAddress) => void
  idPrefix: string
}

export function AddressFields({ value, onChange, idPrefix }: AddressFieldsProps) {
  const set = (key: keyof StoreAddress, v: string) =>
    onChange({ ...value, [key]: v })

  return (
    <div className="addr-grid">
      <div className="addr-field">
        <label htmlFor={`${idPrefix}-first`}>First name *</label>
        <input
          id={`${idPrefix}-first`}
          value={value.first_name}
          onChange={(e) => set('first_name', e.target.value)}
          autoComplete="given-name"
        />
      </div>
      <div className="addr-field">
        <label htmlFor={`${idPrefix}-last`}>Last name *</label>
        <input
          id={`${idPrefix}-last`}
          value={value.last_name}
          onChange={(e) => set('last_name', e.target.value)}
          autoComplete="family-name"
        />
      </div>

      <div className="addr-field addr-field-wide">
        <label htmlFor={`${idPrefix}-addr1`}>Address *</label>
        <input
          id={`${idPrefix}-addr1`}
          value={value.address_1}
          onChange={(e) => set('address_1', e.target.value)}
          autoComplete="address-line1"
        />
      </div>
      <div className="addr-field addr-field-wide">
        <label htmlFor={`${idPrefix}-addr2`}>Address line 2</label>
        <input
          id={`${idPrefix}-addr2`}
          value={value.address_2 ?? ''}
          onChange={(e) => set('address_2', e.target.value)}
          autoComplete="address-line2"
        />
      </div>

      <div className="addr-field">
        <label htmlFor={`${idPrefix}-post`}>Postcode *</label>
        <input
          id={`${idPrefix}-post`}
          value={value.postcode}
          onChange={(e) => set('postcode', e.target.value)}
          autoComplete="postal-code"
        />
      </div>
      <div className="addr-field">
        <label htmlFor={`${idPrefix}-city`}>City *</label>
        <input
          id={`${idPrefix}-city`}
          value={value.city}
          onChange={(e) => set('city', e.target.value)}
          autoComplete="address-level2"
        />
      </div>

      <div className="addr-field addr-field-wide">
        <label htmlFor={`${idPrefix}-country`}>Country *</label>
        <select
          id={`${idPrefix}-country`}
          value={value.country}
          onChange={(e) => set('country', e.target.value)}
          autoComplete="country"
        >
          {COUNTRIES.map(([code, name]) => (
            <option key={code} value={code}>
              {name}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
