'use client'

import { useMemo, useState } from 'react'
import { Input, Textarea, Select } from '@/components/ui/form'
import { BrandTierGate } from '@/components/ui/BrandTierGate'
import { DashboardStickyFooter } from '../DashboardStickyFooter'
import { IconAdd, IconClose } from '@/components/ui/icons'
import type { BrandProfile, BrandSocialLinks } from '@/types/dashboard'
import type { ManufacturerTier } from '@/lib/config/membership'
import { tierMeets } from '@/lib/dashboard/nav'

const COUNTRIES = [
  'Netherlands', 'Belgium', 'Germany', 'France', 'United Kingdom',
  'Spain', 'Italy', 'Denmark', 'Sweden', 'Other',
]

const ALL_CHANNELS = ['Biobased', 'Sustainable', 'Acoustic', 'Circular', 'Recycled']

const SOCIAL_FIELDS: { key: keyof BrandSocialLinks; label: string }[] = [
  { key: 'linkedin', label: 'LinkedIn' },
  { key: 'instagram', label: 'Instagram' },
  { key: 'facebook', label: 'Facebook' },
  { key: 'twitter', label: 'X / Twitter' },
  { key: 'youtube', label: 'YouTube' },
  { key: 'pinterest', label: 'Pinterest' },
]

/**
 * Brand profile editor. Controlled state seeded from the data layer. The
 * keywords section is a Plus+ feature, gated inline with BrandTierGate when
 * the brand's tier is below Plus. Save stubs `POST .../profile`.
 */
export function BrandProfileForm({
  initial,
  tier,
}: {
  initial: BrandProfile
  tier: ManufacturerTier
}) {
  const [form, setForm] = useState<BrandProfile>(initial)
  const [keywordDraft, setKeywordDraft] = useState('')
  const [saving, setSaving] = useState(false)

  const canKeywords = tierMeets(tier, 'plus')

  const set = <K extends keyof BrandProfile>(key: K, value: BrandProfile[K]) =>
    setForm((f) => ({ ...f, [key]: value }))

  const setSocial = (key: keyof BrandSocialLinks, value: string) =>
    setForm((f) => ({ ...f, social: { ...f.social, [key]: value } }))

  const toggleChannel = (channel: string) =>
    setForm((f) => ({
      ...f,
      channels: f.channels.includes(channel)
        ? f.channels.filter((c) => c !== channel)
        : [...f.channels, channel],
    }))

  function addKeyword() {
    const kw = keywordDraft.trim()
    if (!kw || form.keywords.includes(kw)) return
    set('keywords', [...form.keywords, kw])
    setKeywordDraft('')
  }

  const progress = useMemo(() => {
    const core = [form.brandName, form.description, form.website, form.email, form.country, form.city]
    const filled = core.filter((v) => v.trim() !== '').length
    return (filled / core.length) * 100
  }, [form])

  async function handleSave() {
    setSaving(true)
    await new Promise((r) => setTimeout(r, 400))
    setSaving(false)
  }

  return (
    <>
      <div className="dash-panel">
        <h2 className="panel-section-title">Brand details</h2>
        <Input label="Brand name" value={form.brandName} onChange={(e) => set('brandName', e.target.value)} />
        <Textarea label="Description" value={form.description} onChange={(e) => set('description', e.target.value)} rows={4} />
        <div className="g2">
          <Input label="Website" value={form.website} onChange={(e) => set('website', e.target.value)} />
          <Input label="Email" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} />
        </div>
        <Input label="Phone" value={form.phone} onChange={(e) => set('phone', e.target.value)} />
      </div>

      <div className="dash-panel">
        <h2 className="panel-section-title">Address</h2>
        <Input label="Street & number" value={form.address} onChange={(e) => set('address', e.target.value)} />
        <div className="g3">
          <Input label="Postcode" value={form.postcode} onChange={(e) => set('postcode', e.target.value)} />
          <Input label="City" value={form.city} onChange={(e) => set('city', e.target.value)} />
          <Select
            label="Country"
            value={form.country}
            onChange={(e) => set('country', e.target.value)}
            options={COUNTRIES.map((c) => ({ value: c, label: c }))}
          />
        </div>
        <div className="g2">
          <Input label="VAT number" value={form.vatNumber} onChange={(e) => set('vatNumber', e.target.value)} />
          <Input label="Chamber of Commerce number" value={form.chamberNumber} onChange={(e) => set('chamberNumber', e.target.value)} />
        </div>
      </div>

      <div className="dash-panel">
        <h2 className="panel-section-title">Channels</h2>
        <p className="panel-section-desc">Select the material channels this brand participates in.</p>
        <div className="chip-group">
          {ALL_CHANNELS.map((channel) => (
            <button
              key={channel}
              type="button"
              className={`chip ${form.channels.includes(channel) ? 'is-on' : ''}`}
              aria-pressed={form.channels.includes(channel)}
              onClick={() => toggleChannel(channel)}
            >
              {channel}
            </button>
          ))}
        </div>
      </div>

      <div className="dash-panel">
        <h2 className="panel-section-title">Social links</h2>
        <div className="g2">
          {SOCIAL_FIELDS.map((s) => (
            <Input
              key={s.key}
              label={s.label}
              value={form.social[s.key]}
              onChange={(e) => setSocial(s.key, e.target.value)}
            />
          ))}
        </div>
      </div>

      <div className="dash-panel">
        <h2 className="panel-section-title">Keywords</h2>
        {canKeywords ? (
          <>
            <p className="panel-section-desc">Improve discovery — add keywords buyers search for.</p>
            <div className="kw-input-row">
              <Input
                label="Add keyword"
                value={keywordDraft}
                onChange={(e) => setKeywordDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addKeyword()
                  }
                }}
              />
              <button type="button" className="btn btn-outline" onClick={addKeyword}>
                <IconAdd size={16} /> Add
              </button>
            </div>
            <div className="chip-group">
              {form.keywords.map((kw) => (
                <span key={kw} className="chip is-on">
                  {kw}
                  <button
                    type="button"
                    className="chip-x"
                    onClick={() => set('keywords', form.keywords.filter((k) => k !== kw))}
                    aria-label={`Remove keyword ${kw}`}
                  >
                    <IconClose size={12} />
                  </button>
                </span>
              ))}
            </div>
          </>
        ) : (
          <BrandTierGate
            variant="page"
            required="plus"
            title="Keywords"
            description="Add discovery keywords to your brand and materials so buyers find you faster. Available from the Plus tier."
            upgradeHref="./membership"
          />
        )}
      </div>

      <DashboardStickyFooter progress={progress} saving={saving} onSave={handleSave} />
    </>
  )
}
