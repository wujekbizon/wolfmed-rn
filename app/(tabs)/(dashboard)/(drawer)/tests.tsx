import React, { useEffect } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native'
import { useGenerateTestStore } from '@/store/useGenerateTestStore'
import { useTests } from '@/hooks/useTests'
import TestsLevelMenu from '@/components/TestsLevelMenu'
import TestCard from '@/components/TestCard'

export default function Testy() {
  const { numberTests, isTest, setNumberTests, setIsTest, tests, setTests } = useGenerateTestStore()
  const { tests: apiTests } = useTests()

  useEffect(() => {
    if (apiTests.length > 0) setTests(apiTests)
  }, [apiTests, setTests])

  const randomTest = tests.slice(0, numberTests || 0)

  const handleSubmit = () => {
    // Implement submit logic here
    setNumberTests(null)
    setIsTest(false)
  }

  const handleReset = () => {
    setNumberTests(null)
    setIsTest(false)
  }

  return (
    <View style={styles.container}>
      {!isTest ? (
        <TestsLevelMenu />
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {randomTest.map((item, index) => (
            <TestCard
              formState={{ status: 'UNSET', message: '', fieldErrors: {}, timestamp: 0 }}
              key={item.id}
              test={item}
              questionNumber={`${index + 1}/${randomTest.length}`}
            />
          ))}
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={handleSubmit}>
              <Text style={styles.buttonText}>Prześlij Test</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={handleReset}>
              <Text style={styles.buttonText}>Reset Test</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  menuContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    gap: 16,
  },
  testCard: {
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    backgroundColor: '#f8fafc',
  },
  questionNumber: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  question: {
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
  },
  button: {
    backgroundColor: '#3b82f6',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
})
