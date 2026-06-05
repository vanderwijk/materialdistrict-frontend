'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input, Select, Checkbox } from '@/components/ui/form'
import { DashboardStickyFooter } from '../DashboardStickyFooter'
import type { UserProfile, ProfileFieldOptions } from '@/types/dashboard'

const COUNTRIES = [
  'Netherlands', 'Belgium', 'Germany', 'France', 'United Kingdom',
  'Spain', 'Italy', 'Denmark', 'Sweden', 'Other',
]

/**
 * Personal profile form. Controlled state seeded from the data layer; the
 * sticky footer shows completion progress. Filled fields self-mark with a green
 * check (`showFilledState`). Profession and industry render as dropdowns when WP
 * supplies option lists, falling back to a free-text input when it doesn't.
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
  const [form, setForm] = useState<UserProfile>(initial)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const router = useRouter()

  const set = <K extends keyof UserProfile>(key: K, value: UserProfile[K]) =>
    setForm((f) => ({ ...f, [key]: value }))

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

  return (
    <>
      <div className="dash-panel">
        <h2 className="panel-section-title">Personal details</h2>
        {saveError && <p className="form-error" role="alert">{saveError}</p>}

        <div className="g2">
          <Input
            label="First name"
            value={form.firstName}
            onChange={(e) => set('firstName', e.target.value)}
            showFilledState
          />
          <Input
            label="Last name"
            value={form.lastName}
            onChange={(e) => set('lastName', e.target.value)}
            showFilledState
          />
        </div>

        <div className="g2">
          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => set('email', e.target.value)}
            showFilledState
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
          {options.professions.length > 0 ? (
            <Select
              label="Profession"
              value={form.profession}
              onChange={(e) => set('profession', e.target.value)}
              placeholder="Select a profession"
              options={options.professions.map((o) => ({ value: o.value, label: o.label }))}
              showFilledState
            />
          ) : (
            <Input
              label="Profession"
              value={form.profession}
              onChange={(e) => set('profession', e.target.value)}
              showFilledState
            />
          )}
          {options.industries.length > 0 ? (
            <Select
              label="Industry / sector"
              value={form.industry}
              onChange={(e) => set('industry', e.target.value)}
              placeholder="Select an industry"
              options={options.industries.map((o) => ({ value: o.value, label: o.label }))}
              showFilledState
            />
          ) : (
            <Input
              label="Industry / sector"
              value={form.industry}
              onChange={(e) => set('industry', e.target.value)}
              showFilledState
            />
          )}
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
            options={COUNTRIES.map((c) => ({ value: c, label: c }))}
            showFilledState
          />

          <div className="ip-bg">
            <Checkbox
              label="Invoice to a company"
              description="For business invoices — used automatically at your next payment."
              checked={form.invoiceToCompany}
              onChange={(e) => set('invoiceToCompany', e.target.checked)}
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
                  value={form.vatNumber}
                  onChange={(e) => set('vatNumber', e.target.value)}
                  showFilledState
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <DashboardStickyFooter
        progress={progress}
        saving={saving}
        showPreview={false}
        onSave={handleSave}
      />
    </>
  )
}
