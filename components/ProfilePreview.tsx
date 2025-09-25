import { View, LayoutChangeEvent } from 'react-native'
import { useState, useCallback, useRef } from 'react'
import Animated, { useSharedValue, useAnimatedStyle, withSpring, SharedValue } from 'react-native-reanimated'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import { ProfileHeader } from './ProfileHeader'
import { UsernameForm } from './UsernameForm'
import { MottoForm } from './MottoForm'
import { ExamCountdown } from './ExamCountdown'

interface ProfileItem {
  key: string
  type: 'header' | 'username' | 'motto' | 'exam'
  height?: number
}

export default function ProfilePreview() {
  const [user, setUser] = useState({
    username: 'User123',
    motto: 'Learning every day',
  })

  const [components, setComponents] = useState<ProfileItem[]>([
    { key: 'header', type: 'header' },
    { key: 'username', type: 'username' },
    { key: 'motto', type: 'motto' },
    { key: 'exam', type: 'exam' },
  ])

  // Track positions for animation
  const positionsRef = useRef<Record<string, SharedValue<number>>>({})
  if (Object.keys(positionsRef.current).length === 0) {
    components.forEach((item, index) => {
      positionsRef.current[item.key] = useSharedValue(index * 120)
    })
  }

  const handleUpdateUsername = (newUsername: string) => {
    setUser(prev => ({ ...prev, username: newUsername }))
  }

  const handleUpdateMotto = (newMotto: string) => {
    setUser(prev => ({ ...prev, motto: newMotto }))
  }

  const handleComponentLayout = useCallback((key: string, height: number) => {
    // optional: store actual height
  }, [])

  const handleReorder = useCallback((draggedKey: string, newIndex: number) => {
    setComponents(prev => {
      const draggedItem = prev.find(c => c.key === draggedKey)!;
      const filtered = prev.filter(c => c.key !== draggedKey);
      filtered.splice(newIndex, 0, draggedItem);
      return filtered;
    });
  }, []);

  const renderItem = useCallback((item: ProfileItem, index: number) => {
    const translateY = positionsRef.current[item.key];

    const gesture = Gesture.Pan()
      .onUpdate(e => {
        translateY.value = e.translationY + index * 120;
      })
      .onEnd(() => {
        const newIndex = Math.round(translateY.value / 120);
        translateY.value = withSpring(newIndex * 120);
        handleReorder(item.key, newIndex);
      });

    const animatedStyle = useAnimatedStyle(() => ({
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: 120,
      transform: [{ translateY: translateY.value }],
    }));

    let content: React.ReactNode;
    switch (item.type) {
      case 'header':
        content = <ProfileHeader username={user.username} motto={user.motto} />;
        break;
      case 'username':
        content = (
          <UsernameForm username={user.username} onUpdateUsername={newUsername => setUser(prev => ({ ...prev, username: newUsername }))} />
        );
        break;
      case 'motto':
        content = (
          <MottoForm motto={user.motto} onUpdateMotto={newMotto => setUser(prev => ({ ...prev, motto: newMotto }))} />
        );
        break;
      case 'exam':
        content = <ExamCountdown />;
        break;
    }

    return (
      <GestureDetector key={item.key} gesture={gesture}>
        <Animated.View style={animatedStyle}>
          <View style={{ flex: 1 }}>
            {/* Wrap your form in a simple container */}
            {content}
          </View>
        </Animated.View>
      </GestureDetector>
    );
  }, [components, user, handleReorder]);

  return <View style={{ flex: 1 }}>{components.map(renderItem)}</View>;
}
