import { Text, View, Pressable, useColorScheme, ScrollView } from 'react-native'
import { useRouter } from 'expo-router'
import type { Href } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { AntDesign, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons'
import { useAuth } from '@clerk/expo'
import GradientOverlay from '@/components/GradientOverlay'
import { FloatingShapes } from '@/components/FloatingShapes'
import { CardHeader, StatCell, SkeletonRow, SkeletonLine } from '@/components/HomeCards'
import { useUserProfile } from '@/hooks/useUserProfile'
import { useCompletedTests } from '@/hooks/useCompletedTests'
import { useBlogPosts } from '@/hooks/useBlogPosts'
import type { CompletedTestData } from '@/types/dataTypes'

function calcStreak(tests: CompletedTestData[]): number {
  const valid = tests.filter((t) => t.completedAt != null)
  if (!valid.length) return 0
  const days = [...new Set(valid.map((t) => new Date(t.completedAt!).toDateString()))]
  days.sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
  let streak = 0
  const cursor = new Date()
  cursor.setHours(0, 0, 0, 0)
  for (const day of days) {
    const d = new Date(day)
    d.setHours(0, 0, 0, 0)
    if (d.getTime() === cursor.getTime()) {
      streak++
      cursor.setDate(cursor.getDate() - 1)
    } else {
      break
    }
  }
  return streak
}

function calcTodayTests(tests: CompletedTestData[]): number {
  const today = new Date().toDateString()
  return tests.filter((t) => t.completedAt && new Date(t.completedAt).toDateString() === today).length
}

export default function HomeScreen() {
  const colorScheme = useColorScheme()
  const router = useRouter()
  const { signOut, userId } = useAuth()

  const { userProfile, isLoading: profileLoading } = useUserProfile(userId ?? undefined)
  const { completedTests, isLoading: testsLoading } = useCompletedTests(userId ?? undefined)
  const { posts, isLoading: postsLoading } = useBlogPosts()

  const isDark = colorScheme === 'dark'
  const accentColor = isDark ? '#ff69b4' : '#db2777'
  const cardBg = isDark ? 'rgba(25,25,35,1)' : 'rgba(255,255,255,1)'
  const cardShadow = '#000'
  const textPrimary = isDark ? '#f0eeff' : '#1e1b4b'
  const textMuted = isDark ? 'rgba(240,238,255,0.45)' : 'rgba(30,27,75,0.45)'
  const iconBg = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(167,139,250,0.2)'
  const iconColor = isDark ? '#d7d3e3' : '#a78bfa'

  const streak = calcStreak(completedTests)
  const todayTests = calcTodayTests(completedTests)
  const scorePercent =
    userProfile && userProfile.totalQuestions > 0
      ? Math.round((userProfile.totalScore / userProfile.totalQuestions) * 100)
      : 0
  const latestPost = posts[0] ?? null

  const handleSignOut = async () => {
    try {
      await signOut()
      router.replace('/sign-in')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const cardStyle = {
    backgroundColor: cardBg,
    borderRadius: 16,
    padding: 16,
    shadowColor: cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 12,
  }

  const isLoading = profileLoading || testsLoading || postsLoading

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? '#111' : '#fdf2f8' }}>
      <GradientOverlay />
      <FloatingShapes count={6} />
      <SafeAreaView style={{ flex: 1, backgroundColor: 'transparent' }}>
        {/* Header */}
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
          {/* Streak card */}
          <View style={cardStyle}>
            <CardHeader icon={<MaterialCommunityIcons name="fire" size={18} color={iconColor} />} label="Seria nauki" iconBg={iconBg} textColor={textMuted} />
            {isLoading ? (
              <SkeletonRow />
            ) : (
              <View style={{ flexDirection: 'row', gap: 32, marginTop: 4 }}>
                <StatCell value={streak} label="dni z rzędu" textPrimary={textPrimary} textMuted={textMuted} />
                <StatCell value={todayTests} label="testy dziś" textPrimary={textPrimary} textMuted={textMuted} />
              </View>
            )}
          </View>

          {/* Stats card */}
          <View style={cardStyle}>
            <CardHeader icon={<Ionicons name="stats-chart" size={17} color={iconColor} />} label="Twoje wyniki" iconBg={iconBg} textColor={textMuted} />
            {isLoading ? (
              <SkeletonRow />
            ) : (
              <View style={{ flexDirection: 'row', gap: 32, marginTop: 4 }}>
                <StatCell value={`${scorePercent}%`} label="skuteczność" textPrimary={textPrimary} textMuted={textMuted} />
                <StatCell value={userProfile?.testsAttempted ?? 0} label="ukończone testy" textPrimary={textPrimary} textMuted={textMuted} />
              </View>
            )}
          </View>

          {/* Latest post card */}
          {(isLoading || latestPost) ? (
            <Pressable
              style={cardStyle}
              onPress={() => latestPost && router.push(`/blog/${latestPost.id}` as Href)}
            >
              <CardHeader icon={<Ionicons name="newspaper-outline" size={17} color={iconColor} />} label="Najnowszy wpis" iconBg={iconBg} textColor={textMuted} />
              {isLoading ? (
                <>
                  <SkeletonLine width="80%" />
                  <SkeletonLine width="60%" />
                </>
              ) : (
                <>
                  <Text style={{ fontSize: 15, fontWeight: '700', color: textPrimary, marginBottom: 4, marginTop: 4 }} numberOfLines={2}>
                    {latestPost!.title}
                  </Text>
                  <Text style={{ fontSize: 13, color: textMuted, lineHeight: 19 }} numberOfLines={3}>
                    {latestPost!.excerpt}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
                    <Text style={{ fontSize: 12, color: accentColor, fontWeight: '600' }}>Czytaj więcej</Text>
                    <Ionicons name="arrow-forward" size={12} color={accentColor} style={{ marginLeft: 4 }} />
                  </View>
                </>
              )}
            </Pressable>
          ) : null}
        </ScrollView>
      </SafeAreaView>
    </View>
  )
}

