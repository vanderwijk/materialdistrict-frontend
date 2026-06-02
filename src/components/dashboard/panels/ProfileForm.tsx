'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input, Select } from '@/components/ui/form'
import { DashboardStickyFooter } from '../DashboardStickyFooter'
import { initialsFrom } from '@/lib/dashboard/nav'
import type { UserProfile } from '@/types/dashboard'

const COUNTRIES = [
  'Netherlands', 'Belgium', 'Germany', 'France', 'United Kingdom',
  'Spain', 'Italy', 'Denmark', 'Sweden', 'Other',
]

/**
 * Personal profile form. Controlled state seeded from the data layer; the
 * sticky footer shows completion progress. Save is a stub until Johan's
 * `POST /md/v2/dashboard/profile` lands — the submit handler is the single
 * place that will call it.
 */
export function ProfileForm({ initial }: { initial: UserProfile }) {
  const [form, setForm] = useState<UserProfile>(initial)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const router = useRouter()

  const set = <K extends keyof UserProfile>(key: K, value: UserProfile[K]) =>
    setForm((f) => ({ ...f, [key]: value }))

  const progress = useMemo(() => {
    const fields = [form.firstName, form.lastName, form.email, form.profession, form.company, form.country]
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

  const fullName = `${form.firstName} ${form.lastName}`.trim()

  return (
    <>
      <div className="dash-panel">
        <h2 className="panel-section-title">Account details</h2>

        {saveError && <p className="form-error" role="alert">{saveError}</p>}

        <div className="profile-avatar-row">
          <span className="sb-avatar profile-avatar-lg">
            {form.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={form.avatarUrl} alt="" />
            ) : (
              initialsFrom(fullName || 'User')
            )}
          </span>
          <div>
            <button type="button" className="btn btn-outline btn-sm">Upload photo</button>
            <p className="field-helper">JPG or PNG, up to 2&nbsp;MB.</p>
          </div>
        </div>

        <div className="g2">
          <Input
            label="First name"
            value={form.firstName}
            onChange={(e) => set('firstName', e.target.value)}
          />
          <Input
            label="Last name"
            value={form.lastName}
            onChange={(e) => set('lastName', e.target.value)}
          />
        </div>

        <Input
          label="Email"
          type="email"
          value={form.email}
          onChange={(e) => set('email', e.target.value)}
        />

        <div className="g2">
          <Input
            label="Profession"
            value={form.profession}
            onChange={(e) => set('profession', e.target.value)}
          />
          <Input
            label="Company"
            value={form.company}
            onChange={(e) => set('company', e.target.value)}
          />
        </div>

        <Select
          label="Country"
          value={form.country}
          onChange={(e) => set('country', e.target.value)}
          options={COUNTRIES.map((c) => ({ value: c, label: c }))}
        />
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
