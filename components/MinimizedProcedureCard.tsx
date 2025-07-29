import * as Haptics from "expo-haptics";
import { Procedure } from "@/types/dataTypes";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { WOLFMED_COLORS } from "@/constants/styles";
import { Image } from "expo-image";

export default function MinimizedProcedureCard({
  procedure,
  image,
  onPress,
}: {
  procedure: Procedure;
  image: any;
  onPress: () => void;
}) {
  const { name } = procedure.data;

  const onPressCustomButtonHandler = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  const truncateName = (name: string) => {
    const maxLength = 59;
    const openParenIndex = name.indexOf('(');

    if (openParenIndex !== -1 && openParenIndex <= maxLength) {
      return name.slice(0, openParenIndex);
    } else {
      return name.slice(0, maxLength);
    }
  };

  const truncatedName = truncateName(name);

  return (
    <View className="w-[100%] h-[250px] mb-6 rounded-xl">
      <Pressable
        className={`flex-1 rounded-xl shadow-md bg-[#A491BB] border-2 border-slate-950`}
        style={({ pressed }) => [pressed && styles.pressed]}
        onPress={onPressCustomButtonHandler}
        android_ripple={{ color: WOLFMED_COLORS.background }}
      >
        <View className="flex-1">
          <View className="h-[70%]">
            {image && (
              <Image
                source={image}
                contentFit="contain"
                style={{
                  width: "100%",
                  height: "130%",
                }}
              />
            )}
          </View>
          <View className="h-[30%] justify-end items-center">
            <Text className="text-2xl bg-white/70 w-[100%] p-2 backdrop-blur-md shadow-sm rounded-b-xl font-semibold text-center text-black">
              {truncatedName}
            </Text>
          </View>
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  pressed: {
    opacity: 0.7,
  },
});
