'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/form'
import { IconDelete } from '@/components/ui/icons'

/**
 * Delete-brand confirmation. Requires typing the exact brand name to enable
 * the destructive action — guards against accidental deletion. Calls the
 * delete proxy and returns to the personal profile afterwards.
 */
export function DeleteBrandPanel({
  brandId,
  brandName,
}: {
  brandId: number
  brandName: string
}) {
  const router = useRouter()
  const [confirm, setConfirm] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const matches = confirm.trim() === brandName

  async function handleDelete() {
    if (!matches) return
    setDeleting(true)
    setError(null)
    try {
      const res = await fetch(`/api/dashboard/brands/${brandId}`, { method: 'DELETE' })
      if (!res.ok) {
        const err = await res.json().catch(() => null)
        setError(err?.message ?? 'Could not delete the brand. Please try again.')
        setDeleting(false)
        return
      }
      // Brand gone → refresh so the sidebar/auth drop it, then leave the scope.
      router.push('/dashboard/profile')
      router.refresh()
    } catch {
      setError('Could not delete the brand. Please try again.')
      setDeleting(false)
    }
  }

  return (
    <div className="dash-panel danger-panel">
      <h2 className="panel-section-title">Delete this brand</h2>
      <p className="panel-section-desc">
        This permanently removes <strong>{brandName}</strong>, its materials and its statistics.
        This cannot be undone.
      </p>
      {error && <p className="form-error" role="alert">{error}</p>}
      <Input
        label={`Type "${brandName}" to confirm`}
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
      />
      <button
        type="button"
        className="btn btn-danger delete-brand-btn"
        disabled={!matches || deleting}
        onClick={handleDelete}
      >
        <IconDelete size={16} /> {deleting ? 'Deleting…' : 'Delete brand permanently'}
      </button>
    </div>
  )
}
