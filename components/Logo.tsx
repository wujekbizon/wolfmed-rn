import { cn } from "@/lib/utils";
import { View, Image } from "react-native";

export default function Logo() {
  return (
    <View className="flex-row items-center gap-4">
      <View
        className={cn(
          "h-40 w-40 rounded-full border border-[#A1A1AA]/50 flex items-center justify-center bg-white"
        )}
      >
        <Image
          source={{
            uri: "https://utfs.io/a/zw3dk8dyy9/UVAwLrIxs2k5UOm8ArIxs2k5EyuGdN4SRigYP6qreJDvtVZl",
          }}
          className="w-36 h-36"
          resizeMode="contain"
        />
      </View>
    </View>
  );
}
