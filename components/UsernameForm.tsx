import { View, Text, TextInput, Pressable, useColorScheme } from 'react-native'
import { BlurView } from 'expo-blur'
import { Ionicons } from '@expo/vector-icons'
import { useState, useCallback, useEffect } from 'react'
import { validateUsername } from '../lib/validations/profile'
import Animated, {
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  useSharedValue,
  runOnJS
} from 'react-native-reanimated'
import { GestureDetector, Gesture } from 'react-native-gesture-handler'
import { useUpdateProfile } from '@/hooks/useUpdateProfile'

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)
const AnimatedBlurView = Animated.createAnimatedComponent(BlurView)

interface UsernameFormProps {
  username: string
  userId?: string
  onUpdateUsername?: (username: string) => void
}

export function UsernameForm({ username, userId, onUpdateUsername }: UsernameFormProps) {
  const { mutate: updateProfile, isPending } = useUpdateProfile(userId)
  const colorScheme = useColorScheme()
  const themeColor = '#6d28d9'
  const [value, setValue] = useState(username)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [showIcon, setShowIcon] = useState(true)

  useEffect(() => {
    if (!isEditing) setValue(username)
  }, [username, isEditing])

  const scale = useSharedValue(1)
  const opacity = useSharedValue(0)
  const formHeight = useSharedValue(0)
  const buttonOpacity = useSharedValue(1)
  const translateY = useSharedValue(0)

  const pulseAnimation = () => {
    scale.value = withSequence(
      withTiming(0.8, { duration: 100 }),
      withTiming(1.2, { duration: 100 }),
      withTiming(1, { duration: 100 })
    )
    buttonOpacity.value = withSequence(
      withTiming(0.7, { duration: 100 }),
      withTiming(1, { duration: 100 })
    )
  }

  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: buttonOpacity.value,
    backgroundColor: themeColor,
  }))

  const formStyle = useAnimatedStyle(() => ({
    maxHeight: formHeight.value,
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
    overflow: 'hidden',
  }))

  const finishClosing = useCallback(() => {
    setIsEditing(false)
    setShowIcon(true)
  }, [])

  const closeForm = () => {
    formHeight.value = withSpring(0, { damping: 15, stiffness: 100 })
    opacity.value = withTiming(0, { duration: 150 }, (finished) => {
      if (finished) runOnJS(finishClosing)()
    })
    translateY.value = withSpring(0)
  }

  const handlePress = () => {
    if (!isEditing) {
      setIsEditing(true)
      setShowIcon(false)
      opacity.value = withTiming(1, { duration: 200 })
      formHeight.value = withSpring(120, { damping: 12, stiffness: 100 })
    } else {
      handleSubmit()
    }
  }

  const handleSubmit = () => {
    const validation = validateUsername(value)
    if (!validation.isValid) {
      setError(validation.error)
      scale.value = withSequence(
        withTiming(1.1, { duration: 100 }),
        withTiming(1, { duration: 100 })
      )
      return
    }
    setError(null)
    updateProfile({ username: value })
    onUpdateUsername?.(value)
    closeForm()
  }

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      'worklet'
      if (event.translationY > 0) translateY.value = event.translationY
    })
    .onEnd((event) => {
      'worklet'
      if (event.translationY > 50) runOnJS(closeForm)()
      else translateY.value = withSpring(0)
    })

  const tapOutside = Gesture.Tap()
    .onStart(() => {
      'worklet'
      if (isEditing) runOnJS(closeForm)()
    })

  const gestures = Gesture.Race(panGesture, tapOutside)

  const FormContent = (
    <View className="px-4">
      <AnimatedBlurView
        intensity={80}
        tint={colorScheme === 'dark' ? 'dark' : 'light'}
        className="overflow-hidden rounded-2xl"
      >
        <View className="p-4">
          <Pressable
            onPress={() => !isEditing && handlePress()}
            className="flex-row items-center justify-between"
          >
            <Text className="text-base font-medium text-zinc-700 dark:text-zinc-400">
              Zmiana nazwy użytkownika
            </Text>
            {showIcon && (
              <Ionicons
                name="chevron-down"
                size={20}
                color={colorScheme === 'dark' ? '#a1a1aa' : '#71717a'}
              />
            )}
          </Pressable>

          <Animated.View style={formStyle}>
            <View className="mt-4">
              <TextInput
                className="w-full pl-3 pr-12 py-3 rounded-xl font-semibold text-xl text-zinc-950 dark:text-zinc-100"
                style={{
                  backgroundColor: `${themeColor}50`,
                  borderWidth: 1,
                  borderColor: error ? '#ef4444' : `${themeColor}70`,
                }}
                placeholder="Nazwa użytkownika"
                placeholderTextColor={colorScheme === 'dark' ? '#666' : '#999'}
                value={value}
                onChangeText={(text) => {
                  setValue(text)
                  setError(null)
                }}
              />
              <AnimatedPressable
                onPress={handlePress}
                onPressIn={pulseAnimation}
                className="absolute right-2 top-2 w-10 h-10 rounded-lg items-center justify-center"
                style={buttonStyle}
                disabled={isPending}
              >
                <Ionicons
                  name={isPending ? 'hourglass-outline' : 'arrow-forward'}
                  size={24}
                  color="white"
                />
              </AnimatedPressable>
            </View>
            {error && (
              <Text className="text-sm text-red-500 mt-1">{error}</Text>
            )}
          </Animated.View>
        </View>
      </AnimatedBlurView>
    </View>
  )

  return isEditing ? (
    <GestureDetector gesture={gestures}>
      {FormContent}
    </GestureDetector>
  ) : FormContent
}
