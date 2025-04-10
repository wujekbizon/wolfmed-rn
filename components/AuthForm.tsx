import React, { useState } from 'react'
import { TextInput, Pressable, View, Text, useColorScheme } from 'react-native'
import { Link, Href } from 'expo-router'
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated'
import { FontAwesome } from '@expo/vector-icons'
import { cn } from '@/lib/utils'
import { useAuthAnimations } from '@/hooks/useAuthAnimations'

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput)

export type AuthFormErrors = {
  email?: string
  password?: string
  code?: string
}

export type AuthFormProps = {
  type: 'sign-in' | 'sign-up'
  isAuthenticating: boolean
  onSubmit: (data: { email: string; password: string }) => Promise<void>
  onOAuthPress: () => Promise<void>
  errors: AuthFormErrors
  setErrors: (errors: AuthFormErrors | ((prev: AuthFormErrors) => AuthFormErrors)) => void
  isPendingVerification?: boolean
  onVerifyCode?: (code: string) => Promise<void>
}

export function AuthForm({
  type,
  isAuthenticating,
  onSubmit,
  onOAuthPress,
  errors,
  setErrors,
  isPendingVerification,
  onVerifyCode,
}: AuthFormProps) {
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'

  const [emailAddress, setEmailAddress] = useState('')
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')

  const {
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
  } = useAuthAnimations()

  const handleSubmit = () => {
    if (isPendingVerification && onVerifyCode) {
      onVerifyCode(code)
    } else {
      onSubmit({ email: emailAddress, password })
    }
  }

  const handleEmailChange = (text: string) => {
    setEmailAddress(text)
    if (errors.email) {
      setErrors(prev => ({ ...prev, email: undefined }))
    }
  }

  const handlePasswordChange = (text: string) => {
    setPassword(text)
    if (errors.password) {
      setErrors(prev => ({ ...prev, password: undefined }))
    }
  }

  const handleCodeChange = (text: string) => {
    setCode(text)
    if (errors.code) {
      setErrors(prev => ({ ...prev, code: undefined }))
    }
  }

  const getInputStyle = (hasError: boolean) => ({
    borderColor: hasError 
      ? '#ef4444' 
      : isDark 
        ? 'rgba(255,255,255,0.15)' 
        : 'rgba(0,0,0,0.1)',
    backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
  })

  return (
    <View className="z-10">
      <Animated.Text 
        entering={FadeInDown.delay(200)}
        className={cn(
          "text-4xl font-bold text-center mb-8",
          isDark ? "text-white" : "text-[#111]",
          "shadow-[0_1px_12px_rgba(236,72,153,0.3)]"
        )}
      >
        {isPendingVerification ? 'Verify Email' : type === 'sign-in' ? 'Welcome Back' : 'Create Account'}
      </Animated.Text>
      
      <View className="flex flex-col gap-4 mb-6">
        {!isPendingVerification ? (
          <>
            <View>
              <AnimatedTextInput
                entering={FadeInDown.delay(400)}
                className={cn(
                  "rounded-xl p-4 text-base border",
                  isDark ? "text-white" : "text-[#111]",
                  "backdrop-blur-md",
                  errors.email && "border-red-500"
                )}
                style={[
                  getInputStyle(!!errors.email),
                  emailInputStyle
                ]}
                autoCapitalize="none"
                value={emailAddress}
                placeholder="Email"
                placeholderTextColor={isDark ? '#999' : '#666'}
                onChangeText={handleEmailChange}
                onFocus={() => handleFocus('email')}
                onBlur={() => handleBlur('email')}
                editable={!isAuthenticating}
              />
              {errors.email && (
                <Animated.Text 
                  entering={FadeInDown}
                  className="text-red-500 text-sm mt-1 ml-1"
                >
                  {errors.email}
                </Animated.Text>
              )}
            </View>

            <View>
              <AnimatedTextInput
                entering={FadeInDown.delay(600)}
                className={cn(
                  "rounded-xl p-4 text-base border",
                  isDark ? "text-white" : "text-[#111]",
                  "backdrop-blur-md",
                  errors.password && "border-red-500"
                )}
                style={[
                  getInputStyle(!!errors.password),
                  passwordInputStyle
                ]}
                value={password}
                placeholder="Password"
                placeholderTextColor={isDark ? '#999' : '#666'}
                secureTextEntry={true}
                onChangeText={handlePasswordChange}
                onFocus={() => handleFocus('password')}
                onBlur={() => handleBlur('password')}
                editable={!isAuthenticating}
              />
              {errors.password && (
                <Animated.Text 
                  entering={FadeInDown}
                  className="text-red-500 text-sm mt-1 ml-1"
                >
                  {errors.password}
                </Animated.Text>
              )}
            </View>
          </>
        ) : (
          <View>
            <AnimatedTextInput
              entering={FadeInDown.delay(400)}
              className={cn(
                "rounded-xl p-4 text-base border",
                isDark ? "text-white" : "text-[#111]",
                "backdrop-blur-md",
                errors.code && "border-red-500"
              )}
              style={[
                getInputStyle(!!errors.code),
                emailInputStyle
              ]}
              value={code}
              placeholder="Verification Code"
              placeholderTextColor={isDark ? '#999' : '#666'}
              onChangeText={handleCodeChange}
              onFocus={() => handleFocus('email')}
              onBlur={() => handleBlur('email')}
              editable={!isAuthenticating}
            />
            {errors.code && (
              <Animated.Text 
                entering={FadeInDown}
                className="text-red-500 text-sm mt-1 ml-1"
              >
                {errors.code}
              </Animated.Text>
            )}
          </View>
        )}
      </View>

      <View className="flex flex-col gap-6">
        <Animated.View entering={FadeInUp.delay(800)}>
          <Pressable
            onPress={handleSubmit}
            onPressIn={handleSignInPressIn}
            onPressOut={handleSignInPressOut}
            disabled={isAuthenticating}
          >
            <Animated.View
              className={cn(
                "rounded-xl p-4 border backdrop-blur-md items-center",
                isDark ? "bg-black/30" : "bg-white/40",
                isAuthenticating && "opacity-50"
              )}
              style={[
                {
                  borderColor: isDark
                    ? 'rgba(255, 105, 180, 0.25)'
                    : 'rgba(255, 105, 180, 0.15)',
                },
                signInButtonStyle
              ]}
            >
              <Text className={cn(
                "text-lg font-bold",
                isDark ? "text-pink-300" : "text-pink-600"
              )}>
                {isAuthenticating 
                  ? 'Please wait...' 
                  : isPendingVerification 
                    ? 'Verify Email' 
                    : type === 'sign-in' 
                      ? 'Sign In' 
                      : 'Sign Up'}
              </Text>
            </Animated.View>
          </Pressable>
        </Animated.View>

        {!isPendingVerification && (
          <>
            <View className="flex-row items-center">
              <View className={cn("flex-1 h-[1px]", isDark ? "bg-white/10" : "bg-black/10")} />
              <Text className={cn("mx-3 text-sm", isDark ? "text-gray-400" : "text-gray-600")}>
                or continue with
              </Text>
              <View className={cn("flex-1 h-[1px]", isDark ? "bg-white/10" : "bg-black/10")} />
            </View>

            <Animated.View entering={FadeInUp.delay(1000)}>
              <Pressable
                onPress={onOAuthPress}
                onPressIn={handleGooglePressIn}
                onPressOut={handleGooglePressOut}
                disabled={isAuthenticating}
              >
                <Animated.View
                  className={cn(
                    "rounded-xl p-4 border backdrop-blur-md flex-row justify-center items-center",
                    isDark ? "bg-black/30" : "bg-white/40",
                    isAuthenticating && "opacity-50"
                  )}
                  style={[
                    {
                      borderColor: isDark
                        ? 'rgba(255,255,255,0.15)'
                        : 'rgba(0,0,0,0.1)',
                    },
                    googleButtonStyle
                  ]}
                >
                  <FontAwesome name="google" size={20} color={isDark ? '#fff' : '#333'} />
                  <Text className={cn(
                    "text-lg font-bold ml-3",
                    isDark ? "text-white" : "text-[#333]"
                  )}>
                    {isAuthenticating ? 'Please wait...' : `${type === 'sign-in' ? 'Sign in' : 'Sign up'} with Google`}
                  </Text>
                </Animated.View>
              </Pressable>
            </Animated.View>

            <Animated.View 
              entering={FadeInUp.delay(1200)}
              className="flex-row justify-center mt-6"
            >
              <Text className={cn(
                "text-base",
                isDark ? "text-gray-400" : "text-gray-600"
              )}>
                {type === 'sign-in' ? "Don't have an account?" : "Already have an account?"}
              </Text>
              <Link href={type === 'sign-in' ? '/sign-up' : '/sign-in' as Href} asChild>
                <Pressable>
                  <Text className={cn(
                    "text-base font-bold ml-1",
                    isDark ? "text-pink-300" : "text-pink-600"
                  )}>
                    {type === 'sign-in' ? 'Sign up' : 'Sign in'}
                  </Text>
                </Pressable>
              </Link>
            </Animated.View>
          </>
        )}
      </View>
    </View>
  )
} 