'use client'

/**
 * AddressFields — herbruikbare, controlled adresvelden voor de checkout.
 *
 * Gebouwd op de gedeelde huisstijl-formuliercomponenten (`Input`/`Select` uit
 * components/ui/form): die tonen de §41-veldstatus — een groen vinkje rechts-
 * boven zodra een verplicht veld geldig is gevuld. Zo is de checkout één
 * familie met de overige formulieren (register, dashboard).
 *
 * Company (optioneel) en VAT number (optioneel) staan naast elkaar (elk half);
 * als er geen BTW-veld is (verzendadres), wordt Company volle breedte.
 */

import { Input, Select } from '@/components/ui/form'
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
  vatNumber?: string
  onVatNumberChange?: (value: string) => void
  vatStatus?: 'idle' | 'checking' | 'valid' | 'invalid'
  vatErrorMessage?: string | null
}

export function AddressFields({
  value,
  onChange,
  vatNumber,
  onVatNumberChange,
  vatStatus = 'idle',
  vatErrorMessage = null,
}: AddressFieldsProps) {
  const set = (key: keyof StoreAddress, v: string) =>
    onChange({ ...value, [key]: v })

  return (
    <div className="addr-grid">
      <Input
        label="First name"
        required
        showFilledState
        value={value.first_name}
        onChange={(e) => set('first_name', e.target.value)}
        autoComplete="given-name"
      />
      <Input
        label="Last name"
        required
        showFilledState
        value={value.last_name}
        onChange={(e) => set('last_name', e.target.value)}
        autoComplete="family-name"
      />

      <Input
        className={onVatNumberChange ? undefined : 'checkout-field-wide'}
        label="Company"
        optional
        showFilledState
        value={value.company ?? ''}
        onChange={(e) => set('company', e.target.value)}
        autoComplete="organization"
      />
      {onVatNumberChange && (
        <Input
          label="VAT number"
          optional
          value={vatNumber ?? ''}
          onChange={(e) => onVatNumberChange(e.target.value)}
          valid={vatStatus === 'valid'}
          error={
            vatStatus === 'invalid'
              ? vatErrorMessage ?? 'VAT number could not be validated.'
              : undefined
          }
          helper={vatStatus === 'checking' ? 'Checking…' : undefined}
          placeholder="e.g. NL123456789B01"
          autoComplete="off"
        />
      )}

      <Input
        className="checkout-field-wide"
        label="Address"
        required
        showFilledState
        value={value.address_1}
        onChange={(e) => set('address_1', e.target.value)}
        autoComplete="address-line1"
      />
      <Input
        className="checkout-field-wide"
        label="Address line 2"
        optional
        showFilledState
        value={value.address_2 ?? ''}
        onChange={(e) => set('address_2', e.target.value)}
        autoComplete="address-line2"
      />

      <Input
        label="Postcode"
        required
        showFilledState
        value={value.postcode}
        onChange={(e) => set('postcode', e.target.value)}
        autoComplete="postal-code"
      />
      <Input
        label="City"
        required
        showFilledState
        value={value.city}
        onChange={(e) => set('city', e.target.value)}
        autoComplete="address-level2"
      />

      <Select
        className="checkout-field-wide"
        label="Country"
        required
        options={COUNTRIES.map(([v, label]) => ({ value: v, label }))}
        value={value.country}
        onChange={(e) => set('country', e.target.value)}
        autoComplete="country"
      />
    </div>
  )
}
