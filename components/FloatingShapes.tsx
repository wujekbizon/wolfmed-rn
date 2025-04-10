import React from 'react'
import { View, Dimensions, useColorScheme } from 'react-native'
import Animated, {
  useAnimatedStyle,
  withRepeat,
  withTiming,
  useSharedValue,
  withDelay,
  withSequence,
  Easing,
} from 'react-native-reanimated'

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window')

interface ShapeProps {
  index: number
  type: 'circle' | 'square'
  color: string
  left: number
  top: number
  size: number
}

const Shape = ({ index, type, color, left, top, size }: ShapeProps) => {
  const translateY = useSharedValue(0)
  const rotation = useSharedValue(0)
  const scale = useSharedValue(1)
  const opacity = useSharedValue(0)
  const colorScheme = useColorScheme()

  React.useEffect(() => {
    opacity.value = withDelay(index * 200, withTiming(colorScheme === 'dark' ? 0.35 : 0.45, { duration: 1000 }))
    rotation.value = withRepeat(
      withTiming(360, { 
        duration: 50000 + index * 5000,
        easing: Easing.linear 
      }),
      -1,
      false
    )
    translateY.value = withRepeat(
      withSequence(
        withTiming(-8, { 
          duration: 4000 + index * 500,
          easing: Easing.bezier(0.4, 0, 0.2, 1)
        }),
        withTiming(8, { 
          duration: 4000 + index * 500,
          easing: Easing.bezier(0.4, 0, 0.2, 1)
        })
      ),
      -1,
      true
    )
    scale.value = withRepeat(
      withSequence(
        withTiming(1.1, { 
          duration: 4000,
          easing: Easing.bezier(0.4, 0, 0.2, 1)
        }),
        withTiming(0.95, { 
          duration: 4000,
          easing: Easing.bezier(0.4, 0, 0.2, 1)
        })
      ),
      -1,
      true
    )
  }, [])

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { rotate: `${rotation.value}deg` },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }))

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          width: size,
          height: size,
          backgroundColor: colorScheme === 'dark' ? `${color}20` : `${color}25`,
          borderRadius: type === 'circle' ? size / 2 : size / 4,
          borderWidth: 1.5,
          borderColor: colorScheme === 'dark' ? `${color}50` : `${color}40`,
          left,
          top,
        },
        animatedStyle,
      ]}
    />
  )
}

export function FloatingShapes({ count = 4 }: { count?: number }) {
  const colorScheme = useColorScheme()
  
  const shapes = React.useMemo(() => {
    const darkColors = ['#ff69b4', '#9333ea']
    const lightColors = ['#e11d48', '#6d28d9'] // More vibrant colors for light mode
    const colors = colorScheme === 'dark' ? darkColors : lightColors

    return Array.from({ length: count }, (_, i) => ({
      left: Math.random() * (SCREEN_WIDTH - 100) + 50,
      top: Math.random() * (SCREEN_HEIGHT - 200) + 100,
      type: (i % 2 === 0 ? 'circle' : 'square') as 'circle' | 'square',
      color: colors[i % colors.length],
      size: Math.random() * 60 + 80,
    }))
  }, [count, colorScheme])

  return (
    <View style={{ position: 'absolute', width: '100%', height: '100%' }}>
      {shapes.map((shape, i) => (
        <Shape
          key={i}
          index={i}
          type={shape.type}
          color={shape.color}
          left={shape.left}
          top={shape.top}
          size={shape.size}
        />
      ))}
    </View>
  )
} 