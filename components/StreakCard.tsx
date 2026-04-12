import { View } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { CardHeader, StatCell, SkeletonRow, useCardTheme, baseCardStyle } from '@/components/HomeCards'

interface StreakCardProps {
  streak: number
  todayTests: number
  isLoading: boolean
}

export function StreakCard({ streak, todayTests, isLoading }: StreakCardProps) {
  const { cardBg, textPrimary, textMuted, iconBg, iconColor } = useCardTheme()
  return (
    <View style={baseCardStyle(cardBg)}>
      <CardHeader
        icon={<MaterialCommunityIcons name="fire" size={18} color={iconColor} />}
        label="Seria nauki"
        iconBg={iconBg}
        textColor={textMuted}
      />
      {isLoading ? (
        <SkeletonRow />
      ) : (
        <View style={{ flexDirection: 'row', gap: 32, marginTop: 4 }}>
          <StatCell value={streak} label="dni z rzędu" textPrimary={textPrimary} textMuted={textMuted} />
          <StatCell value={todayTests} label="testy dziś" textPrimary={textPrimary} textMuted={textMuted} />
        </View>
      )}
    </View>
  )
}
