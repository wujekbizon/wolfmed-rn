import { Stack, useLocalSearchParams } from 'expo-router'
import { useColorScheme } from 'react-native'
import CustomHeader from '@/components/ui/CustomHeader'

function CreateHeader() {
  const { postId } = useLocalSearchParams<{ postId?: string }>()
  return <CustomHeader title={postId ? 'Edytuj artykuł' : 'Nowy artykuł'} />
}

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
      <Stack.Screen
        name="create"
        options={{
          header: () => <CreateHeader />,
          presentation: 'card',
        }}
      />
    </Stack>
  )
}
