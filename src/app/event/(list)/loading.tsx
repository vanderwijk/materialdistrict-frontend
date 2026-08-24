/**
 * Events overzicht — loading skeleton.
 *
 * Sessie 8.
 *
 * Gerendered tijdens de eerste server-render van `/event` (RSC suspend) en
 * bij hard-refresh/deeplink. Matcht de echte page: page-header + channel-bar-
 * strook + event-card-grid.
 */

import { Skeleton } from '@/components/ui'

const SKELETON_CARDS = Array.from({ length: 6 }, (_, i) => i)

export default function EventsLoading() {
  return (
    <>
      <header className="ov-page-header">
        <div className="ov-page-header-main">
          <Skeleton width="100px" height="14px" />
          <Skeleton variant="title" width="160px" />
        </div>
      </header>

      <div className="channel-bar" aria-hidden="true">
        <div className="channel-bar-inner">
          <Skeleton width="60px" height="16px" />
        </div>
      </div>

      <div className="ov-wrap-full" aria-busy="true" aria-live="polite">
        <div className="ov-grid-3">
          {SKELETON_CARDS.map((i) => (
            <div
              key={i}
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
              }}
            >
              <Skeleton width="100%" height="120px" />
              <div style={{ padding: '14px 16px 16px' }}>
                <Skeleton width="30%" />
                <Skeleton variant="title" width="80%" />
                <Skeleton width="50%" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
