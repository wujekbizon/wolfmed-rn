import { View, Text, Pressable } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { CardHeader, SkeletonLine, useCardTheme, baseCardStyle } from '@/components/HomeCards'
import type { Post } from '@/types/dataTypes'

interface LatestPostCardProps {
  post: Post | null
  isLoading: boolean
  onPress: () => void
}

export function LatestPostCard({ post, isLoading, onPress }: LatestPostCardProps) {
  const { cardBg, textPrimary, textMuted, iconBg, iconColor, accentColor } = useCardTheme()
  if (!isLoading && !post) return null
  return (
    <Pressable style={baseCardStyle(cardBg)} onPress={post ? onPress : undefined}>
      <CardHeader
        icon={<Ionicons name="newspaper-outline" size={17} color={iconColor} />}
        label="Najnowszy wpis"
        iconBg={iconBg}
        textColor={textMuted}
      />
      {isLoading ? (
        <>
          <SkeletonLine width="80%" />
          <SkeletonLine width="60%" />
        </>
      ) : (
        <>
          <Text style={{ fontSize: 15, fontWeight: '700', color: textPrimary, marginBottom: 4, marginTop: 4 }} numberOfLines={2}>
            {post!.title}
          </Text>
          <Text style={{ fontSize: 13, color: textMuted, lineHeight: 19 }} numberOfLines={3}>
            {post!.excerpt}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
            <Text style={{ fontSize: 12, color: accentColor, fontWeight: '600' }}>Czytaj więcej</Text>
            <Ionicons name="arrow-forward" size={12} color={accentColor} style={{ marginLeft: 4 }} />
          </View>
        </>
      )}
    </Pressable>
  )
}
