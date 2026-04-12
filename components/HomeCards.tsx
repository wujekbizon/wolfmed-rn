import { View, Text, useColorScheme } from 'react-native'
import type { ReactNode } from 'react'
import { he } from 'zod/v4/locales'

interface CardHeaderProps {
  icon: ReactNode
  label: string
  iconBg: string
  textColor: string
}

export function CardHeader({ icon, label, iconBg, textColor }: CardHeaderProps) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
      <View style={{ width: 30, height: 30, borderRadius: 8, backgroundColor: iconBg, alignItems: 'center', justifyContent: 'center' }}>
        {icon}
      </View>
      <Text style={{ fontSize: 12, fontWeight: '600', color: textColor, marginLeft: 8, letterSpacing: 0.5, textTransform: 'uppercase' }}>
        {label}
      </Text>
    </View>
  )
}

interface StatCellProps {
  value: string | number
  label: string
  textPrimary: string
  textMuted: string
}

export function StatCell({ value, label, textPrimary, textMuted }: StatCellProps) {
  return (
    <View>
      <Text style={{ fontSize: 30, fontWeight: '800', color: textPrimary, lineHeight: 34 }}>{value}</Text>
      <Text style={{ fontSize: 12, color: textMuted, marginTop: 2 }}>{label}</Text>
    </View>
  )
}

export function SkeletonRow() {
  return (
    <View style={{ flexDirection: 'row', gap: 24 }}>
      <SkeletonLine width={60} />
      <SkeletonLine width={60} />
    </View>
  )
}

export function SkeletonLine({ width }: { width: number | string }) {
  return (
    <View
      style={{
        height: 20,
        width,
        borderRadius: 6,
        backgroundColor: 'rgba(150,150,150,0.15)',
        marginBottom: 8,
      }}
    />
  )
}

export function useCardTheme() {
  const isDark = useColorScheme() === 'dark'
  return {
    isDark,
    accentColor: isDark ? '#ff69b4' : '#db2777',
    cardBg: isDark ? 'rgba(25,25,35,1)' : 'rgba(255,255,255,1)',
    textPrimary: isDark ? '#f0eeff' : '#1e1b4b',
    textMuted: isDark ? 'rgba(240,238,255,0.45)' : 'rgba(30,27,75,0.45)',
    iconBg: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(167,139,250,0.2)',
    iconColor: isDark ? '#d7d3e3' : '#a78bfa',
  }
}

export function baseCardStyle(cardBg: string) {
  return {
    backgroundColor: cardBg,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 } as const,
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 12,
  }
}
