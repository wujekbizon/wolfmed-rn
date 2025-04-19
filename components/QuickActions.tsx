import { View, Text, ScrollView, Pressable } from 'react-native'
import { BlurView } from 'expo-blur'
import { Link } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'

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
  color: string;
}

export default function QuickActions({ color }: QuickActionsProps) {
  return (
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
  )
} 