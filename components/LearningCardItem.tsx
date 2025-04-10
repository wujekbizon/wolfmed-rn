import React from 'react'
import { ColorSchemeName, Text, View } from 'react-native'
import { Answer } from '@/types/dataTypes'
import { LETTERS } from '@/constants/optionsLetters'

type LearningCardItemProps = {
  item: Answer
  index: number
  showCorrectAnswer: boolean
  colorScheme: ColorSchemeName
}

export const LearningCardItem = ({
  item: { option, isCorrect },
  index,
  showCorrectAnswer,
  colorScheme,
}: LearningCardItemProps) => {
  return (
    <View className="flex-row items-center mb-2">
      <Text
        className={`text-sm mr-2 ${showCorrectAnswer && isCorrect ? 'text-[#ff6060]' : 'text-[#ffabab]'} ${
          showCorrectAnswer && !isCorrect ? 'opacity-25' : 'opacity-100'
        }`}
      >
        {LETTERS[index]})
      </Text>
      <Text
        className={`text-sm flex-1 py-0.5 px-1 rounded-lg ${colorScheme === 'dark' ? 'text-white' : 'text-black'} ${
          showCorrectAnswer && !isCorrect ? 'opacity-25' : 'opacity-100'
        } ${showCorrectAnswer && isCorrect ? 'bg-[#ffdcdc]' : 'bg-transparent'}
      `}
      >
        {option}
      </Text>
    </View>
  )
}
