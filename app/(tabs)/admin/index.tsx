import React from 'react'
import { View, Text, Pressable, ScrollView, StyleSheet, useColorScheme } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import { useTests } from '@/hooks/useTests'
import { useProcedures } from '@/hooks/useProcedures'
import { useCategories } from '@/hooks/useCategories'
import { useTags } from '@/hooks/useTags'
import { useMessages } from '@/hooks/useMessages'

type NavCardProps = {
  title: string
  count?: number
  icon: React.ComponentProps<typeof MaterialIcons>['name']
  onPress: () => void
  isDark: boolean
}

function NavCard({ title, count, icon, onPress, isDark }: NavCardProps) {
  return (
    <Pressable
      style={[styles.card, isDark && styles.cardDark]}
      onPress={onPress}
    >
      <MaterialIcons name={icon} size={28} color="#A491BB" />
      <View style={styles.cardText}>
        <Text style={[styles.cardTitle, isDark && styles.textLight]}>{title}</Text>
        {count !== undefined && (
          <Text style={styles.cardCount}>{count} pozycji</Text>
        )}
      </View>
      <MaterialIcons name="chevron-right" size={22} color="#9ca3af" />
    </Pressable>
  )
}

export default function AdminIndexScreen() {
  const router = useRouter()
  const isDark = useColorScheme() === 'dark'
  const { top: safeTop } = useSafeAreaInsets()
  const { tests } = useTests()
  const { procedures } = useProcedures()
  const { categories } = useCategories()
  const { tags } = useTags()
  const { messages } = useMessages()

  const bg = isDark ? '#09090b' : '#f9fafb'

  return (
    <ScrollView style={{ flex: 1, backgroundColor: bg }} contentContainerStyle={[styles.content, { paddingTop: safeTop + 16 }]}>
      <Text style={[styles.header, isDark && styles.textLight]}>Panel Admina</Text>
      <NavCard
        title="Pytania testowe"
        count={tests.length}
        icon="quiz"
        onPress={() => router.push('/admin/tests' as any)}
        isDark={isDark}
      />
      <NavCard
        title="Procedury"
        count={procedures.length}
        icon="medical-services"
        onPress={() => router.push('/admin/procedures' as any)}
        isDark={isDark}
      />
      <NavCard
        title="Kategorie"
        count={categories.length}
        icon="category"
        onPress={() => router.push('/admin/categories' as any)}
        isDark={isDark}
      />
      <NavCard
        title="Tagi"
        count={tags.length}
        icon="label"
        onPress={() => router.push('/admin/tags' as any)}
        isDark={isDark}
      />
      <NavCard
        title="Wiadomości"
        count={messages.length}
        icon="mail"
        onPress={() => router.push('/admin/messages' as any)}
        isDark={isDark}
      />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  content: {
    padding: 20,
  },
  header: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1f2937',
    marginBottom: 24,
  },
  textLight: {
    color: '#f9fafb',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  cardDark: {
    backgroundColor: '#18181b',
  },
  cardText: {
    flex: 1,
    marginLeft: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  cardCount: {
    fontSize: 13,
    color: '#9ca3af',
    marginTop: 2,
  },
})
