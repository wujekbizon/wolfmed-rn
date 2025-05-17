import { View, ImageBackground, TouchableOpacity, LayoutChangeEvent } from 'react-native'
import { useState, useCallback } from 'react'
import { ProfileHeader } from './ProfileHeader'
import { UsernameForm } from './UsernameForm'
import { MottoForm } from './MottoForm'
import { ExamCountdown } from './ExamCountdown'
import DraggableFlatList, { 
  ScaleDecorator,
  RenderItemParams,
  DragEndParams,
  OpacityDecorator
} from 'react-native-draggable-flatlist'

type ComponentType = 'header' | 'username' | 'motto' | 'exam'

interface ProfileItem {
  key: string
  type: ComponentType
  height?: number
}

export default function ProfilePreview() {
  const [user, setUser] = useState({
    username: 'User123',
    motto: 'Learning every day',
  })

  // Initial order of components
  const [components, setComponents] = useState<ProfileItem[]>([
    { key: 'header', type: 'header' },
    { key: 'username', type: 'username' },
    { key: 'motto', type: 'motto' },
    { key: 'exam', type: 'exam' },
  ])

  const handleUpdateUsername = (newUsername: string) => {
    setUser(prev => ({ ...prev, username: newUsername }))
  }

  const handleUpdateMotto = (newMotto: string) => {
    setUser(prev => ({ ...prev, motto: newMotto }))
  }

  const handleComponentLayout = useCallback((key: string, event: LayoutChangeEvent) => {
    const height = event.nativeEvent.layout.height
    setComponents(prev => prev.map(item => 
      item.key === key ? { ...item, height } : item
    ))
  }, [])

  const renderPlaceholder = useCallback(({ item }: { item: ProfileItem }) => {
    return (
      <View 
        style={{
          backgroundColor: 'rgba(109, 40, 217, 0.15)',
          borderRadius: 16,
          marginVertical: 8,
          marginHorizontal: 16,
          height: item.height || 100,
          borderWidth: 2,
          borderColor: 'rgba(109, 40, 217, 0.3)',
          borderStyle: 'dashed'
        }}
      />
    )
  }, [])

  const renderItem = useCallback(({ item, drag, isActive }: RenderItemParams<ProfileItem>) => {
    let content = null

    switch (item.type) {
      case 'header':
        content = (
          <ProfileHeader 
            username={user.username}
            motto={user.motto}
          />
        )
        break
      case 'username':
        content = (
          <UsernameForm
            username={user.username}
            onUpdateUsername={handleUpdateUsername}
            isDragging={isActive}
          />
        )
        break
      case 'motto':
        content = (
          <MottoForm
            motto={user.motto}
            onUpdateMotto={handleUpdateMotto}
            isDragging={isActive}
          />
        )
        break
      case 'exam':
        content = <ExamCountdown />
        break
    }

    return (
      <OpacityDecorator activeOpacity={0.8}>
        <ScaleDecorator>
          <TouchableOpacity
            onLongPress={drag}
            disabled={isActive}
            onLayout={(event) => handleComponentLayout(item.key, event)}
            style={{ 
              opacity: isActive ? 0.98 : 1,
              transform: [{ scale: isActive ? 1.02 : 1 }],
              backgroundColor: isActive ? 'rgba(255,255,255,0.15)' : 'transparent',
              marginVertical: 8,
              borderRadius: 16,
              shadowColor: "#000",
              shadowOffset: {
                width: 0,
                height: isActive ? 6 : 0
              },
              shadowOpacity: isActive ? 0.15 : 0,
              shadowRadius: 8,
              elevation: isActive ? 8 : 0,
            }}
            activeOpacity={0.95}
          >
            {content}
          </TouchableOpacity>
        </ScaleDecorator>
      </OpacityDecorator>
    )
  }, [user, handleComponentLayout])

  return (
    <View className="flex-1 py-4">
      <ImageBackground 
        source={require('../assets/images/profile-bg.jpg')} 
        className="absolute inset-0 w-full h-full"
        imageStyle={{ opacity: 0.2 }}
        resizeMode="cover"
      />
      
      <DraggableFlatList
        data={components}
        onDragEnd={({ data }: DragEndParams<ProfileItem>) => setComponents(data)}
        keyExtractor={(item: ProfileItem) => item.key}
        renderItem={renderItem}
        renderPlaceholder={renderPlaceholder}
        containerStyle={{ flex: 1 }}
        activationDistance={8}
        animationConfig={{
          damping: 25,
          mass: 0.8,
          stiffness: 200
        }}
      />
    </View>
  )
} 