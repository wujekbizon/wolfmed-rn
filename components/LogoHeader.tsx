import { Text, View, Image, StyleSheet } from 'react-native'

export default function LogoHeader({ isDark }: { isDark: boolean }) {
  return (
    <View style={styles.row}>
      <Image
        source={{ uri: 'https://utfs.io/a/zw3dk8dyy9/UVAwLrIxs2k5UOm8ArIxs2k5EyuGdN4SRigYP6qreJDvtVZl' }}
        style={styles.logo}
        resizeMode="contain"
      />
      <View style={styles.textRow}>
        <Text style={[styles.bold, { color: isDark ? '#f1f5f9' : '#1e1b4b' }]}>WOLFMED</Text>
        <Text style={[styles.light, { color: isDark ? 'rgba(255,255,255,0.45)' : '#6b7280' }]}> EDUKACJA</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logo: {
    width: 40,
    height: 40,
  },
  textRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  bold: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  light: {
    fontSize: 20,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
})      
