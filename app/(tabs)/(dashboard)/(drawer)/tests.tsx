import React, { useEffect, useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, useColorScheme } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import CircularProgress from 'react-native-circular-progress-indicator'
import { useAuth } from '@clerk/expo'
import { useGenerateTestStore } from '@/store/useGenerateTestStore'
import { useTests } from '@/hooks/useTests'
import { useCategories } from '@/hooks/useCategories'
import { useSubmitCompletedTest } from '@/hooks/useSubmitCompletedTest'
import CategoryTestCard from '@/components/CategoryTestCard'
import TestCard from '@/components/TestCard'

export default function Testy() {
  const { userId } = useAuth()
  const {
    isTest,
    setNumberTests,
    setIsTest,
    setSelectedCategoryId,
    tests,
    setTests,
  } = useGenerateTestStore()
  const { tests: apiTests } = useTests()
  const { categories } = useCategories()
  const { mutate: submitTest, isPending } = useSubmitCompletedTest()

  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [score, setScore] = useState<{ correct: number; total: number } | null>(null)
  const [activeTests, setActiveTests] = useState<typeof tests>([])
  const isDarkMode = useColorScheme() === 'dark'

  useEffect(() => {
    if (apiTests.length > 0) setTests(apiTests)
  }, [apiTests, setTests])

  const handleAnswer = (questionId: string, selectedIndex: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: selectedIndex }))
  }

  const handleSubmit = () => {
    if (!userId) return

    const testResult = activeTests.map(item => {
      const selectedIndex = answers[item.id]
      const isCorrect = selectedIndex !== undefined && item.data.answers[selectedIndex]?.isCorrect === true
      return { questionId: item.id, answer: isCorrect }
    })

    const correct = testResult.filter(r => r.answer).length
    setScore({ correct, total: activeTests.length })

    submitTest(
      { userId, score: correct, testResult },
      { onSuccess: () => setIsSubmitted(true), onError: () => setIsSubmitted(true) }
    )
  }

  const handleRetry = () => {
    setAnswers({})
    setIsSubmitted(false)
    setScore(null)
  }

  const handleBackToMenu = () => {
    setNumberTests(null)
    setIsTest(false)
    setSelectedCategoryId(null)
    setAnswers({})
    setIsSubmitted(false)
    setScore(null)
    setActiveTests([])
  }

  const handleStart = (categoryId: number, questionCount: number) => {
    const picked = tests
      .filter(t => t.categoryId === categoryId)
      .sort(() => Math.random() - 0.5)
      .slice(0, questionCount)
    setActiveTests(picked)
    setSelectedCategoryId(categoryId)
    setNumberTests(questionCount)
    setIsTest(true)
  }

  return (
    <View style={styles.container}>
      {!isTest ? (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {categories
            .filter(c => c.isActive)
            .map(category => (
              <CategoryTestCard
                key={category.id}
                category={category}
                testsCount={tests.filter(t => t.categoryId === category.id).length}
                onStart={handleStart}
              />
            ))}
        </ScrollView>
      ) : isSubmitted && score ? (
        <View style={styles.scoreContainer}>
          <View style={[styles.scoreCard, { backgroundColor: isDarkMode ? '#1e1b2e' : '#ffffff' }]}>
            <View style={styles.scoreIconRow}>
              <View style={styles.scoreIconCircle}>
                <Ionicons
                  name={
                    Math.round((score.correct / score.total) * 100) >= 90
                      ? 'trophy'
                      : Math.round((score.correct / score.total) * 100) >= 70
                      ? 'medal'
                      : 'school'
                  }
                  size={22}
                  color="#A491BB"
                />
              </View>
              <Text style={[styles.scoreLabel, { color: isDarkMode ? '#f1f5f9' : '#1e1b4b' }]}>Wynik testu</Text>
            </View>

            <CircularProgress
              value={Math.round((score.correct / score.total) * 100)}
              radius={70}
              activeStrokeColor="#A491BB"
              inActiveStrokeColor="#A491BB25"
              activeStrokeWidth={10}
              inActiveStrokeWidth={10}
              progressValueColor="#A491BB"
              progressValueFontSize={22}
              valueSuffix="%"
              duration={800}
            />

            <Text style={[styles.scoreValue, { color: isDarkMode ? '#f1f5f9' : '#1e1b4b' }]}>
              {score.correct} / {score.total}
            </Text>

            <View style={styles.gradeBadge}>
              <Text style={styles.scoreGrade}>
                {Math.round((score.correct / score.total) * 100) >= 90
                  ? 'Doskonały'
                  : Math.round((score.correct / score.total) * 100) >= 70
                  ? 'Dobry'
                  : Math.round((score.correct / score.total) * 100) >= 50
                  ? 'Zaliczony'
                  : 'Niezaliczony'}
              </Text>
            </View>
          </View>

          <View style={styles.scoreButtons}>
            <TouchableOpacity style={styles.button} onPress={handleRetry}>
              <Ionicons name="refresh" size={16} color="white" style={styles.btnIcon} />
              <Text style={styles.buttonText}>Spróbuj ponownie</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.secondaryButton]} onPress={handleBackToMenu}>
              <Ionicons name="arrow-back" size={16} color="#A491BB" style={styles.btnIcon} />
              <Text style={styles.secondaryButtonText}>Wróć do menu</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {activeTests.map((item, index) => (
            <TestCard
              key={item.id}
              test={item}
              questionNumber={`${index + 1}/${activeTests.length}`}
              onAnswer={handleAnswer}
            />
          ))}
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.rowButton} onPress={handleSubmit} disabled={isPending}>
              <Text style={styles.buttonText}>{isPending ? 'Wysyłanie...' : 'Prześlij Test'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.rowButton, styles.secondaryButton]} onPress={handleBackToMenu}>
              <Text style={styles.secondaryButtonText}>Reset Test</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  scrollContent: {
    gap: 16,
    paddingBottom: 16,
  },
  scoreContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  scoreCard: {
    width: '100%',
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    gap: 16,
    borderWidth: 1.5,
    borderColor: '#A491BB40',
    shadowColor: '#280652',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  scoreIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 10,
  },
  scoreIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#A491BB18',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreLabel: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  scoreValue: {
    fontSize: 40,
    fontWeight: '800',
  },
  gradeBadge: {
    backgroundColor: '#A491BB18',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 4,
  },
  scoreGrade: {
    fontSize: 14,
    fontWeight: '600',
    color: '#A491BB',
  },
  scoreButtons: {
    gap: 12,
    width: '100%',
    marginTop: 28,
  },
  btnIcon: {
    marginRight: 6,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: 16,
    padding: 16,
  },
  button: {
    width: '100%',
    flexDirection: 'row',
    backgroundColor: '#A491BB',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#A491BB',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#A491BB',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  secondaryButtonText: {
    color: '#A491BB',
    fontWeight: 'bold',
  },
  textLight: {
    color: '#1f2937',
  },
  textDark: {
    color: '#f1f5f9',
  },
})
