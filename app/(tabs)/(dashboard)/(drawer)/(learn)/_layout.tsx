import CustomHeader from "@/components/ui/CustomHeader";
import { Stack } from "expo-router";
import { useColorScheme } from "react-native";

export default function LearnLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: isDark ? "#000" : "#fff",
        },
        headerTintColor: isDark ? "#fff" : "#000",
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="questions"
        options={{
          header: () => <CustomHeader title="Baza pytań" />,
          presentation: "card",
        }}
      />
      <Stack.Screen
        name="quizes"
        options={{
          header: () => <CustomHeader title="Wyzwania" />,
          presentation: "card",
        }}
      />
      <Stack.Screen
        name="procedures"
        options={{
          header: () => <CustomHeader title="Procedury" />,
          presentation: "card",
        }}
      />
    </Stack>
  );
}
