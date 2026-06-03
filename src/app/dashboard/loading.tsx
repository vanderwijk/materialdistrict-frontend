import { Skeleton } from '@/components/ui/Skeleton'

/**
 * Loading state for the dashboard segment. Shown while a panel's server-side
 * reads resolve, so navigation feels instant instead of blank. Mirrors the
 * rough shape of a page header + one panel.
 */
export default function DashboardLoading() {
  return (
    <div className="dash-loading" aria-busy="true" aria-label="Loading">
      <Skeleton variant="title" width="40%" />
      <div className="dash-panel">
        <Skeleton variant="text" width="30%" />
        <Skeleton variant="text" />
        <Skeleton variant="text" width="85%" />
        <Skeleton variant="text" width="60%" />
      </div>
    </div>
  )
}
