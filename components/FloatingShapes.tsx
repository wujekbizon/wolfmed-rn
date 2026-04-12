import React from 'react'
import { View, Dimensions, useColorScheme } from 'react-native'
import Animated, {
  useAnimatedStyle,
  withRepeat,
  withTiming,
  useSharedValue,
  withDelay,
  withSequence,
  cancelAnimation,
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
    cancelAnimation(opacity)
    cancelAnimation(rotation)
    cancelAnimation(translateY)
    cancelAnimation(scale)

    opacity.value = withDelay(index * 200, withTiming(colorScheme === 'dark' ? 0.35 : 0.45, { duration: 1000 }))
    rotation.value = withRepeat(
      withTiming(360, {
        duration: 50000 + index * 5000,
        easing: Easing.linear,
      }),
      -1,
      false
    )
    translateY.value = withRepeat(
      withSequence(
        withTiming(-8, { duration: 4000 + index * 500, easing: Easing.bezier(0.4, 0, 0.2, 1) }),
        withTiming(8, { duration: 4000 + index * 500, easing: Easing.bezier(0.4, 0, 0.2, 1) })
      ),
      -1,
      true
    )
    scale.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 4000, easing: Easing.bezier(0.4, 0, 0.2, 1) }),
        withTiming(0.95, { duration: 4000, easing: Easing.bezier(0.4, 0, 0.2, 1) })
      ),
      -1,
      true
    )
  }, [index, colorScheme, opacity, rotation, scale, translateY])

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

const DARK_COLORS = ['#ff69b4', '#9333ea']
const LIGHT_COLORS = ['#e11d48', '#6d28d9']

export function FloatingShapes({ count = 4 }: { count?: number }) {
  const colorScheme = useColorScheme()
  const colors = colorScheme === 'dark' ? DARK_COLORS : LIGHT_COLORS

  // positions stable per count — must not re-randomize on theme change
  const positions = React.useMemo(() =>
    Array.from({ length: count }, (_, i) => ({
      left: Math.random() * (SCREEN_WIDTH - 100) + 50,
      top: Math.random() * (SCREEN_HEIGHT - 200) + 100,
      type: (i % 2 === 0 ? 'circle' : 'square') as 'circle' | 'square',
      size: Math.random() * 60 + 80,
    }))
  , [count])

  const shapes = positions.map((pos, i) => ({ ...pos, color: colors[i % colors.length] }))

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