/**
 * `/channels/[slug]` hub — loading skeleton (stap 12).
 *
 * Matcht de hub-layout: een hero-band gevolgd door enkele type-strips
 * (sectiekop + kaart-grid), zodat er geen layout-shift is wanneer de echte
 * content binnenkomt.
 */

import { Skeleton } from '@/components/ui'

const STRIPS = [0, 1]
const CARDS = Array.from({ length: 4 }, (_, i) => i)

export default function ChannelHubLoading() {
  return (
    <div aria-busy="true" aria-live="polite">
      {/* Hero-band */}
      <div
        style={{
          background: 'var(--surface2)',
          padding: '64px var(--content-padding-desktop)',
        }}
      >
        <div style={{ maxWidth: 'var(--max-width)', margin: '0 auto' }}>
          <Skeleton width="80px" height="12px" />
          <Skeleton variant="title" width="280px" />
          <Skeleton width="60%" height="18px" />
        </div>
      </div>

      <div className="ov-wrap-single">
        {STRIPS.map((s) => (
          <section key={s} className="channel-strip">
            <div className="channel-strip-head">
              <Skeleton variant="title" width="160px" />
              <Skeleton width="140px" height="14px" />
            </div>
            <div className="ov-grid-4">
              {CARDS.map((c) => (
                <div
                  key={c}
                  style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)',
                    overflow: 'hidden',
                  }}
                >
                  <div className="card-thumb" aria-hidden="true" />
                  <div style={{ padding: '16px' }}>
                    <Skeleton variant="title" width="70%" />
                    <Skeleton width="45%" />
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
