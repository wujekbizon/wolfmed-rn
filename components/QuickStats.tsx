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
    <View style={{ flex: 1 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <View style={{ alignItems: 'center' }}>
          <CircularProgress 
            progress={stats.averageScore} 
            size={80} 
            color={color}
            strokeWidth={8}
          />
          <Text style={{ 
            marginTop: 8,
            fontSize: 16,
            fontWeight: '500',
            color,
          }}>
            {stats.averageScore}%
          </Text>
          <Text style={{
            fontSize: 14,
            color: `${color}99`,
          }}>
            Średni wynik
          </Text>
        </View>

        <View style={{ alignItems: 'center' }}>
          <CircularProgress 
            progress={(stats.testsCompleted / stats.totalTests) * 100} 
            size={80} 
            color={color}
            strokeWidth={8}
          />
          <Text style={{ 
            marginTop: 8,
            fontSize: 16,
            fontWeight: '500',
            color,
          }}>
            {stats.testsCompleted}/{stats.totalTests}
          </Text>
          <Text style={{
            fontSize: 14,
            color: `${color}99`,
          }}>
            Ukończone testy
          </Text>
        </View>
      </View>
    </View>
  )
} 