'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input, Select, Checkbox } from '@/components/ui/form'
import { DashboardStickyFooter } from '../DashboardStickyFooter'
import { FormStateProvider } from '@/components/ui/form/FormStateContext'
import { COUNTRY_OPTIONS, resolveCountryCode } from '@/lib/config/countries'
import { withCurrentSelectValue } from '@/lib/config/profile-options'
import { checkCheckoutVat } from '@/lib/api/checkout-account'
import type { UserProfile, ProfileFieldOptions } from '@/types/dashboard'

/**
 * Personal profile form. Controlled state seeded from the data layer; the
 * sticky footer shows completion progress. Filled fields self-mark with a green
 * check (`showFilledState`). Profession, industry and country use the same
 * option lists as the legacy WP profile (theme defaults until profile-options ships).
 *
 * Save POSTs the full `UserProfile` to `/api/dashboard/profile`, which maps it
 * to the WP snake_case body. Company name + VAT only apply when "Invoice to a
 * company" is on.
 */
export function ProfileForm({
  initial,
  options,
}: {
  initial: UserProfile
  options: ProfileFieldOptions
}) {
  const [form, setForm] = useState<UserProfile>(() => ({
    ...initial,
    country: resolveCountryCode(initial.country),
  }))
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const router = useRouter()

  const set = <K extends keyof UserProfile>(key: K, value: UserProfile[K]) =>
    setForm((f) => ({ ...f, [key]: value }))

  const [vatStatus, setVatStatus] = useState<'idle' | 'checking' | 'valid' | 'invalid'>('idle')
  const [vatError, setVatError] = useState<string | null>(null)
  const [vatTouched, setVatTouched] = useState(false)

  const professionOptions = useMemo(
    () => withCurrentSelectValue(options.professions, form.profession),
    [options.professions, form.profession],
  )
  const industryOptions = useMemo(
    () => withCurrentSelectValue(options.industries, form.industry),
    [options.industries, form.industry],
  )

  const progress = useMemo(() => {
    const fields = [
      form.firstName, form.lastName, form.email, form.phone,
      form.profession, form.industry,
      form.address, form.postcode, form.city, form.country,
    ]
    if (form.invoiceToCompany) fields.push(form.company, form.vatNumber)
    const filled = fields.filter((v) => v.trim() !== '').length
    return (filled / fields.length) * 100
  }, [form])

  // Verplichte velden voor een persoonlijk profiel: voor- en achternaam + e-mail.
  // (Adres is hier bewust niet verplicht; dat hoort bij sample-aanvragen.)
  const requiredComplete =
    form.firstName.trim() !== '' &&
    form.lastName.trim() !== '' &&
    form.email.trim() !== ''

  async function handleSave() {
    setSaving(true)
    setSaveError(null)
    try {
      const res = await fetch('/api/dashboard/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => null)
        setSaveError(err?.message ?? 'Could not save your profile. Please try again.')
        return
      }
      // Re-run Server Components so the sidebar + /auth/me reflect the change.
      router.refresh()
    } catch {
      setSaveError('Could not save your profile. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  useEffect(() => {
    if (!form.invoiceToCompany) {
      setVatStatus('idle')
      setVatError(null)
      return
    }

    // Voorkom VIES calls bij page load / login. Alleen wanneer de gebruiker
    // zelf de VAT (of de invoice-to-company toggle) aanpast, starten we checks.
    if (!vatTouched) {
      return
    }

    const trimmedVat = form.vatNumber.trim()
    if (!trimmedVat) {
      setVatStatus('idle')
      setVatError(null)
      return
    }

    if (!form.country) {
      setVatStatus('idle')
      setVatError(null)
      return
    }

    const normalizedVat = trimmedVat.toUpperCase().replace(/[^A-Z0-9]/g, '')
    const vatPrefix = normalizedVat.slice(0, 2)
    if (/^[A-Z]{2}$/.test(vatPrefix) && vatPrefix !== form.country.toUpperCase()) {
      setVatStatus('invalid')
      setVatError('VAT country prefix does not match the selected billing country.')
      return
    }

    const timer = window.setTimeout(async () => {
      setVatStatus('checking')
      setVatError(null)
      try {
        const result = await checkCheckoutVat(form.country, trimmedVat)
        if (result.is_valid) {
          setVatStatus('valid')
          setVatError(null)
        } else {
          setVatStatus('invalid')
          if (result.status === 'invalid') {
            setVatError('VAT number not recognized by VIES.')
          } else if (result.status === 'unreachable') {
            setVatError('Could not verify VAT right now. Please try again.')
          } else if (result.status === 'non_eu') {
            setVatError('VAT validation via VIES is only available for EU countries.')
          } else {
            setVatError('VAT number could not be validated.')
          }
        }
      } catch {
        setVatStatus('invalid')
        setVatError('Could not verify VAT right now. Please try again.')
      }
    }, 500)

    return () => window.clearTimeout(timer)
  }, [form.country, form.invoiceToCompany, form.vatNumber, vatTouched])

  return (
    <FormStateProvider>
      <div className="dash-panel">
        <h2 className="panel-section-title">Personal details</h2>
        {saveError && <p className="form-error" role="alert">{saveError}</p>}

        <div className="g2">
          <Input
            label="First name"
            required
            value={form.firstName}
            onChange={(e) => set('firstName', e.target.value)}
          />
          <Input
            label="Last name"
            required
            value={form.lastName}
            onChange={(e) => set('lastName', e.target.value)}
          />
        </div>

        <div className="g2">
          <Input
            label="Email"
            type="email"
            required
            value={form.email}
            onChange={(e) => set('email', e.target.value)}
          />
          <Input
            label="Telephone"
            type="tel"
            value={form.phone}
            onChange={(e) => set('phone', e.target.value)}
            showFilledState
          />
        </div>

        <div className="g2">
          <Select
            label="Profession"
            value={form.profession}
            onChange={(e) => set('profession', e.target.value)}
            placeholder="Select a profession"
            options={professionOptions.map((o) => ({ value: o.value, label: o.label }))}
            showFilledState
          />
          <Select
            label="Industry / sector"
            value={form.industry}
            onChange={(e) => set('industry', e.target.value)}
            placeholder="Select an industry / sector"
            options={industryOptions.map((o) => ({ value: o.value, label: o.label }))}
            showFilledState
          />
        </div>

        <div className="section-sep">
          <h2 className="panel-section-title">Billing &amp; address details</h2>
          <p className="panel-section-desc">Used for invoicing and lead follow-up.</p>

          <Input
            label="Street address"
            value={form.address}
            onChange={(e) => set('address', e.target.value)}
            showFilledState
          />

          <Input
            label="Address line 2"
            optional
            value={form.address2 ?? ''}
            onChange={(e) => set('address2', e.target.value)}
            showFilledState
          />

          <div className="g2">
            <Input
              label="Post code"
              value={form.postcode}
              onChange={(e) => set('postcode', e.target.value)}
              showFilledState
            />
            <Input
              label="City"
              value={form.city}
              onChange={(e) => set('city', e.target.value)}
              showFilledState
            />
          </div>

          <Select
            label="Country"
            value={form.country}
            onChange={(e) => set('country', e.target.value)}
            placeholder="Select a country"
            options={COUNTRY_OPTIONS}
            showFilledState
          />

          <div className="ip-bg profile-billing-block">
            <Checkbox
              label="Invoice to a company"
              description="For business invoices — used automatically at your next payment."
              checked={form.invoiceToCompany}
              onChange={(e) => {
                const next = e.target.checked
                set('invoiceToCompany', next)
                setVatTouched(next ? form.vatNumber.trim() !== '' : false)
                if (!next) {
                  setVatStatus('idle')
                  setVatError(null)
                }
              }}
            />
            {form.invoiceToCompany && (
              <div className="g2 profile-invoice-fields">
                <Input
                  label="Company name"
                  value={form.company}
                  onChange={(e) => set('company', e.target.value)}
                  showFilledState
                />
                <Input
                  label="VAT number"
                  optional
                  value={form.vatNumber}
                  onChange={(e) => {
                    set('vatNumber', e.target.value)
                    setVatTouched(true)
                  }}
                  autoComplete="off"
                  placeholder="e.g. NL123456789B01"
                  valid={vatStatus === 'valid'}
                  error={vatStatus === 'invalid' ? (vatError ?? 'VAT number could not be validated.') : undefined}
                  helper={vatStatus === 'checking' ? 'Checking VAT…' : undefined}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <DashboardStickyFooter
        progress={progress}
        saving={saving}
        invalid={!requiredComplete}
        showPreview={false}
        onSave={handleSave}
      />
    </FormStateProvider>
  )
}
