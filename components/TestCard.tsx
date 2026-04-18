import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet, useColorScheme } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { LETTERS } from '@/constants/optionsLetters'
import { Test, Answer, TestData } from '@/types/dataTypes'

const PRIMARY = '#A491BB'
const PRIMARY_SOFT = '#A491BB18'
const SECONDARY = 'rgba(134, 108, 164, 0.75)'
const SHADOW_COLOR = '#280652'

export default function TestCard({
  test,
  questionNumber,
  onAnswer,
  selectedIndex,
}: {
  test: Test
  questionNumber: string
  onAnswer: (questionId: string, selectedIndex: number) => void
  selectedIndex: number | null
}) {
  const isDark = useColorScheme() === 'dark'

  const rawData: TestData | null = typeof test.data === 'string'
    ? (JSON.parse(test.data) as TestData)
    : test.data ?? null
  const answers: Answer[] = rawData?.answers ?? []
  const question = rawData?.question ?? ''

  if (!answers.length) return null

  const handlePress = (index: number) => {
    onAnswer(test.id, index)
  }

  const cardBg = isDark ? '#1e1b2e' : '#ffffff'
  const textPrimary = isDark ? '#f1f5f9' : '#1e1b4b'
  const textMuted = isDark ? '#94a3b8' : '#6b7280'
  const answerBg = isDark ? '#2a2540' : '#f9f7fc'

  return (
    <View style={[styles.shadow, { backgroundColor: cardBg, shadowColor: SHADOW_COLOR }]}>
    <View style={[styles.container, { backgroundColor: cardBg }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{questionNumber}</Text>
        </View>
        <Ionicons name="help-circle-outline" size={18} color={PRIMARY} />
      </View>

      {/* Question */}
      <Text style={[styles.question, { color: textPrimary }]}>{question}</Text>

      <View style={styles.divider} />

      {/* Answers */}
      <View style={styles.answersContainer}>
        {answers.map((answer, index) => {
          const isActive = selectedIndex === index

          return (
            <TouchableOpacity
              key={`${answer.option}/${index}`}
              onPress={() => handlePress(index)}
              activeOpacity={0.75}
            >
              {isActive ? (
                <LinearGradient
                  colors={[PRIMARY, SECONDARY]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.answerItem}
                >
                  <View style={styles.letterCircleActive}>
                    <Text style={styles.letterActive}>{LETTERS[index]}</Text>
                  </View>
                  <Text style={styles.answerTextActive} numberOfLines={3}>{answer.option}</Text>
                  <Ionicons name="checkmark-circle" size={18} color="#ffffff" />
                </LinearGradient>
              ) : (
                <View style={[styles.answerItem, { backgroundColor: answerBg }]}>
                  <View style={[styles.letterCircle, { backgroundColor: PRIMARY_SOFT }]}>
                    <Text style={[styles.letter, { color: PRIMARY }]}>{LETTERS[index]}</Text>
                  </View>
                  <Text style={[styles.answerText, { color: textMuted }]} numberOfLines={3}>{answer.option}</Text>
                </View>
              )}
            </TouchableOpacity>
          )
        })}
      </View>
    </View>
    </View>
  )
}

const styles = StyleSheet.create({
  shadow: {
    width: '100%',
    borderRadius: 20,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  container: {
    borderRadius: 20,
    overflow: 'hidden',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  badge: {
    backgroundColor: PRIMARY_SOFT,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: PRIMARY,
  },
  question: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 24,
    marginBottom: 14,
  },
  divider: {
    height: 1,
    backgroundColor: PRIMARY_SOFT,
    marginBottom: 14,
  },
  answersContainer: {
    gap: 8,
  },
  answerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    gap: 10,
  },
  letterCircle: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  letter: {
    fontSize: 13,
    fontWeight: '700',
  },
  letterCircleActive: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  letterActive: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
  },
  answerText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  answerTextActive: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: '#ffffff',
    fontWeight: '500',
  },
})
