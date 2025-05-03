import React from 'react'
import { View, Text, FlatList, Pressable } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { helpItems } from '@/constants/helpInfoItems'

interface HelpInfoProps {
  color: string
}

export default function HelpInfo({ color }: HelpInfoProps) {
  const renderHeader = () => (
    <View className="px-4 pt-4">
      <Text className="text-2xl font-bold text-zinc-800 dark:text-zinc-100 mb-4">
        Pomoc i Informacje
      </Text>
      <Text className="text-base text-zinc-600 dark:text-zinc-300 mb-6">
        Dowiedz się, jak korzystać z panelu i wykorzystać jego pełny potencjał
      </Text>
    </View>
  )

  const renderItem = ({ item }: { item: typeof helpItems[0] }) => (
    <View className="px-4">
      <Pressable 
        className="flex-row items-start p-4 rounded-xl bg-white dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-700"
        style={{ 
          shadowColor: color,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 2,
          marginBottom: 16
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
    </View>
  )

  return (
    <FlatList
      className="flex-1"
      contentContainerClassName="pb-4"
      data={helpItems}
      renderItem={renderItem}
      ListHeaderComponent={renderHeader}
      showsVerticalScrollIndicator={false}
      keyExtractor={(item) => item.title}
      removeClippedSubviews
      initialNumToRender={5}
      maxToRenderPerBatch={5}
      windowSize={5}
    />
  )
} 