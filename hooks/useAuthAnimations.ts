import { useCallback } from 'react'
import { useSharedValue, withSpring, useAnimatedStyle } from 'react-native-reanimated'

type InputType = 'email' | 'password' | 'code'

export function useAuthAnimations() {
  const signInScale = useSharedValue(1)
  const googleScale = useSharedValue(1)
  const emailScale = useSharedValue(1)
  const passwordScale = useSharedValue(1)

  const handleSignInPressIn = useCallback(() => {
    signInScale.value = withSpring(0.95)
  }, [])

  const handleSignInPressOut = useCallback(() => {
    signInScale.value = withSpring(1)
  }, [])

  const handleGooglePressIn = useCallback(() => {
    googleScale.value = withSpring(0.95)
  }, [])

  const handleGooglePressOut = useCallback(() => {
    googleScale.value = withSpring(1)
  }, [])

  const handleFocus = useCallback((type: InputType) => {
    if (type === 'email') {
      emailScale.value = withSpring(1.02)
    } else {
      passwordScale.value = withSpring(1.02)
    }
  }, [])

  const handleBlur = useCallback((type: InputType) => {
    if (type === 'email') {
      emailScale.value = withSpring(1)
    } else {
      passwordScale.value = withSpring(1)
    }
  }, [])

  const signInButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: signInScale.value }]
  }))

  const googleButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: googleScale.value }]
  }))

  const emailInputStyle = useAnimatedStyle(() => ({
    transform: [{ scale: emailScale.value }]
  }))

  const passwordInputStyle = useAnimatedStyle(() => ({
    transform: [{ scale: passwordScale.value }]
  }))

  return {
    handleSignInPressIn,
    handleSignInPressOut,
    handleGooglePressIn,
    handleGooglePressOut,
    handleFocus,
    handleBlur,
    signInButtonStyle,
    googleButtonStyle,
    emailInputStyle,
    passwordInputStyle,
  }
} 