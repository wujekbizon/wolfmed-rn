import { Ionicons } from '@expo/vector-icons'

export interface HelpItem {
    title: string
    description: string
    icon: keyof typeof Ionicons.glyphMap
  }
  
export const helpItems: HelpItem[] = [
    {
      title: 'Nawigacja Okrągła',
      description: 'Dotknij środkowego koła, aby rozwinąć lub zwinąć menu nawigacyjne. Przesuwaj między sekcjami po rozwinięciu.',
      icon: 'radio-button-on'
    },
    {
      title: 'Szybkie Akcje',
      description: 'Uzyskaj dostęp do często używanych funkcji poprzez menu Szybkich Akcji w różowej sekcji.',
      icon: 'flash'
    },
    {
      title: 'Ustawienia Profilu',
      description: 'Zaktualizuj swój profil, motto i preferencje w sekcji Profil.',
      icon: 'person'
    },
    {
      title: 'Statystyki',
      description: 'Zobacz swoje postępy i metryki aktywności w sekcji Statystyk.',
      icon: 'stats-chart'
    },
    {
      title: 'Aktualności',
      description: 'Bądź na bieżąco z najnowszymi ogłoszeniami i aktualizacjami społeczności.',
      icon: 'newspaper'
    }
  ]
  