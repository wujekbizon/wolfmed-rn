import { View , useColorScheme } from 'react-native'
import React from 'react'
import { LinearGradient } from 'expo-linear-gradient'
import Animated, { 
  useAnimatedStyle, 
  withRepeat, 
  withTiming,
  withSequence,
  useSharedValue,
  withDelay
} from 'react-native-reanimated'


const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient)

type GradientColors = {
  dark: {
    base: [string, string]
    rotating: [string, string, string]
  }
  light: {
    base: [string, string]
    rotating: [string, string, string]
  }
}

export default function GradientOverlay() {
  const opacity = useSharedValue(0)
  const rotation = useSharedValue(0)
  const scale = useSharedValue(1)
  const colorScheme = useColorScheme()

  React.useEffect(() => {
    opacity.value = withDelay(100, withTiming(1, { duration: 1000 }))
    rotation.value = withRepeat(
      withTiming(360, { duration: 30000 }),
      -1,
      false
    )
    scale.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 2000 }),
        withTiming(1, { duration: 2000 })
      ),
      -1,
      true
    )
  }, []) // shared values are stable refs — no deps needed

  const baseGradientStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }))

  const rotatingGradientStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }))

  const gradientColors: GradientColors = {
    dark: {
      base: ['rgba(255,91,91,0.2)', 'rgba(147,51,234,0.1)'],
      rotating: ['rgba(255,91,91,0.15)', 'rgba(59,130,246,0.1)', 'rgba(255,91,91,0.15)']
    },
    light: {
      base: ['rgba(225,29,72,0.15)', 'rgba(109,40,217,0.1)'],
      rotating: ['rgba(225,29,72,0.12)', 'rgba(59,130,246,0.08)', 'rgba(225,29,72,0.12)']
    }
  } as const

  return (
    <View style={{ position: 'absolute', width: '100%', height: '100%' }}>
      {/* Base gradient layer */}
      <AnimatedLinearGradient
        style={[
          { position: 'absolute', width: '100%', height: '100%' },
          baseGradientStyle,
        ]}
        colors={colorScheme === 'dark' ? gradientColors.dark.base : gradientColors.light.base}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Rotating gradient overlay */}
      <AnimatedLinearGradient
        style={[
          { position: 'absolute', width: '100%', height: '100%' },
          rotatingGradientStyle,
        ]}
        colors={colorScheme === 'dark' ? gradientColors.dark.rotating : gradientColors.light.rotating}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
    </View>
  )
} 