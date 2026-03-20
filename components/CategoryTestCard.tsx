import React, { useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, useColorScheme } from 'react-native'
import { Category } from '@/types/dataTypes'

const QUESTION_OPTIONS = [10, 40]

interface Props {
  category: Category
  testsCount: number
  onStart: (categoryId: number, questionCount: number) => void
}

export default function CategoryTestCard({ category, testsCount, onStart }: Props) {
  const [selectedCount, setSelectedCount] = useState(10)
  const isDark = useColorScheme() === 'dark'

  return (
    <View style={[styles.card, isDark ? styles.cardDark : styles.cardLight]}>
      <Text style={[styles.title, isDark ? styles.textDark : styles.textLight]}>{category.name}</Text>

      <View style={styles.meta}>
        <Text style={[styles.metaText, isDark ? styles.metaTextDark : styles.metaTextLight]}>
          Dostępne pytania:{' '}
          <Text style={styles.metaHighlight}>{testsCount}</Text>
        </Text>
        <Text style={[styles.metaText, isDark ? styles.metaTextDark : styles.metaTextLight]}>
          Czas trwania:{' '}
          <Text style={styles.metaHighlight}>25 min</Text>
        </Text>
      </View>

      <View style={styles.row}>
        <Text style={[styles.label, isDark ? styles.metaTextDark : styles.metaTextLight]}>Ilość pytań</Text>
        <View style={styles.pills}>
          {QUESTION_OPTIONS.map((n) => (
            <TouchableOpacity
              key={n}
              style={[styles.pill, selectedCount === n && styles.pillActive]}
              onPress={() => setSelectedCount(n)}
            >
              <Text style={[styles.pillText, selectedCount === n && styles.pillTextActive]}>
                {n} pytań
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity
        style={styles.startButton}
        onPress={() => onStart(category.id, selectedCount)}
        disabled={testsCount === 0}
      >
        <Text style={styles.startButtonText}>Rozpocznij Test</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    gap: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardLight: {
    backgroundColor: '#fff5f5',
    borderColor: 'rgba(254, 202, 202, 0.6)',
    shadowColor: '#6b7280',
  },
  cardDark: {
    backgroundColor: '#222e',
    borderColor: 'rgba(254, 202, 202, 0.3)',
    shadowColor: '#000',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  textLight: { color: '#111827' },
  textDark: { color: '#e5e7eb' },
  meta: {
    gap: 4,
  },
  metaText: {
    fontSize: 13,
  },
  metaTextLight: { color: '#6b7280' },
  metaTextDark: { color: '#9ca3af' },
  metaHighlight: {
    color: '#ff7a7a',
    fontWeight: '700',
  },
  row: {
    gap: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
  },
  pills: {
    flexDirection: 'row',
    gap: 8,
  },
  pill: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ff7a7a',
  },
  pillActive: {
    backgroundColor: '#ff7a7a',
  },
  pillText: {
    color: '#ff7a7a',
    fontWeight: '600',
    fontSize: 14,
  },
  pillTextActive: {
    color: '#fff',
  },
  startButton: {
    backgroundColor: '#ff7a7a',
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: 'center',
  },
  startButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
})
