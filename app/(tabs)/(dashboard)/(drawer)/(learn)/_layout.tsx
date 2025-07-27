import { Stack } from 'expo-router'
import { useColorScheme } from 'react-native'

export default function LearnLayout() {
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: isDark ? '#000' : '#fff',
        },
        headerTintColor: isDark ? '#fff' : '#000',
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="AllQuestionsScreen"
        options={{
          title: 'Baza pytań',
          presentation: 'card',
        }}
      />
      <Stack.Screen
        name="FlashcardsScreen"
        options={{
          title: 'Flashcards',
          presentation: 'card',
        }}
      />
      <Stack.Screen
        name="QuizzesScreen"
        options={{
          title: 'Quizzes',
          presentation: 'card',
        }}
      />
    </Stack>
  )
} 