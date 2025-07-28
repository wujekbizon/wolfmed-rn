import * as Haptics from "expo-haptics";
import { Procedure } from "@/types/dataTypes";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { WOLFMED_COLORS } from "@/constants/styles";
import { Image } from 'expo-image';

export default function MinimizedProcedureCard({
  procedure,
  image,
  onPress,
}: {
  procedure: Procedure;
  image: any,
  onPress: () => void;
}) {
  const { name } = procedure.data;

  const onPressCustomButtonHandler = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  const truncatedName = name.slice(0, 58) + (name.length > 58 ? ' ...' : '')


  return (
    <View className="w-[100%] h-[200px] mb-6 rounded-xl">
      <Pressable
        className={`flex-1 rounded-xl shadow-md bg-[#A491BB] border border-slate-900/60`}
        style={({ pressed }) => [pressed && styles.pressed]}
        onPress={onPressCustomButtonHandler}
        android_ripple={{ color: WOLFMED_COLORS.background }}
      >
        {image && <Image source={image} style={{position:'absolute', borderRadius: 12, objectFit:'cover', width: '100%', height:198}} />} 
        <View className="flex-1 p-2 items-center justify-center rounded-sm ">
          <Text className="text-2xl font-semibold text-center text-zinc-950">
            {truncatedName}
          </Text>
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
