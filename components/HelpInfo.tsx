import React from 'react'
import { View, Text, ScrollView, Pressable } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

interface HelpInfoProps {
  color: string
}

interface HelpItem {
  title: string
  description: string
  icon: keyof typeof Ionicons.glyphMap
}

const helpItems: HelpItem[] = [
  {
    title: 'Nawigacja Okrągła',
    description: 'Dotknij środkowego koła, aby rozwinąć lub zwinąć menu nawigacyjne. Przesuwaj między sekcjami po rozwinięciu.',
    icon: 'radio-button-on'
  },
  {
    title: 'Szybkie Akcje',
    description: 'Uzyskaj dostęp do często używanych funkcji poprzez menu Szybkich Akcji w różowej sekcji.',
    icon: 'flash'
  },
  {
    title: 'Ustawienia Profilu',
    description: 'Zaktualizuj swój profil, motto i preferencje w sekcji Profil.',
    icon: 'person'
  },
  {
    title: 'Statystyki',
    description: 'Zobacz swoje postępy i metryki aktywności w sekcji Statystyk.',
    icon: 'stats-chart'
  },
  {
    title: 'Aktualności',
    description: 'Bądź na bieżąco z najnowszymi ogłoszeniami i aktualizacjami społeczności.',
    icon: 'newspaper'
  }
]

export default function HelpInfo({ color }: HelpInfoProps) {
  return (
    <ScrollView 
      showsVerticalScrollIndicator={false}
      className="flex-1"
    >
      <Text className="text-2xl font-bold text-zinc-800 dark:text-zinc-100 mb-4">
        Pomoc i Informacje
      </Text>
      <Text className="text-base text-zinc-600 dark:text-zinc-300 mb-6">
        Dowiedz się, jak korzystać z panelu i wykorzystać jego pełny potencjał
      </Text>
      
      <View className="space-y-4">
        {helpItems.map((item, index) => (
          <Pressable 
            key={index}
            className="flex-row items-start p-4 rounded-xl bg-white dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-700"
            style={{ 
              shadowColor: color,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 2
            }}
          >
            <View 
              className="w-10 h-10 rounded-full items-center justify-center mr-4"
              style={{ backgroundColor: `${color}15` }}
            >
              <Ionicons 
                name={item.icon} 
                size={20} 
                color={color}
              />
            </View>
            <View className="flex-1">
              <Text className="text-base font-semibold text-zinc-800 dark:text-zinc-100 mb-1">
                {item.title}
              </Text>
              <Text className="text-sm text-zinc-600 dark:text-zinc-300">
                {item.description}
              </Text>
            </View>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  )
} 