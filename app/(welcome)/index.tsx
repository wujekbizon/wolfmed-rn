import React from 'react'
import { Text, View, Pressable, useWindowDimensions } from 'react-native'
import { useColorScheme } from 'react-native'
import { Link, useRouter } from 'expo-router'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated'
import GradientOverlay from '@/components/GradientOverlay'
import { FloatingShapes } from '@/components/FloatingShapes'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { AntDesign } from '@expo/vector-icons'
import { useAuth } from '@clerk/clerk-expo'

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

export default function WelcomeScreen() {
  const colorScheme = useColorScheme()
  const { height } = useWindowDimensions()
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const { signOut } = useAuth()
  const buttonScale = useSharedValue(1)
  const buttonGlow = useSharedValue(0)
  const arrowX = useSharedValue(0)

  // Subtle continuous button animation
  React.useEffect(() => {
    buttonGlow.value = withRepeat(
      withSequence(
        withTiming(1, { 
          duration: 2000,
          easing: Easing.bezier(0.4, 0, 0.2, 1)
        }),
        withTiming(0, { 
          duration: 2000,
          easing: Easing.bezier(0.4, 0, 0.2, 1)
        })
      ),
      -1,
      true
    )

    // Subtle arrow movement
    arrowX.value = withRepeat(
      withSequence(
        withTiming(4, {
          duration: 1200,
          easing: Easing.bezier(0.4, 0, 0.2, 1)
        }),
        withTiming(0, {
          duration: 1200,
          easing: Easing.bezier(0.4, 0, 0.2, 1)
        })
      ),
      -1,
      true
    )
  }, [])

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
    shadowOpacity: colorScheme === 'dark' ? (0.15 + buttonGlow.value * 0.1) : (0.3 + buttonGlow.value * 0.2),
    shadowRadius: colorScheme === 'dark' ? (4 + buttonGlow.value * 2) : (8 + buttonGlow.value * 4),
  }))

  const arrowAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: arrowX.value }]
  }))

  const handlePressIn = () => {
    buttonScale.value = withSpring(0.95, {
      mass: 0.5,
      damping: 10,
      stiffness: 100,
    })
  }

  const handlePressOut = () => {
    buttonScale.value = withSpring(1, {
      mass: 0.5,
      damping: 10,
      stiffness: 100,
    })
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      router.replace('/sign-in')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <View 
      className={`flex-1 ${colorScheme === 'dark' ? 'bg-[#111]' : 'bg-white'}`}
      style={{ paddingTop: insets.top }}
    >
      {/* Temporary Logout Button - Development Only */}
      <Pressable
        onPress={handleSignOut}
        className="absolute right-4 z-50 rounded-full p-2"
        style={{
          backgroundColor: colorScheme === 'dark' ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.3)',
          top: insets.top + 8,
        }}
      >
        <AntDesign 
          name="logout" 
          size={24} 
          color={colorScheme === 'dark' ? '#ff69b4' : '#db2777'} 
        />
      </Pressable>

      <View className="flex-1 justify-center items-center px-6">
        <GradientOverlay />
        <FloatingShapes count={6} />
        
        <View className="z-10 items-center w-full max-w-[320px] py-16">
          <View className="mb-4">
            <Text 
              className={`
                text-5xl font-semibold text-center tracking-tight leading-none mb-1
                ${colorScheme === 'dark' ? 'text-white' : 'text-[#111]'}
              `}
              style={{
                textShadowColor: colorScheme === 'dark' 
                  ? 'rgba(236, 72, 153, 0.3)'
                  : 'rgba(236, 72, 153, 0.2)',
                textShadowOffset: { width: 0, height: 1 },
                textShadowRadius: 12,
                fontFamily: 'System'
              }}
            >
              WOLFMED
            </Text>
            <Text 
              className={`
                text-2xl font-medium text-center tracking-tight
                ${colorScheme === 'dark' ? 'text-white/80' : 'text-[#111]/80'}
              `}
            >
              EDUKACJA
            </Text>
          </View>
          
          <Text 
            className={`
              text-lg text-center mb-20 leading-relaxed
              ${colorScheme === 'dark' ? 'text-gray-300/90' : 'text-gray-700/90'}
            `}
          >
            Twoja ścieżka do{'\n'}
            <Text 
              className="text-transparent font-small"
              style={{
                textShadowColor: colorScheme === 'dark' 
                  ? '#ff69b4'
                  : '#db2777',
                textShadowOffset: { width: 0, height: 0 },
                textShadowRadius: 4,
                color: colorScheme === 'dark' 
                  ? '#ff69b4'
                  : '#db2777',
              }}
            >
              doskonałości medycznej
            </Text>
          </Text>

          <Pressable
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onPress={() => router.push('/(tabs)')}
            className="w-full active:opacity-90"
          >
            <Animated.View
              style={[
                buttonAnimatedStyle,
                {
                  backgroundColor: colorScheme === 'dark' 
                    ? 'rgba(0, 0, 0, 0.3)'
                    : 'rgba(255, 255, 255, 0.4)',
                  backdropFilter: 'blur(8px)',
                  borderWidth: 1,
                  borderColor: colorScheme === 'dark'
                    ? 'rgba(255, 105, 180, 0.2)'
                    : 'rgba(255, 105, 180, 0.15)',
                  shadowColor: colorScheme === 'dark'
                    ? 'rgba(255, 105, 180, 0.2)'
                    : 'rgba(255, 105, 180, 0.2)',
                }
              ]}
              className={`
                py-4 px-6 rounded-2xl
                shadow-lg
                flex-row items-center justify-between
                overflow-hidden
              `}
            >
              <View className="flex-1 mr-3">
                <Text 
                  className={`
                    text-lg font-semibold text-left
                    ${colorScheme === 'dark' ? 'text-pink-300' : 'text-pink-600'}
                  `}
                  style={{
                    textShadowColor: colorScheme === 'dark' 
                      ? 'rgba(236, 72, 153, 0.4)'
                      : 'rgba(236, 72, 153, 0.1)',
                    textShadowOffset: { width: 0, height: 0 },
                    textShadowRadius: 4,
                  }}
                >
                  Rozpocznij naukę
                </Text>
                <Text 
                  className={`
                    text-sm mt-0.5 text-left
                    ${colorScheme === 'dark' ? 'text-pink-300/70' : 'text-pink-600/70'}
                  `}
                >
                  Dołącz do społeczności
                </Text>
              </View>
              <Animated.View 
                style={[arrowAnimatedStyle]}
                className={`
                  rounded-xl p-2 self-center
                  ${colorScheme === 'dark' 
                    ? 'bg-black/30' 
                    : 'bg-white/50'
                  }
                `}
              >
                <AntDesign 
                  name="arrowright" 
                  size={20} 
                  color={colorScheme === 'dark' ? '#f9a8d4' : '#db2777'} 
                />
              </Animated.View>
            </Animated.View>
          </Pressable>
        </View>
      </View>
    </View>
  )
} 