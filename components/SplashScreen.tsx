import { StatusBar, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { Easing, FadeInDown, ZoomIn } from "react-native-reanimated";
import { WOLFMED_COLORS } from "@/constants/styles";
import Logo from "./Logo";
import { useEffect } from "react";
import * as ExpoSplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font";

interface SplashScreenProps {
  onReady: () => void;
}

export default function SplashScreen({ onReady }: SplashScreenProps) {
  const [loaded] = useFonts({
    OpenSans: require("../assets/fonts/OpenSans-Regular.ttf"),
  });

  // Hide the Expo splash screen immediately
  useEffect(() => {
    ExpoSplashScreen.hideAsync();
  }, []);

  // Notify the parent component when assets are loaded
  useEffect(() => {
    if (loaded) {
      // Optional: Add a delay to show the custom splash screen for a few seconds
      setTimeout(() => {
        onReady();
      }, 3000);
    }
  }, [loaded, onReady]);

  return (
    <>
      <StatusBar  backgroundColor={WOLFMED_COLORS.background} />
      <SafeAreaView style={{ flex: 1 }}>
        <View className="flex-1 bg-background items-center justify-center gap-3 p-spacer5">
          <Animated.View
            entering={ZoomIn.withInitialValues({
              opacity: 0,
              transform: [{ scale: 0.5 }],
            })
              .easing(Easing.ease)
              .duration(1100)}
            className="flex-1/2 items-center"
          >
            <Logo />
          </Animated.View>
          <Animated.View
            entering={FadeInDown.withInitialValues({
              opacity: 0,
              transform: [{ translateY: 250 }],
            })
              .easing(Easing.ease)
              .duration(1000)
              .delay(200)}
            className="flex-1/2 items-center"
          >
            <Text className="text-[45px] leading-11 line font-bold text-black dark:text-zinc-100">
              WOLFMED
            </Text>
            <Text className="mb-5 text-[40px] leading-10 font-normal text-[#565656] dark:text-zinc-100">
              EDUKACJA
            </Text>
            <Text className="text-2xl text-primary300 text-center leading-9 font-light">
              Innowacyjne rozwiązania w edukacji medycznej
            </Text>
          </Animated.View>
        </View>
      </SafeAreaView>
    </>
  );
}
