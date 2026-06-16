'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input, Textarea, Select } from '@/components/ui/form'
import { BrandTierGate } from '@/components/ui/BrandTierGate'
import { DashboardStickyFooter } from '../DashboardStickyFooter'
import { CurrentPlanBanner } from '../CurrentPlanBanner'
import {
  ApplicationPicker,
  DownloadsField,
  VideoLinksField,
  GalleryField,
} from '../fields'
import { IconAdd, IconClose, IconCheck, IconUpload, IconImage } from '@/components/ui/icons'
import { MATERIAL_CHANNEL_LABELS } from '@/lib/config/material-channels'
import { COUNTRY_OPTIONS, resolveCountryCode } from '@/lib/config/countries'
import type { BrandProfile, BrandSocialLinks, MaterialAsset } from '@/types/dashboard'
import { canManufacturerAccess, type ManufacturerTier } from '@/lib/config/membership'
import { tierMeets } from '@/lib/dashboard/nav'
import { checkCheckoutVat } from '@/lib/api/checkout-account'

const SOCIAL_FIELDS: { key: keyof BrandSocialLinks; label: string }[] = [
  { key: 'twitter', label: 'Twitter / X' },
  { key: 'instagram', label: 'Instagram' },
  { key: 'linkedin', label: 'LinkedIn' },
  { key: 'youtube', label: 'YouTube' },
  { key: 'pinterest', label: 'Pinterest' },
  { key: 'facebook', label: 'Facebook' },
]

const MAX_CHANNELS = 3

/**
 * Brand profile editor, aligned to the demo. Controlled state seeded from the
 * data layer. Tier-gated sections (sectors & applications, video links,
 * downloads, keywords = Plus+; channel coupling = Partner) use BrandTierGate.
 * Save posts the full BrandProfile to `POST .../profile` (mapped to WP there).
 */
export function BrandProfileForm({
  initial,
  tier,
}: {
  initial: BrandProfile
  tier: ManufacturerTier
}) {
  const [form, setForm] = useState<BrandProfile>({
    ...initial,
    country: resolveCountryCode(initial.country),
  })
  const [keywordDraft, setKeywordDraft] = useState('')
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const logoInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const [vatStatus, setVatStatus] = useState<'idle' | 'checking' | 'valid' | 'invalid'>('idle')
  const [vatError, setVatError] = useState<string | null>(null)
  const [vatTouched, setVatTouched] = useState(false)

  const canApplications = tierMeets(tier, 'plus')
  const canVideos = canManufacturerAccess(tier, 'Video link')
  const canDownloads = canManufacturerAccess(tier, 'PDF & EPD downloads')
  const canKeywords = tierMeets(tier, 'plus')
  const canChannels = tierMeets(tier, 'partner')

  const set = <K extends keyof BrandProfile>(key: K, value: BrandProfile[K]) =>
    setForm((f) => ({ ...f, [key]: value }))

  const setSocial = (key: keyof BrandSocialLinks, value: string) =>
    setForm((f) => ({ ...f, social: { ...f.social, [key]: value } }))

  const toggleChannel = (channel: string) =>
    setForm((f) => {
      if (f.channels.includes(channel)) {
        return { ...f, channels: f.channels.filter((c) => c !== channel) }
      }
      if (f.channels.length >= MAX_CHANNELS) return f
      return { ...f, channels: [...f.channels, channel] }
    })

  function addKeyword() {
    const kw = keywordDraft.trim()
    if (!kw || form.keywords.includes(kw)) return
    set('keywords', [...form.keywords, kw])
    setKeywordDraft('')
  }

  /** Upload one file via the scoped dashboard media endpoint → MaterialAsset. */
  async function uploadFile(
    file: File,
    context: 'image' | 'document' = 'image',
  ): Promise<MaterialAsset | null> {
    setSaveError(null)
    setUploading(true)
    try {
      const data = new FormData()
      data.append('file', file)
      data.append('brand_id', String(form.brandId))
      data.append('context', context)
      const res = await fetch('/api/dashboard/media', { method: 'POST', body: data })
      if (!res.ok) {
        const err = await res.json().catch(() => null)
        setSaveError(err?.message ?? 'Upload failed. Please try again.')
        return null
      }
      return (await res.json()) as MaterialAsset
    } catch {
      setSaveError('Upload failed. Please try again.')
      return null
    } finally {
      setUploading(false)
    }
  }

  async function handleLogoChange(file: File | null) {
    if (!file) return
    const asset = await uploadFile(file)
    if (!asset) return
    setForm((f) => ({ ...f, logoUrl: asset.url, logoName: asset.name, logoId: asset.id }))
    if (logoInputRef.current) logoInputRef.current.value = ''
  }

  const progress = useMemo(() => {
    const core = [form.brandName, form.description, form.website, form.email, form.country, form.city]
    const filled = core.filter((v) => v.trim() !== '').length
    return (filled / core.length) * 100
  }, [form])

  async function handleSave() {
    setSaving(true)
    setSaveError(null)
    try {
      const res = await fetch(`/api/dashboard/brands/${initial.brandId}/profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => null)
        setSaveError(
          err?.code === 'md_dashboard_forbidden'
            ? (err?.message ?? 'One of these fields needs a higher membership tier.')
            : err?.message ?? 'Could not save the brand profile. Please try again.',
        )
        return
      }
      router.refresh()
    } catch {
      setSaveError('Could not save the brand profile. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  useEffect(() => {
    if (!vatTouched) return

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
  }, [form.country, form.vatNumber, vatTouched])

  return (
    <>
      <CurrentPlanBanner tier={tier} />

      {/* Brand details + logo */}
      <div className="dash-panel">
        {saveError && <p className="form-error" role="alert">{saveError}</p>}
        <div className="brand-details-grid">
          <div className="brand-details-main">
            <Input label="Brand name" value={form.brandName} onChange={(e) => set('brandName', e.target.value)} />
            <Textarea label="Brand description" value={form.description} onChange={(e) => set('description', e.target.value)} rows={4} />
          </div>
          <div className="brand-logo-field">
            <span className="field-label">Logo</span>
            <div className="brand-logo-box">
              {form.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={form.logoUrl} alt="" className="brand-logo-img" />
              ) : (
                <span className="brand-logo-empty">
                  <IconImage size={18} />
                  <span className="brand-logo-name">{form.logoName ?? 'No logo yet'}</span>
                </span>
              )}
            </div>
            <input
              ref={logoInputRef}
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(e) => handleLogoChange(e.target.files?.[0] ?? null)}
            />
            <button
              type="button"
              className="btn btn-outline btn-block"
              onClick={() => logoInputRef.current?.click()}
              disabled={uploading}
            >
              <IconUpload size={16} /> {uploading ? 'Uploading…' : 'Choose logo'}
            </button>
            <p className="field-helper">JPEG, PNG, SVG or WebP.</p>
          </div>
        </div>
      </div>

      {/* Contact & company */}
      <div className="dash-panel">
        <h2 className="panel-section-title">Contact &amp; company</h2>
        <p className="panel-section-desc">Core company details used on the public brand page and in lead follow-up.</p>
        <div className="g2">
          <Input label="Website" value={form.website} onChange={(e) => set('website', e.target.value)} />
          <Input label="Email" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} />
        </div>
        <div className="g2">
          <Input label="Phone" value={form.phone} onChange={(e) => set('phone', e.target.value)} />
          <Select
            label="Country"
            value={form.country}
            placeholder="Select a country"
            onChange={(e) => {
              set('country', e.target.value)
              setVatTouched(true)
            }}
            options={COUNTRY_OPTIONS}
          />
        </div>
        <div className="g2">
          <Input label="Address line 1" value={form.addressLine1} onChange={(e) => set('addressLine1', e.target.value)} />
          <Input label="Address line 2" optional value={form.addressLine2} onChange={(e) => set('addressLine2', e.target.value)} />
        </div>
        <div className="g2">
          <Input label="Post code" value={form.postcode} onChange={(e) => set('postcode', e.target.value)} />
          <Input label="City" value={form.city} onChange={(e) => set('city', e.target.value)} />
        </div>
        <div className="g2">
          <div className="addr-field addr-field-wide">
            <label htmlFor="brand-vat">VAT number</label>
            <div className="checkout-vat-input-wrap">
              <input
                id="brand-vat"
                value={form.vatNumber}
                onChange={(e) => {
                  set('vatNumber', e.target.value)
                  setVatTouched(true)
                }}
                autoComplete="off"
                placeholder="e.g. NL123456789B01"
                className={`checkout-vat-input ${
                  vatStatus === 'valid' ? 'is-valid' : ''
                } ${vatStatus === 'invalid' ? 'is-invalid' : ''}`.trim()}
              />
              {vatStatus === 'checking' && <span className="checkout-vat-indicator">…</span>}
              {vatStatus === 'valid' && <span className="checkout-vat-indicator is-valid">✓</span>}
              {vatStatus === 'invalid' && <span className="checkout-vat-indicator is-invalid">!</span>}
            </div>
            {vatError && <p className="checkout-vat-error">{vatError}</p>}
          </div>
          <Input label="Chamber of Commerce number" value={form.chamberNumber} onChange={(e) => set('chamberNumber', e.target.value)} />
        </div>
      </div>

      {/* Social channels */}
      <div className="dash-panel">
        <h2 className="panel-section-title">Social channels</h2>
        <p className="panel-section-desc">Links shown on the brand page for people who want to discover more.</p>
        <div className="g3">
          {SOCIAL_FIELDS.map((s) => (
            <Input
              key={s.key}
              label={s.label}
              optional
              value={form.social[s.key]}
              onChange={(e) => setSocial(s.key, e.target.value)}
            />
          ))}
        </div>
      </div>

      {/* Sectors & applications — Plus+ */}
      <div className="dash-panel">
        <h2 className="panel-section-title">Sectors &amp; applications</h2>
        <p className="panel-section-desc">
          In which application areas are your products used? This makes your brand findable when specifiers
          filter by application — e.g. wall cladding, facade, or flooring.
        </p>
        {canApplications ? (
          <ApplicationPicker value={form.applications} onChange={(next) => set('applications', next)} />
        ) : (
          <BrandTierGate
            variant="page"
            required="plus"
            title="Sectors & applications"
            description="Help architects and designers find your brand by the applications you serve. Available from the Plus tier."
            upgradeHref="./membership"
          />
        )}
      </div>

      {/* Media — gallery (all tiers) + video links (Plus+) */}
      <div className="dash-panel">
        <h2 className="panel-section-title">Media</h2>
        <p className="panel-section-desc">Gallery images and video links displayed on your brand page.</p>
        <div className="media-grid">
          <div>
            <span className="field-subhead">Gallery images</span>
            <GalleryField
              value={form.gallery}
              onChange={(next) => set('gallery', next)}
              onUpload={(file) => uploadFile(file, 'image')}
              uploading={uploading}
            />
          </div>
          <div>
            <span className="field-subhead">Video links</span>
            {canVideos ? (
              <VideoLinksField value={form.videos} onChange={(next) => set('videos', next)} />
            ) : (
              <BrandTierGate
                variant="page"
                required="plus"
                title="Video links"
                description="Add YouTube or Vimeo links to your brand page. Available from the Plus tier."
                upgradeHref="./membership"
              />
            )}
          </div>
        </div>
      </div>

      {/* Downloads & brochures — Plus+ */}
      <div className="dash-panel">
        <h2 className="panel-section-title">Downloads &amp; brochures</h2>
        <p className="panel-section-desc">
          Upload company brochures, catalogues or sustainability reports. Visitors can download these directly from your brand page.
        </p>
        {canDownloads ? (
          <DownloadsField
            value={form.downloads}
            onChange={(next) => set('downloads', next)}
            onUpload={(file) => uploadFile(file, 'document')}
            uploading={uploading}
          />
        ) : (
          <BrandTierGate
            variant="page"
            required="plus"
            title="Downloads & brochures"
            description="Upload brochures, catalogues and sustainability reports. Available from the Plus tier."
            upgradeHref="./membership"
          />
        )}
      </div>

      {/* Keywords — Plus+ */}
      <div className="dash-panel">
        <h2 className="panel-section-title">Keywords</h2>
        {canKeywords ? (
          <>
            <p className="panel-section-desc">
              Add keywords to help visitors find your brand. Think of materials, applications, sectors or
              certifications. Keywords also apply to individual material pages.
            </p>
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

      {/* Channel coupling — Partner only */}
      <div className="dash-panel">
        <h2 className="panel-section-title">Channel coupling</h2>
        <p className="panel-section-desc">
          Link your brand to up to {MAX_CHANNELS} editorial channels. Your brand will appear on those channel pages,
          shown alongside curated materials, articles and talks.
        </p>
        {canChannels ? (
          <>
            <span className="field-subhead">Select up to {MAX_CHANNELS} channels</span>
            <div className="chip-group">
              {MATERIAL_CHANNEL_LABELS.map((channel) => {
                const selected = form.channels.includes(channel)
                const atMax = !selected && form.channels.length >= MAX_CHANNELS
                return (
                  <button
                    key={channel}
                    type="button"
                    className={`chip ${selected ? 'is-on' : ''}`}
                    aria-pressed={selected}
                    disabled={atMax}
                    onClick={() => toggleChannel(channel)}
                  >
                    {channel}
                    {selected && <IconCheck size={12} className="chip-check" aria-hidden="true" />}
                  </button>
                )
              })}
            </div>

            <div className="active-channel-links">
              <span className="field-subhead">Active channel links</span>
              {form.channels.length === 0 ? (
                <p className="field-helper">No channels linked yet.</p>
              ) : (
                <div className="chip-group">
                  {form.channels.map((c) => (
                    <span key={c} className="chip is-active-link">{c}</span>
                  ))}
                </div>
              )}
              <p className="field-helper">Your brand will appear on these channel pages within 24 hours of saving.</p>
            </div>
          </>
        ) : (
          <BrandTierGate
            variant="page"
            required="partner"
            title="Channel coupling"
            description="Link your brand to editorial channels so it appears on channel pages alongside relevant materials, articles and talks. Available on the Partner tier."
            upgradeHref="./membership"
          />
        )}
      </div>

      <DashboardStickyFooter progress={progress} saving={saving} onSave={handleSave} />
    </>
  )
}
