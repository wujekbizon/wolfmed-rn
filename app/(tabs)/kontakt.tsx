import { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  ActivityIndicator,
  useColorScheme,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useUser } from '@clerk/expo'
import { useSendMessage } from '@/hooks/useSendMessage'
import { contactSchema } from '@/lib/validations/contact'

const primary = '#A491BB'
const textPrimary = '#1f2937'
const textMuted = '#6b7280'
const success = '#10b981'
const danger = '#dc2626'

export default function KontaktScreen() {
  const { user } = useUser()
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'

  const [email, setEmail] = useState(user?.primaryEmailAddress?.emailAddress ?? '')
  const [message, setMessage] = useState('')
  const [errors, setErrors] = useState<{ email?: string; message?: string }>({})
  const [apiError, setApiError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)

  const { mutate: sendMessage, isPending } = useSendMessage()

  const handleSubmit = () => {
    const result = contactSchema.safeParse({ email, message })
    if (!result.success) {
      const fieldErrors: { email?: string; message?: string } = {}
      for (const issue of result.error.issues) {
        const field = issue.path[0] as 'email' | 'message'
        if (!fieldErrors[field]) fieldErrors[field] = issue.message
      }
      setErrors(fieldErrors)
      return
    }
    setErrors({})
    setApiError(null)
    sendMessage(
      { email, message },
      {
        onSuccess: () => {
          setSent(true)
          setEmail(user?.primaryEmailAddress?.emailAddress ?? '')
          setMessage('')
        },
        onError: () => {
          setApiError('Nie udało się wysłać wiadomości. Spróbuj ponownie.')
        },
      }
    )
  }

  const screenBg = isDark ? '#09090b' : '#ffffff'
  const cardBg = isDark ? '#27272a' : '#ffffff'
  const labelColor = isDark ? '#a1a1aa' : textMuted

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: screenBg }}>
      <ScrollView
        contentContainerStyle={{ padding: 20, gap: 24 }}
        keyboardShouldPersistTaps="handled"
      >
        <Text
          style={{
            fontSize: 24,
            fontWeight: '700',
            color: isDark ? '#f4f4f5' : textPrimary,
          }}
        >
          Kontakt
        </Text>

        <View
          style={{
            backgroundColor: cardBg,
            borderRadius: 16,
            padding: 20,
            gap: 16,
            shadowColor: '#28065240',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.06,
            shadowRadius: 8,
            elevation: 2,
          }}
        >
          <View style={{ gap: 6 }}>
            <Text style={{ fontSize: 14, color: labelColor, fontWeight: '500' }}>Email</Text>
            <TextInput
              value={email}
              onChangeText={(t) => {
                setEmail(t)
                setErrors((e) => ({ ...e, email: undefined }))
                setSent(false)
              }}
              placeholder="twoj@email.com"
              placeholderTextColor={isDark ? '#52525b' : '#9ca3af'}
              keyboardType="email-address"
              autoCapitalize="none"
              style={{
                backgroundColor: `${primary}30`,
                borderWidth: 1,
                borderColor: errors.email ? danger : `${primary}70`,
                borderRadius: 12,
                padding: 12,
                fontSize: 16,
                color: isDark ? '#f4f4f5' : textPrimary,
              }}
            />
            {errors.email && (
              <Text style={{ fontSize: 12, color: danger }}>{errors.email}</Text>
            )}
          </View>

          <View style={{ gap: 6 }}>
            <Text style={{ fontSize: 14, color: labelColor, fontWeight: '500' }}>Wiadomość</Text>
            <TextInput
              value={message}
              onChangeText={(t) => {
                setMessage(t)
                setErrors((e) => ({ ...e, message: undefined }))
                setSent(false)
              }}
              placeholder="Twoja wiadomość..."
              placeholderTextColor={isDark ? '#52525b' : '#9ca3af'}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
              style={{
                backgroundColor: `${primary}30`,
                borderWidth: 1,
                borderColor: errors.message ? danger : `${primary}70`,
                borderRadius: 12,
                padding: 12,
                fontSize: 16,
                color: isDark ? '#f4f4f5' : textPrimary,
                minHeight: 120,
              }}
            />
            {errors.message && (
              <Text style={{ fontSize: 12, color: danger }}>{errors.message}</Text>
            )}
          </View>

          <Pressable
            onPress={handleSubmit}
            disabled={isPending}
            style={{
              backgroundColor: primary,
              borderRadius: 12,
              padding: 14,
              alignItems: 'center',
              opacity: isPending ? 0.7 : 1,
            }}
          >
            {isPending ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={{ color: '#ffffff', fontWeight: '600', fontSize: 16 }}>
                Wyślij wiadomość
              </Text>
            )}
          </Pressable>

          {sent && (
            <Text style={{ color: success, textAlign: 'center', fontWeight: '500' }}>
              Wiadomość wysłana!
            </Text>
          )}
          {apiError && (
            <Text style={{ color: danger, textAlign: 'center', fontSize: 13 }}>{apiError}</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
