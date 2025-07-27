import { View, useColorScheme } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { FloatingShapes } from '@/components/FloatingShapes'
import GradientOverlay from '@/components/GradientOverlay'
import { cn } from '@/lib/utils'
import { AuthForm } from '@/components/AuthForm'
import { useAuth } from '@/hooks/useAuth'

export default function SignInScreen() {
  const {
    isLoaded,
    isAuthenticating,
    errors,
    setErrors,
    handleSubmit,
    handleOAuth,
  } = useAuth('sign-in')

  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'

  if (!isLoaded) {
    return null
  }

  return (
    <SafeAreaView className={cn("flex-1", isDark ? "bg-[#111]" : "bg-white")}>
      <GradientOverlay />
      <FloatingShapes count={4} />
      <View className="flex-1 justify-center px-5">
        <AuthForm
          type="sign-in"
          isAuthenticating={isAuthenticating}
          onSubmit={handleSubmit}
          onOAuthPress={handleOAuth}
          errors={errors}
          setErrors={setErrors}
        />
      </View>
    </SafeAreaView>
  )
}
