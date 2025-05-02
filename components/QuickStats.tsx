import { View, Text, useColorScheme, TouchableOpacity, Dimensions } from 'react-native'
import { BlurView } from 'expo-blur'
import { LinearGradient } from 'expo-linear-gradient'
import CircularProgress from '@/components/ui/CircularProgress'
import { Ionicons } from '@expo/vector-icons'
import Animated, { FadeIn } from 'react-native-reanimated'
import { FloatingShapes } from './FloatingShapes'
import DraggableFlatList, { 
  ScaleDecorator, 
  OpacityDecorator,
  RenderItemParams
} from 'react-native-draggable-flatlist'
import { useState } from 'react'

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window')
// Calculate card height based on screen height minus header and padding
const CARD_HEIGHT = (SCREEN_HEIGHT - 120) / 5 - 16 // 120px for header and padding, 16px for margin between cards

interface StatItem {
  id: string
  title: string
  value: string | number
  subtitle: string
  icon: any
  progress: number
  trend?: {
    type: 'up' | 'down' | 'neutral'
    value: string
  }
}

interface StatCardProps extends StatItem {
  color: string
  isDragging?: boolean
  onLongPress?: () => void
  isActive?: boolean
}

interface QuickStatsProps {
  color?: string
}

const getTrendIcon = (type: 'up' | 'down' | 'neutral') => {
  switch (type) {
    case 'up':
      return 'trending-up'
    case 'down':
      return 'trending-down'
    default:
      return 'remove'
  }
}

const getTrendColor = (type: 'up' | 'down' | 'neutral') => {
  switch (type) {
    case 'up':
      return '#10b981'
    case 'down':
      return '#ef4444'
    default:
      return '#6b7280'
  }
}

const StatCard = ({ 
  title, 
  value, 
  subtitle, 
  icon, 
  progress, 
  color, 
  isDragging,
  onLongPress,
  isActive,
  trend 
}: StatCardProps) => {
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'
  
  // Adjust colors for dark mode
  const cardColor = isDark 
    ? isActive ? '#ffffff' : '#94a3b8'
    : color

  return (
    <TouchableOpacity
      onLongPress={onLongPress}
      disabled={isDragging}
      activeOpacity={0.9}
      style={{ 
        opacity: isDragging ? 0.5 : 1,
        transform: [{ scale: isDragging ? 1.02 : 1 }],
        height: CARD_HEIGHT,
        marginBottom: 16
      }}
    >
      <LinearGradient
        colors={[`${cardColor}20`, `${cardColor}05`]}
        className="rounded-2xl p-[1px] flex-1"
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <BlurView 
          intensity={isDark ? 15 : 40} 
          tint={isDark ? 'dark' : 'light'}
          className="rounded-2xl p-6 flex-1"
        >
          <View className="flex-row items-center justify-between flex-1">
            <View className="flex-1 justify-between">
              <View>
                <View className="flex-row items-center mb-3">
                  <View 
                    className="w-10 h-10 rounded-full items-center justify-center mr-3"
                    style={{ backgroundColor: `${cardColor}15` }}
                  >
                    <Ionicons name={icon} size={22} color={cardColor} />
                  </View>
                  <Text className="text-base font-medium text-zinc-600 dark:text-zinc-400">
                    {title}
                  </Text>
                </View>
                
                <View className="flex-row items-baseline">
                  <Text className="text-3xl font-bold text-zinc-800 dark:text-zinc-100">
                    {value}
                  </Text>
                  {trend && (
                    <View className="flex-row items-center ml-2">
                      <Ionicons 
                        name={getTrendIcon(trend.type)} 
                        size={16} 
                        color={getTrendColor(trend.type)}
                      />
                      <Text 
                        className="ml-1 text-sm"
                        style={{ color: getTrendColor(trend.type) }}
                      >
                        {trend.value}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
              
              <Text className="text-sm text-zinc-500 dark:text-zinc-400">
                {subtitle}
              </Text>
            </View>

            <View className="ml-4 justify-center">
              <CircularProgress 
                progress={progress}
                size={80}
                color={cardColor}
                strokeWidth={8}
              />
            </View>
          </View>
        </BlurView>
      </LinearGradient>
    </TouchableOpacity>
  )
}

export default function QuickStats({ color = '#ec4899' }: QuickStatsProps) {
  const [stats, setStats] = useState<StatItem[]>([
    {
      id: 'average',
      title: "Średni Wynik",
      value: "75%",
      subtitle: "Twój ogólny wynik",
      icon: "stats-chart",
      progress: 75,
      trend: {
        type: 'up',
        value: '5%'
      }
    },
    {
      id: 'completed',
      title: "Ukończone Testy",
      value: "42/150",
      subtitle: "Wykonane testy",
      icon: "checkmark-circle",
      progress: (42 / 150) * 100,
      trend: {
        type: 'neutral',
        value: '0'
      }
    },
    {
      id: 'best',
      title: "Najlepszy Wynik",
      value: "95%",
      subtitle: "Twój rekord",
      icon: "trophy",
      progress: 95,
      trend: {
        type: 'up',
        value: '10%'
      }
    },
    {
      id: 'streak',
      title: "Seria Dni",
      value: "7",
      subtitle: "Dni pod rząd",
      icon: "flame",
      progress: 70,
      trend: {
        type: 'up',
        value: '+2'
      }
    },
    {
      id: 'accuracy',
      title: "Dokładność",
      value: "85%",
      subtitle: "Poprawnych odpowiedzi",
      icon: "checkmark-done",
      progress: 85,
      trend: {
        type: 'down',
        value: '3%'
      }
    }
  ])

  const renderItem = ({ item, drag, isActive }: RenderItemParams<StatItem>) => (
    <ScaleDecorator>
      <OpacityDecorator>
        <Animated.View 
          entering={FadeIn}
          style={{
            transform: [{ scale: isActive ? 1.02 : 1 }],
            shadowColor: color,
            shadowOffset: { width: 0, height: isActive ? 10 : 0 },
            shadowOpacity: isActive ? 0.2 : 0,
            shadowRadius: 10,
            elevation: isActive ? 5 : 0
          }}
        >
          <StatCard
            {...item}
            color={color}
            onLongPress={drag}
            isDragging={isActive}
            isActive={isActive}
          />
        </Animated.View>
      </OpacityDecorator>
    </ScaleDecorator>
  )

  return (
    <View className="flex-1">
      <FloatingShapes count={3} />
      
      <View className="flex-1">
        <View className="px-4 pt-4 mb-6">
          <Text className="text-3xl font-bold text-zinc-800 dark:text-zinc-100">
            Twoje Statystyki
          </Text>
        </View>

        <DraggableFlatList
          data={stats}
          onDragEnd={({ data }) => setStats(data)}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ 
            paddingHorizontal: 16
          }}
          showsVerticalScrollIndicator={false}
          activationDistance={10}
          scrollEnabled={false}
          animationConfig={{
            damping: 20,
            mass: 0.2,
            stiffness: 100
          }}
        />
      </View>
    </View>
  )
} 