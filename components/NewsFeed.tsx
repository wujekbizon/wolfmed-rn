import React from 'react'
import { View, Text, FlatList, Pressable } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { newsItems } from '@/constants/newsItems'
import { getTypeColor, getTypeLabel } from '@/helpers/dashboardsGetters'

interface NewsFeedProps {
  color: string
}

export default function NewsFeed({ color }: NewsFeedProps) {
  const renderHeader = () => (
    <>
      <Text className="text-2xl font-bold text-zinc-800 dark:text-zinc-100 mb-4">
        Najnowsze Aktualizacje
      </Text>
      <Text className="text-base text-zinc-600 dark:text-zinc-300 mb-6">
        Bądź na bieżąco z nowymi funkcjami i aktualizacjami społeczności
      </Text>
    </>
  )

  const renderItem = ({ item }: { item: typeof newsItems[0] }) => {
    const typeColor = getTypeColor(item.type, color)
    
    return (
      <Pressable 
        className="p-4 rounded-xl bg-white dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-700"
        style={{ 
          shadowColor: typeColor,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 2,
          marginBottom: 16
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
  }

  return (
    <FlatList
      data={newsItems}
      renderItem={renderItem}
      ListHeaderComponent={renderHeader}
      showsVerticalScrollIndicator={false}
      keyExtractor={(item) => `${item.type}-${item.date}`}
      removeClippedSubviews
      initialNumToRender={5}
      maxToRenderPerBatch={5}
      windowSize={5}
    />
  )
} 