import { cn } from '@/lib/utils'
import { Text, View, Image } from 'react-native'

export default function LogoHeader({ isDark }: { isDark: boolean }) {
    return (
        <View className={cn(
            "w-full flex-row items-center justify-evenly px-2 py-2 rounded-lg",
            isDark 
              ? "bg-black/40 border border-rose-500/20" 
              : "bg-white/90 border border-red-200/40"
          )}>
            <View className="flex-row items-center gap-4">
              <View className={cn(
                "h-16 w-16 rounded-full flex items-center justify-center",
                isDark ? "bg-black/50" : "bg-white"
              )}>
                <Image
                  source={{ uri: 'https://utfs.io/a/zw3dk8dyy9/UVAwLrIxs2k5UOm8ArIxs2k5EyuGdN4SRigYP6qreJDvtVZl' }}
                  className="w-12 h-12"
                  resizeMode="contain"
                />
              </View>
              <View className="flex-row items-center gap-2">
                <Text className={cn(
                  "text-2xl font-black tracking-wide",
                  isDark ? "text-white" : "text-zinc-950"
                )}>
                  WOLFMED
                </Text>
                <Text className={cn(
                  "text-2xl font-semibold tracking-wide",
                  isDark ? "text-white/50" : "text-zinc-500"
                )}>
                  EDUKACJA
                </Text>
              </View>
            </View>
        </View>
    )  
}      
