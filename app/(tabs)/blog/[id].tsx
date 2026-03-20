import React, { useState, useCallback } from 'react'
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Pressable,
  StyleSheet,
  useColorScheme,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native'
import Ionicons from '@expo/vector-icons/Ionicons'
import { useLocalSearchParams } from 'expo-router'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@clerk/expo'
import Animated, {
  useSharedValue,
  withTiming,
  useAnimatedStyle,
} from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'
import { createApiClient } from '@/services/apiClient'
import { createBlogService } from '@/services/blogService'
import { useAddComment } from '@/hooks/useAddComment'
import { useDeleteComment } from '@/hooks/useDeleteComment'
import { useUpdateComment } from '@/hooks/useUpdateComment'
import { useComments } from '@/hooks/useComments'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { Comment } from '@/types/dataTypes'

const CARD_COLORS = ['#e8dff5', '#f3e8ff', '#ddd6f3', '#ead4f7', '#d4c5e8']

function getCardColor(id: string): string {
  return CARD_COLORS[id.charCodeAt(0) % CARD_COLORS.length]
}

type CommentItemProps = {
  comment: Comment
  isDark: boolean
  currentUserId: string | null | undefined
  blogPostId: string
}

function CommentItem({ comment, isDark, currentUserId, blogPostId }: CommentItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editText, setEditText] = useState(comment.content)
  const { mutate: deleteComment, isPending: isDeleting } = useDeleteComment()
  const { mutate: updateComment, isPending: isUpdating } = useUpdateComment()

  const isOwner = currentUserId === comment.userId
  const initial = String(comment.userId).charAt(0).toUpperCase()
  const date = new Date(comment.createdAt).toLocaleDateString('pl-PL', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

  const handleDelete = useCallback(() => {
    Alert.alert('Usuń komentarz', 'Na pewno chcesz usunąć ten komentarz?', [
      { text: 'Anuluj', style: 'cancel' },
      {
        text: 'Usuń',
        style: 'destructive',
        onPress: () => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
          deleteComment({ commentId: comment.id, blogPostId })
        },
      },
    ])
  }, [comment.id, blogPostId, deleteComment])

  const handleSaveEdit = useCallback(() => {
    if (!editText.trim() || editText.trim() === comment.content) {
      setIsEditing(false)
      return
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    updateComment(
      { commentId: comment.id, blogPostId, content: editText.trim() },
      { onSuccess: () => setIsEditing(false) }
    )
  }, [editText, comment.id, comment.content, blogPostId, updateComment])

  return (
    <View style={[commentStyles.item, isDark && commentStyles.itemDark]}>
      <View style={commentStyles.avatar}>
        <Text style={commentStyles.avatarText}>{initial}</Text>
      </View>
      <View style={commentStyles.body}>
        <View style={commentStyles.headerRow}>
          <Text style={[commentStyles.username, isDark && commentStyles.usernameDark]}>
            {comment.userId.slice(0, 16)}
          </Text>
          <View style={commentStyles.headerRight}>
            <Text style={commentStyles.date}>{date}</Text>
            {isOwner && !isEditing && (
              <View style={commentStyles.actions}>
                <Pressable
                  onPress={() => { setEditText(comment.content); setIsEditing(true) }}
                  hitSlop={8}
                  disabled={isDeleting}
                >
                  <Ionicons name="create-outline" size={16} color="#A491BB" />
                </Pressable>
                <Pressable onPress={handleDelete} hitSlop={8} disabled={isDeleting}>
                  <Ionicons name="trash-outline" size={16} color="#dc2626" />
                </Pressable>
              </View>
            )}
          </View>
        </View>

        {isEditing ? (
          <View>
            <TextInput
              style={[commentStyles.editInput, isDark && commentStyles.editInputDark]}
              value={editText}
              onChangeText={setEditText}
              multiline
              autoFocus
              textAlignVertical="top"
            />
            <View style={commentStyles.editActions}>
              <Pressable
                style={[commentStyles.editBtn, commentStyles.editBtnCancel]}
                onPress={() => setIsEditing(false)}
              >
                <Text style={commentStyles.editBtnCancelText}>Anuluj</Text>
              </Pressable>
              <Pressable
                style={[commentStyles.editBtn, commentStyles.editBtnSave, isUpdating && commentStyles.editBtnDisabled]}
                onPress={handleSaveEdit}
                disabled={isUpdating}
              >
                <Text style={commentStyles.editBtnSaveText}>
                  {isUpdating ? 'Zapisuję...' : 'Zapisz'}
                </Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <Text style={[commentStyles.content, isDark && commentStyles.contentDark]}>
            {comment.content}
          </Text>
        )}
      </View>
    </View>
  )
}

const commentStyles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#A491BB22',
  },
  itemDark: {
    borderBottomColor: '#ffffff15',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#A491BB40',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#A491BB',
    fontWeight: '700',
    fontSize: 14,
  },
  body: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  username: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1f2937',
    flex: 1,
  },
  usernameDark: {
    color: '#f9fafb',
  },
  date: {
    fontSize: 11,
    color: '#6b7280',
  },
  content: {
    fontSize: 14,
    color: '#1f2937',
    lineHeight: 20,
  },
  contentDark: {
    color: '#d1d5db',
  },
  editInput: {
    backgroundColor: '#A491BB20',
    borderColor: '#A491BB70',
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
    fontSize: 14,
    color: '#1f2937',
    minHeight: 60,
    marginBottom: 6,
  },
  editInputDark: {
    color: '#f9fafb',
    backgroundColor: '#A491BB15',
  },
  editActions: {
    flexDirection: 'row',
    gap: 8,
  },
  editBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
  },
  editBtnCancel: {
    backgroundColor: '#f3f4f6',
  },
  editBtnCancelText: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '500',
  },
  editBtnSave: {
    backgroundColor: '#A491BB',
  },
  editBtnSaveText: {
    fontSize: 13,
    color: '#ffffff',
    fontWeight: '600',
  },
  editBtnDisabled: {
    opacity: 0.5,
  },
})

export default function BlogPostScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { getToken, userId } = useAuth()
  const isDark = useColorScheme() === 'dark'

  const { data: post, isLoading: postLoading } = useQuery({
    queryKey: ['blogPost', id],
    queryFn: () => {
      const api = createApiClient(getToken)
      return createBlogService(api).getById(id)
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  })

  const { comments, isLoading: commentsLoading } = useComments(id, { enabled: !!id })
  const { mutate: addComment, isPending } = useAddComment()
  const [comment, setComment] = useState('')
  const successOpacity = useSharedValue(0)
  const successStyle = useAnimatedStyle(() => ({ opacity: successOpacity.value }))

  const handleSubmit = useCallback(() => {
    if (!comment.trim() || !userId || !id) return
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    addComment(
      { blogPostId: id, userId, content: comment.trim() },
      {
        onSuccess: () => {
          setComment('')
          successOpacity.value = withTiming(1, { duration: 300 })
          setTimeout(() => {
            successOpacity.value = withTiming(0, { duration: 500 })
          }, 2500)
        },
      }
    )
  }, [comment, userId, id, addComment, successOpacity])

  const bg = isDark ? '#09090b' : '#ffffff'
  const textColor = isDark ? '#f9fafb' : '#1f2937'

  if (postLoading) {
    return (
      <View style={[styles.center, { backgroundColor: bg }]}>
        <LoadingSpinner isLoading />
      </View>
    )
  }

  if (!post) {
    return (
      <View style={[styles.center, { backgroundColor: bg }]}>
        <Text style={{ color: '#6b7280' }}>Nie znaleziono artykułu</Text>
      </View>
    )
  }

  const cardColor = getCardColor(post.id)

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={{ backgroundColor: bg }}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Color header with title overlay */}
        <View style={[styles.gradientHeader, { backgroundColor: cardColor }]}>
          <View style={styles.headerOverlay}>
            <Text style={styles.headerTitle} numberOfLines={3}>
              {post.title}
            </Text>
            <View style={styles.dateBadge}>
              <Text style={styles.dateBadgeText}>{post.date}</Text>
            </View>
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Excerpt */}
          <Text style={[styles.excerpt, isDark && styles.excerptDark]}>
            {post.excerpt}
          </Text>
          <View style={styles.excerptDivider} />

          {/* Body */}
          <Text style={[styles.body, { color: textColor }]}>{post.content}</Text>

          {/* Comment count pill */}
          {post.commentCount !== undefined && post.commentCount > 0 && (
            <View style={styles.countPill}>
              <Text style={styles.countPillText}>
                {post.commentCount} {post.commentCount === 1 ? 'komentarz' : 'komentarzy'}
              </Text>
            </View>
          )}
        </View>

        {/* Comments section */}
        <View style={[styles.commentsSection, isDark && styles.commentsSectionDark]}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>Komentarze</Text>

          {commentsLoading ? (
            <LoadingSpinner isLoading />
          ) : comments.length === 0 ? (
            <Text style={styles.emptyComments}>Brak komentarzy. Bądź pierwszy!</Text>
          ) : (
            comments.map((c) => (
              <CommentItem
                key={c.id}
                comment={c}
                isDark={isDark}
                currentUserId={userId}
                blogPostId={id}
              />
            ))
          )}
        </View>

        {/* Add comment form */}
        <View style={styles.formSection}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>
            Dodaj komentarz
          </Text>
          <TextInput
            style={[styles.input, isDark && styles.inputDark]}
            placeholder="Napisz komentarz..."
            placeholderTextColor="#6b7280"
            multiline
            numberOfLines={4}
            value={comment}
            onChangeText={setComment}
            textAlignVertical="top"
          />
          <Pressable
            style={[styles.button, isPending && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={isPending || !comment.trim()}
          >
            <Text style={styles.buttonText}>
              {isPending ? 'Wysyłanie...' : 'Wyślij komentarz'}
            </Text>
          </Pressable>
          <Animated.Text style={[styles.successText, successStyle]}>
            Dodano komentarz!
          </Animated.Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingBottom: 48,
  },
  gradientHeader: {
    height: 180,
    justifyContent: 'flex-end',
  },
  headerOverlay: {
    padding: 20,
    paddingBottom: 18,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 12,
  },
  headerTitle: {
    flex: 1,
    fontSize: 22,
    fontWeight: '700',
    color: '#1f2937',
    lineHeight: 29,
  },
  dateBadge: {
    backgroundColor: 'rgba(255,255,255,0.75)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: 'flex-end',
    flexShrink: 0,
  },
  dateBadgeText: {
    fontSize: 11,
    color: '#1f2937',
    fontWeight: '500',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 8,
  },
  excerpt: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#6b7280',
    lineHeight: 24,
    marginBottom: 16,
  },
  excerptDark: {
    color: '#9ca3af',
  },
  excerptDivider: {
    height: 1,
    backgroundColor: '#A491BB33',
    marginBottom: 18,
  },
  body: {
    fontSize: 16,
    lineHeight: 26,
    marginBottom: 20,
  },
  countPill: {
    alignSelf: 'flex-start',
    backgroundColor: '#A491BB',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    marginBottom: 8,
  },
  countPillText: {
    fontSize: 13,
    color: '#ffffff',
    fontWeight: '600',
  },
  commentsSection: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
    borderTopWidth: 1,
    borderTopColor: '#A491BB22',
  },
  commentsSectionDark: {
    borderTopColor: '#ffffff15',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 14,
  },
  emptyComments: {
    fontSize: 14,
    color: '#6b7280',
    fontStyle: 'italic',
    marginBottom: 12,
  },
  formSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#A491BB22',
  },
  input: {
    backgroundColor: '#A491BB30',
    borderColor: '#A491BBB3',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    color: '#1f2937',
    minHeight: 100,
    marginBottom: 12,
  },
  inputDark: {
    color: '#f9fafb',
    backgroundColor: '#A491BB20',
  },
  button: {
    backgroundColor: '#A491BB',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  successText: {
    color: '#10b981',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 10,
  },
})
