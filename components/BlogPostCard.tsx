import React, { useState, useCallback } from 'react'
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  useColorScheme,
} from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated'
import Ionicons from '@expo/vector-icons/Ionicons'
import * as Haptics from 'expo-haptics'
import { Post } from '@/types/dataTypes'
import { useComments } from '@/hooks/useComments'

const CARD_COLORS = [
  '#e8dff5',
  '#f3e8ff',
  '#ddd6f3',
  '#ead4f7',
  '#d4c5e8',
]

const COMMENT_ROW_HEIGHT = 64
const EXPANDED_PADDING = 12

function getCardColor(id: string): string {
  return CARD_COLORS[id.charCodeAt(0) % CARD_COLORS.length]
}

type CommentRowProps = {
  userId: string
  content: string
  createdAt: Date
}

function CommentRow({ userId, content, createdAt }: CommentRowProps) {
  const initial = String(userId).charAt(0).toUpperCase()
  const date = new Date(createdAt).toLocaleDateString('pl-PL', {
    day: 'numeric',
    month: 'short',
  })
  return (
    <View style={commentStyles.row}>
      <View style={commentStyles.avatar}>
        <Text style={commentStyles.avatarText}>{initial}</Text>
      </View>
      <View style={commentStyles.body}>
        <View style={commentStyles.header}>
          <Text style={commentStyles.username} numberOfLines={1}>
            {userId.slice(0, 12)}
          </Text>
          <Text style={commentStyles.date}>{date}</Text>
        </View>
        <Text style={commentStyles.content} numberOfLines={1}>
          {content}
        </Text>
      </View>
    </View>
  )
}

const commentStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 8,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#A491BB40',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#A491BB',
    fontWeight: '700',
    fontSize: 13,
  },
  body: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  username: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1f2937',
    flex: 1,
  },
  date: {
    fontSize: 11,
    color: '#6b7280',
  },
  content: {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 18,
  },
})

type Props = {
  post: Post
  onPress: () => void
}

export default function BlogPostCard({ post, onPress }: Props) {
  const isDark = useColorScheme() === 'dark'
  const [isExpanded, setIsExpanded] = useState(false)
  const { comments, isLoading } = useComments(post.id)

  const displayedComments = comments.slice(-2)
  const emptyExpanded = isExpanded && !isLoading && comments.length === 0

  const commentCount = comments.length
  const commentLabel =
    commentCount === 1 ? '1 komentarz' : `${commentCount} komentarzy`

  const expandHeight = useSharedValue(0)
  const animStyle = useAnimatedStyle(() => ({
    height: expandHeight.value,
    overflow: 'hidden',
  }))

  const targetHeight =
    (displayedComments.length || 1) * COMMENT_ROW_HEIGHT + EXPANDED_PADDING * 2 + 32

  const handleToggle = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    const next = !isExpanded
    setIsExpanded(next)
    expandHeight.value = withTiming(next ? targetHeight : 0, { duration: 250 })
  }, [isExpanded, expandHeight, targetHeight])

  const handleCardPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    onPress()
  }, [onPress])

  const [cardColor] = useState(() => getCardColor(post.id))

  return (
    <View style={[styles.card, isDark ? styles.cardDark : styles.cardLight]}>
      {/* Color top */}
      <Pressable onPress={handleCardPress}>
        <View style={[styles.gradientTop, { backgroundColor: cardColor }]}>
          <View style={styles.dateBadge}>
            <Text style={styles.dateBadgeText}>{post.date}</Text>
          </View>
        </View>

        {/* Body */}
        <View style={styles.body}>
          <Text
            style={[styles.title, isDark && styles.titleDark]}
            numberOfLines={2}
          >
            {post.title}
          </Text>
          <Text style={styles.excerpt} numberOfLines={2}>
            {post.excerpt}
          </Text>
        </View>
      </Pressable>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Footer row */}
      <Pressable style={styles.footer} onPress={handleToggle}>
        <View style={styles.footerLeft}>
          <Ionicons name="chatbubble-outline" size={15} color="#A491BB" />
          <Text style={styles.commentLabel}>{commentLabel}</Text>
        </View>
        <Ionicons
          name={isExpanded ? 'chevron-up' : 'chevron-down'}
          size={16}
          color="#6b7280"
        />
      </Pressable>

      {/* Expandable comments */}
      <Animated.View style={animStyle}>
        <View style={[styles.expandedArea, isDark && styles.expandedAreaDark]}>
          {isLoading ? (
            <Text style={styles.loadingText}>Ładowanie...</Text>
          ) : emptyExpanded ? (
            <Text style={styles.emptyText}>Brak komentarzy</Text>
          ) : (
            displayedComments.map((c) => (
              <CommentRow
                key={c.id}
                userId={c.userId}
                content={c.content}
                createdAt={c.createdAt}
              />
            ))
          )}
          <Pressable onPress={handleCardPress}>
            <Text style={styles.readMore}>Czytaj więcej →</Text>
          </Pressable>
        </View>
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#280652',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    overflow: 'hidden',
  },
  cardLight: {
    backgroundColor: '#ffffff',
  },
  cardDark: {
    backgroundColor: '#27272a',
  },
  gradientTop: {
    height: 110,
    justifyContent: 'flex-end',
    padding: 12,
  },
  dateBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.85)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  dateBadgeText: {
    fontSize: 11,
    color: '#1f2937',
    fontWeight: '500',
  },
  body: {
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
    lineHeight: 22,
    marginBottom: 6,
  },
  titleDark: {
    color: '#f9fafb',
  },
  excerpt: {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 19,
  },
  divider: {
    height: 1,
    backgroundColor: '#A491BB22',
    marginHorizontal: 14,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  footerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  commentLabel: {
    fontSize: 13,
    color: '#A491BB',
    fontWeight: '500',
  },
  expandedArea: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#f9f5ff',
    borderTopWidth: 1,
    borderTopColor: '#A491BB22',
  },
  expandedAreaDark: {
    backgroundColor: '#1c1c1f',
  },
  loadingText: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  readMore: {
    fontSize: 13,
    color: '#A491BB',
    fontWeight: '600',
    marginTop: 4,
  },
})
