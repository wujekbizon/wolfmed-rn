import { View, Text, Animated , useColorScheme } from 'react-native'

import { BlurView } from 'expo-blur'
import { LinearGradient } from 'expo-linear-gradient'

interface TimeUnitProps {
  value: number
  unit: string
  themeColors: string[]
  isAnimated?: boolean
  pulseAnim?: Animated.Value
  isSeconds?: boolean
}

export const TimeUnitDisplay = ({ value, unit, themeColors, isAnimated = false, pulseAnim, isSeconds = false }: TimeUnitProps) => {
  const TextComponent = isAnimated ? Animated.Text : Text
  const animationStyle = isAnimated && pulseAnim ? { transform: [{ scale: pulseAnim }] } : {}
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'

  return (
    <View className="items-center px-2">
      <LinearGradient
        colors={isSeconds ? 
          [isDark ? '#ff69b450' : '#ff69b430', isDark ? '#9333ea40' : '#6d28d930'] : 
          [isDark ? '#20203080' : '#ffffff80', isDark ? '#15152080' : '#f8f8f880']}
        className="w-20 h-20 p-[1px]"
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <BlurView 
          intensity={isDark ? 15 : 40} 
          tint={isDark ? 'dark' : 'light'}
          className="w-full h-full items-center justify-center"
        >
          <TextComponent 
            className={`text-2xl font-bold ${
              isSeconds ? `text-[${themeColors[0]}]` : isDark ? 'text-gray-200' : 'text-gray-800'
            }`}
            style={[
              animationStyle,
              { textShadowColor: isSeconds ? themeColors[0] : 'transparent',
                textShadowOffset: { width: 0, height: 0 },
                textShadowRadius: isSeconds ? 4 : 0 }
            ]}
          >
            {value.toString().padStart(2, '0')}
          </TextComponent>
          <Text 
            className={`text-xs font-medium mt-1 ${
              isSeconds ? `text-[${themeColors[1]}]` : isDark ? 'text-gray-400' : 'text-gray-600'
            }`}
          >
            {unit}
          </Text>
        </BlurView>
      </LinearGradient>
    </View>
  )
} 