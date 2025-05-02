import React from 'react'
import { View, useWindowDimensions } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import QuickStats from '@/components/QuickStats'
import QuickActions from '@/components/QuickActions'
import ProfilePreview from '@/components/ProfilePreview'
import HelpInfo from '@/components/HelpInfo'
import NewsFeed from '@/components/NewsFeed'
import { DashboardCircle } from '@/components/DashboardCircle'
import { useDashboardStore } from '@/store/useDashboardStore'
import Animated, { 
  FadeIn, 
  FadeOut,
  SlideInRight,
  SlideOutLeft 
} from 'react-native-reanimated'
import { BlurView } from 'expo-blur'

// Component mapping object
const SECTION_COMPONENTS = {
  stats: QuickStats,
  actions: QuickActions,
  profile: ProfilePreview,
  help: HelpInfo,
  news: NewsFeed,
} as const

export default function DashboardScreen() {
  const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = useWindowDimensions()
  const { 
    activeSection, 
    getSectionConfig,
    isCircleExpanded,
    isMinimized,
    toggleMinimized
  } = useDashboardStore()

  const renderActiveComponent = () => {
    const activeColor = getSectionConfig(activeSection).color
    const commonContainerStyle = {
      flex: 1,
    }

    const commonContentStyle = {
      backgroundColor: `${activeColor}10`,
      flex: 1
    }

    const Component = SECTION_COMPONENTS[activeSection]
    
    return (
      <Animated.View 
        entering={SlideInRight} 
        exiting={SlideOutLeft}
        key={activeSection}
        style={commonContainerStyle}
      >
        <BlurView intensity={20} tint="light" style={commonContentStyle}>
          <Component color={activeColor} />
        </BlurView>
      </Animated.View>
    )
  }

  return (
    <View className="flex-1 bg-zinc-50 dark:bg-zinc-900">
      <View className="flex-1">
        <Animated.View 
          entering={FadeIn}
          exiting={FadeOut}
          className="flex-1"
        >
          {renderActiveComponent()}
        </Animated.View>
      </View>
      {!isMinimized && (
        <Animated.View 
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(200)}
          onTouchEnd={() => toggleMinimized()}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 50
          }}
        />
      )}
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
    </View>
  )
}
