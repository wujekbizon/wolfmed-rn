import { StyleSheet, Text, View } from 'react-native'
import { useColorScheme } from 'react-native'

export default function BlogScreen() {
  const colorScheme = useColorScheme()

  return (
    <View style={[styles.container, { backgroundColor: colorScheme === 'dark' ? '#222' : '#FFF' }]}>
      <Text style={[styles.title, { color: colorScheme === 'dark' ? '#FFF' : '#000' }]}>Medical Blog</Text>
      <Text style={[styles.subtitle, { color: colorScheme === 'dark' ? '#DDD' : '#333' }]}>
        Stay updated with the latest medical news and insights
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
})
