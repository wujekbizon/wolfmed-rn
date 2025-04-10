import React, { useState, useCallback } from 'react'
import { Text, View, TouchableOpacity, FlatList } from 'react-native'
import { Answer, Test } from '@/types/dataTypes'
import { useColorScheme } from 'react-native'
import { LearningCardItem } from './LearningCardItem'

type LearningCardProps = {
  test: Test
  questionNumber: string
}

export const LearningCard = ({ test, questionNumber }: LearningCardProps) => {
  const [showCorrectAnswer, setShowCorrectAnswer] = useState(false)
  const colorScheme = useColorScheme()

  return (
    <View
      className={`flex rounded-lg shadow-sm border border-red-100 p-4 mb-5
        ${colorScheme === 'dark' ? 'bg-[#333]' : 'bg-white'}`}
    >
      <Text
        className={`absolute right-2 top-1 text-xs
          ${colorScheme === 'dark' ? 'text-[#BBB]' : 'text-[#666]'}`}
      >
        {questionNumber}
      </Text>

      <Text
        className={`text-base font-bold border-b border-black/10 pb-2 mb-4
          ${colorScheme === 'dark' ? 'text-white' : 'text-black'}`}
      >
        {test.data.question}
      </Text>

      <FlatList
        data={test.data.answers}
        renderItem={({ item, index }: { item: Answer; index: number }) => (
          <LearningCardItem item={item} index={index} showCorrectAnswer={showCorrectAnswer} colorScheme={colorScheme} />
        )}
        keyExtractor={(_item: Answer, index: number) => `answer-${index}`}
      />

      <TouchableOpacity
        className="h-9 rounded-lg justify-center items-center mt-2 bg-[#ffb1b1]"
        onPress={() => setShowCorrectAnswer((prev) => !prev)}
      >
        <Text className="text-sm font-medium text-black">
          {showCorrectAnswer ? 'Ukryj Odpowiedź' : 'Pokaż Odpowiedź'}
        </Text>
      </TouchableOpacity>
    </View>
  )
}
