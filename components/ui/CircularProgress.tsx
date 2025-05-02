import { View, Text, Animated, StyleSheet, useColorScheme } from 'react-native'
import { useEffect, useRef } from 'react'

interface CircularProgressProps {
  progress: number
  size: number
  color: string
  strokeWidth: number
}

export default function CircularProgress({
  progress,
  size,
  color,
  strokeWidth,
}: CircularProgressProps) {
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'
  const animatedValue = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.spring(animatedValue, {
      toValue: progress / 100,
      useNativeDriver: true,
      damping: 15,
      mass: 1,
      stiffness: 100,
    }).start()
  }, [progress])

  const containerStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
    borderWidth: strokeWidth,
    borderColor: isDark ? '#E4E4E7' : '#D4D4D8',
  }

  const progressStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
    borderWidth: strokeWidth,
    borderColor: color,
    position: 'absolute' as const,
    transform: [{
      scale: animatedValue
    }],
    opacity: isDark ? animatedValue : animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 0.85]
    }),
  }

  return (
    <View style={[styles.container, containerStyle]}>
      <Animated.View style={progressStyle} />
      <Text style={[styles.text, { color }]}>
        {Math.round(progress)}%
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
}) 