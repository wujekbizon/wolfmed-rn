import React, { useState, useCallback } from 'react'
import { StyleSheet, Text, View, FlatList, TouchableOpacity, ActivityIndicator, useColorScheme } from 'react-native'
import proceduresData from '../../data/procedures.json'
import { Procedure } from '@/types/dataTypes'
import { ProcedureContent } from '@/components/ProcedureContent'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { ITEMS_PER_PAGE } from '@/constants/itemsPerPage'

export default function ProceduresScreen() {
  const colorScheme = useColorScheme()
  const [displayedProcedures, setDisplayedProcedures] = useState<Procedure[]>(proceduresData.slice(0, ITEMS_PER_PAGE))
  const [isLoading, setIsLoading] = useState(false)

  const loadMoreProcedures = useCallback(() => {
    if (isLoading || displayedProcedures.length >= proceduresData.length) return

    setIsLoading(true)
    setTimeout(() => {
      const newProcedures = proceduresData.slice(
        displayedProcedures.length,
        displayedProcedures.length + ITEMS_PER_PAGE
      )
      setDisplayedProcedures((prevProcedures) => [...prevProcedures, ...newProcedures])
      setIsLoading(false)
    }, 400) // Simulate network delay
  }, [displayedProcedures, isLoading])

  const renderItem = useCallback(({ item }: { item: Procedure }) => <ProcedureContent procedure={item} />, [])

  return (
    <View style={[styles.container, { backgroundColor: colorScheme === 'dark' ? '#222' : '#FFF' }]}>
      <Text style={[styles.title, { color: colorScheme === 'dark' ? '#FFF' : '#000' }]}>Medical Procedures</Text>
      <FlatList
        data={displayedProcedures}
        renderItem={renderItem}
        keyExtractor={(item, index) => item.data.name || index.toString()}
        contentContainerStyle={styles.listContainer}
        onEndReached={loadMoreProcedures}
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
  },
  listContainer: {
    paddingBottom: 20,
  },
  loaderContainer: {
    marginVertical: 16,
    alignItems: 'center',
  },
})
