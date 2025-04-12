import React from 'react'
import { Text, View, Pressable, useWindowDimensions } from 'react-native'
import { useColorScheme } from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export default function DashboardScreen() {
  const colorScheme = useColorScheme()
  const insets = useSafeAreaInsets()
  const buttonScale = useSharedValue(1)
  const buttonGlow = useSharedValue(0)
  const arrowX = useSharedValue(0)

  // Subtle continuous button animation
  React.useEffect(() => {
    buttonGlow.value = withRepeat(
      withSequence(
        withTiming(1, { 
          duration: 2000,
          easing: Easing.bezier(0.4, 0, 0.2, 1)
        }),
        withTiming(0, { 
          duration: 2000,
          easing: Easing.bezier(0.4, 0, 0.2, 1)
        })
      ),
      -1,
      true
    )

    // Subtle arrow movement
    arrowX.value = withRepeat(
      withSequence(
        withTiming(4, {
          duration: 1200,
          easing: Easing.bezier(0.4, 0, 0.2, 1)
        }),
        withTiming(0, {
          duration: 1200,
          easing: Easing.bezier(0.4, 0, 0.2, 1)
        })
      ),
      -1,
      true
    )
  }, [])


  return (
    <View 
      className={`flex-1 ${colorScheme === 'dark' ? 'bg-[#111]' : 'bg-white'}`}
      style={{ paddingTop: insets.top }}
    >
      <View className="p-6">
        <Text 
          className={`text-2xl font-semibold mb-2 ${
            colorScheme === 'dark' ? 'text-white' : 'text-[#111]'
          }`}
        >
          Dashboard
        </Text>
        <Text
          className={`text-base ${
            colorScheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}
        >
          Welcome to your medical education journey
        </Text>
      </View>
      
      {/* Add your dashboard content here */}
      <View className="flex-1 p-6">
        {/* You can add quick stats, recent activities, progress cards etc. */}
      </View>
    </View>
  )
}
