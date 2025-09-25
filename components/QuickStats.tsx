import React, { useState } from "react"
import { View, Text } from "react-native"
import Animated, { useSharedValue, useAnimatedStyle, withSpring, runOnJS, SharedValue } from "react-native-reanimated"
import { GestureDetector, Gesture } from "react-native-gesture-handler"

import { SECTIONS } from "@/constants/dashboardButton"
import { StatCard } from "./StatCard"
import { DraggableCardProps } from "@/types/draggableCardTypes"

const CARD_HEIGHT = 120

function DraggableCard({ item, index, positions, stats, onReorder }: DraggableCardProps) {
  const translateY = positions[item.id] || useSharedValue(index * CARD_HEIGHT)

  const gesture = Gesture.Pan()
    .onUpdate(e => {
      translateY.value = index * CARD_HEIGHT + e.translationY
      positions[item.id].value = translateY.value
    })
    .onEnd(e => {
      const newIndex = Math.round(translateY.value / CARD_HEIGHT)
      translateY.value = withSpring(newIndex * CARD_HEIGHT, {}, () => {
        onReorder(item.id, newIndex)
      })
    })

  const style = useAnimatedStyle(() => ({
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: CARD_HEIGHT,
    transform: [{ translateY: translateY.value }],
    zIndex: 10,
  }))

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={style}>
        <StatCard {...item} color="#ec4899" />
      </Animated.View>
    </GestureDetector>
  )
}

export default function QuickStats() {
  const [stats, setStats] = useState([
    { id: "average", title: "Średni Wynik", value: "75%", subtitle: "Twój ogólny wynik", icon: "stats-chart", progress: 75 },
    { id: "completed", title: "Ukończone Testy", value: "42/150", subtitle: "Wykonane testy", icon: "checkmark-circle", progress: (42/150)*100 },
    { id: "best", title: "Najlepszy Wynik", value: "95%", subtitle: "Twój rekord", icon: "trophy", progress: 95 },
    { id: "streak", title: "Seria Dni", value: "7", subtitle: "Dni pod rząd", icon: "flame", progress: 70 },
  ])

  const positions = stats.reduce((acc, item, index) => {
    acc[item.id] = useSharedValue(index * CARD_HEIGHT)
    return acc
  }, {} as Record<string, SharedValue<number>>)

  const moveCard = (id: string, newOrder: number) => {
    const oldIndex = stats.findIndex(s => s.id === id)
    if (oldIndex !== -1 && newOrder >= 0 && newOrder < stats.length) {
      const updated = [...stats]
      const [moved] = updated.splice(oldIndex, 1)
      updated.splice(newOrder, 0, moved)
      setStats(updated)
    }
  }

  return (
    <View className="flex-1 px-4 pt-4">
      <Text className="text-3xl font-bold text-zinc-800 dark:text-zinc-100 mb-6">Twoje Statystyki</Text>

      {stats.map((item, index) => {
        return (
          <DraggableCard
            key={item.id}
            item={item}
            index={index}
            positions={positions}
            stats={stats}
            onReorder={moveCard}
          />
        )
      })}
    </View>
  )
}