import { getProfile } from '@/lib/dashboard/data'
import { DashboardPageHeader } from '@/components/dashboard'
import { ProfileForm } from '@/components/dashboard/panels/ProfileForm'

export default async function ProfilePage() {
  const profile = await getProfile()
  return (
    <>
      <DashboardPageHeader title="My profile" />
      <ProfileForm initial={profile} />
    </>
  )
}
