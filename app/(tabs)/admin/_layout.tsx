import { Stack, Redirect } from 'expo-router'
import { useIsAdmin } from '@/hooks/useIsAdmin'

export default function AdminLayout() {
  const isAdmin = useIsAdmin()

  if (!isAdmin) return <Redirect href="/(tabs)" />

  return (
    <Stack screenOptions={{ headerShown: false }} />
  )
}
