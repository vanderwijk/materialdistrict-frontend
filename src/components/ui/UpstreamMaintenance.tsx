/**
 * Shown on overview pages when WordPress is temporarily unreachable.
 * Better than throwing (which triggers Vercel retries and more upstream load).
 */
export function UpstreamMaintenance({
  title = 'Temporarily unavailable',
}: {
  title?: string
}) {
  return (
    <div className="ov-wrap">
      <div className="empty-state" style={{ maxWidth: '42rem', margin: '3rem auto' }}>
        <h2 className="t-display-md" style={{ marginBottom: '0.75rem' }}>
          {title}
        </h2>
        <p className="t-body-md" style={{ color: 'var(--ct-text-muted)' }}>
          MaterialDistrict is having trouble reaching the content server. Cached
          pages may still work — please try again in a minute.
        </p>
      </div>
    </div>
  )
}
