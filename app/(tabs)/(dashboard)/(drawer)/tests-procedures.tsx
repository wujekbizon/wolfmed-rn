import React, { useState, useEffect, useCallback } from 'react'
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
import { SafeAreaView } from 'react-native-safe-area-context'
import { FlashList } from '@shopify/flash-list'
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as DocumentPicker from 'expo-document-picker'
import { File, Directory, Paths } from 'expo-file-system'
import * as Sharing from 'expo-sharing'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'

const STORAGE_KEY = 'wolfmed_materials'
const getMaterialsDir = () => new Directory(Paths.document, 'wolfmed_materials')

type MaterialType = 'PDF' | 'Wideo' | 'Dokument' | 'Link' | 'Inne'

type Material = {
  id: string
  title: string
  type: MaterialType
  fileName: string
  localUri: string
  createdAt: string
}

const TYPE_CONFIG: Record<MaterialType, { icon: string; color: string }> = {
  PDF:      { icon: 'document-text', color: '#ef4444' },
  Wideo:    { icon: 'videocam',      color: '#3b82f6' },
  Dokument: { icon: 'document',      color: '#10b981' },
  Link:     { icon: 'link',          color: '#f59e0b' },
  Inne:     { icon: 'folder',        color: '#9ca3af' },
}

const TYPES: MaterialType[] = ['PDF', 'Wideo', 'Dokument', 'Link', 'Inne']

function getMimeType(type: MaterialType): string {
  if (type === 'PDF') return 'application/pdf'
  if (type === 'Wideo') return 'video/*'
  if (type === 'Dokument') return 'application/octet-stream'
  return '*/*'
}

function guessType(name: string): MaterialType {
  const ext = name.split('.').pop()?.toLowerCase() ?? ''
  if (ext === 'pdf') return 'PDF'
  if (['mp4', 'mov', 'avi', 'mkv'].includes(ext)) return 'Wideo'
  if (['doc', 'docx', 'txt', 'odt', 'rtf', 'ppt', 'pptx', 'xls', 'xlsx'].includes(ext)) return 'Dokument'
  return 'Inne'
}

function ensureDir() {
  const dir = getMaterialsDir()
  if (!dir.exists) dir.create({ intermediates: true })
}

export default function TrainingMaterialsScreen() {
  const isDark = useColorScheme() === 'dark'
  const bg = isDark ? '#09090b' : '#f9fafb'
  const textColor = isDark ? '#f9fafb' : '#1f2937'

  const [materials, setMaterials] = useState<Material[]>([])
  const [modalVisible, setModalVisible] = useState(false)
  const [pending, setPending] = useState<{ uri: string; name: string; type: MaterialType } | null>(null)
  const [title, setTitle] = useState('')
  const [selectedType, setSelectedType] = useState<MaterialType>('PDF')

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (raw) setMaterials(JSON.parse(raw))
    })
  }, [])

  const persist = useCallback((list: Material[]) => {
    setMaterials(list)
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(list))
  }, [])

  const handlePick = useCallback(async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ copyToCacheDirectory: true })
      if (result.canceled || !result.assets?.length) return
      const asset = result.assets[0]
      const guessed = guessType(asset.name)
      setPending({ uri: asset.uri, name: asset.name, type: guessed })
      setTitle(asset.name.replace(/\.[^.]+$/, ''))
      setSelectedType(guessed)
      setModalVisible(true)
    } catch {
      Alert.alert('Błąd', 'Nie udało się wybrać pliku.')
    }
  }, [])

  const handleSave = useCallback(async () => {
    if (!pending || !title.trim()) return
    try {
      ensureDir()
      const id = Date.now().toString()
      const ext = pending.name.split('.').pop() ?? ''
      const destFile = new File(getMaterialsDir(), id + (ext ? `.${ext}` : ''))
      new File(pending.uri).copy(destFile)
      const dest = destFile.uri
      const next = [
        ...materials,
        {
          id,
          title: title.trim(),
          type: selectedType,
          fileName: pending.name,
          localUri: dest,
          createdAt: new Date().toLocaleDateString('pl-PL'),
        },
      ]
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
      persist(next)
      setModalVisible(false)
      setPending(null)
    } catch {
      Alert.alert('Błąd', 'Nie udało się zapisać pliku.')
    }
  }, [pending, title, selectedType, materials, persist])

  const handleOpen = useCallback(async (item: Material) => {
    try {
      const filename = item.localUri.split('/').pop() ?? ''
      const file = new File(getMaterialsDir(), filename)
      if (!file.exists) {
        Alert.alert('Błąd', 'Plik nie istnieje.')
        return
      }
      const canShare = await Sharing.isAvailableAsync()
      if (!canShare) return
      await Sharing.shareAsync(file.uri, { mimeType: getMimeType(item.type) })
    } catch (e) {
      Alert.alert('Błąd', String(e))
    }
  }, [])

  const handleDelete = useCallback((item: Material) => {
    Alert.alert('Usuń materiał', 'Na pewno?', [
      { text: 'Anuluj', style: 'cancel' },
      {
        text: 'Usuń',
        style: 'destructive',
        onPress: async () => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
          try { new File(item.localUri).delete() } catch {}
          persist(materials.filter((m) => m.id !== item.id))
        },
      },
    ])
  }, [materials, persist])

  const renderItem = useCallback(({ item }: { item: Material }) => {
    const cfg = TYPE_CONFIG[item.type]
    return (
      <Pressable style={[styles.item, isDark && styles.itemDark]} onPress={() => handleOpen(item)}>
        <View style={[styles.iconCircle, { backgroundColor: `${cfg.color}18` }]}>
          <Ionicons name={cfg.icon as any} size={20} color={cfg.color} />
        </View>
        <View style={styles.itemInfo}>
          <Text style={[styles.itemTitle, { color: textColor }]} numberOfLines={1}>
            {item.title}
          </Text>
          <View style={styles.itemMeta}>
            <View style={[styles.typeBadge, { backgroundColor: `${cfg.color}20` }]}>
              <Text style={[styles.typeBadgeText, { color: cfg.color }]}>{item.type}</Text>
            </View>
            <Text style={styles.itemDate}>{item.createdAt}</Text>
          </View>
        </View>
        <Pressable onPress={() => handleDelete(item)} style={styles.deleteBtn} hitSlop={8}>
          <Ionicons name="trash-outline" size={18} color="#ef4444" />
        </Pressable>
      </Pressable>
    )
  }, [isDark, textColor, handleOpen, handleDelete])

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      <FlashList
        data={materials}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="folder-open-outline" size={64} color={isDark ? '#374151' : '#d1d5db'} />
            <Text style={[styles.emptyTitle, { color: textColor }]}>Brak materiałów</Text>
            <Text style={styles.emptySubtitle}>Dotknij + aby dodać plik szkoleniowy</Text>
          </View>
        }
      />

      <Pressable style={styles.fab} onPress={handlePick}>
        <Ionicons name="add" size={28} color="#ffffff" />
      </Pressable>

      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={{ flex: 1, backgroundColor: bg }}>
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
              <Text style={[styles.modalTitle, { color: textColor }]}>Dodaj materiał</Text>
              <Pressable onPress={() => { setModalVisible(false); setPending(null) }}>
                <Ionicons name="close" size={24} color={textColor} />
              </Pressable>
            </View>

            {pending && (
              <View style={[styles.fileChip, isDark && styles.fileChipDark]}>
                <Ionicons name="document-attach-outline" size={16} color="#A491BB" />
                <Text style={styles.fileChipText} numberOfLines={1}>{pending.name}</Text>
              </View>
            )}

            <Text style={[styles.label, { color: textColor }]}>Nazwa</Text>
            <TextInput
              style={[styles.input, isDark && styles.inputDark, { color: textColor }]}
              value={title}
              onChangeText={setTitle}
              placeholder="Nazwa materiału"
              placeholderTextColor="#9ca3af"
            />

            <Text style={[styles.label, { color: textColor }]}>Typ</Text>
            <View style={styles.typeRow}>
              {TYPES.map((t) => (
                <Pressable
                  key={t}
                  style={[styles.chip, selectedType === t && styles.chipActive]}
                  onPress={() => setSelectedType(t)}
                >
                  <Ionicons
                    name={TYPE_CONFIG[t].icon as any}
                    size={14}
                    color={selectedType === t ? '#fff' : '#A491BB'}
                  />
                  <Text style={[styles.chipText, selectedType === t && styles.chipTextActive]}>{t}</Text>
                </Pressable>
              ))}
            </View>

            <Pressable
              style={[styles.button, !title.trim() && styles.buttonDisabled]}
              onPress={handleSave}
              disabled={!title.trim()}
            >
              <Text style={styles.buttonText}>Zapisz materiał</Text>
            </Pressable>
          </ScrollView>
        </KeyboardAvoidingView>
        </SafeAreaView>
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
    shadowColor: '#280652',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  itemDark: { backgroundColor: '#18181b' },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  itemInfo: { flex: 1 },
  itemTitle: { fontSize: 14, fontWeight: '600', marginBottom: 4 },
  itemMeta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  typeBadge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 },
  typeBadgeText: { fontSize: 11, fontWeight: '600' },
  itemDate: { fontSize: 11, color: '#9ca3af' },
  deleteBtn: { padding: 6 },
  emptyState: { alignItems: 'center', marginTop: 80, gap: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700' },
  emptySubtitle: { fontSize: 14, color: '#9ca3af' },
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
  fileChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#A491BB15',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 16,
  },
  fileChipDark: { backgroundColor: '#A491BB20' },
  fileChipText: { flex: 1, fontSize: 13, color: '#A491BB', fontWeight: '500' },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
  input: {
    backgroundColor: '#A491BB20',
    borderColor: '#A491BB50',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    marginBottom: 16,
  },
  inputDark: { backgroundColor: '#A491BB15' },
  typeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#A491BB',
  },
  chipActive: { backgroundColor: '#A491BB', borderColor: '#A491BB' },
  chipText: { fontSize: 13, color: '#A491BB', fontWeight: '500' },
  chipTextActive: { color: '#ffffff' },
  button: {
    backgroundColor: '#A491BB',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: { opacity: 0.4 },
  buttonText: { color: '#ffffff', fontSize: 16, fontWeight: '700' },
})
