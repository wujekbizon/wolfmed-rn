import { View, Text } from 'react-native'
import { BlurView } from 'expo-blur'
import CircularProgress from '@/components/ui/CircularProgress'

interface QuickStatsProps {
  color?: string;
}

export default function QuickStats({ color = '#f58a8a' }: QuickStatsProps) {
  // TODO: Replace with actual data from your API
  const stats = {
    testsCompleted: 42,
    totalTests: 150,
    averageScore: 75,
  }

  return (
    <View className="flex-1 p-4">
      <View className="flex-row justify-between">
        <View className="items-center">
          <CircularProgress 
            progress={stats.averageScore} 
            size={80} 
            color={color}
            strokeWidth={8}
          />
          <Text className="mt-2 text-lg font-medium text-zinc-800 dark:text-zinc-100">
            {stats.averageScore}%
          </Text>
          <Text className="text-sm text-zinc-600 dark:text-zinc-300">
            Średni wynik
          </Text>
        </View>

        <View className="items-center">
          <CircularProgress 
            progress={(stats.testsCompleted / stats.totalTests) * 100} 
            size={80} 
            color={color}
            strokeWidth={8}
          />
          <Text className="mt-2 text-lg font-medium text-zinc-800 dark:text-zinc-100">
            {stats.testsCompleted}/{stats.totalTests}
          </Text>
          <Text className="text-sm text-zinc-600 dark:text-zinc-300">
            Ukończone testy
          </Text>
        </View>
      </View>
    </View>
  )
} 