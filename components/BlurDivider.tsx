import { View } from 'react-native'
import { BlurView } from 'expo-blur'
import { useColorScheme } from 'react-native'

interface BlurDividerProps {
  /**
   * Height of the divider in percentage (without % symbol)
   * @default 24
   */
  heightPercentage?: number
  /**
   * Intensity of the blur effect
   * @default 80
   */
  blurIntensity?: number
  /**
   * Additional className for the container View
   */
  className?: string
}

export function BlurDivider({ 
  heightPercentage = 24,
  blurIntensity = 80,
  className = ''
}: BlurDividerProps) {
  const colorScheme = useColorScheme()

  return (
    <View 
      className={`w-full px-4 ${className}`}
      style={{ height: `${heightPercentage}%` }}
    >
      <BlurView 
        intensity={blurIntensity}
        tint={colorScheme === 'dark' ? 'dark' : 'light'}
        className="w-full h-full rounded-2xl overflow-hidden"
      />
    </View>
  )
} 