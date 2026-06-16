/**
 * `/channel` index — loading skeleton (stap 12).
 *
 * Gerenderd tijdens de eerste server-render (RSC suspend) en bij
 * hard-refresh/deeplink. Layout matched de echte page: page-header +
 * `ov-grid-3` met kaart-skeletons, zodat er geen layout-shift is wanneer de
 * echte channel-kaarten binnenkomen. Skeleton-tiles gebruiken dezelfde
 * inline-token-styling als de overige overzicht-loadings.
 */

import { Skeleton } from '@/components/ui'

const SKELETON_CARDS = Array.from({ length: 9 }, (_, i) => i)

export default function ChannelsLoading() {
  return (
    <>
      <header className="ov-page-header">
        <div className="ov-page-header-main">
          <Skeleton width="100px" height="14px" />
          <Skeleton variant="title" width="180px" />
          <Skeleton width="320px" height="16px" />
        </div>
      </header>

      <div className="ov-wrap-single" aria-busy="true" aria-live="polite">
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
              <div className="card-thumb" aria-hidden="true" />
              <div style={{ padding: '16px' }}>
                <Skeleton variant="title" width="60%" />
                <Skeleton width="90%" />
                <Skeleton width="75%" />
                <Skeleton width="35%" height="11px" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
