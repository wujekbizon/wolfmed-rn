import { Stack, useLocalSearchParams, useGlobalSearchParams } from 'expo-router'
import { useColorScheme } from 'react-native'
import CustomHeader from '@/components/ui/CustomHeader'

const CARD_COLORS = ['#e8dff5', '#f3e8ff', '#ddd6f3', '#ead4f7', '#d4c5e8']

function PostHeader() {
  const { id, title, date } = useGlobalSearchParams<{ id?: string; title?: string; date?: string }>()
  const cardColor = id ? CARD_COLORS[id.charCodeAt(0) % CARD_COLORS.length] : undefined
  return <CustomHeader title={title ?? 'Artykuł'} backgroundColor={cardColor} date={date} />
}

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
          header: () => <PostHeader />,
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
