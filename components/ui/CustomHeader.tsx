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
        <Ionicons name="arrow-back-circle-outline" size={34}  />
      </TouchableOpacity>
      <Text className="flex-1 text-2xl font-medium text-slate-900 text-center">
        {title}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 45,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    marginLeft: 8,
    backgroundColor: "#fff",
  },
});
