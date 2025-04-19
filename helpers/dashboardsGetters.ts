import type {NewsItem}  from '@/constants/newsItems'

export const getTypeColor = (type: NewsItem['type'], baseColor: string) => {
    switch (type) {
      case 'update':
        return '#3b82f6'
      case 'announcement':
        return baseColor
      case 'community':
        return '#10b981'
      default:
        return baseColor
    }
  }
  
  export const getTypeLabel = (type: NewsItem['type']) => {
    switch (type) {
      case 'update':
        return 'Aktualizacja'
      case 'announcement':
        return 'Ogłoszenie'
      case 'community':
        return 'Społeczność'
      default:
        return type
    }
  }
  