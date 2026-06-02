'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input, Textarea } from '@/components/ui/form'
import { IconAdd } from '@/components/ui/icons'
import type { BrandCandidate } from '@/types/dashboard'

/**
 * Add-brand onboarding. The person either claims an existing brand (matched on
 * e-mail domain → `POST /brands/claim`) or requests a brand-new one
 * (`POST /brands/request-new`). Candidate search filters the list client-side.
 */
export function AddBrandPanel({ candidates }: { candidates: BrandCandidate[] }) {
  const router = useRouter()
  const [query, setQuery] = useState('')

  // Claim state
  const [claimingId, setClaimingId] = useState<number | null>(null)
  const [claimedIds, setClaimedIds] = useState<number[]>([])
  const [claimError, setClaimError] = useState<string | null>(null)

  // Request-new state
  const [showRequest, setShowRequest] = useState(false)
  const [reqForm, setReqForm] = useState({ name: '', website: '', email: '', message: '' })
  const [requesting, setRequesting] = useState(false)
  const [requestSent, setRequestSent] = useState(false)
  const [requestError, setRequestError] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return candidates
    return candidates.filter(
      (c) => c.name.toLowerCase().includes(q) || c.domain.toLowerCase().includes(q),
    )
  }, [candidates, query])

  async function claim(id: number) {
    setClaimingId(id)
    setClaimError(null)
    try {
      const res = await fetch('/api/dashboard/brands/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brandId: id }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => null)
        setClaimError(
          err?.code === 'md_dashboard_forbidden'
            ? 'This brand is already managed by someone else, or its domain does not match your account.'
            : err?.message ?? 'Could not claim this brand. Please try again.',
        )
        return
      }
      setClaimedIds((ids) => [...ids, id])
      // The brand now belongs to this user — refresh so the sidebar picks it up.
      router.refresh()
    } catch {
      setClaimError('Could not claim this brand. Please try again.')
    } finally {
      setClaimingId(null)
    }
  }

  async function submitRequest() {
    if (!reqForm.name.trim()) {
      setRequestError('A brand name is required.')
      return
    }
    setRequesting(true)
    setRequestError(null)
    try {
      const res = await fetch('/api/dashboard/brands/request-new', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reqForm),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => null)
        setRequestError(err?.message ?? 'Could not send your request. Please try again.')
        return
      }
      setRequestSent(true)
    } catch {
      setRequestError('Could not send your request. Please try again.')
    } finally {
      setRequesting(false)
    }
  }

  return (
    <>
      <div className="dash-panel">
        <h2 className="panel-section-title">Claim an existing brand</h2>
        <p className="panel-section-desc">
          We matched these brands to your account domain. Claim the one you represent.
        </p>
        {claimError && <p className="form-error" role="alert">{claimError}</p>}
        <Input
          label="Search brands"
          placeholder="Search by name or domain"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        <ul className="candidate-list">
          {filtered.map((c) => {
            const claimed = claimedIds.includes(c.id)
            return (
              <li key={c.id} className="candidate-row">
                <span className="candidate-logo">{c.logoLabel}</span>
                <div className="candidate-main">
                  <span className="candidate-name">{c.name}</span>
                  <span className="candidate-domain">{c.domain}</span>
                </div>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  disabled={claimed || claimingId === c.id}
                  onClick={() => claim(c.id)}
                >
                  {claimed ? 'Claimed' : claimingId === c.id ? 'Claiming…' : 'Claim'}
                </button>
              </li>
            )
          })}
          {filtered.length === 0 && <li className="field-helper">No matching brands.</li>}
        </ul>
      </div>

      <div className="dash-panel">
        <h2 className="panel-section-title">Create a new brand</h2>
        <p className="panel-section-desc">Not in the list? Request a new brand profile.</p>

        {requestSent ? (
          <p className="field-helper">
            Thanks — your request has been sent. We&apos;ll review it and get back to you.
          </p>
        ) : !showRequest ? (
          <button type="button" className="btn btn-primary" onClick={() => setShowRequest(true)}>
            <IconAdd size={16} /> Request new brand
          </button>
        ) : (
          <>
            {requestError && <p className="form-error" role="alert">{requestError}</p>}
            <Input
              label="Brand name"
              value={reqForm.name}
              onChange={(e) => setReqForm((f) => ({ ...f, name: e.target.value }))}
            />
            <Input
              label="Website"
              value={reqForm.website}
              onChange={(e) => setReqForm((f) => ({ ...f, website: e.target.value }))}
            />
            <Input
              label="Contact e-mail"
              value={reqForm.email}
              onChange={(e) => setReqForm((f) => ({ ...f, email: e.target.value }))}
            />
            <Textarea
              label="Message (optional)"
              value={reqForm.message}
              onChange={(e) => setReqForm((f) => ({ ...f, message: e.target.value }))}
              rows={3}
            />
            <button
              type="button"
              className="btn btn-primary"
              disabled={requesting}
              onClick={submitRequest}
            >
              {requesting ? 'Sending…' : 'Send request'}
            </button>
          </>
        )}
      </div>
    </>
  )
}
