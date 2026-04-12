import React, { useCallback } from 'react'
import { View, Text, StyleSheet, useColorScheme } from 'react-native'
import { FlashList } from '@shopify/flash-list'
import AdminScreenHeader from '@/components/ui/AdminScreenHeader'
import { useProcedures } from '@/hooks/useProcedures'
import { Procedure } from '@/types/dataTypes'

export default function AdminProceduresScreen() {
  const isDark = useColorScheme() === 'dark'
  const { procedures, isLoading } = useProcedures()
  const bg = isDark ? '#09090b' : '#f9fafb'
  const textColor = isDark ? '#f9fafb' : '#1f2937'

  const renderItem = useCallback(({ item }: { item: Procedure }) => (
    <View style={[styles.item, isDark && styles.itemDark]}>
      <Text style={[styles.itemTitle, { color: textColor }]}>
        {(item.data as any)?.name ?? item.id}
      </Text>
      {item.tags && item.tags.length > 0 && (
        <View style={styles.tagsRow}>
          {item.tags.map((tag) => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  ), [isDark, textColor])

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      <AdminScreenHeader title="Procedury" count={procedures.length} badge="tylko podgląd" />
      <FlashList
        data={procedures as Procedure[]}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={
          !isLoading ? <Text style={styles.empty}>Brak procedur</Text> : null
        }
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  readOnly: {
    fontSize: 12,
    color: '#9ca3af',
    marginLeft: 4,
  },
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
  itemTitle: { fontSize: 15, fontWeight: '600' },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
  tag: {
    backgroundColor: '#A491BB20',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  tagText: { fontSize: 11, color: '#A491BB' },
  empty: { textAlign: 'center', color: '#6b7280', marginTop: 40, fontSize: 16 },
})
