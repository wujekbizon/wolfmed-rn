import React, { useState, useCallback } from 'react'
import {
  View,
  Text,
  Pressable,
  TextInput,
  ScrollView,
  Modal,
  Alert,
  StyleSheet,
  useColorScheme,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { FlashList } from '@shopify/flash-list'
import AdminScreenHeader from '@/components/ui/AdminScreenHeader'
import Ionicons from '@expo/vector-icons/Ionicons'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import * as Haptics from 'expo-haptics'
import { useTests } from '@/hooks/useTests'
import { useCategories } from '@/hooks/useCategories'
import { useCreateTest } from '@/hooks/useCreateTest'
import { useUpdateTest } from '@/hooks/useUpdateTest'
import { useDeleteTest } from '@/hooks/useDeleteTest'
import { Test, Category } from '@/types/dataTypes'

type FormState = {
  categoryId: string
  dataJson: string
}

const EMPTY_FORM: FormState = { categoryId: '', dataJson: '' }

export default function AdminTestsScreen() {
  const isDark = useColorScheme() === 'dark'
  const { tests, isLoading } = useTests()
  const { categories } = useCategories()
  const { mutate: createTest, isPending: isCreating } = useCreateTest()
  const { mutate: updateTest, isPending: isUpdating } = useUpdateTest()
  const { mutate: deleteTest } = useDeleteTest()

  const [modalVisible, setModalVisible] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [jsonError, setJsonError] = useState('')

  const bg = isDark ? '#09090b' : '#f9fafb'
  const textColor = isDark ? '#f9fafb' : '#1f2937'
  const isPending = isCreating || isUpdating

  const openCreate = useCallback(() => {
    setEditId(null)
    setForm(EMPTY_FORM)
    setJsonError('')
    setModalVisible(true)
  }, [])

  const openEdit = useCallback((test: Test) => {
    setEditId(test.id)
    setForm({
      categoryId: test.categoryId?.toString() ?? '',
      dataJson: JSON.stringify(test.data, null, 2),
    })
    setJsonError('')
    setModalVisible(true)
  }, [])

  const handleDelete = useCallback((id: string) => {
    Alert.alert('Usuń pytanie', 'Na pewno?', [
      { text: 'Anuluj', style: 'cancel' },
      {
        text: 'Usuń',
        style: 'destructive',
        onPress: () => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
          deleteTest(id)
        },
      },
    ])
  }, [deleteTest])

  const handleSubmit = useCallback(() => {
    let parsedData: unknown
    try {
      parsedData = JSON.parse(form.dataJson)
    } catch {
      setJsonError('Nieprawidłowy JSON')
      return
    }
    setJsonError('')
    const categoryId = parseInt(form.categoryId, 10)
    if (isNaN(categoryId)) {
      setJsonError('Wybierz kategorię')
      return
    }
    const selectedCategory = categories.find((c: Category) => c.id === categoryId)
    const payload = { categoryId, category: selectedCategory?.name ?? '', data: parsedData }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    if (editId) {
      updateTest({ id: editId, data: payload }, { onSuccess: () => setModalVisible(false) })
    } else {
      createTest(payload, { onSuccess: () => setModalVisible(false) })
    }
  }, [form, editId, categories, createTest, updateTest])

  const renderItem = useCallback(({ item }: { item: Test }) => (
    <View style={[styles.item, isDark && styles.itemDark]}>
      <View style={styles.itemInfo}>
        <Text style={[styles.itemTitle, { color: textColor }]} numberOfLines={2}>
          {(item.data as any)?.question ?? item.id}
        </Text>
        <Text style={styles.itemSub}>{item.categoryName ?? item.category}</Text>
      </View>
      <View style={styles.itemActions}>
        <Pressable onPress={() => openEdit(item)} style={styles.iconBtn}>
          <MaterialIcons name="edit" size={20} color="#A491BB" />
        </Pressable>
        <Pressable onPress={() => handleDelete(item.id)} style={styles.iconBtn}>
          <MaterialIcons name="delete" size={20} color="#ef4444" />
        </Pressable>
      </View>
    </View>
  ), [isDark, textColor, openEdit, handleDelete])

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      <AdminScreenHeader title="Pytania testowe" count={tests.length} />

      <FlashList
        data={tests as Test[]}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={
          !isLoading ? <Text style={styles.empty}>Brak pytań</Text> : null
        }
      />

      <Pressable style={styles.fab} onPress={openCreate}>
        <Ionicons name="add" size={28} color="#ffffff" />
      </Pressable>

      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            style={{ backgroundColor: bg }}
            contentContainerStyle={styles.modalContent}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: textColor }]}>
                {editId ? 'Edytuj pytanie' : 'Nowe pytanie'}
              </Text>
              <Pressable onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={textColor} />
              </Pressable>
            </View>

            <Text style={[styles.label, { color: textColor }]}>Kategoria</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
              {categories.map((cat: Category) => (
                <Pressable
                  key={cat.id}
                  style={[
                    styles.catChip,
                    form.categoryId === cat.id.toString() && styles.catChipActive,
                  ]}
                  onPress={() => setForm((f) => ({ ...f, categoryId: cat.id.toString() }))}
                >
                  <Text style={[
                    styles.catChipText,
                    form.categoryId === cat.id.toString() && styles.catChipTextActive,
                  ]}>
                    {cat.name}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>

            <Text style={[styles.label, { color: textColor }]}>Dane pytania (JSON)</Text>
            <TextInput
              style={[styles.jsonInput, isDark && styles.inputDark, !!jsonError && styles.inputError]}
              value={form.dataJson}
              onChangeText={(v) => setForm((f) => ({ ...f, dataJson: v }))}
              placeholder={'{\n  "question": "...",\n  "answers": []\n}'}
              placeholderTextColor="#9ca3af"
              multiline
              numberOfLines={14}
              textAlignVertical="top"
              autoCapitalize="none"
              autoCorrect={false}
            />
            {!!jsonError && <Text style={styles.errorText}>{jsonError}</Text>}

            <Pressable
              style={[styles.button, isPending && styles.buttonDisabled]}
              onPress={handleSubmit}
              disabled={isPending}
            >
              <Text style={styles.buttonText}>
                {isPending ? 'Zapisuję...' : editId ? 'Zapisz zmiany' : 'Dodaj pytanie'}
              </Text>
            </Pressable>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
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
  itemInfo: { flex: 1, marginRight: 8 },
  itemTitle: { fontSize: 14, fontWeight: '500' },
  itemSub: { fontSize: 12, color: '#9ca3af', marginTop: 3 },
  itemActions: { flexDirection: 'row', gap: 4 },
  iconBtn: { padding: 6 },
  empty: { textAlign: 'center', color: '#6b7280', marginTop: 40, fontSize: 16 },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#A491BB',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#280652',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  modalContent: { padding: 20, paddingBottom: 48 },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: { fontSize: 20, fontWeight: '700' },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
  catScroll: { marginBottom: 16 },
  catChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#A491BB',
    marginRight: 8,
  },
  catChipActive: { backgroundColor: '#A491BB' },
  catChipText: { fontSize: 13, color: '#A491BB' },
  catChipTextActive: { color: '#ffffff' },
  jsonInput: {
    backgroundColor: '#A491BB30',
    borderColor: '#A491BB70',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    fontSize: 13,
    color: '#1f2937',
    minHeight: 220,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    marginBottom: 4,
  },
  inputDark: { color: '#f9fafb', backgroundColor: '#A491BB20' },
  inputError: { borderColor: '#dc2626' },
  errorText: { fontSize: 12, color: '#dc2626', marginBottom: 12 },
  button: {
    backgroundColor: '#A491BB',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: '#ffffff', fontSize: 16, fontWeight: '700' },
})
