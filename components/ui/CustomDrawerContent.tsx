import {
  DrawerContentScrollView,
  DrawerItemList,
} from "@react-navigation/drawer";
import { cn } from "@/lib/utils";
import LogoHeader from "@/components/LogoHeader";
import {useRouter } from "expo-router";
import { Pressable, useColorScheme, View } from "react-native";

export default function CustomDrawerContent(props: any) {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const isDark = colorScheme === "dark";

  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={{
        flex: 1,
        paddingTop: 0,
      }}
    >
      <Pressable
        onPress={() => router.push("/(tabs)")}
        className="w-full px-2 pt-6 active:opacity-70"
      >
        <LogoHeader isDark={isDark} />
      </Pressable>
      <View
        className={cn(
          "flex-1 w-full border-t pt-2 pb-6 mt-4",
          isDark ? "bg-black/30 border-white/10" : "bg-white/70 border-zinc-200"
        )}
      >
        <DrawerItemList {...props} />
      </View>
    </DrawerContentScrollView>
  );
}