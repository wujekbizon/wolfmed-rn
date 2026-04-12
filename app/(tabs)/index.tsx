import { View, Pressable, useColorScheme, ScrollView } from 'react-native'
import { useRouter } from 'expo-router'
import type { Href } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { AntDesign } from '@expo/vector-icons'
import { useAuth } from '@clerk/expo'
import GradientOverlay from '@/components/GradientOverlay'
import { FloatingShapes } from '@/components/FloatingShapes'
import { StreakCard } from '@/components/StreakCard'
import { StatsCard } from '@/components/StatsCard'
import { LatestPostCard } from '@/components/LatestPostCard'
import { useUserProfile } from '@/hooks/useUserProfile'
import { useCompletedTests } from '@/hooks/useCompletedTests'
import { useBlogPosts } from '@/hooks/useBlogPosts'
import { calcStreak, calcTodayTests } from '@/helpers/testStats'

export default function HomeScreen() {
  const colorScheme = useColorScheme()
  const router = useRouter()
  const { signOut, userId } = useAuth()

  const { userProfile, isLoading: profileLoading } = useUserProfile(userId ?? undefined)
  const { completedTests, isLoading: testsLoading } = useCompletedTests(userId ?? undefined)
  const { posts, isLoading: postsLoading } = useBlogPosts()

  const isDark = colorScheme === 'dark'
  const accentColor = isDark ? '#ff69b4' : '#db2777'

  const streak = calcStreak(completedTests)
  const todayTests = calcTodayTests(completedTests)
  const scorePercent =
    userProfile && userProfile.totalQuestions > 0
      ? Math.round((userProfile.totalScore / userProfile.totalQuestions) * 100)
      : 0
  const latestPost = posts[0] ?? null
  const isLoading = profileLoading || testsLoading || postsLoading

  const handleSignOut = async () => {
    try {
      await signOut()
      router.replace('/sign-in')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? '#111' : '#fdf2f8' }}>
      <GradientOverlay />
      <FloatingShapes count={6} />
      <SafeAreaView style={{ flex: 1, backgroundColor: 'transparent' }}>
        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: 20, paddingTop: 4 }}>
          <Pressable
            onPress={handleSignOut}
            style={{ borderRadius: 999, padding: 8, backgroundColor: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.5)' }}
          >
            <AntDesign name="logout" size={20} color={accentColor} />
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        >
          <StreakCard streak={streak} todayTests={todayTests} isLoading={isLoading} />
          <StatsCard scorePercent={scorePercent} testsAttempted={userProfile?.testsAttempted ?? 0} isLoading={isLoading} />
          <LatestPostCard
            post={latestPost}
            isLoading={isLoading}
            onPress={() => router.push(`/blog/${latestPost!.id}` as Href)}
          />
        </ScrollView>
      </SafeAreaView>
    </View>
  )
}
