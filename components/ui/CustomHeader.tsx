import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Props = {
  title?: string;
  onRightPress?: () => void;
  backgroundColor?: string;
  date?: string;
};

export default function CustomHeader({
  title = "Powrót",
  onRightPress,
  backgroundColor,
  date,
}: Props) {
  const navigation = useNavigation();
  const { top } = useSafeAreaInsets();

  if (backgroundColor) {
    return (
      <View style={[styles.tall, { backgroundColor, paddingTop: top }]}>
        <TouchableOpacity style={{ paddingHorizontal: 8 }} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back-circle-outline" size={34} />
        </TouchableOpacity>
        <View style={styles.tallOverlay}>
          <Text style={styles.tallTitle} numberOfLines={3}>
            {title}
          </Text>
          {date ? (
            <View style={styles.dateBadge}>
              <Text style={styles.dateBadgeText}>{date}</Text>
            </View>
          ) : null}
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { height: 45 + top, paddingTop: top }]}>
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
  tall: {
    height: 180,
    justifyContent: "space-between",
  },
  tallOverlay: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 18,
    gap: 12,
  },
  tallTitle: {
    flex: 1,
    fontSize: 22,
    fontWeight: "700",
    color: "#1f2937",
    lineHeight: 29,
  },
  dateBadge: {
    backgroundColor: "rgba(255,255,255,0.75)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: "flex-end",
    flexShrink: 0,
  },
  dateBadgeText: {
    fontSize: 11,
    color: "#1f2937",
    fontWeight: "500",
  },
});
