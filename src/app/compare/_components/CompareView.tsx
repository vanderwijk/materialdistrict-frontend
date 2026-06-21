'use client'

/**
 * CompareView — de interactieve vergelijk-tabel op `/compare`.
 * ----------------------------------------------------------------------
 * De pagina ligt buiten de CompareProvider, dus de URL (`?ids=`) is de
 * bron. De server haalt de materials op en seedt deze component; lokale
 * state stuurt de weergave. Verwijderen/legen werkt op de lokale lijst en
 * synct de URL (history.replaceState, geen re-fetch/flits).
 *
 * Per facet hergebruiken we exact de detail-page-helpers
 * (`getAllPropertyGroups` + de semantic-pill-kleuren), zodat de
 * vergelijking dezelfde taal spreekt als de materiaal-pagina.
 *
 * Compare is een Insider-feature: niet-leden die hier via een directe link
 * belanden, krijgen een lichte guard (geen blur-paywall).
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/components/providers/AuthContext'
import {
  getAllPropertyGroups,
  type GroupedPropertyEntry,
} from '@/lib/utils/material-properties'
import type { MaterialListItem } from '@/types/material'

type CompareMaterial = Pick<
  MaterialListItem,
  'id' | 'slug' | 'title' | 'brandName' | 'materialCode' | 'hero' | 'properties'
>

export function CompareView({
  initialMaterials,
}: {
  initialMaterials: CompareMaterial[]
}) {
  const router = useRouter()
  const { isMember } = useAuth()
  const [materials, setMaterials] = useState<CompareMaterial[]>(initialMaterials)

  const syncUrl = (next: CompareMaterial[]) => {
    const ids = next.map((m) => m.id).join(',')
    const url = ids ? `/compare?ids=${ids}` : '/compare'
    window.history.replaceState(null, '', url)
  }

  const remove = (id: number) => {
    setMaterials((prev) => {
      const next = prev.filter((m) => m.id !== id)
      syncUrl(next)
      return next
    })
  }

  const clearAll = () => {
    setMaterials([])
    window.history.replaceState(null, '', '/compare')
  }

  // ------------------------------------------------------------------
  // Insider-guard (licht) — geen blur-paywall.
  // ------------------------------------------------------------------
  if (!isMember) {
    return (
      <div className="compare-guard">
        <h1 className="compare-guard-title">Compare materials</h1>
        <p className="compare-guard-text">
          Side-by-side material comparison is an Insider feature. Become an
          Insider to line up sensorial, technical and environmental properties
          across materials.
        </p>
        <div className="compare-guard-actions">
          <Link href="/membership" className="compare-guard-cta">
            Become an Insider
          </Link>
          <Link href="/material" className="compare-guard-link">
            Browse materials
          </Link>
        </div>
      </div>
    )
  }

  // ------------------------------------------------------------------
  // Lege staat — minder dan 2 materials.
  // ------------------------------------------------------------------
  if (materials.length < 2) {
    return (
      <div className="compare-empty">
        <h1 className="compare-empty-title">Material comparison</h1>
        <p className="compare-empty-text">
          {materials.length === 0
            ? 'Add at least two materials to start comparing.'
            : 'Add one more material to start comparing.'}
        </p>
        <Link href="/material" className="compare-empty-cta">
          Browse materials
        </Link>
      </div>
    )
  }

  // ------------------------------------------------------------------
  // De tabel.
  // ------------------------------------------------------------------
  const perMaterialGroups = materials.map((m) =>
    getAllPropertyGroups(m.properties),
  )
  const gridStyle = {
    gridTemplateColumns: `minmax(150px, 210px) repeat(${materials.length}, minmax(0, 1fr))`,
  }

  return (
    <div className="compare-page">
      <div className="compare-head">
        <h1 className="compare-title">Material comparison</h1>
        <div className="compare-actions">
          <Link href="/material" className="compare-action">
            + Add material
          </Link>
          <button
            type="button"
            className="compare-action"
            onClick={() => window.print()}
          >
            Export PDF
          </button>
          <button
            type="button"
            className="compare-action is-danger"
            onClick={clearAll}
          >
            Clear all
          </button>
        </div>
      </div>

      <div className="compare-grid" style={gridStyle}>
        {/* Header-rij: lege hoek + materiaal-kop-kaarten */}
        <div className="compare-corner" />
        {materials.map((m) => (
          <div key={m.id} className="compare-mat-head">
            <button
              type="button"
              className="compare-mat-remove"
              onClick={() => remove(m.id)}
              aria-label={`Remove ${m.title}`}
            >
              ×
            </button>
            <div className="compare-mat-thumb">
              {m.hero?.sourceUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={m.hero.sourceUrl} alt={m.hero.alt || m.title} />
              ) : (
                <span className="compare-mat-thumb-empty" aria-hidden="true" />
              )}
            </div>
            <div className="compare-mat-name">{m.title}</div>
            {m.brandName && (
              <div className="compare-mat-brand">{m.brandName}</div>
            )}
            {m.materialCode && (
              <div className="compare-mat-code">{m.materialCode}</div>
            )}
            <Link href={`/material/${m.slug}`} className="compare-mat-view">
              View material →
            </Link>
          </div>
        ))}

        {/* General — altijd aanwezig */}
        <CompareSection label="General" span={materials.length} />
        <CompareRow label="Brand">
          {materials.map((m) => (
            <CompareCell key={m.id} value={m.brandName ?? 'Not specified'} />
          ))}
        </CompareRow>
        <CompareRow label="Material code">
          {materials.map((m) => (
            <CompareCell key={m.id} value={m.materialCode ?? 'Not specified'} />
          ))}
        </CompareRow>

        {/* Eigenschap-groepen (sensorial / technical / environmental / content) */}
        {perMaterialGroups[0].map((group, gi) => (
          <GroupBlock
            key={group.group}
            label={group.label}
            span={materials.length}
            facetCount={group.entries.length}
            entryAt={(fi) =>
              perMaterialGroups.map((groups) => groups[gi].entries[fi])
            }
          />
        ))}

        {/* Get in touch */}
        <CompareSection label="Interested?" span={materials.length} />
        <div className="compare-row-label compare-row-label--cta">
          Get in touch
        </div>
        {materials.map((m) => (
          <div key={m.id} className="compare-cell compare-cell--cta">
            <Link
              href={`/material/${m.slug}`}
              className="compare-getintouch"
            >
              Get in touch
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}

// --------------------------------------------------------------------
// Sub-componenten
// --------------------------------------------------------------------

function CompareSection({ label, span }: { label: string; span: number }) {
  return (
    <div
      className="compare-section"
      style={{ gridColumn: `1 / span ${span + 1}` }}
    >
      {label}
    </div>
  )
}

function CompareRow({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <>
      <div className="compare-row-label">{label}</div>
      {children}
    </>
  )
}

function CompareCell({ value }: { value: string }) {
  return <div className="compare-cell">{value}</div>
}

function GroupBlock({
  label,
  span,
  facetCount,
  entryAt,
}: {
  label: string
  span: number
  facetCount: number
  entryAt: (facetIndex: number) => GroupedPropertyEntry[]
}) {
  return (
    <>
      <CompareSection label={label} span={span} />
      {Array.from({ length: facetCount }).map((_, fi) => {
        const entries = entryAt(fi)
        return (
          <CompareRow key={entries[0].facet} label={entries[0].facetLabel}>
            {entries.map((entry, mi) => (
              <div key={mi} className="compare-cell">
                <span className={`compare-val is-${entry.semantic}`}>
                  {entry.displayValue}
                </span>
              </div>
            ))}
          </CompareRow>
        )
      })}
    </>
  )
}
