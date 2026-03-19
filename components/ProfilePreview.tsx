import { ScrollView } from 'react-native'
import { useAuth } from '@clerk/expo'
import { ProfileHeader } from './ProfileHeader'
import { UsernameForm } from './UsernameForm'
import { MottoForm } from './MottoForm'
import { ExamCountdown } from './ExamCountdown'
import { LoadingSpinner } from './LoadingSpinner'
import { useUserProfile } from '@/hooks/useUserProfile'

export default function ProfilePreview() {
  const { userId } = useAuth()
  const { userProfile, isLoading } = useUserProfile(userId ?? undefined)

  return (
    <ScrollView contentContainerStyle={{ gap: 12, padding: 16 }} keyboardShouldPersistTaps="handled">
      <ProfileHeader
        username={userProfile?.username ?? ''}
        motto={userProfile?.motto ?? ''}
      />
      <LoadingSpinner isLoading={isLoading} />
      <UsernameForm
        userId={userId ?? undefined}
        username={userProfile?.username ?? ''}
      />
      <MottoForm
        userId={userId ?? undefined}
        motto={userProfile?.motto ?? ''}
      />
      <ExamCountdown />
    </ScrollView>
  )
}
