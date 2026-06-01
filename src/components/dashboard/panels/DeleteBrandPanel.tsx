'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/form'
import { IconDelete } from '@/components/ui/icons'

/**
 * Delete-brand confirmation. Requires typing the exact brand name to enable
 * the destructive action — guards against accidental deletion. Stubs the
 * delete endpoint and returns to the personal profile afterwards.
 */
export function DeleteBrandPanel({ brandName }: { brandName: string }) {
  const router = useRouter()
  const [confirm, setConfirm] = useState('')
  const [deleting, setDeleting] = useState(false)
  const matches = confirm.trim() === brandName

  async function handleDelete() {
    if (!matches) return
    setDeleting(true)
    await new Promise((r) => setTimeout(r, 500))
    router.push('/dashboard/profile')
  }

  return (
    <div className="dash-panel danger-panel">
      <h2 className="panel-section-title">Delete this brand</h2>
      <p className="panel-section-desc">
        This permanently removes <strong>{brandName}</strong>, its materials and its statistics.
        This cannot be undone.
      </p>
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
