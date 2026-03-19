import React, { useState, useMemo } from "react"
import { View, Text } from "react-native"
import Animated, { useSharedValue, useAnimatedStyle, withSpring, SharedValue } from "react-native-reanimated"
import { GestureDetector, Gesture } from "react-native-gesture-handler"
import { useAuth } from "@clerk/expo"

import { StatCard } from "./StatCard"
import { LoadingSpinner } from "./LoadingSpinner"
import { DraggableCardProps } from "@/types/draggableCardTypes"
import { useUserProfile } from "@/hooks/useUserProfile"

const CARD_HEIGHT = 120

function DraggableCard({ item, index, positions, stats, onReorder }: DraggableCardProps) {
  const translateY = positions[item.id]

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
  const { userId } = useAuth()
  const { userProfile, isLoading } = useUserProfile(userId ?? undefined)

  const scorePercent = userProfile && userProfile.total_questions > 0
    ? Math.round((userProfile.total_score / userProfile.total_questions) * 100)
    : 0

  const STAT_DEFS = useMemo(() => [
    { id: "average", title: "Średni Wynik", value: `${scorePercent}%`, subtitle: "Twój ogólny wynik", icon: "stats-chart", progress: scorePercent },
    { id: "completed", title: "Ukończone Testy", value: `${userProfile?.tests_attempted ?? 0}`, subtitle: "Wykonane testy", icon: "checkmark-circle", progress: Math.min((userProfile?.tests_attempted ?? 0), 100) },
    { id: "questions", title: "Pytania odpowiedziane", value: `${userProfile?.total_questions ?? 0}`, subtitle: "Łącznie", icon: "help-circle", progress: Math.min((userProfile?.total_questions ?? 0) / 10, 100) },
  ], [scorePercent, userProfile?.tests_attempted, userProfile?.total_questions])

  const [order, setOrder] = useState<string[]>(() => STAT_DEFS.map(s => s.id))

  const stats = useMemo(
    () => order.map(id => STAT_DEFS.find(s => s.id === id)!).filter(Boolean),
    [order, STAT_DEFS]
  )

  const sv0 = useSharedValue(0 * CARD_HEIGHT)
  const sv1 = useSharedValue(1 * CARD_HEIGHT)
  const sv2 = useSharedValue(2 * CARD_HEIGHT)

  const positions = useMemo<Record<string, SharedValue<number>>>(() => ({
    [order[0]]: sv0,
    [order[1]]: sv1,
    [order[2]]: sv2,
  }), [])

  const moveCard = (id: string, newIndex: number) => {
    setOrder(prev => {
      const oldIndex = prev.indexOf(id)
      if (oldIndex === -1 || newIndex < 0 || newIndex >= prev.length) return prev
      const updated = [...prev]
      updated.splice(oldIndex, 1)
      updated.splice(newIndex, 0, id)
      return updated
    })
  }

  return (
    <View className="flex-1 px-4 pt-4">
      <Text className="text-3xl font-bold text-zinc-800 dark:text-zinc-100 mb-6">Twoje Statystyki</Text>
      <LoadingSpinner isLoading={isLoading} />

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