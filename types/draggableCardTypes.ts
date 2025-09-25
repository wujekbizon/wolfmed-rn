import type { SharedValue} from 'react-native-reanimated'
import { StatItem } from './statsTypes'

export interface DraggableCardProps {
  item: StatItem
  index: number
  positions: Record<string, SharedValue<number>>
  stats: StatItem[]
  onReorder: (id: string, newIndex: number) => void
}