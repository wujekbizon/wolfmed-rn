import React, { useState, useCallback } from 'react'
import {
  View,
  Text,
  Pressable,
  TextInput,
  Alert,
  StyleSheet,
  useColorScheme,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import AdminScreenHeader from '@/components/ui/AdminScreenHeader'
import { FlashList } from '@shopify/flash-list'
import Ionicons from '@expo/vector-icons/Ionicons'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import * as Haptics from 'expo-haptics'
import { useCategories } from '@/hooks/useCategories'
import { useCreateCategory } from '@/hooks/useCreateCategory'
import { useUpdateCategory } from '@/hooks/useUpdateCategory'
import { useDeleteCategory } from '@/hooks/useDeleteCategory'
import { Category } from '@/types/dataTypes'

type EditingState = { id: number; name: string; description: string } | null

export default function AdminCategoriesScreen() {
  const isDark = useColorScheme() === 'dark'
  const { categories, isLoading } = useCategories()
  const { mutate: createCategory, isPending: isCreating } = useCreateCategory()
  const { mutate: updateCategory, isPending: isUpdating } = useUpdateCategory()
  const { mutate: deleteCategory } = useDeleteCategory()

  const [newName, setNewName] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [editing, setEditing] = useState<EditingState>(null)

  const bg = isDark ? '#09090b' : '#f9fafb'
  const textColor = isDark ? '#f9fafb' : '#1f2937'

  const handleCreate = useCallback(() => {
    if (!newName.trim()) return
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    createCategory(
      { name: newName.trim(), description: newDesc.trim() },
      { onSuccess: () => { setNewName(''); setNewDesc('') } }
    )
  }, [newName, newDesc, createCategory])

  const handleUpdate = useCallback(() => {
    if (!editing || !editing.name.trim()) return
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    updateCategory(
      { id: editing.id, data: { name: editing.name.trim(), description: editing.description.trim() } },
      { onSuccess: () => setEditing(null) }
    )
  }, [editing, updateCategory])

  const handleDelete = useCallback((id: number, name: string) => {
    Alert.alert(`Usuń kategorię`, `"${name}"?`, [
      { text: 'Anuluj', style: 'cancel' },
      {
        text: 'Usuń',
        style: 'destructive',
        onPress: () => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
          deleteCategory(id)
        },
      },
    ])
  }, [deleteCategory])

  const renderItem = useCallback(({ item }: { item: Category }) => {
    const isEditing = editing?.id === item.id

    return (
      <View style={[styles.item, isDark && styles.itemDark]}>
        {isEditing ? (
          <View style={styles.editRow}>
            <TextInput
              style={[styles.inlineInput, isDark && styles.inputDark]}
              value={editing.name}
              onChangeText={(v) => setEditing((e) => e && { ...e, name: v })}
              placeholder="Nazwa"
              placeholderTextColor="#9ca3af"
            />
            <TextInput
              style={[styles.inlineInput, isDark && styles.inputDark]}
              value={editing.description}
              onChangeText={(v) => setEditing((e) => e && { ...e, description: v })}
              placeholder="Opis"
              placeholderTextColor="#9ca3af"
            />
            <View style={styles.editActions}>
              <Pressable onPress={handleUpdate} style={styles.iconBtn} disabled={isUpdating}>
                <Ionicons name="checkmark" size={20} color="#22c55e" />
              </Pressable>
              <Pressable onPress={() => setEditing(null)} style={styles.iconBtn}>
                <Ionicons name="close" size={20} color="#9ca3af" />
              </Pressable>
            </View>
          </View>
        ) : (
          <View style={styles.itemRow}>
            <View style={styles.itemInfo}>
              <View style={styles.nameRow}>
                <Text style={[styles.itemTitle, { color: textColor }]}>{item.name}</Text>
                {!item.isActive && (
                  <View style={styles.inactiveBadge}>
                    <Text style={styles.inactiveBadgeText}>nieaktywna</Text>
                  </View>
                )}
              </View>
              {!!item.description && (
                <Text style={styles.itemSub}>{item.description}</Text>
              )}
            </View>
            <View style={styles.itemActions}>
              <Pressable
                onPress={() => setEditing({ id: item.id, name: item.name, description: item.description ?? '' })}
                style={styles.iconBtn}
              >
                <MaterialIcons name="edit" size={20} color="#A491BB" />
              </Pressable>
              <Pressable onPress={() => handleDelete(item.id, item.name)} style={styles.iconBtn}>
                <MaterialIcons name="delete" size={20} color="#ef4444" />
              </Pressable>
            </View>
          </View>
        )}
      </View>
    )
  }, [isDark, textColor, editing, isUpdating, handleUpdate, handleDelete])

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <AdminScreenHeader title="Kategorie" count={categories.length} />

      <View style={[styles.createBox, isDark && styles.createBoxDark]}>
        <TextInput
          style={[styles.createInput, isDark && styles.inputDark]}
          value={newName}
          onChangeText={setNewName}
          placeholder="Nazwa kategorii..."
          placeholderTextColor="#9ca3af"
        />
        <TextInput
          style={[styles.createInput, isDark && styles.inputDark]}
          value={newDesc}
          onChangeText={setNewDesc}
          placeholder="Opis (opcjonalnie)..."
          placeholderTextColor="#9ca3af"
        />
        <Pressable
          style={[styles.createBtn, (!newName.trim() || isCreating) && styles.btnDisabled]}
          onPress={handleCreate}
          disabled={!newName.trim() || isCreating}
        >
          <Text style={styles.createBtnText}>{isCreating ? 'Dodaję...' : 'Dodaj kategorię'}</Text>
        </Pressable>
      </View>

      <FlashList
        data={categories}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={
          !isLoading ? <Text style={styles.empty}>Brak kategorii</Text> : null
        }
      />
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  createBox: {
    margin: 16,
    marginTop: 0,
    padding: 14,
    backgroundColor: '#ffffff',
    borderRadius: 14,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  createBoxDark: { backgroundColor: '#18181b' },
  createInput: {
    backgroundColor: '#A491BB30',
    borderColor: '#A491BB70',
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    fontSize: 14,
    color: '#1f2937',
    marginBottom: 8,
  },
  inputDark: { color: '#f9fafb', backgroundColor: '#A491BB20' },
  createBtn: {
    backgroundColor: '#A491BB',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  btnDisabled: { opacity: 0.4 },
  createBtnText: { color: '#ffffff', fontWeight: '600', fontSize: 14 },
  item: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  itemDark: { backgroundColor: '#18181b' },
  itemRow: { flexDirection: 'row', alignItems: 'center' },
  itemInfo: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  itemTitle: { fontSize: 15, fontWeight: '600' },
  itemSub: { fontSize: 12, color: '#9ca3af', marginTop: 2 },
  inactiveBadge: {
    backgroundColor: '#fef2f2',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  inactiveBadgeText: { fontSize: 10, color: '#ef4444' },
  itemActions: { flexDirection: 'row', gap: 4 },
  iconBtn: { padding: 6 },
  editRow: { gap: 6 },
  inlineInput: {
    backgroundColor: '#A491BB30',
    borderColor: '#A491BB70',
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
    fontSize: 14,
    color: '#1f2937',
  },
  editActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 4 },
  empty: { textAlign: 'center', color: '#6b7280', marginTop: 40, fontSize: 16 },
})
