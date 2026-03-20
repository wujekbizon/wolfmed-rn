import { View, Text, Animated, useColorScheme } from 'react-native'

import { useState, useEffect, useRef } from 'react'
import { BlurView } from 'expo-blur'
import { LinearGradient } from 'expo-linear-gradient'
import { formatDateInPolish } from '../helpers/date'
import { TimeUnitDisplay } from './TimeUnitDisplay'

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

interface ExamCountdownProps {
  examDate?: Date
  className?: string
}

export function ExamCountdown({ examDate = new Date('2025-06-02'), className = '' }: ExamCountdownProps) {
  const colorScheme = useColorScheme()
  const themeColors = colorScheme === 'dark'
    ? ['#ff69b4', '#9333ea']
    : ['#ff69b4', '#6d28d9']
  const isDark = colorScheme === 'dark'

  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 })
  const pulseAnim = useRef(new Animated.Value(1)).current
  const pulseLoopRef = useRef<Animated.CompositeAnimation | null>(null)

  useEffect(() => {
    const pulse = Animated.sequence([
      Animated.timing(pulseAnim, { toValue: 1.1, duration: 500, useNativeDriver: true }),
      Animated.timing(pulseAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
    ])
    pulseLoopRef.current = Animated.loop(pulse)
    pulseLoopRef.current.start()

    const timer = setInterval(() => {
      const now = new Date().getTime()
      const distance = examDate.getTime() - now

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000),
      })
    }, 1000)

    return () => {
      clearInterval(timer)
      pulseLoopRef.current?.stop()
    }
  }, [examDate, pulseAnim])

  return (
    <View className={`px-4  ${className}`}>
      <BlurView 
        intensity={colorScheme === 'dark' ? 40 : 60} 
        tint={colorScheme === 'dark' ? 'dark' : 'light'} 
        className="overflow-hidden rounded-2xl"
      >
        <LinearGradient
          colors={colorScheme === 'dark' ? 
            ['#20203030', '#15152030'] : 
            ['#ffffff40', '#f8f8f840']}
          className="px-6 py-4 rounded-2xl"
        >
          <View className="flex-row items-center justify-center mb-6 space-x-2">
            <Text className={`text-lg font-semibold ${isDark ? 'text-gray-100' : 'text-gray-800'}`}>
              Czas do egzaminu {" "}
            </Text>
            <Text 
              className={`text-base ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
              style={{ color: themeColors[0] }}
            >
              • {formatDateInPolish(examDate)}
            </Text>
          </View>
          <View className="flex-row justify-evenly">
            <TimeUnitDisplay value={timeLeft.days} unit="Dni" themeColors={themeColors} />
            <TimeUnitDisplay value={timeLeft.hours} unit="Godz" themeColors={themeColors} />
            <TimeUnitDisplay value={timeLeft.minutes} unit="Min" themeColors={themeColors} />
            <TimeUnitDisplay 
              value={timeLeft.seconds} 
              unit="Sek" 
              themeColors={themeColors} 
              isAnimated={true}
              pulseAnim={pulseAnim}
              isSeconds={true}
            />
          </View>
        </LinearGradient>
      </BlurView>
    </View>
  )
} 