import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";

type Props = {
  title?: string;
  onRightPress?: () => void;
};

export default function CustomHeader({
  title = "Powrót",
  onRightPress,
}: Props) {
  const navigation = useNavigation();
  return (
    <View style={styles.container} >
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back-circle-outline" size={35} color="#484c55" />
      </TouchableOpacity>
      <Text className="flex-1 text-2xl font-medium text-slate-900 text-center">
        {title}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 160,
    height: 40,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    marginTop: 8,
    marginLeft: 8,
    backgroundColor: "#fff",
    borderColor: "#000",
    borderWidth: 1,
    borderRadius: 8,
  },
});
