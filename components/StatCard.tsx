// StatCard.tsx
import React from 'react'
import { View, Text, useColorScheme, StyleSheet } from 'react-native'
import { BlurView } from 'expo-blur'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import CircularProgress from '@/components/ui/CircularProgress'
import { StatItem } from '@/types/statsTypes'


interface StatCardProps extends StatItem {
  color: string
  isActive?: boolean
  isDragging?: boolean
}

const getTrendIcon = (type: 'up' | 'down' | 'neutral') => {
  switch (type) {
    case 'up': return 'trending-up'
    case 'down': return 'trending-down'
    default: return 'remove'
  }
}

const getTrendColor = (type: 'up' | 'down' | 'neutral') => {
  switch (type) {
    case 'up': return '#10b981'
    case 'down': return '#ef4444'
    default: return '#6b7280'
  }
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  progress,
  color,
  trend,
  isDragging,
  isActive,
}) => {
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'

  const cardColor = isDark
    ? isActive ? '#ffffff' : '#94a3b8'
    : color

  return (
    <LinearGradient
      colors={[`${cardColor}20`, `${cardColor}05`]}
      style={[styles.container, { opacity: isDragging ? 0.5 : 1 }]}
    >
      <BlurView
        intensity={isDark ? 15 : 40}
        tint={isDark ? 'dark' : 'light'}
        style={styles.blur}
      >
        <View style={styles.content}>
          {/* Left side */}
          <View style={styles.left}>
            <View style={styles.titleRow}>
              <View style={[styles.iconCircle, { backgroundColor: `${cardColor}15` }]}>
                <Ionicons name={icon as any} size={22} color={cardColor} />
              </View>
              <Text style={[styles.title, { color: isDark ? '#9ca3af' : '#374151' }]}>
                {title}
              </Text>
            </View>

            <View style={styles.valueRow}>
              <Text style={[styles.value, { color: isDark ? '#f9fafb' : '#111827' }]}>
                {value}
              </Text>
              {trend && (
                <View style={styles.trendRow}>
                  <Ionicons
                    name={getTrendIcon(trend.type)}
                    size={16}
                    color={getTrendColor(trend.type)}
                  />
                  <Text style={[styles.trendText, { color: getTrendColor(trend.type) }]}>
                    {trend.value}
                  </Text>
                </View>
              )}
            </View>

            <Text style={[styles.subtitle, { color: isDark ? '#9ca3af' : '#6b7280' }]}>
              {subtitle}
            </Text>
          </View>

          {/* Right side (progress) */}
          <View style={styles.right}>
            <CircularProgress
              progress={progress}
              size={80}
              color={cardColor}
              strokeWidth={8}
            />
          </View>
        </View>
      </BlurView>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    marginBottom: 16,
  },
  blur: {
    borderRadius: 16,
    padding: 16,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  left: {
    flex: 1,
  },
  right: {
    marginLeft: 12,
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  value: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  trendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 6,
  },
  trendText: {
    fontSize: 14,
    marginLeft: 2,
  },
  subtitle: {
    fontSize: 13,
    marginTop: 4,
  },
})
