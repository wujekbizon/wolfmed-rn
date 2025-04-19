import { Ionicons } from '@expo/vector-icons'

export interface NewsItem {
    date: string
    title: string
    description: string
    type: 'update' | 'announcement' | 'community'
    icon: keyof typeof Ionicons.glyphMap
}
  
export const newsItems: NewsItem[] = [
    {
      date: '12 Kwiecień 2025',
      title: 'Aktualizacja bazy testów',
      description: 'Poszerzyliśmy naszą bazę danych o najnowsze 40 testów z egzaminów ze Stycznia 2025',
      type: 'update',
      icon: 'document-text'
    },
    {
      date: '12 Kwiecień 2025',
      title: 'Rozwój Społeczności',
      description: 'Już ponad 2500 aktywnych użytkowników!',
      type: 'community',
      icon: 'people'
    },
    {
      date: '11 Kwiecień 2025',
      title: 'Nowość: Procedury Video',
      description: 'Już wkrótce: Profesjonalne materiały video pokazujące krok po kroku najważniejsze procedury',
      type: 'announcement',
      icon: 'videocam'
    }
]