import React, { useCallback } from 'react'
import { View, Text, StyleSheet, useColorScheme } from 'react-native'
import { FlashList } from '@shopify/flash-list'
import AdminScreenHeader from '@/components/ui/AdminScreenHeader'
import { useMessages } from '@/hooks/useMessages'
import { CustomerMessage } from '@/types/dataTypes'

function formatDate(date: Date | string | undefined): string {
  if (!date) return ''
  return new Date(date).toLocaleDateString('pl-PL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export default function AdminMessagesScreen() {
  const isDark = useColorScheme() === 'dark'
  const { messages, isLoading } = useMessages()
  const bg = isDark ? '#09090b' : '#f9fafb'
  const textColor = isDark ? '#f9fafb' : '#1f2937'

  const renderItem = useCallback(({ item }: { item: CustomerMessage }) => (
    <View style={[styles.item, isDark && styles.itemDark]}>
      <View style={styles.itemHeader}>
        <Text style={[styles.email, { color: textColor }]}>{item.email}</Text>
        <Text style={styles.date}>{formatDate(item.createdAt)}</Text>
      </View>
      <Text style={[styles.message, isDark && { color: '#d1d5db' }]}>{item.messageContent}</Text>
    </View>
  ), [isDark, textColor])

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      <AdminScreenHeader title="Wiadomości" count={messages.length} />
      <FlashList
        data={messages}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={
          !isLoading ? <Text style={styles.empty}>Brak wiadomości</Text> : null
        }
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  item: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  itemDark: { backgroundColor: '#18181b' },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  email: { fontSize: 14, fontWeight: '600' },
  date: { fontSize: 12, color: '#9ca3af' },
  message: { fontSize: 14, color: '#4b5563', lineHeight: 20 },
  empty: { textAlign: 'center', color: '#6b7280', marginTop: 40, fontSize: 16 },
})
