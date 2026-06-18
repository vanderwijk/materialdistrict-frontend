'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input, Textarea, Select } from '@/components/ui/form'
import { BrandTierGate } from '@/components/ui/BrandTierGate'
import { DashboardStickyFooter } from '../DashboardStickyFooter'
import { FormStateProvider } from '@/components/ui/form/FormStateContext'
import { CurrentPlanBanner } from '../CurrentPlanBanner'
import {
  ApplicationPicker,
  ChannelPicker,
  DownloadsField,
  VideoLinksField,
  GalleryField,
} from '../fields'
import { CropModal } from '../fields/CropModal'
import { IconAdd, IconClose, IconUpload, IconImage } from '@/components/ui/icons'
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
  const [logoCropFile, setLogoCropFile] = useState<File | null>(null)
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

  // Logo wordt vierkant (1:1) bijgesneden vóór upload. SVG kan niet naar canvas
  // en gaat ongecropt door.
  function onLogoPick(file: File | null) {
    if (logoInputRef.current) logoInputRef.current.value = ''
    if (!file) return
    if (file.type === 'image/svg+xml') {
      void handleLogoChange(file)
      return
    }
    setLogoCropFile(file)
  }

  const progress = useMemo(() => {
    const core = [form.brandName, form.description, form.website, form.email, form.country, form.city]
    const filled = core.filter((v) => v.trim() !== '').length
    return (filled / core.length) * 100
  }, [form])

  // Verplichte velden voor een merkprofiel: kerngegevens, volledig adres én logo.
  const requiredComplete =
    form.brandName.trim() !== '' &&
    form.description.trim() !== '' &&
    form.website.trim() !== '' &&
    form.email.trim() !== '' &&
    form.phone.trim() !== '' &&
    form.country.trim() !== '' &&
    form.addressLine1.trim() !== '' &&
    form.postcode.trim() !== '' &&
    form.city.trim() !== '' &&
    Boolean(form.logoUrl)

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
    <FormStateProvider>
      <CurrentPlanBanner tier={tier} />

      {/* Brand details + logo */}
      <div className="dash-panel">
        {saveError && <p className="form-error" role="alert">{saveError}</p>}
        <div className="brand-details-grid">
          <div className="brand-details-main">
            <Input label="Brand name" required value={form.brandName} onChange={(e) => set('brandName', e.target.value)} />
            <Textarea label="Brand description" required minChars={500} value={form.description} onChange={(e) => set('description', e.target.value)} rows={4} />
          </div>
          <div className="brand-logo-field">
            <label htmlFor="brand-logo-input" className="field-label">Logo <span className="field-required" aria-hidden="true">*</span></label>
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
              id="brand-logo-input"
              ref={logoInputRef}
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(e) => onLogoPick(e.target.files?.[0] ?? null)}
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
          <Input label="Website" required value={form.website} onChange={(e) => set('website', e.target.value)} />
          <Input label="Email" type="email" required value={form.email} onChange={(e) => set('email', e.target.value)} />
        </div>
        <div className="g2">
          <Input label="Phone" required value={form.phone} onChange={(e) => set('phone', e.target.value)} />
          <Select
            label="Country"
            required
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
          <Input label="Address line 1" required value={form.addressLine1} onChange={(e) => set('addressLine1', e.target.value)} />
          <Input label="Address line 2" optional value={form.addressLine2} onChange={(e) => set('addressLine2', e.target.value)} />
        </div>
        <div className="g2">
          <Input label="Post code" required value={form.postcode} onChange={(e) => set('postcode', e.target.value)} />
          <Input label="City" required value={form.city} onChange={(e) => set('city', e.target.value)} />
        </div>
        <div className="g2">
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
          <Input label="Chamber of Commerce number" optional value={form.chamberNumber} onChange={(e) => set('chamberNumber', e.target.value)} />
        </div>
      </div>

      {/* Sectors & applications — Plus+ (boven Social: belangrijker) */}
      {canApplications ? (
        <div className="dash-panel">
          <h2 className="panel-section-title">Sectors &amp; applications</h2>
          <p className="panel-section-desc">
            In which application areas are your products used? This makes your brand findable when specifiers
            filter by application — e.g. wall cladding, facade, or flooring.
          </p>
          <ApplicationPicker value={form.applications} onChange={(next) => set('applications', next)} />
        </div>
      ) : (
        <BrandTierGate
          variant="section"
          required="plus"
          className="dash-panel"
          title="Sectors & applications"
          description="Help architects and designers find your brand by the applications you serve. Available from the Plus tier."
          upgradeHref="./membership"
        >
          <h2 className="panel-section-title">Sectors &amp; applications</h2>
          <p className="panel-section-desc">
            In which application areas are your products used? This makes your brand findable when specifiers
            filter by application — e.g. wall cladding, facade, or flooring.
          </p>
          <ApplicationPicker value={form.applications} onChange={() => {}} />
        </BrandTierGate>
      )}

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
            {canVideos ? (
              <>
                <span className="field-subhead">Video links</span>
                <VideoLinksField value={form.videos} onChange={(next) => set('videos', next)} />
              </>
            ) : (
              <BrandTierGate
                variant="section"
                required="plus"
                title="Video links"
                description="Add YouTube or Vimeo links to your brand page. Available from the Plus tier."
                upgradeHref="./membership"
              >
                <span className="field-subhead">Video links</span>
                <div className="asset-list" aria-hidden="true">
                  <div className="asset-row"><span className="asset-row-main"><span className="asset-row-label">https://youtube.com/watch?v=…</span></span></div>
                  <div className="asset-row"><span className="asset-row-main"><span className="asset-row-label">https://vimeo.com/…</span></span></div>
                </div>
              </BrandTierGate>
            )}
          </div>
        </div>
      </div>

      {/* Downloads & brochures — Plus+ */}
      {canDownloads ? (
        <div className="dash-panel">
          <h2 className="panel-section-title">Downloads &amp; brochures</h2>
          <p className="panel-section-desc">
            Upload company brochures, catalogues or sustainability reports. Visitors can download these directly from your brand page.
          </p>
          <DownloadsField
            value={form.downloads}
            onChange={(next) => set('downloads', next)}
            onUpload={(file) => uploadFile(file, 'document')}
            uploading={uploading}
          />
        </div>
      ) : (
        <BrandTierGate
          variant="section"
          required="plus"
          className="dash-panel"
          title="Downloads & brochures"
          description="Upload brochures, catalogues and sustainability reports. Available from the Plus tier."
          upgradeHref="./membership"
        >
          <h2 className="panel-section-title">Downloads &amp; brochures</h2>
          <p className="panel-section-desc">
            Upload company brochures, catalogues or sustainability reports. Visitors can download these directly from your brand page.
          </p>
          <div className="asset-list" aria-hidden="true">
            <div className="asset-row"><span className="asset-row-main"><span className="asset-row-label">Company brochure.pdf</span></span></div>
            <div className="asset-row"><span className="asset-row-main"><span className="asset-row-label">Sustainability report.pdf</span></span></div>
          </div>
        </BrandTierGate>
      )}

      {/* Keywords — Plus+ */}
      {canKeywords ? (
        <div className="dash-panel">
          <h2 className="panel-section-title">Keywords</h2>
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
            <button type="button" className="btn btn-primary" onClick={addKeyword} disabled={!keywordDraft.trim()}>
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
        </div>
      ) : (
        <BrandTierGate
          variant="section"
          required="plus"
          className="dash-panel"
          title="Keywords"
          description="Add discovery keywords to your brand and materials so buyers find you faster. Available from the Plus tier."
          upgradeHref="./membership"
        >
          <h2 className="panel-section-title">Keywords</h2>
          <p className="panel-section-desc">
            Add keywords to help visitors find your brand. Think of materials, applications, sectors or
            certifications. Keywords also apply to individual material pages.
          </p>
          <div className="chip-group" aria-hidden="true">
            <span className="chip is-on">sustainable</span>
            <span className="chip is-on">FSC</span>
            <span className="chip">recycled</span>
            <span className="chip">acoustic</span>
          </div>
        </BrandTierGate>
      )}

      {/* Channel coupling — Partner only */}
      {canChannels ? (
        <div className="dash-panel">
          <h2 className="panel-section-title">Channel coupling</h2>
          <p className="panel-section-desc">
            Link your brand to up to {MAX_CHANNELS} editorial channels. Your brand will appear on those channel pages,
            shown alongside curated materials, articles and talks.
          </p>
          <ChannelPicker
            options={MATERIAL_CHANNEL_LABELS}
            value={form.channels}
            onChange={(next) => set('channels', next)}
            max={MAX_CHANNELS}
            note="Your brand will appear on these channel pages within 24 hours of saving."
          />
        </div>
      ) : (
        <BrandTierGate
          variant="section"
          required="partner"
          className="dash-panel"
          title="Channel coupling"
          description="Link your brand to editorial channels so it appears on channel pages alongside relevant materials, articles and talks. Available on the Partner tier."
          upgradeHref="./membership"
        >
          <h2 className="panel-section-title">Channel coupling</h2>
          <p className="panel-section-desc">
            Link your brand to up to {MAX_CHANNELS} editorial channels. Your brand will appear on those channel pages,
            shown alongside curated materials, articles and talks.
          </p>
          <div className="chip-group" aria-hidden="true">
            <span className="chip is-on">Biobased</span>
            <span className="chip">Acoustic</span>
            <span className="chip is-on">Sustainability</span>
            <span className="chip">Lighting</span>
            <span className="chip">Surfaces</span>
          </div>
        </BrandTierGate>
      )}

      {logoCropFile && (
        <CropModal
          file={logoCropFile}
          aspect={1}
          title="Crop logo"
          onCancel={() => setLogoCropFile(null)}
          onConfirm={(cropped) => {
            setLogoCropFile(null)
            void handleLogoChange(cropped)
          }}
        />
      )}

      <DashboardStickyFooter progress={progress} saving={saving} invalid={!requiredComplete} onSave={handleSave} />
    </FormStateProvider>
  )
}
