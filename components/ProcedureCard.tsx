import React from 'react'
import { View, Text } from 'react-native'
import { Step } from '@/types/dataTypes'

export default function ProcedureCard({ steps }: { steps: Step[] }) {
  return (
    <View className="space-y-4">
  
      {steps.map((step, index) => (
            <View
              key={`${step.step}/${index}`}
              className="border mb-5 border-zinc-700/50 bg-zinc-200 hover:bg-zinc-300 p-4 rounded-lg shadow-md opacity-100 transition-all"
            >
              <View className="flex justify-between items-center">
                <Text className="text-xs font-semibold text-zinc-600">{`Krok ${index + 1}`}</Text>
              </View>
              <Text className="mt-2 text-zinc-900 font-semibold text-base">{step.step}</Text>
            </View>
          ))}
    </View>
  )
}