import { View, ImageBackground } from 'react-native'
import { useState } from 'react'
import { ProfileHeader } from './ProfileHeader'
import { UsernameForm } from './UsernameForm'
import { MottoForm } from './MottoForm'

export default function ProfilePreview() {
  const [user, setUser] = useState({
    username: 'User123',
    motto: 'Learning every day',
  })

  const handleUpdateUsername = (newUsername: string) => {
    setUser(prev => ({ ...prev, username: newUsername }))
  }

  const handleUpdateMotto = (newMotto: string) => {
    setUser(prev => ({ ...prev, motto: newMotto }))
  }

  return (
    <View className="flex-1">
      <ImageBackground 
        source={require('../assets/images/profile-bg.jpg')} 
        className="absolute inset-0 w-full h-full"
        imageStyle={{ opacity: 0.4 }}
        resizeMode="cover"
      />
      
      <View className="flex-1 justify-between">
        {/* Header Section */}
        <ProfileHeader 
          username={user.username}
          motto={user.motto}
        />

        <View className="h-[24%]" />

        {/* Forms Section */}
        <View className="flex-1 flex-col gap-6">
          <UsernameForm
            username={user.username}
            onUpdateUsername={handleUpdateUsername}
          />
          <MottoForm
            motto={user.motto}
            onUpdateMotto={handleUpdateMotto}
          />
        </View>
      </View>
    </View>
  )
} 