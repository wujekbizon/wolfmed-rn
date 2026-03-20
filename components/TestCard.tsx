import React, { useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, useColorScheme } from 'react-native'
import { LETTERS } from '@/constants/optionsLetters'
import { Test } from '@/types/dataTypes'

export default function TestCard({
  test,
  questionNumber,
  onAnswer,
}: {
  test: Test
  questionNumber: string
  onAnswer: (questionId: string, selectedIndex: number) => void
}) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const isDarkMode = useColorScheme() === 'dark'

  const {
    data: { answers, question },
  } = test

  const handlePress = (index: number) => {
    setActiveIndex(index)
    onAnswer(test.id, index)
  }

  return (
    <View style={[styles.container, isDarkMode ? styles.containerDark : styles.containerLight]}>
      <Text style={[styles.questionNumber, isDarkMode ? styles.textDark : styles.textLight]}>{questionNumber}</Text>
      <Text style={[styles.question, isDarkMode ? styles.textDark : styles.textLight]}>{question}</Text>
      <View style={styles.answersContainer}>
        {answers.map((answer, index) => {
          const isActive = activeIndex === index

          return (
            <TouchableOpacity
              key={`${answer.option}/${index}`}
              style={[
                styles.answerItem,
                isActive && styles.activeAnswer,
                isDarkMode ? styles.answerItemDark : styles.answerItemLight,
              ]}
              onPress={() => handlePress(index)}
            >
              <Text style={[styles.answerLetter, isDarkMode ? styles.textDark : styles.textLight]}>
                {LETTERS[index]})
              </Text>
              <View style={[styles.radioButton, isActive && styles.radioButtonActive]} />
              <Text style={[styles.answerText, isDarkMode ? styles.textDark : styles.textLight]}>{answer.option}</Text>
            </TouchableOpacity>
          )
        })}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    minHeight: 320,
    width: '100%',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    padding: 16,
    marginBottom: 16,
  },
  containerLight: {
    backgroundColor: 'white',
    borderColor: 'rgba(254, 202, 202, 0.5)',
  },
  containerDark: {
    backgroundColor: '#333',
    borderColor: 'rgba(254, 202, 202, 0.2)',
  },
  questionNumber: {
    position: 'absolute',
    right: 8,
    top: 4,
    fontSize: 12,
  },
  question: {
    fontSize: 16,
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  answersContainer: {
    flex: 1,
    gap: 8,
  },
  answerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
  },
  answerItemLight: {
    backgroundColor: '#f8f8f8',
  },
  answerItemDark: {
    backgroundColor: '#444',
  },
  activeAnswer: {
    backgroundColor: '#ffdcdc',
  },
  correctAnswer: {
    backgroundColor: 'rgba(134, 239, 172, 0.4)',
  },
  incorrectAnswer: {
    backgroundColor: 'rgba(252, 165, 165, 0.4)',
    opacity: 0.5,
  },
  answerLetter: {
    fontSize: 14,
    marginRight: 8,
    color: '#666',
  },
  radioButton: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#666',
    marginRight: 8,
  },
  radioButtonActive: {
    backgroundColor: '#ff6060',
    borderColor: '#ff6060',
  },
  answerText: {
    flex: 1,
    fontSize: 14,
  },
  textLight: {
    color: '#333',
  },
  textDark: {
    color: '#f1f1f1',
  },
})
