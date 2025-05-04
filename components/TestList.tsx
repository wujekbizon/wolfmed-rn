import React, { useCallback } from 'react'
import { StyleSheet, FlatList, View, Text } from 'react-native'
import type { Test } from '@/types/dataTypes'
import { TestListItem } from './TestListItem'

interface TestListProps {
  tests: Test[]
}

export function TestList({ 
  tests
}: TestListProps) {
  const renderItem = useCallback(({ item, index }: { item: Test; index: number }) => (
    <TestListItem
      test={item}
      questionNumber={`${index + 1}/${tests.length}`}
    />
  ), [tests.length])
 
  return (
    <FlatList
      data={tests}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={true}
      initialNumToRender={10}
      maxToRenderPerBatch={5}
      windowSize={5}
    />
  )
}

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
}) 