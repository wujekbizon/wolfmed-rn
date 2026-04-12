import React, { useCallback } from 'react'
import { View, Text, Pressable, StyleSheet, useColorScheme } from 'react-native'
import { FlashList } from '@shopify/flash-list'
import { useRouter } from 'expo-router'
import Ionicons from '@expo/vector-icons/Ionicons'
import * as Haptics from 'expo-haptics'
import { Post } from '@/types/dataTypes'
import { useBlogPosts } from '@/hooks/useBlogPosts'
import { useIsAdmin } from '@/hooks/useIsAdmin'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import BlogPostCard from '@/components/BlogPostCard'
import BlogHeroSection from '@/components/BlogHeroSection'

export default function BlogScreen() {
  const { posts, isLoading } = useBlogPosts()
  const router = useRouter()
  const isDark = useColorScheme() === 'dark'
  const isAdmin = useIsAdmin()

  const handlePress = useCallback(
    (id: string, title: string, date: string) => {
      router.push({ pathname: `/blog/${id}` as any, params: { title, date } })
    },
    [router]
  )

  const handleCreate = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    router.push('/blog/create' as any)
  }, [router])

  const renderItem = useCallback(
    ({ item }: { item: Post }) => (
      <BlogPostCard post={item} onPress={() => handlePress(item.id, item.title, item.date)} />
    ),
    [handlePress]
  )

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <FlashList
        data={posts}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          padding: 16,
          backgroundColor: isDark ? '#09090b' : '#ffffff',
        }}
        ListHeaderComponent={<BlogHeroSection postCount={posts.length} />}
        ListFooterComponent={<LoadingSpinner isLoading={isLoading} />}
        ListEmptyComponent={
          !isLoading ? (
            <Text style={styles.empty}>Brak artykułów</Text>
          ) : null
        }
      />

      {isAdmin && (
        <Pressable style={styles.fab} onPress={handleCreate}>
          <Ionicons name="add" size={28} color="#ffffff" />
        </Pressable>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  containerDark: {
    backgroundColor: '#09090b',
  },
  empty: {
    textAlign: 'center',
    color: '#6b7280',
    marginTop: 40,
    fontSize: 16,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#A491BB',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#280652',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
})
