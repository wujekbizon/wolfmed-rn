import React, { useCallback } from 'react'
import { StyleSheet, Dimensions } from 'react-native'
import { FlashList } from '@shopify/flash-list'
import type { Test } from '@/types/dataTypes'
import { TestListItem } from './TestListItem'

interface TestListProps {
  tests: Test[]
}

const { width } = Dimensions.get('window')

export function TestList({ tests }: TestListProps) {
  // Memoize the renderItem function
  const renderItem = useCallback(
    ({ item, index }: { item: Test; index: number }) => (
      <TestListItem
        test={item}
        questionNumber={`${index + 1}/${tests.length}`}
      />
    ),
    [tests.length]
  )

  return (
    <FlashList
      data={tests}
      renderItem={renderItem}
      estimatedItemSize={664}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={true}
    />
  )
}

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
}) 