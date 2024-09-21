import React from 'react'
import { StyleSheet, Text, ScrollView, ColorSchemeName, useColorScheme } from 'react-native'
import { cards } from '@/constants/cardContent'
import { TestInfoCard } from '@/components/TestInfoCard'
import { Divider } from '@/components/Divider'

export default function TestsProceduresScreen() {
  const colorScheme = useColorScheme()

  return (
    <ScrollView style={[styles.container, { backgroundColor: colorScheme === 'dark' ? '#333' : '#FFF' }]}>
      <Text style={[styles.screenTitle, { color: colorScheme === 'dark' ? '#FFF' : '#000' }]}>
        Szeroki wybór testów i procedur.
      </Text>
      <Text style={[styles.testText, { color: colorScheme === 'dark' ? '#FFF' : '#000' }]}>
        Wybieraj spośród ponad 500 testów obejmujących szeroką gamę odpowiednich tematów rozwoju zawodowego opiekunów
        medycznych!
      </Text>
      {cards.map((card, index) => (
        <React.Fragment key={index}>
          <TestInfoCard card={card} colorScheme={colorScheme} />
          {index < cards.length - 1 && <Divider colorScheme={colorScheme} />}
        </React.Fragment>
      ))}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 50,
    textAlign: 'center',
  },
  testText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'left',
  },
})
