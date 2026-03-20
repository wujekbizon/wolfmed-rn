import React, { useCallback } from 'react'
import { View, Text, StyleSheet, useColorScheme } from 'react-native'
import { FlashList } from '@shopify/flash-list'
import { useRouter } from 'expo-router'
import { Post } from '@/types/dataTypes'
import { useBlogPosts } from '@/hooks/useBlogPosts'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import BlogPostCard from '@/components/BlogPostCard'
import BlogHeroSection from '@/components/BlogHeroSection'

export default function BlogScreen() {
  const { posts, isLoading } = useBlogPosts()
  const router = useRouter()
  const isDark = useColorScheme() === 'dark'

  const handlePress = useCallback(
    (id: string) => {
      router.push(`/blog/${id}` as any)
    },
    [router]
  )

  const renderItem = useCallback(
    ({ item }: { item: Post }) => (
      <BlogPostCard post={item} onPress={() => handlePress(item.id)} />
    ),
    [handlePress]
  )

  return (
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
  )
}

const styles = StyleSheet.create({
  empty: {
    textAlign: 'center',
    color: '#6b7280',
    marginTop: 40,
    fontSize: 16,
  },
})
