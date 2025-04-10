import { View, ActivityIndicator } from 'react-native'
import { useColorScheme } from 'react-native'
import { cn } from '@/lib/utils'

export default function LoadingScreen() {
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'

  return (
    <View className={cn(
      "flex-1 items-center justify-center",
      isDark ? "bg-[#111]" : "bg-white"
    )}>
      <ActivityIndicator size="large" color={isDark ? '#f9a8d4' : '#db2777'} />
    </View>
  )
} 