import { View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { CardHeader, StatCell, SkeletonRow, useCardTheme, baseCardStyle } from '@/components/HomeCards'

interface StatsCardProps {
  scorePercent: number
  testsAttempted: number
  isLoading: boolean
}

export function StatsCard({ scorePercent, testsAttempted, isLoading }: StatsCardProps) {
  const { cardBg, textPrimary, textMuted, iconBg, iconColor } = useCardTheme()
  return (
    <View style={baseCardStyle(cardBg)}>
      <CardHeader
        icon={<Ionicons name="stats-chart" size={17} color={iconColor} />}
        label="Twoje wyniki"
        iconBg={iconBg}
        textColor={textMuted}
      />
      {isLoading ? (
        <SkeletonRow />
      ) : (
        <View style={{ flexDirection: 'row', gap: 32, marginTop: 4 }}>
          <StatCell value={`${scorePercent}%`} label="skuteczność" textPrimary={textPrimary} textMuted={textMuted} />
          <StatCell value={testsAttempted} label="ukończone testy" textPrimary={textPrimary} textMuted={textMuted} />
        </View>
      )}
    </View>
  )
}
