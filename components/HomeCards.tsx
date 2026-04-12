import { View, Text } from 'react-native'
import type { ReactNode } from 'react'

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
