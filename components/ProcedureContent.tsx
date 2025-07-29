import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Procedure } from '@/types/dataTypes';
import ProcedureCard from './ProcedureCard';

export default function ProcedureContent({ procedure }: { procedure: Procedure }) {
  const [isShowAlgorithm, setIsShowAlgorithm] = useState(false);
  const { algorithm, name, procedure: procedureText } = procedure.data;

  return (
    <View className="flex-1 p-2 bg-white">
      <Text className="text-3xl font-bold mb-2">{name}</Text>
      <Text className="text-xl text-zinc-700 mb-4">
        {procedureText}
      </Text>
      <TouchableOpacity
        className="flex justify-center bg-[#ffc5c5] items-center px-2 py-1 rounded-md border border-red-100/50 hover:border-zinc-900 hover:shadow-sm hover:bg-[#f58a8a] shadow-md shadow-zinc-500"
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
  );
}
