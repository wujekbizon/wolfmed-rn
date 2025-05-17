import { View, Text, Pressable, useColorScheme } from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { cn } from '@/lib/utils'
import Animated, { FadeIn } from 'react-native-reanimated'
import { FloatingShapes } from '@/components/FloatingShapes'
import GradientOverlay from '@/components/GradientOverlay'

export default function UnmatchedRoute() {
  const router = useRouter()
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'

  return (
    <SafeAreaView className={cn("flex-1", isDark ? "bg-[#111]" : "bg-white")}>
      <GradientOverlay />
      <FloatingShapes count={3} />
      
      <Animated.View 
        entering={FadeIn.delay(200)}
        className="flex-1 justify-center items-center px-5"
      >
        <View className="z-10 items-center">
          <Text className={cn(
            "text-4xl font-bold mb-4",
            isDark ? "text-white" : "text-[#111]"
          )}>
            404
          </Text>
          <Text className={cn(
            "text-xl text-center mb-8",
            isDark ? "text-white/80" : "text-[#111]/80"
          )}>
            Oops! This page doesn&apos;t exist.
          </Text>
          
          <Pressable
            onPress={() => router.replace('/')}
            className={cn(
              "px-6 py-3 rounded-xl border",
              isDark ? "bg-black/30 border-pink-500/25" : "bg-white/40 border-pink-500/15",
              "backdrop-blur-md"
            )}
          >
            <Text className={cn(
              "text-lg font-semibold",
              isDark ? "text-pink-300" : "text-pink-600"
            )}>
              Go Home
            </Text>
          </Pressable>
        </View>
      </Animated.View>
    </SafeAreaView>
  )
} 