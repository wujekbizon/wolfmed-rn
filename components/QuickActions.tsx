import { View, Text, Switch, Pressable, useColorScheme, Dimensions, FlatList, AccessibilityInfo, AppState, AppStateStatus } from 'react-native'
import { BlurView } from 'expo-blur'
import { Link, RelativePathString } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useState, useCallback, useMemo, useEffect } from 'react'
import Animated, { FadeIn } from 'react-native-reanimated'
import React from 'react'

type ActionType = 'setting' | 'link' | 'toggle'

interface ActionItem {
  id: string
  label: string
  icon: keyof typeof Ionicons.glyphMap
  type: ActionType
  href?: RelativePathString
  isEnabled?: boolean
  onPress?: () => void
  accessibilityHint?: string
}

const defaultActions: ActionItem[] = [
  {
    id: 'theme',
    label: 'Tryb ciemny',
    icon: 'moon',
    type: 'toggle',
    accessibilityHint: 'Przełącz między jasnym a ciemnym motywem'
  },
  {
    id: 'account',
    label: 'Ustawienia konta',
    icon: 'person-circle',
    type: 'setting',
    accessibilityHint: 'Przejdź do ustawień konta'
  },
  {
    id: 'personal-tests',
    label: 'Moje testy',
    icon: 'document-text',
    type: 'link',
    href: '/(drawer)/tests/personal' as RelativePathString,
    accessibilityHint: 'Przejdź do moich testów'
  },
  {
    id: 'scores',
    label: 'Ostatnie wyniki',
    icon: 'trophy',
    type: 'link',
    href: '/(drawer)/stats/recent' as RelativePathString,
    accessibilityHint: 'Zobacz ostatnie wyniki'
  },
  {
    id: 'favorites',
    label: 'Ulubione pytania',
    icon: 'star',
    type: 'link',
    href: '/(drawer)/questions/favorites' as RelativePathString,
    accessibilityHint: 'Przejdź do ulubionych pytań'
  },
  {
    id: 'language',
    label: 'Język',
    icon: 'language',
    type: 'setting',
    accessibilityHint: 'Zmień ustawienia języka'
  },
  {
    id: 'notifications',
    label: 'Powiadomienia',
    icon: 'notifications',
    type: 'setting',
    accessibilityHint: 'Zarządzaj powiadomieniami'
  },
  {
    id: 'customize',
    label: 'Dostosuj akcje',
    icon: 'grid',
    type: 'setting',
    accessibilityHint: 'Dostosuj układ szybkich akcji'
  },
]

interface ActionItemProps {
  item: ActionItem
  color: string
  isDark: boolean
  onActionPress: (action: ActionItem) => void
  isDarkMode: boolean
  itemWidth: number
  windowWidth: number
}

const ActionItemComponent = React.memo(({ 
  item, 
  color, 
  isDark, 
  onActionPress, 
  isDarkMode,
  itemWidth,
  windowWidth
}: ActionItemProps) => {
  const isToggle = item.type === 'toggle'
  const isDarkModeItem = item.id === 'theme'
  const itemContainerWidth = isDarkModeItem ? windowWidth - 32 : itemWidth

  const content = (
    <Animated.View
      entering={FadeIn}
      style={{
        width: itemContainerWidth,
        margin: 8,
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: isDark ? `${color}30` : `${color}20`,
      }}
      accessible={true}
      accessibilityRole={isToggle ? "switch" : "button"}
      accessibilityLabel={item.label}
      accessibilityHint={item.accessibilityHint}
      accessibilityState={{
        checked: isToggle ? (item.id === 'theme' ? isDarkMode : item.isEnabled) : undefined
      }}
    >
      <BlurView 
        intensity={isDark ? 20 : 40} 
        tint={isDark ? 'dark' : 'light'} 
        className="rounded-2xl"
      >
        <View 
          style={{
            padding: 16,
            alignItems: isDarkModeItem ? 'flex-start' : 'center',
            width: '100%',
            minHeight: 90,
            justifyContent: 'space-between',
            backgroundColor: isDark ? 'rgba(0,0,0,0.4)' : `${color}15`,
          }}
        >
          <View className="flex-row items-center justify-between w-full">
            <View 
              style={{
                backgroundColor: isDark ? `${color}20` : `${color}15`,
                padding: 8,
                borderRadius: 12,
              }}
            >
              <Ionicons 
                name={item.icon} 
                size={22} 
                color={isDark ? color : `${color}CC`}
              />
            </View>
            {isToggle && (
              <Switch 
                value={item.id === 'theme' ? isDarkMode : item.isEnabled}
                trackColor={{ false: isDark ? '#27272a' : '#e5e7eb', true: `${color}50` }}
                thumbColor={item.id === 'theme' ? (isDarkMode ? color : '#fff') : (item.isEnabled ? color : '#fff')}
                onValueChange={() => onActionPress(item)}
                accessible={true}
                accessibilityLabel={`${item.label} przełącznik`}
                accessibilityRole="switch"
                accessibilityState={{ checked: item.id === 'theme' ? isDarkMode : item.isEnabled }}
              />
            )}
          </View>
          <Text 
            className="text-[15px] font-medium mt-3"
            style={{ 
              color: isDark ? '#f4f4f5' : '#27272a'
            }}
          >
            {item.label}
          </Text>
        </View>
      </BlurView>
    </Animated.View>
  )

  if (item.type === 'link' && item.href) {
    return (
      <Link href={item.href} asChild>
        <Pressable 
          className="active:opacity-80"
          accessible={true}
          accessibilityRole="link"
          accessibilityLabel={item.label}
          accessibilityHint={item.accessibilityHint}
        >
          {content}
        </Pressable>
      </Link>
    )
  }

  return (
    <Pressable 
      className="active:opacity-80" 
      onPress={() => onActionPress(item)}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={item.label}
      accessibilityHint={item.accessibilityHint}
    >
      {content}
    </Pressable>
  )
})

ActionItemComponent.displayName = 'ActionItemComponent'

export default function QuickActions({ color }: { color: string }) {
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'
  const [isDarkMode, setIsDarkMode] = useState(isDark)
  const windowWidth = Dimensions.get('window').width
  const itemWidth = (windowWidth - 48) / 2

  // Sync with device theme changes
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        setIsDarkMode(colorScheme === 'dark')
      }
    })

    return () => {
      subscription.remove()
    }
  }, [colorScheme])

  // Update when device theme changes
  useEffect(() => {
    setIsDarkMode(isDark)
  }, [isDark])

  const getThemeAction = useCallback((): ActionItem => ({
    id: 'theme',
    label: isDarkMode ? 'Tryb jasny' : 'Tryb ciemny',
    icon: isDarkMode ? 'sunny' : 'moon',
    type: 'toggle',
    accessibilityHint: isDarkMode 
      ? 'Przełącz na tryb jasny' 
      : 'Przełącz na tryb ciemny',
    isEnabled: isDarkMode
  }), [isDarkMode])

  const actions = useMemo(() => {
    const updatedActions = [...defaultActions]
    const themeIndex = updatedActions.findIndex(action => action.id === 'theme')
    if (themeIndex !== -1) {
      updatedActions[themeIndex] = getThemeAction()
    }
    return updatedActions
  }, [getThemeAction])

  const handleActionPress = useCallback((action: ActionItem) => {
    switch (action.id) {
      case 'theme':
        setIsDarkMode(prev => !prev)
        AccessibilityInfo.announceForAccessibility(
          `Tryb ${!isDarkMode ? 'ciemny' : 'jasny'} włączony`
        )
        break
      case 'customize':
        break
      default:
        action.onPress?.()
    }
  }, [isDarkMode])

  const renderItem = useCallback(({ item }: { item: ActionItem }) => (
    <ActionItemComponent
      item={item}
      color={color}
      isDark={isDark}
      onActionPress={handleActionPress}
      isDarkMode={isDarkMode}
      itemWidth={itemWidth}
      windowWidth={windowWidth}
    />
  ), [color, isDark, handleActionPress, isDarkMode, itemWidth, windowWidth])

  const keyExtractor = useCallback((item: ActionItem) => item.id, [])

  const getItemLayout = useCallback((_: any, index: number) => ({
    length: 90,
    offset: 90 * index,
    index,
  }), [])

  return (
    <View className="flex-1">
      <View 
        className="px-4 pt-4 mb-6"
        accessible={true}
        accessibilityRole="header"
      >
        <Text 
          className="text-3xl font-bold"
          style={{ color: isDark ? '#f4f4f5' : '#27272a' }}
        >
          Ustawienia
        </Text>
      </View>

      <FlatList
        data={actions}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        numColumns={2}
        contentContainerStyle={{ 
          paddingHorizontal: 8,
        }}
        showsVerticalScrollIndicator={false}
        initialNumToRender={6}
        maxToRenderPerBatch={8}
        windowSize={3}
        removeClippedSubviews={true}
        getItemLayout={getItemLayout}
        maintainVisibleContentPosition={{
          minIndexForVisible: 0,
        }}
      />
    </View>
  )
} 