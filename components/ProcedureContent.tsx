import React, { useState } from "react";
import { View, Text, TouchableOpacity, Modal } from "react-native";
import { Procedure } from "@/types/dataTypes";
import ProcedureCard from "./ProcedureCard";
import { ScrollView } from "react-native-gesture-handler";

export default function ProcedureContent({
  procedure,
}: {
  procedure: Procedure;
}) {
  const [isShowAlgorithm, setIsShowAlgorithm] = useState(false);
  const { algorithm, name, procedure: procedureText } = procedure.data;

  return (
    <View className="flex-1 p-2 bg-white">
      <View className="flex-1">
        <Text className="text-3xl font-bold mb-2">{name}</Text>
        <Text className="text-xl text-zinc-700 mb-4">{procedureText}</Text>
      </View>
      <TouchableOpacity
        className="flex-1 justify-center bg-[#ffc5c5] items-center px-2 py-1 rounded-md border border-red-100/50 hover:border-zinc-900 hover:shadow-sm hover:bg-[#f58a8a] shadow-md shadow-zinc-500"
        onPress={() => setIsShowAlgorithm(!isShowAlgorithm)}
      >
        <Text>{isShowAlgorithm ? "Zwiń Algorytm" : "Pokaż Algorytm"}</Text>
      </TouchableOpacity>

      <Modal
        visible={isShowAlgorithm}
        animationType="slide"
        onRequestClose={() => setIsShowAlgorithm(false)}
      >
        <ScrollView className="flex-1 p-4 bg-white" contentContainerStyle={{ paddingBottom: 40 }}>
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-2xl font-bold">Algorytm</Text>
            <TouchableOpacity onPress={() => setIsShowAlgorithm(false)}>
              <Text className="text-red-500">Zamknij</Text>
            </TouchableOpacity>
          </View>
          <ProcedureCard steps={algorithm} />
        </ScrollView>
      </Modal>
    </View>
  );
}
