import React from "react";
import { Stack } from "expo-router";

export default function DashboardScreen() {

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(drawer)" />
    </Stack>
  );
}
