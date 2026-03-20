import { Stack } from 'expo-router'
import { useColorScheme } from 'react-native'
import CustomHeader from '@/components/ui/CustomHeader'

export default function BlogLayout() {
  const isDark = useColorScheme() === 'dark'

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: isDark ? '#09090b' : '#ffffff',
        },
        headerTintColor: isDark ? '#fff' : '#000',
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen
        name="[id]"
        options={{
          header: () => <CustomHeader title="Artykuł" />,
          presentation: 'card',
        }}
      />
    </Stack>
  )
}
