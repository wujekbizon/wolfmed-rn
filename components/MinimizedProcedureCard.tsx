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
    <View className="w-[100%] h-[250px] mb-6 rounded-xl">
      <Pressable
        className={`flex-1 rounded-xl shadow-md bg-[#A491BB] border border-slate-900/60`}
        style={({ pressed }) => [pressed && styles.pressed]}
        onPress={onPressCustomButtonHandler}
        android_ripple={{ color: WOLFMED_COLORS.background }}
      >
        <View className="flex-1 items-center justify-center rounded-sm ">
        {image && <Image source={image} contentFit="contain" style={{position:'absolute', borderRadius: 12, width: '100%', height: '100%',}} />} 
          <Text className="text-2xl bg-white/80 w-[90%] p-2 backdrop-blur-md shadow-sm rounded font-semibold text-center text-black">
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
