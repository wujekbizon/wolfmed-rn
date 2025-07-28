import React, { useState } from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { Step } from '@/types/dataTypes'

export default function ProcedureCard({ steps }: { steps: Step[] }) {
  const [currentStep, setCurrentStep] = useState(0)
  const [showAll, setShowAll] = useState(false)

  const handleNextStep = () => {
    setCurrentStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev))
  }

  const handleShowAll = () => {
    setShowAll(true)
  }

  return (
    <View className="space-y-4">
      {!showAll && (
        <TouchableOpacity
          onPress={handleShowAll}
          className="flex justify-center bg-[#ffc5c5] items-center px-2 py-1 transition-all hover:scale-95 rounded-md border border-red-100/50 hover:border-zinc-900 hover:shadow-sm hover:bg-[#f58a8a] shadow-md shadow-zinc-500"
        >
          <Text>Pokaż wszystkie kroki</Text>
        </TouchableOpacity>
      )}
      {showAll
        ? steps.map((step, index) => (
            <View
              key={`${step.step}/${index}`}
              className="border border-zinc-700/50 bg-zinc-200 hover:bg-zinc-300 p-4 rounded-lg shadow-md opacity-100 transition-all"
            >
              <View className="flex justify-between items-center">
                <Text className="text-xs font-semibold text-zinc-600">{`Krok ${index + 1}`}</Text>
              </View>
              <Text className="mt-2 text-zinc-900 font-semibold text-base">{step.step}</Text>
            </View>
          ))
        : steps.map((step, index) => (
            <View
              key={index}
              className={`border border-zinc-700/50 bg-zinc-50 hover:bg-[#ffeeee] p-4 rounded-lg shadow-md transition-all ${
                index <= currentStep ? 'opacity-100' : 'opacity-50'
              } ${index === currentStep ? 'border-zinc-700/80' : ''}`}
            >
              <View className="flex justify-between items-center">
                <Text className="text-xs font-semibold text-zinc-600">{`Krok ${index + 1}`}</Text>
                {index === currentStep && index < steps.length - 1 && (
                  <TouchableOpacity
                    onPress={handleNextStep}
                    className="flex justify-center text-zinc-800 hover:text-red-400 font-semibold items-center transition-colors"
                  >
                    <Text>Następny krok</Text>
                  </TouchableOpacity>
                )}
              </View>
              {index <= currentStep && <Text className="mt-2 text-zinc-900 font-semibold text-base">{step.step}</Text>}
            </View>
          ))}
    </View>
  )
}