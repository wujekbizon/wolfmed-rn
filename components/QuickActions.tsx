import { View, Text, ScrollView, Pressable } from 'react-native'
import { BlurView } from 'expo-blur'
import { Link } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import Animated, { 
  useAnimatedStyle, 
  withSpring,
  interpolate,
  useSharedValue,
  useAnimatedReaction
} from 'react-native-reanimated'

type ActionType = {
  id: string
  label: string
  icon: string
  href: `/(drawer)/${string}`
}

const actions: ActionType[] = [
  {
    id: 'start-test',
    label: 'Rozpocznij test',
    icon: 'play-circle',
    href: '/(drawer)/tests',
  },
  {
    id: 'profile',
    label: 'Profil',
    icon: 'person',
    href: '/(drawer)/profile',
  },
  {
    id: 'stats',
    label: 'Statystyki',
    icon: 'stats-chart',
    href: '/(drawer)/stats',
  },
]

interface QuickActionsProps {
  isExpanded: boolean;
  color?: string;
}

export default function QuickActions({ isExpanded, color = '#f58a8a' }: QuickActionsProps) {
  const animation = useSharedValue(0)

  useAnimatedReaction(
    () => isExpanded,
    (expanded) => {
      animation.value = withSpring(expanded ? 1 : 0, {
        damping: 12,
        stiffness: 100,
      })
    },
    [isExpanded]
  )

  const animatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(animation.value, [0, 1], [0.95, 1])
    const opacity = interpolate(animation.value, [0, 1], [0.5, 1])

    return {
      transform: [{ scale }],
      opacity,
    }
  })

  return (
    <Animated.View style={animatedStyle}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="gap-3"
      >
        {actions.map((action) => (
          <Link key={action.id} href={action.href} asChild>
            <Pressable>
              <BlurView intensity={40} tint="light" className="overflow-hidden rounded-xl">
                <View 
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 8,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    backgroundColor: `${color}10`,
                  }}
                >
                  <Ionicons 
                    name={action.icon as any} 
                    size={20} 
                    color={color}
                  />
                  <Text style={{ fontSize: 14, fontWeight: '500', color }}>
                    {action.label}
                  </Text>
                </View>
              </BlurView>
            </Pressable>
          </Link>
        ))}
      </ScrollView>
    </Animated.View>
  )
} 