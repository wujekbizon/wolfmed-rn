import React, { useState, useCallback } from 'react'
import { StyleSheet, Text, View, FlatList, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native'
import { useColorScheme } from 'react-native'
import testsData from '../../data/tests.json'

// Define the types
type Answer = {
  option: string
  isCorrect: boolean
}

interface TestData {
  question: string
  answers: Answer[]
}

interface Test {
  id?: string
  data: TestData
  category: string
  createdAt?: Date
  updatedAt?: Date | null
}

const LETTERS = ['a', 'b', 'c', 'd']

const LearningCard = ({ test, questionNumber }: { test: Test; questionNumber: string }) => {
  const [showCorrectAnswer, setShowCorrectAnswer] = useState(false)
  const colorScheme = useColorScheme()
  const { answers, question } = test.data

  const handleCorrectAnswer = () => {
    setShowCorrectAnswer(!showCorrectAnswer)
  }

  return (
    <View style={[styles.card, { backgroundColor: colorScheme === 'dark' ? '#333' : '#FFF' }]}>
      <Text style={[styles.questionNumber, { color: colorScheme === 'dark' ? '#BBB' : '#666' }]}>{questionNumber}</Text>
      <Text style={[styles.question, { color: colorScheme === 'dark' ? '#FFF' : '#000' }]}>{question}</Text>
      <ScrollView style={styles.answerContainer}>
        {answers.map(({ option, isCorrect }, index) => (
          <View key={option} style={styles.answerItem}>
            <Text
              style={[
                styles.answerLetter,
                {
                  color: showCorrectAnswer && isCorrect ? '#ff6060' : '#ffabab',
                  opacity: showCorrectAnswer && !isCorrect ? 0.25 : 1,
                },
              ]}
            >
              {LETTERS[index]})
            </Text>
            <Text
              style={[
                styles.answerText,
                {
                  color: colorScheme === 'dark' ? '#FFF' : '#000',
                  opacity: showCorrectAnswer && !isCorrect ? 0.25 : 1,
                  backgroundColor: showCorrectAnswer && isCorrect ? '#ffdcdc' : 'transparent',
                },
              ]}
            >
              {option}
            </Text>
          </View>
        ))}
      </ScrollView>
      <TouchableOpacity style={[styles.button, { backgroundColor: '#ffb1b1' }]} onPress={handleCorrectAnswer}>
        <Text style={styles.buttonText}>{showCorrectAnswer ? 'Ukryj Odpowiedź' : 'Pokaż Odpowiedź'}</Text>
      </TouchableOpacity>
    </View>
  )
}

const ITEMS_PER_PAGE = 25

export default function TestsScreen() {
  const colorScheme = useColorScheme()
  const [displayedTests, setDisplayedTests] = useState<Test[]>(testsData.slice(0, ITEMS_PER_PAGE))
  const [isLoading, setIsLoading] = useState(false)

  const loadMoreTests = useCallback(() => {
    if (isLoading || displayedTests.length >= testsData.length) return

    setIsLoading(true)
    setTimeout(() => {
      const newTests = testsData.slice(displayedTests.length, displayedTests.length + ITEMS_PER_PAGE)
      setDisplayedTests((prevTests) => [...prevTests, ...newTests])
      setIsLoading(false)
    }, 400) // Simulate network delay
  }, [displayedTests, isLoading])

  const renderItem = useCallback(
    ({ item, index }: { item: Test; index: number }) => (
      <LearningCard test={item} questionNumber={`${index + 1}/${testsData.length}`} />
    ),
    []
  )

  const renderFooter = () => {
    if (!isLoading) return null
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#ff9be8" />
      </View>
    )
  }

  return (
    <View style={[styles.container, { backgroundColor: colorScheme === 'dark' ? '#222' : '#FFF' }]}>
      <Text style={[styles.title, { color: colorScheme === 'dark' ? '#FFF' : '#000' }]}>
        Pytania dla opiekunów medycznych
      </Text>
      <FlatList
        data={displayedTests}
        renderItem={renderItem}
        keyExtractor={(item, index) => item.id || index.toString()}
        contentContainerStyle={styles.listContainer}
        onEndReached={loadMoreTests}
        onEndReachedThreshold={0.1}
        ListFooterComponent={renderFooter}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  listContainer: {
    paddingBottom: 20,
  },
  card: {
    flexGrow: 1,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(255, 0, 0, 0.1)',
    padding: 16,
    marginBottom: 20,
  },
  questionNumber: {
    position: 'absolute',
    right: 8,
    top: 4,
    fontSize: 12,
  },
  question: {
    fontSize: 16,
    fontWeight: 'bold',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
    paddingBottom: 8,
    marginBottom: 16,
  },
  answerContainer: {
    flexGrow: 1,
    marginBottom: 16,
  },
  answerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  answerLetter: {
    fontSize: 14,
    marginRight: 8,
  },
  answerText: {
    fontSize: 14,
    flex: 1,
    paddingVertical: 2,
    paddingHorizontal: 4,
    borderRadius: 8,
  },
  button: {
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
  },
  loaderContainer: {
    marginVertical: 16,
    alignItems: 'center',
  },
})
