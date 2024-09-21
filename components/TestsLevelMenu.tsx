import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet, useColorScheme } from 'react-native'
import { testsMenu } from '@/constants/testsMenu'
import { useGenerateTestStore } from '../store/useGenerateTestStore'

const RandomTestButton = ({
  children,
  number,
  disabled,
  isDarkMode,
}: {
  children: React.ReactNode
  number: number
  disabled: boolean
  isDarkMode: boolean
}) => {
  const { setNumberTests, setIsTest } = useGenerateTestStore()

  const handlePress = () => {
    setNumberTests(number)
    setIsTest(true)
  }

  return (
    <TouchableOpacity
      style={[styles.button, isDarkMode ? styles.buttonDark : styles.buttonLight]}
      onPress={handlePress}
      disabled={disabled}
    >
      <Text style={[styles.buttonText, isDarkMode ? styles.buttonTextDark : styles.buttonTextLight]}>{children}</Text>
    </TouchableOpacity>
  )
}

export default function TestsLevelMenu({ isLoading }: { isLoading?: boolean }) {
  const colorScheme = useColorScheme()
  const isDarkMode = colorScheme === 'dark'

  return (
    <View style={[styles.container, isDarkMode ? styles.containerDark : styles.containerLight]}>
      <Text style={[styles.title, isDarkMode ? styles.titleDark : styles.titleLight]}>Wybierz poziom testu.</Text>
      <View style={styles.buttonContainer}>
        {testsMenu.map((m) => (
          <View key={m.testTitle} style={styles.menuItem}>
            <Text style={[styles.menuItemText, isDarkMode ? styles.menuItemTextDark : styles.menuItemTextLight]}>
              {m.number.toString()} pytań
            </Text>
            <RandomTestButton disabled={isLoading ? true : false} number={m.number} isDarkMode={isDarkMode}>
              {isLoading ? 'Wczytuje testy...' : m.testTitle}
            </RandomTestButton>
          </View>
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    gap: 16,
    borderRadius: 16,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    padding: 20,
  },
  containerLight: {
    borderColor: 'rgba(254, 202, 202, 0.6)',
    backgroundColor: '#ffb1b1',
    shadowColor: '#6b7280',
  },
  containerDark: {
    borderColor: 'rgba(254, 202, 202, 0.3)',
    backgroundColor: '#222e',
    shadowColor: '#000',
  },
  title: {
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 16,
  },
  titleLight: {
    color: '#111827',
  },
  titleDark: {
    color: '#e5e7eb',
  },
  buttonContainer: {
    width: '100%',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: 16,
  },
  menuItem: {
    gap: 8,
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: 14,
    textAlign: 'center',
  },
  menuItemTextLight: {
    color: '#6b7280',
  },
  menuItemTextDark: {
    color: '#9ca3af',
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
  },
  buttonLight: {
    backgroundColor: '#ff7a7a',
  },
  buttonDark: {
    backgroundColor: '#ff0000',
  },
  buttonText: {
    fontWeight: 'bold',
  },
  buttonTextLight: {
    color: 'white',
  },
  buttonTextDark: {
    color: '#e5e7eb',
  },
})
