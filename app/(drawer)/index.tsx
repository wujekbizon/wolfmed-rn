import React from 'react'
import { View, useWindowDimensions } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import QuickStats from '@/components/QuickStats'
import QuickActions from '@/components/QuickActions'
import ProfilePreview from '@/components/ProfilePreview'
import { DashboardCircle } from '@/components/DashboardCircle'
import { useDashboardStore } from '@/store/useDashboardStore'
import Animated, { 
  FadeIn, 
  FadeOut,
  SlideInRight,
  SlideOutLeft 
} from 'react-native-reanimated'
import { BlurView } from 'expo-blur'

export default function DashboardScreen() {
  const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = useWindowDimensions()
  const { 
    isCircleExpanded, 
    activeSection, 
    getSectionConfig 
  } = useDashboardStore()

  const renderActiveComponent = () => {
    const activeColor = getSectionConfig(activeSection).color
    const commonContainerStyle = {
      position: 'absolute' as const,
      left: 20,
      right: 20,
      top: 20,
      bottom: 20,
      overflow: 'hidden' as const,
      borderRadius: 20,
    }

    const commonContentStyle = {
      padding: 20,
      backgroundColor: `${activeColor}10`,
      borderColor: `${activeColor}30`,
      borderWidth: 1,
      flex: 1,
    }

    switch (activeSection) {
      case 'stats':
        return (
          <Animated.View 
            entering={SlideInRight} 
            exiting={SlideOutLeft}
            key="stats"
            style={commonContainerStyle}
          >
            <BlurView intensity={20} tint="light" style={commonContentStyle}>
              <QuickStats color={activeColor} />
            </BlurView>
          </Animated.View>
        )
      case 'actions':
        return (
          <Animated.View 
            entering={SlideInRight} 
            exiting={SlideOutLeft}
            key="actions"
            style={commonContainerStyle}
          >
            <BlurView intensity={20} tint="light" style={commonContentStyle}>
              <QuickActions isExpanded={isCircleExpanded} color={activeColor} />
            </BlurView>
          </Animated.View>
        )
      case 'profile':
        return (
          <Animated.View 
            entering={SlideInRight} 
            exiting={SlideOutLeft}
            key="profile"
            style={commonContainerStyle}
          >
            <BlurView intensity={20} tint="light" style={commonContentStyle}>
              <ProfilePreview color={activeColor} />
            </BlurView>
          </Animated.View>
        )
      default:
        return null
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-zinc-50 dark:bg-zinc-900">
      <View className="flex-1">
        <Animated.View 
          entering={FadeIn}
          exiting={FadeOut}
          className="flex-1"
        >
          {renderActiveComponent()}
        </Animated.View>
      </View>

      {/* Circle Navigation */}
      <View 
        style={{
          position: 'absolute',
          top: SCREEN_HEIGHT / 2 - SCREEN_WIDTH * 0.225,
          left: SCREEN_WIDTH / 2 - SCREEN_WIDTH * 0.225,
          zIndex: 100,
        }}
        pointerEvents="box-none"
      >
        <DashboardCircle />
      </View>
    </SafeAreaView>
  )
}
