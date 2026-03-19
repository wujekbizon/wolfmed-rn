import React, { useCallback } from 'react'
import { StyleSheet, Text, View, FlatList, useColorScheme } from 'react-native'
import { cards } from '@/constants/cardContent'
import { TestInfoCard } from '@/components/TestInfoCard'
import { Divider } from '@/components/Divider'
import { TestCardContent } from '@/types/dataTypes'

export default function TestsProceduresScreen() {
  const colorScheme = useColorScheme()

  const renderItem = useCallback(
    ({ item, index }: { item: TestCardContent; index: number }) => (
      <View>
        <TestInfoCard card={item} colorScheme={colorScheme} />
        {index < cards.length - 1 && <Divider colorScheme={colorScheme} />}
      </View>
    ),
    [colorScheme]
  )

  const ListHeaderComponent = useCallback(
    () => (
      <>
        <Text style={[styles.screenTitle, { color: colorScheme === 'dark' ? '#FFF' : '#000' }]}>
          Szeroki wybór testów i procedur.
        </Text>
        <Text style={[styles.testText, { color: colorScheme === 'dark' ? '#FFF' : '#000' }]}>
          Wybieraj spośród ponad 500 testów obejmujących szeroką gamę odpowiednich tematów rozwoju zawodowego opiekunów
          medycznych!
        </Text>
      </>
    ),
    [colorScheme]
  )

  return (
    <FlatList
      style={[styles.container, { backgroundColor: colorScheme === 'dark' ? '#333' : '#FFF' }]}
      data={cards}
      renderItem={renderItem}
      keyExtractor={(_, index) => index.toString()}
      ListHeaderComponent={ListHeaderComponent}
      showsVerticalScrollIndicator={false}
      removeClippedSubviews={true}
      maxToRenderPerBatch={5}
      windowSize={5}
      initialNumToRender={4}
    />
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
