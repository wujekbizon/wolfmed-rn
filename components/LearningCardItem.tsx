import React from 'react'
import { ColorSchemeName, Text, View, StyleSheet } from 'react-native'
import { Answer } from '@/types/dataTypes'
import { LETTERS } from '@/constants/optionsLetters'

type LearningCardItemProps = {
  item: Answer
  index: number
  showCorrectAnswer: boolean
  colorScheme: ColorSchemeName
}

export const LearningCardItem = ({
  item: { option, isCorrect },
  index,
  showCorrectAnswer,
  colorScheme,
}: LearningCardItemProps) => {
  return (
    <View style={styles.answerContainer}>
      <Text
        style={[
          styles.optionPrefix,
          showCorrectAnswer && isCorrect && styles.correctOption,
          showCorrectAnswer && !isCorrect && styles.incorrectOption,
        ]}
      >
        {LETTERS[index]})
      </Text>
      <Text
        style={[
          styles.optionText,
          colorScheme === 'dark' ? styles.textDark : styles.textLight,
          showCorrectAnswer && !isCorrect && styles.incorrectOption,
          showCorrectAnswer && isCorrect && styles.correctHighlight,
        ]}
      >
        {option}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  answerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  optionPrefix: {
    fontSize: 14,
    marginRight: 8,
    fontWeight: '500',
  },
  optionText: {
    fontSize: 14,
    flex: 1,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  correctOption: {
    color: '#FF6B6B',
  },
  incorrectOption: {
    opacity: 0.25,
  },
  correctHighlight: {
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
  },
  textLight: {
    color: '#000000',
  },
  textDark: {
    color: '#FFFFFF',
  },
})
