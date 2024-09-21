import React, { useState } from 'react'
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native'
import { Test } from '@/types/dataTypes'
import { LETTERS } from '@/constants/optionsLetters'
import { useColorScheme } from 'react-native'

export const LearningCard = ({ test, questionNumber }: { test: Test; questionNumber: string }) => {
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

const styles = StyleSheet.create({
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
})
