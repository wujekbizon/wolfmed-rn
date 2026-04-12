import React from 'react'
import { View, Text, StyleSheet, useColorScheme } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

type Props = {
  title: string
  count: number
  badge?: string
}

export default function AdminScreenHeader({ title, count, badge }: Props) {
  const isDark = useColorScheme() === 'dark'
  const { top: safeTop } = useSafeAreaInsets()
  const textColor = isDark ? '#f9fafb' : '#1f2937'

  return (
    <View style={[styles.topBar, { paddingTop: safeTop + 16 }]}>
      <Text style={[styles.title, { color: textColor }]}>{title}</Text>
      <View style={styles.countBadge}>
        <Text style={styles.countBadgeText}>{count}</Text>
      </View>
      {!!badge && <Text style={styles.badge}>{badge}</Text>}
    </View>
  )
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 14,
    gap: 12,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    flex: 1,
  },
  countBadge: {
    backgroundColor: '#A491BB',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    minWidth: 36,
    alignItems: 'center',
  },
  countBadgeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
  badge: {
    fontSize: 12,
    color: '#9ca3af',
  },
})
