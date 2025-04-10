import { useSharedValue, withSpring, useAnimatedStyle } from 'react-native-reanimated'

export const useAuthAnimations = () => {
  const signInButtonScale = useSharedValue(1)
  const googleButtonScale = useSharedValue(1)
  const emailBorderWidth = useSharedValue(1)
  const passwordBorderWidth = useSharedValue(1)

  const handleSignInPressIn = () => {
    signInButtonScale.value = withSpring(0.95)
  }

  const handleSignInPressOut = () => {
    signInButtonScale.value = withSpring(1)
  }

  const handleGooglePressIn = () => {
    googleButtonScale.value = withSpring(0.95)
  }

  const handleGooglePressOut = () => {
    googleButtonScale.value = withSpring(1)
  }

  const signInButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: signInButtonScale.value }]
  }))

  const googleButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: googleButtonScale.value }]
  }))

  const emailInputStyle = useAnimatedStyle(() => ({
    borderWidth: emailBorderWidth.value,
  }))

  const passwordInputStyle = useAnimatedStyle(() => ({
    borderWidth: passwordBorderWidth.value,
  }))

  const handleFocus = (input: 'email' | 'password') => {
    if (input === 'email') {
      emailBorderWidth.value = withSpring(2)
    } else {
      passwordBorderWidth.value = withSpring(2)
    }
  }

  const handleBlur = (input: 'email' | 'password') => {
    if (input === 'email') {
      emailBorderWidth.value = withSpring(1)
    } else {
      passwordBorderWidth.value = withSpring(1)
    }
  }

  return {
    handleSignInPressIn,
    handleSignInPressOut,
    handleGooglePressIn,
    handleGooglePressOut,
    signInButtonStyle,
    googleButtonStyle,
    emailInputStyle,
    passwordInputStyle,
    handleFocus,
    handleBlur,
  }
} 