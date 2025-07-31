import { useEffect } from "react";
import * as Haptics from "expo-haptics";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from "react-native";
import { ExternalPathString, Link, RelativePathString } from "expo-router";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import { learningMaterials } from "@/constants/learningMaterials";
import { WOLFMED_COLORS } from "@/constants/styles";

export default function LearningScreen() {
  const colorScheme = useColorScheme();
  const fadeAnim = useSharedValue(0);

  useEffect(() => {
    fadeAnim.value = withTiming(1, { duration: 1000 });
  }, [fadeAnim]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: fadeAnim.value,
  }));

  const onPressCustomButtonHandler = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  return (
    <View
      className={`flex-1 p-5 ${
        colorScheme === "dark" ? "bg-zinc-900" : "bg-[#f4edff7f]/50"
      }`}
    >
      <View className="flex-1 items-center">
        {learningMaterials.map((item, index) => (
          <Animated.View
            key={item.id}
            style={[
              styles.briefcase,
              animatedStyle,
              { backgroundColor: index === 0 ? "#A491BB" : "#fff" },
            ]}
          >
            <Link
              href={item.href as RelativePathString | ExternalPathString}
              asChild
              className="flex-1 flex-col justify-between items-center"
            >
              <Pressable
                className={`flex-1 rounded-xl shadow-md p-6 border border-slate-900/50`}
                style={({ pressed }) => [pressed && styles.pressed]}
                onPress={onPressCustomButtonHandler}
                android_ripple={{ color: WOLFMED_COLORS.background }}
              >
                <View className="flex flex-col items-center">
                  <Text
                    className={`${
                      index === 0 ? "text-white" : "text-black"
                    } text-2xl font-medium`}
                  >
                    {item.title}
                  </Text>

                  <Text
                    className={`${
                      index === 0 ? "text-white" : "text-black"
                    } text-lg text-center font-normal mt-2`}
                  >
                    {item.description}
                  </Text>
                </View>
                <FontAwesome5 name={item.icon} size={38} color="#494C4E" />
                <Text
                  className={`${
                    index === 0 ? "text-white" : "text-[#6B696B]"
                  } text-base text-center leading-5 font-normal mt-2 `}
                >
                  Ilość dostępnych materiałów:
                  <Text className="text-red-500 font-semibold">
                    {" "}
                    {item.total}
                  </Text>
                </Text>
              </Pressable>
            </Link>
          </Animated.View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  briefcase: {
    flex: 1,
    width: "100%",
    marginVertical: 10,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  pressed: {
    opacity: 0.7,
  },
});
