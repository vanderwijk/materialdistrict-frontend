'use client'

import { useMemo, useState } from 'react'
import { Input } from '@/components/ui/form'
import { IconAdd } from '@/components/ui/icons'
import type { BrandCandidate } from '@/types/dashboard'

/**
 * Add-brand onboarding. The person either claims an existing brand (matched on
 * e-mail domain) or requests a brand-new one. Both submit stubs until the
 * brand-claim / create endpoints land. Search filters the candidate list
 * client-side.
 */
export function AddBrandPanel({ candidates }: { candidates: BrandCandidate[] }) {
  const [query, setQuery] = useState('')
  const [requested, setRequested] = useState<number | null>(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return candidates
    return candidates.filter(
      (c) => c.name.toLowerCase().includes(q) || c.domain.toLowerCase().includes(q),
    )
  }, [candidates, query])

  return (
    <>
      <div className="dash-panel">
        <h2 className="panel-section-title">Claim an existing brand</h2>
        <p className="panel-section-desc">
          We matched these brands to your account domain. Claim the one you represent.
        </p>
        <Input
          label="Search brands"
          placeholder="Search by name or domain"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        <ul className="candidate-list">
          {filtered.map((c) => (
            <li key={c.id} className="candidate-row">
              <span className="candidate-logo">{c.logoLabel}</span>
              <div className="candidate-main">
                <span className="candidate-name">{c.name}</span>
                <span className="candidate-domain">{c.domain}</span>
              </div>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                disabled={requested === c.id}
                onClick={() => setRequested(c.id)}
              >
                {requested === c.id ? 'Requested' : 'Claim'}
              </button>
            </li>
          ))}
          {filtered.length === 0 && <li className="field-helper">No matching brands.</li>}
        </ul>
      </div>

      <div className="dash-panel">
        <h2 className="panel-section-title">Create a new brand</h2>
        <p className="panel-section-desc">Not in the list? Request a new brand profile.</p>
        <button type="button" className="btn btn-primary">
          <IconAdd size={16} /> Request new brand
        </button>
      </div>
    </>
  )
}
