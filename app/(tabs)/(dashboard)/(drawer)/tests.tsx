import React, { useEffect, useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, useColorScheme } from 'react-native'
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
    numberTests,
    isTest,
    selectedCategoryId,
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

  const textStyle = isDarkMode ? styles.textDark : styles.textLight

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
          <Text style={[styles.scoreLabel, textStyle]}>Wynik testu</Text>
          <Text style={[styles.scoreValue, textStyle]}>
            {score.correct} / {score.total}
          </Text>
          <Text style={[styles.scorePercent, textStyle]}>
            {Math.round((score.correct / score.total) * 100)}%
          </Text>
          <View style={styles.scoreButtons}>
            <TouchableOpacity style={styles.button} onPress={handleRetry}>
              <Text style={styles.buttonText}>Spróbuj ponownie</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.secondaryButton]} onPress={handleBackToMenu}>
              <Text style={styles.buttonText}>Wróć do menu</Text>
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
            <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={isPending}>
              <Text style={styles.buttonText}>{isPending ? 'Wysyłanie...' : 'Prześlij Test'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.secondaryButton]} onPress={handleBackToMenu}>
              <Text style={styles.buttonText}>Reset Test</Text>
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
    gap: 16,
  },
  scoreLabel: {
    fontSize: 18,
    fontWeight: '600',
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#6d28d9',
  },
  scorePercent: {
    fontSize: 24,
    color: '#a78bfa',
  },
  scoreButtons: {
    gap: 12,
    width: '100%',
    marginTop: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: 16,
    padding: 16,
  },
  button: {
    flex: 1,
    backgroundColor: '#6d28d9',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryButton: {
    backgroundColor: '#a78bfa',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  textLight: {
    color: '#1f2937',
  },
  textDark: {
    color: '#f1f5f9',
  },
})
