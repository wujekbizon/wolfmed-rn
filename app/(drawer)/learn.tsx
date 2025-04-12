import React, { useState, useCallback } from 'react'
import { StyleSheet, Text, View, FlatList } from 'react-native'
import { useColorScheme } from 'react-native'
import testsData from '../../data/tests.json'
import { Test } from '@/types/dataTypes'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { LearningCard } from '@/components/LearningCard'
import { ITEMS_PER_PAGE } from '@/constants/itemsPerPage'

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
        ListFooterComponent={<LoadingSpinner isLoading={isLoading} />}
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
})
