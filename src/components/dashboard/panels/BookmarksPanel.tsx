'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import type { CSSProperties } from 'react'
import { Tabs, TabItem } from '@/components/ui/Tabs'
import { EmptyState } from '@/components/ui/EmptyState'
import { IconDelete, IconSave } from '@/components/ui/icons'
import type { BookmarkItem, BookmarkType } from '@/types/dashboard'

const TYPE_LABEL: Record<BookmarkType, string> = {
  materials: 'Materials',
  articles: 'Articles',
  brands: 'Brands',
  talks: 'Talks',
  events: 'Events',
  books: 'Books',
}

/**
 * Bookmarks panel. Tabs are derived from the content types actually present;
 * an "All" tab shows everything. Removal is optimistic local state until
 * `DELETE /md/v2/dashboard/bookmarks/{id}` exists.
 */
export function BookmarksPanel({ initial }: { initial: BookmarkItem[] }) {
  const [items, setItems] = useState(initial)
  const [tab, setTab] = useState<'all' | BookmarkType>('all')

  const types = useMemo(() => {
    const present = new Set<BookmarkType>()
    items.forEach((i) => present.add(i.type))
    return Array.from(present)
  }, [items])

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: items.length }
    items.forEach((i) => {
      c[i.type] = (c[i.type] ?? 0) + 1
    })
    return c
  }, [items])

  const visible = tab === 'all' ? items : items.filter((i) => i.type === tab)

  async function remove(id: string) {
    const prev = items
    setItems((list) => list.filter((i) => i.id !== id)) // optimistic
    try {
      const res = await fetch(`/api/dashboard/bookmarks/${id}`, { method: 'DELETE' })
      if (!res.ok) setItems(prev) // revert
    } catch {
      setItems(prev)
    }
  }

  if (items.length === 0) {
    return (
      <div className="dash-panel">
        <EmptyState
          icon={<IconSave size={28} />}
          title="No bookmarks yet"
          description="Save materials, articles and brands to find them back here."
          actions={
            <Link href="/material" className="btn btn-primary">
              Browse materials
            </Link>
          }
        />
      </div>
    )
  }

  return (
    <div className="dash-panel">
      <Tabs value={tab} onChange={(v) => setTab(v as typeof tab)} ariaLabel="Bookmark type">
        <TabItem value="all" count={counts.all}>All</TabItem>
        {types.map((t) => (
          <TabItem key={t} value={t} count={counts[t]}>
            {TYPE_LABEL[t]}
          </TabItem>
        ))}
      </Tabs>

      <div className="bm-grid">
        {visible.map((item) => {
          const cover = { '--cover': item.gradient ?? 'var(--surface2)' } as CSSProperties
          return (
            <article key={item.id} className="bm-card">
              <Link href={item.href} className="bm-cover" style={cover} aria-hidden="true" tabIndex={-1}>
                {item.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.imageUrl} alt="" />
                )}
              </Link>
              <div className="bm-body">
                <span className="tag">{item.label}</span>
                <h3 className="bm-title">
                  <Link href={item.href}>{item.title}</Link>
                </h3>
              </div>
              <button
                type="button"
                className="bm-remove"
                onClick={() => remove(item.id)}
                aria-label={`Remove ${item.title} from bookmarks`}
              >
                <IconDelete size={16} />
              </button>
            </article>
          )
        })}
      </div>
    </div>
  )
}
