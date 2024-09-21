import { useState } from 'react'
import { StyleSheet, Text, View, TouchableOpacity, useColorScheme } from 'react-native'
import { Procedure } from '@/types/dataTypes'

export const ProcedureContent = ({ procedure }: { procedure: Procedure }) => {
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

const styles = StyleSheet.create({
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
})
