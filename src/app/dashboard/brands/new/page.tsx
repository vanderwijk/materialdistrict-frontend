import { getBrandCandidates } from '@/lib/dashboard/data'
import { DashboardPageHeader } from '@/components/dashboard'
import { AddBrandPanel } from '@/components/dashboard/panels/AddBrandPanel'

export default async function AddBrandPage() {
  const candidates = await getBrandCandidates('')
  return (
    <>
      <DashboardPageHeader title="Add brand" />
      <AddBrandPanel candidates={candidates} />
    </>
  )
}
