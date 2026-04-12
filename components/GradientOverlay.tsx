import { useColorScheme } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'

export default function GradientOverlay() {
  const colorScheme = useColorScheme()

  const colors = colorScheme === 'dark'
    ? ['rgba(255,91,91,0.2)', 'rgba(147,51,234,0.1)'] as const
    : ['rgba(225,29,72,0.15)', 'rgba(109,40,217,0.1)'] as const

  return (
    <LinearGradient
      style={{ position: 'absolute', width: '100%', height: '100%' }}
      colors={colors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    />
  )
}
