import { View, Text } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { BlurView } from 'expo-blur'
import { useColorScheme } from 'react-native'

interface ProfileHeaderProps {
  username: string
  motto: string
}

export function ProfileHeader({ username, motto }: ProfileHeaderProps) {
  const colorScheme = useColorScheme()
  const themeColors = colorScheme === 'dark'
    ? ['#ff69b4', '#9333ea']
    : ['#ff69b4', '#6d28d9']

  return (
    <View className="w-full px-4">
      <BlurView intensity={80} tint={colorScheme === 'dark' ? 'dark' : 'light'} className="overflow-hidden rounded-2xl">
          <View className="flex flex-col gap-24 p-4">
            {/* Username Section */}
            <View className="items-start">
              <View 
                className="w-20 h-20 rounded-2xl items-center justify-center mb-4"
                style={{
                  backgroundColor: `${themeColors[0]}50`,
                  borderWidth: 1,
                  borderColor: `${themeColors[0]}70`,
                }}
              >
                <Ionicons name="person-circle-outline" size={54} color={themeColors[0]} />
              </View>
              <View className="items-start">
                <Text className="text-xs font-medium text-zinc-500 dark:text-zinc-400  tracking-wider">
                 Nazwa użytkownika
                </Text>
                <Text className="text-3xl font-medium text-zinc-950 dark:text-zinc-100">
                  {username.substring(0, 16)}
                </Text>
              </View>
            </View>

            {/* Motto Section */}
            <View 
              className="rounded-2xl p-4"
              style={{
                backgroundColor: `${themeColors[1]}50`,
                borderWidth: 1,
                borderColor: `${themeColors[1]}70`,
              }}
            >
              <View>
                <View className="flex-row items-center gap-2 mb-3">
                  <Ionicons name="book" size={24} color={themeColors[1]} />
                  <Text className="text-base font-medium text-zinc-700 dark:text-zinc-400 tracking-wider">
                    Motto nauki
                  </Text>
                </View>
                <Text className="text-3xl text-center text-zinc-950 dark:text-zinc-200 italic font-medium">
                  "{motto.substring(0, 30)}"
                </Text>
              </View>
            </View>
          </View>
   
      </BlurView>
    </View>
  )
} 