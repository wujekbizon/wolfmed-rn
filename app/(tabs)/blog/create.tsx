import React, { useState, useCallback } from 'react'
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
  useColorScheme,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import * as Haptics from 'expo-haptics'
import { useIsAdmin } from '@/hooks/useIsAdmin'
import { useCreatePost } from '@/hooks/useCreatePost'
import { useUpdatePost } from '@/hooks/useUpdatePost'
import { postSchema } from '@/lib/validations/blog'

function todayDateString(): string {
  return new Date().toISOString().split('T')[0]
}

export default function CreatePostScreen() {
  const { postId, initialTitle, initialExcerpt, initialContent } =
    useLocalSearchParams<{
      postId?: string
      initialTitle?: string
      initialExcerpt?: string
      initialContent?: string
    }>()

  const isAdmin = useIsAdmin()
  const router = useRouter()
  const isDark = useColorScheme() === 'dark'
  const isEditMode = !!postId

  const [title, setTitle] = useState(initialTitle ?? '')
  const [excerpt, setExcerpt] = useState(initialExcerpt ?? '')
  const [content, setContent] = useState(initialContent ?? '')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const { mutate: createPost, isPending: isCreating } = useCreatePost()
  const { mutate: updatePost, isPending: isUpdating } = useUpdatePost()
  const isPending = isCreating || isUpdating

  const bg = isDark ? '#09090b' : '#ffffff'
  const textColor = isDark ? '#f9fafb' : '#1f2937'

  const handleSubmit = useCallback(() => {
    const result = postSchema.safeParse({ title, excerpt, content })
    if (!result.success) {
      const fieldErrors: Record<string, string> = {}
      result.error.issues.forEach((issue) => {
        const key = issue.path[0] as string
        if (!fieldErrors[key]) fieldErrors[key] = issue.message
      })
      setErrors(fieldErrors)
      return
    }
    setErrors({})
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)

    const formData = { ...result.data, date: todayDateString() }

    if (isEditMode && postId) {
      updatePost(
        { postId, data: formData },
        { onSuccess: () => router.back() }
      )
    } else {
      createPost(formData, {
        onSuccess: () => {
          router.replace('/blog' as any)
        },
      })
    }
  }, [title, excerpt, content, isEditMode, postId, createPost, updatePost, router])

  if (!isAdmin) {
    return (
      <View style={[styles.center, { backgroundColor: bg }]}>
        <Text style={{ color: '#6b7280', fontSize: 15 }}>Brak uprawnień</Text>
      </View>
    )
  }

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
        <Field
          label="Tytuł"
          value={title}
          onChangeText={setTitle}
          error={errors.title}
          isDark={isDark}
          textColor={textColor}
          placeholder="Tytuł artykułu..."
        />
        <Field
          label="Streszczenie"
          value={excerpt}
          onChangeText={setExcerpt}
          error={errors.excerpt}
          isDark={isDark}
          textColor={textColor}
          placeholder="Krótkie streszczenie..."
          multiline
          numberOfLines={3}
        />
        <Field
          label="Treść"
          value={content}
          onChangeText={setContent}
          error={errors.content}
          isDark={isDark}
          textColor={textColor}
          placeholder="Treść artykułu..."
          multiline
          numberOfLines={10}
        />

        <Pressable
          style={[styles.button, isPending && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={isPending}
        >
          <Text style={styles.buttonText}>
            {isPending
              ? isEditMode ? 'Zapisuję...' : 'Publikuję...'
              : isEditMode ? 'Zapisz zmiany' : 'Opublikuj artykuł'}
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

type FieldProps = {
  label: string
  value: string
  onChangeText: (v: string) => void
  error?: string
  isDark: boolean
  textColor: string
  placeholder?: string
  multiline?: boolean
  numberOfLines?: number
}

function Field({
  label, value, onChangeText, error, isDark, textColor,
  placeholder, multiline, numberOfLines,
}: FieldProps) {
  return (
    <View style={styles.fieldContainer}>
      <Text style={[styles.label, { color: textColor }]}>{label}</Text>
      <TextInput
        style={[
          styles.input,
          isDark && styles.inputDark,
          multiline && { minHeight: (numberOfLines ?? 3) * 22 + 24 },
          !!error && styles.inputError,
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9ca3af"
        multiline={multiline}
        numberOfLines={numberOfLines}
        textAlignVertical={multiline ? 'top' : 'center'}
      />
      {!!error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  )
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 48,
  },
  fieldContainer: {
    marginBottom: 18,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#A491BB30',
    borderColor: '#A491BB70',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    color: '#1f2937',
  },
  inputDark: {
    color: '#f9fafb',
    backgroundColor: '#A491BB20',
  },
  inputError: {
    borderColor: '#dc2626',
  },
  errorText: {
    fontSize: 12,
    color: '#dc2626',
    marginTop: 4,
  },
  button: {
    backgroundColor: '#A491BB',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
})
