import { Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons'

export type ChatResponse = {
  message: string
  date: Date
  id: string
  isBotResponse: boolean
}

export type IconType =
  | keyof typeof MaterialIcons.glyphMap
  | keyof typeof Ionicons.glyphMap
  | keyof typeof MaterialCommunityIcons.glyphMap