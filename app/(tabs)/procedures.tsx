import React, { useState, useCallback } from 'react'
import { StyleSheet, Text, View, FlatList, TouchableOpacity, ActivityIndicator, useColorScheme } from 'react-native'
import proceduresData from '../../data/procedures.json'

// Types
type Step = {
  step: string
}

interface ProcedureData {
  name: string
  procedure: string
  algorithm: Step[]
}

interface Procedure {
  data: ProcedureData
}

const ITEMS_PER_PAGE = 25

const ProcedureContent = ({ procedure }: { procedure: Procedure }) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isShowAlgorithm, setIsShowAlgorithm] = useState(false)
  const colorScheme = useColorScheme()
  const { algorithm, name, procedure: procedureText } = procedure.data

  const truncatedProcedure = procedureText.slice(0, 280) + (procedureText.length > 280 ? '...' : '')

  return (
    <View style={[styles.procedureCard, { backgroundColor: colorScheme === 'dark' ? '#333' : '#ffb1b1' }]}>
      <Text style={[styles.procedureName, { color: colorScheme === 'dark' ? '#FFF' : '#000' }]}>{name}</Text>
      <Text style={[styles.procedureText, { color: colorScheme === 'dark' ? '#DDD' : '#333' }]}>
        {isExpanded ? procedureText : truncatedProcedure}
      </Text>
      <TouchableOpacity onPress={() => setIsExpanded(!isExpanded)}>
        <Text style={styles.expandButton}>{isExpanded ? 'Pokaż Mniej' : 'Czytaj Więcej'}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.algorithmButton, { backgroundColor: colorScheme === 'dark' ? '#444' : '#ffc5c5' }]}
        onPress={() => setIsShowAlgorithm(!isShowAlgorithm)}
      >
        <Text style={[styles.algorithmButtonText, { color: colorScheme === 'dark' ? '#FFF' : '#000' }]}>
          {isShowAlgorithm ? 'Zwiń Algorytm' : 'Pokaż Algorytm'}
        </Text>
      </TouchableOpacity>
      {isShowAlgorithm && (
        <View style={styles.algorithmContainer}>
          {algorithm.map((step, index) => (
            <Text key={index} style={[styles.algorithmStep, { color: colorScheme === 'dark' ? '#DDD' : '#333' }]}>
              {index + 1}. {step.step}
            </Text>
          ))}
        </View>
      )}
    </View>
  )
}

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

  const renderFooter = () => {
    if (!isLoading) return null
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    )
  }

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
  },
  listContainer: {
    paddingBottom: 20,
  },
  procedureCard: {
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  procedureName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  procedureText: {
    fontSize: 14,
    marginBottom: 8,
  },
  expandButton: {
    color: '#ff6060',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  algorithmButton: {
    padding: 8,
    borderRadius: 4,
    alignItems: 'center',
    marginTop: 8,
  },
  algorithmButtonText: {
    fontWeight: 'bold',
  },
  algorithmContainer: {
    marginTop: 16,
  },
  algorithmStep: {
    fontSize: 14,
    marginBottom: 4,
  },
  loaderContainer: {
    marginVertical: 16,
    alignItems: 'center',
  },
})
