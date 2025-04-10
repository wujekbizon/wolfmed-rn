import { useState, useCallback, useEffect } from 'react'
import { useSignIn } from '@clerk/clerk-expo'
import { Href, Link, useRouter } from 'expo-router'
import { Text, TextInput, Pressable, View, useColorScheme } from 'react-native'
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

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput)

export const useWarmUpBrowser = () => {
  useEffect(() => {
    void WebBrowser.warmUpAsync()
    return () => {
      void WebBrowser.coolDownAsync()
    }
  }, [])
}

WebBrowser.maybeCompleteAuthSession()

export default function SignInScreen() {
  useWarmUpBrowser()
  
  const { signIn, setActive, isLoaded } = useSignIn()
  const { startSSOFlow } = useSSO()
  const router = useRouter()
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'

  const [emailAddress, setEmailAddress] = useState('')
  const [password, setPassword] = useState('')
  const [isAuthenticating, setIsAuthenticating] = useState(false)
  
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

  const onSignInPress = useCallback(async () => {
    if (!isLoaded || isAuthenticating) return
    setIsAuthenticating(true)
    
    try {
      const signInAttempt = await signIn.create({
        identifier: emailAddress,
        password,
      })

      if (signInAttempt.status === 'complete') {
        await setActive({ session: signInAttempt.createdSessionId })
        router.replace('/')
      } else {
        console.error(JSON.stringify(signInAttempt, null, 2))
      }
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2))
    } finally {
      setIsAuthenticating(false)
    }
  }, [isLoaded, emailAddress, password, isAuthenticating])

  const handleOAuthSignIn = useCallback(async () => {
    if (!isLoaded || isAuthenticating) return
    setIsAuthenticating(true)
    
    try {
      const { createdSessionId, setActive: setActiveSession, signIn: oauthSignIn } = await startSSOFlow({
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
        router.replace('/')
      } else if (oauthSignIn) {
        console.log("Additional sign in steps required")
      }
    } catch (err) {
      console.error("OAuth error:", err)
    } finally {
      setIsAuthenticating(false)
    }
  }, [isLoaded, isAuthenticating])

  if (!isLoaded) {
    return null
  }

  return (
    <SafeAreaView className={cn("flex-1", isDark ? "bg-[#111]" : "bg-white")}>
      <GradientOverlay />
      <FloatingShapes count={4} />
      
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
            Welcome Back
          </Animated.Text>
          
          <View className="flex flex-col gap-4 mb-6">
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
          </View>

          <View className="flex flex-col gap-6">
            <Animated.View 
              entering={FadeInUp.delay(800)}
            >
              <Pressable
                onPress={onSignInPress}
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
                    {isAuthenticating ? 'Signing in...' : 'Sign In'}
                  </Text>
                </Animated.View>
              </Pressable>
            </Animated.View>

            <View className="flex-row items-center">
              <View className={cn("flex-1 h-[1px]", isDark ? "bg-white/10" : "bg-black/10")} />
              <Text className={cn("mx-3 text-sm", isDark ? "text-gray-400" : "text-gray-600")}>
                or continue with
              </Text>
              <View className={cn("flex-1 h-[1px]", isDark ? "bg-white/10" : "bg-black/10")} />
            </View>

            <Animated.View entering={FadeInUp.delay(1000)}>
              <Pressable
                onPress={handleOAuthSignIn}
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
                    {isAuthenticating ? 'Signing in...' : 'Sign in with Google'}
                  </Text>
                </Animated.View>
              </Pressable>
            </Animated.View>
          </View>

          <Animated.View 
            entering={FadeInUp.delay(1200)}
            className="flex-row justify-center mt-6"
          >
            <Text className={cn(
              "text-base",
              isDark ? "text-gray-400" : "text-gray-600"
            )}>
              Don't have an account?
            </Text>
            <Link href={'/sign-up' as Href} asChild>
              <Pressable>
                <Text className={cn(
                  "text-base font-bold ml-1",
                  isDark ? "text-pink-300" : "text-pink-600"
                )}>
                  Sign up
                </Text>
              </Pressable>
            </Link>
          </Animated.View>
        </View>
      </View>
    </SafeAreaView>
  )
}
