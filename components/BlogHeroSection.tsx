import React from 'react'
import { View, Text, StyleSheet, useColorScheme } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

type Props = {
  postCount: number
}

export default function BlogHeroSection({ postCount }: Props) {
  const { top } = useSafeAreaInsets()
  const isDark = useColorScheme() === 'dark'

  return (
    <View
      style={[
        styles.container,
        { paddingTop: top + 20 },
        isDark && styles.containerDark,
      ]}
    >
      <Text style={[styles.title, isDark && styles.titleDark]}>
        Blog Wolfmed Edukacja
      </Text>
      <Text style={styles.subtitle}>
        Aktualności i wskazówki dla studentów medycyny
      </Text>
      {postCount > 0 && (
        <View style={styles.countRow}>
          <View style={styles.countDot} />
          <Text style={styles.countText}>{postCount} artykułów</Text>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingBottom: 28,
    backgroundColor: '#ffffff',
  },
  containerDark: {
    backgroundColor: '#09090b',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 6,
  },
  titleDark: {
    color: '#f9fafb',
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 12,
  },
  countRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  countDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#A491BB',
  },
  countText: {
    fontSize: 13,
    color: '#A491BB',
    fontWeight: '500',
  },
})
