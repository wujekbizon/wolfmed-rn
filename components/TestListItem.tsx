import React, { memo } from 'react'
import { StyleSheet, View } from 'react-native'
import type { Test } from '@/types/dataTypes'
import { LearningCard } from '@/components/LearningCard'

interface TestListItemProps {
  test: Test
  questionNumber: string
}

function TestListItemComponent({ test, questionNumber }: TestListItemProps) {
  return (
    <View style={styles.itemContainer}>
      <LearningCard test={test} questionNumber={questionNumber} />
    </View>
  )
}

const styles = StyleSheet.create({
  itemContainer: {
    marginVertical: 8,
  },
})

export const TestListItem = memo(TestListItemComponent) 