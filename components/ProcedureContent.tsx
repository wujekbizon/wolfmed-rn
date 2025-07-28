import { useState } from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { Procedure } from '@/types/dataTypes'
import ProcedureCard from './ProcedureCard'

export default function ProcedureContent({ procedure }: { procedure: Procedure }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isShowAlgorithm, setIsShowAlgorithm] = useState(false)
  const { algorithm, name, procedure: procedureText } = procedure.data

  const truncatedProcedure = procedureText.slice(0, 280) + (procedureText.length > 280 ? '...' : '')

  return (
    <View className="border p-5 rounded-lg shadow-md border-red-200/60 bg-white shadow-zinc-500">
      <Text className="text-2xl mb-2">{name}</Text>
      <Text className="text-zinc-700 mb-4">
        {isExpanded ? procedureText : truncatedProcedure}{' '}
        <TouchableOpacity onPress={() => setIsExpanded(!isExpanded)}>
          <Text className="text-sm text-red-500/80 font-semibold">
            {isExpanded ? 'Pokaż Mniej' : 'Czytaj Więcej'}
          </Text>
        </TouchableOpacity>
      </Text>
      <TouchableOpacity
        className="flex justify-center bg-[#ffc5c5] items-center px-2 py-1 transition-all hover:scale-95 rounded-md border border-red-100/50 hover:border-zinc-900 hover:shadow-sm hover:bg-[#f58a8a] shadow-md shadow-zinc-500"
        onPress={() => setIsShowAlgorithm(!isShowAlgorithm)}
      >
        <Text>{isShowAlgorithm ? 'Zwiń Algorytm' : 'Pokaż Algorytm'}</Text>
      </TouchableOpacity>

      {isShowAlgorithm && (
        <View className="mt-4">
          <ProcedureCard steps={algorithm} />
        </View>
      )}
    </View>
  )
}
