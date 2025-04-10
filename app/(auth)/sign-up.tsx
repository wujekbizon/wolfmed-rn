import React, { useState, useCallback } from 'react'
import { TextInput, Pressable, View, Text, KeyboardAvoidingView, Platform, useColorScheme } from 'react-native'
import { useSignUp, useUser } from '@clerk/clerk-expo'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { FloatingShapes } from '@/components/FloatingShapes'
import GradientOverlay from '@/components/GradientOverlay'
import Animated, { 
  FadeInDown, 
  FadeInUp,
} from 'react-native-reanimated'
import { FontAwesome } from '@expo/vector-icons'
import * as WebBrowser from 'expo-web-browser'
import * as AuthSession from 'expo-auth-session'
import { useSSO } from '@clerk/clerk-expo'
import { cn } from '@/lib/utils'
import { useAuthAnimations } from '@/hooks/useAuthAnimations'
import { useWarmUpBrowser } from './sign-in'

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput)

WebBrowser.maybeCompleteAuthSession()

export default function SignUpScreen() {
  useWarmUpBrowser()

  const { isLoaded, signUp, setActive } = useSignUp()
  const { startSSOFlow } = useSSO()
  const { user } = useUser()
  const router = useRouter()
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'

  const [emailAddress, setEmailAddress] = useState('')
  const [password, setPassword] = useState('')
  const [pendingVerification, setPendingVerification] = useState(false)
  const [code, setCode] = useState('')
  const [isAuthenticating, setIsAuthenticating] = useState(false)
  
  const {
    handleSignInPressIn: handleSignUpPressIn,
    handleSignInPressOut: handleSignUpPressOut,
    handleGooglePressIn,
    handleGooglePressOut,
    signInButtonStyle: signUpButtonStyle,
    googleButtonStyle,
    emailInputStyle,
    passwordInputStyle,
    handleFocus,
    handleBlur,
  } = useAuthAnimations()

  const onSignUpPress = useCallback(async () => {
    if (!isLoaded || isAuthenticating) return
    setIsAuthenticating(true)

    try {
      await signUp.create({
        emailAddress,
        password,
      })

      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' })
      setPendingVerification(true)
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2))
    } finally {
      setIsAuthenticating(false)
    }
  }, [isLoaded, isAuthenticating, emailAddress, password])

  const handleOAuthSignUp = useCallback(async () => {
    if (!isLoaded || isAuthenticating) return
    setIsAuthenticating(true)
    
    try {
      const { createdSessionId, setActive: setActiveSession, signUp: oauthSignUp } = await startSSOFlow({
        strategy: "oauth_google",
        redirectUrl: AuthSession.makeRedirectUri({
          scheme: 'com.wujekbizon.wolfmed',
          path: '/(auth)/oauth-callback'
        }),
      })
      
      if (createdSessionId) {
        if (setActiveSession) {
          await setActiveSession({ session: createdSessionId })
        }
        
        // Set user role if this is a new signup
        if (oauthSignUp?.status === 'complete' && oauthSignUp.createdUserId) {
          await user?.update({
            unsafeMetadata: { role: 'user' },
          })
        }
        
        router.replace('/')
      }
    } catch (err) {
      console.error("OAuth error:", err)
    } finally {
      setIsAuthenticating(false)
    }
  }, [isLoaded, isAuthenticating, user])

  const onPressVerify = async () => {
    if (!isLoaded || isAuthenticating) return
    setIsAuthenticating(true)

    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code,
      })

      if (completeSignUp.status === 'complete') {
        await setActive({ session: completeSignUp.createdSessionId })
        await user?.update({
          unsafeMetadata: { role: 'user' },
        })
        router.replace('/')
      } else {
        console.error(JSON.stringify(completeSignUp, null, 2))
      }
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2))
    } finally {
      setIsAuthenticating(false)
    }
  }

  if (!isLoaded) {
    return null
  }

  return (
    <SafeAreaView className={cn("flex-1", isDark ? "bg-[#111]" : "bg-white")}>
      <GradientOverlay />
      <FloatingShapes count={4} />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        className="flex-1"
      >
        <View className="flex-1 justify-center px-5">
          <View className="z-10">
            <Animated.Text 
              entering={FadeInDown.delay(200)}
              className={cn(
                "text-4xl font-bold text-center mb-8",
                isDark ? "text-white" : "text-[#111]",
                "shadow-[0_1px_12px_rgba(236,72,153,0.3)]"
              )}
            >
              {pendingVerification ? 'Verify Email' : 'Create Account'}
            </Animated.Text>

            <View className="flex flex-col gap-4 mb-6">
              {!pendingVerification ? (
                <>
                  <AnimatedTextInput
                    entering={FadeInDown.delay(400)}
                    className={cn(
                      "rounded-xl p-4 text-base border",
                      isDark ? "text-white" : "text-[#111]",
                      "backdrop-blur-md"
                    )}
                    style={[
                      {
                        borderColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)',
                        backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                      },
                      emailInputStyle
                    ]}
                    autoCapitalize="none"
                    value={emailAddress}
                    placeholder="Email"
                    placeholderTextColor={isDark ? '#999' : '#666'}
                    onChangeText={setEmailAddress}
                    onFocus={() => handleFocus('email')}
                    onBlur={() => handleBlur('email')}
                    editable={!isAuthenticating}
                  />
                  <AnimatedTextInput
                    entering={FadeInDown.delay(600)}
                    className={cn(
                      "rounded-xl p-4 text-base border",
                      isDark ? "text-white" : "text-[#111]",
                      "backdrop-blur-md"
                    )}
                    style={[
                      {
                        borderColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)',
                        backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                      },
                      passwordInputStyle
                    ]}
                    value={password}
                    placeholder="Password"
                    placeholderTextColor={isDark ? '#999' : '#666'}
                    secureTextEntry={true}
                    onChangeText={setPassword}
                    onFocus={() => handleFocus('password')}
                    onBlur={() => handleBlur('password')}
                    editable={!isAuthenticating}
                  />
                </>
              ) : (
                <AnimatedTextInput
                  entering={FadeInDown.delay(400)}
                  className={cn(
                    "rounded-xl p-4 text-base border",
                    isDark ? "text-white" : "text-[#111]",
                    "backdrop-blur-md"
                  )}
                  style={[
                    {
                      borderColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)',
                      backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                    },
                    emailInputStyle
                  ]}
                  value={code}
                  placeholder="Verification Code"
                  placeholderTextColor={isDark ? '#999' : '#666'}
                  onChangeText={setCode}
                  onFocus={() => handleFocus('email')}
                  onBlur={() => handleBlur('email')}
                  editable={!isAuthenticating}
                />
              )}
            </View>

            <View className="flex flex-col gap-6">
              <Animated.View 
                entering={FadeInUp.delay(800)}
              >
                <Pressable
                  onPress={pendingVerification ? onPressVerify : onSignUpPress}
                  onPressIn={handleSignUpPressIn}
                  onPressOut={handleSignUpPressOut}
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
                      signUpButtonStyle
                    ]}
                  >
                    <Text className={cn(
                      "text-lg font-bold",
                      isDark ? "text-pink-300" : "text-pink-600"
                    )}>
                      {isAuthenticating ? 'Please wait...' : (pendingVerification ? 'Verify Email' : 'Sign Up')}
                    </Text>
                  </Animated.View>
                </Pressable>
              </Animated.View>

              {!pendingVerification && (
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
                      onPress={handleOAuthSignUp}
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
                          {isAuthenticating ? 'Please wait...' : 'Sign up with Google'}
                        </Text>
                      </Animated.View>
                    </Pressable>
                  </Animated.View>
                </>
              )}
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
