import { View, ScrollView } from 'react-native'
import { useState } from 'react'
import { ProfileHeader } from './ProfileHeader'
import { UsernameForm } from './UsernameForm'
import { MottoForm } from './MottoForm'
import { ExamCountdown } from './ExamCountdown'

export default function ProfilePreview() {
  const [user, setUser] = useState({ username: 'User123', motto: 'Learning every day' })

  return (
    <ScrollView contentContainerStyle={{ gap: 12, padding: 16 }}>
      <ProfileHeader username={user.username} motto={user.motto} />
      <UsernameForm
        username={user.username}
        onUpdateUsername={v => setUser(prev => ({ ...prev, username: v }))}
      />
      <MottoForm
        motto={user.motto}
        onUpdateMotto={v => setUser(prev => ({ ...prev, motto: v }))}
      />
      <ExamCountdown />
    </ScrollView>
  )
}
