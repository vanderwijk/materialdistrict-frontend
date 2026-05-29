/**
 * Homepage — loading skeleton (sessie 10).
 *
 * Gerendered tijdens de eerste server-render van `/` (RSC suspend) en bij
 * hard-refresh. Benadert de echte layout: hero-balk + twee content-grids +
 * sticky sidebar. Gebruikt uitsluitend bestaande klassen + <Skeleton> —
 * geen inline styles.
 */

import { Skeleton } from '@/components/ui'

const CARDS = Array.from({ length: 3 }, (_, i) => i)
const SIDE = Array.from({ length: 5 }, (_, i) => i)

export default function HomeLoading() {
  return (
    <div aria-busy="true" aria-live="polite">
      <div className="hero hero-skeleton" aria-hidden="true">
        <div className="hero-inner">
          <div className="hero-left">
            <Skeleton width="120px" height="12px" />
            <Skeleton variant="title" width="80%" />
            <Skeleton width="60%" />
          </div>
        </div>
      </div>

      <div className="hp-main">
        <div className="hp-content">
          {[0, 1].map((s) => (
            <section className="hp-section" key={s}>
              <div className="section-hd">
                <Skeleton variant="title" width="180px" />
              </div>
              <div className="grid-3">
                {CARDS.map((i) => (
                  <div className="card" key={i}>
                    <Skeleton width="100%" height="160px" />
                    <div className="card-body">
                      <Skeleton width="40%" />
                      <Skeleton variant="title" width="80%" />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>

        <aside className="hp-sidebar" aria-hidden="true">
          <div className="sw-card">
            <div className="sw-header">
              <Skeleton width="90px" height="16px" />
            </div>
            <div className="sw-body">
              <div className="stories-list">
                {SIDE.map((i) => (
                  <div className="story-item" key={i}>
                    <span className="story-thumb" />
                    <span className="story-text">
                      <Skeleton width="50%" height="11px" />
                      <Skeleton width="85%" />
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
