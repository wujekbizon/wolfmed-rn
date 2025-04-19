import React from 'react'
import { View, Text, ScrollView, Pressable } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

interface NewsFeedProps {
  color: string
}

interface NewsItem {
  date: string
  title: string
  description: string
  type: 'update' | 'announcement' | 'community'
  icon: keyof typeof Ionicons.glyphMap
}

const newsItems: NewsItem[] = [
  {
    date: '12 Kwiecień 2025',
    title: 'Aktualizacja bazy testów',
    description: 'Poszerzyliśmy naszą bazę danych o najnowsze 40 testów z egzaminów ze Stycznia 2025',
    type: 'update',
    icon: 'document-text'
  },
  {
    date: '12 Kwiecień 2025',
    title: 'Rozwój Społeczności',
    description: 'Już ponad 2500 aktywnych użytkowników!',
    type: 'community',
    icon: 'people'
  },
  {
    date: '11 Kwiecień 2025',
    title: 'Nowość: Procedury Video',
    description: 'Już wkrótce: Profesjonalne materiały video pokazujące krok po kroku najważniejsze procedury',
    type: 'announcement',
    icon: 'videocam'
  }
]

const getTypeColor = (type: NewsItem['type'], baseColor: string) => {
  switch (type) {
    case 'update':
      return '#3b82f6'
    case 'announcement':
      return baseColor
    case 'community':
      return '#10b981'
    default:
      return baseColor
  }
}

const getTypeLabel = (type: NewsItem['type']) => {
  switch (type) {
    case 'update':
      return 'Aktualizacja'
    case 'announcement':
      return 'Ogłoszenie'
    case 'community':
      return 'Społeczność'
    default:
      return type
  }
}

export default function NewsFeed({ color }: NewsFeedProps) {
  return (
    <ScrollView 
      showsVerticalScrollIndicator={false}
      className="flex-1"
    >
      <Text className="text-2xl font-bold text-zinc-800 dark:text-zinc-100 mb-4">
        Najnowsze Aktualizacje
      </Text>
      <Text className="text-base text-zinc-600 dark:text-zinc-300 mb-6">
        Bądź na bieżąco z nowymi funkcjami i aktualizacjami społeczności
      </Text>
      
      <View className="space-y-4">
        {newsItems.map((item, index) => {
          const typeColor = getTypeColor(item.type, color)
          
          return (
            <Pressable 
              key={index}
              className="p-4 rounded-xl bg-white dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-700"
              style={{ 
                shadowColor: typeColor,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 2
              }}
            >
              <View className="flex-row items-center mb-3">
                <View 
                  className="w-8 h-8 rounded-full items-center justify-center mr-3"
                  style={{ backgroundColor: `${typeColor}15` }}
                >
                  <Ionicons 
                    name={item.icon} 
                    size={16} 
                    color={typeColor}
                  />
                </View>
                <Text className="text-sm text-zinc-500 dark:text-zinc-400">
                  {item.date}
                </Text>
              </View>
              
              <Text 
                className="text-lg font-semibold text-zinc-800 dark:text-zinc-100 mb-2"
                style={{ color: typeColor }}
              >
                {item.title}
              </Text>
              <Text className="text-base text-zinc-600 dark:text-zinc-300">
                {item.description}
              </Text>
              
              <View className="flex-row mt-3">
                <View 
                  className="px-3 py-1 rounded-full"
                  style={{ backgroundColor: `${typeColor}15` }}
                >
                  <Text 
                    className="text-xs font-medium capitalize"
                    style={{ color: typeColor }}
                  >
                    {getTypeLabel(item.type)}
                  </Text>
                </View>
              </View>
            </Pressable>
          )
        })}
      </View>
    </ScrollView>
  )
} 