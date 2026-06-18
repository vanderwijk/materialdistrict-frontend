import { getProfile, getProfileFieldOptions } from '@/lib/dashboard/data'
import { DashboardPageHeader } from '@/components/dashboard'
import { ProfileForm } from '@/components/dashboard/panels/ProfileForm'

export default async function ProfilePage() {
  const [profile, options] = await Promise.all([
    getProfile(),
    getProfileFieldOptions(),
  ])
  return (
    <>
      <DashboardPageHeader title="My profile" crumbs={[{ label: 'Account' }, { label: 'My profile' }]} />
      <ProfileForm initial={profile} options={options} />
    </>
  )
}
