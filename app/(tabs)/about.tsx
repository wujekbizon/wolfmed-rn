import { StyleSheet, Text, View } from 'react-native'
import { useColorScheme } from 'react-native'

export default function AboutScreen() {
  const colorScheme = useColorScheme()

  return (
    <View style={[styles.container, { backgroundColor: colorScheme === 'dark' ? '#222' : '#FFF' }]}>
      <Text style={[styles.title, { color: colorScheme === 'dark' ? '#FFF' : '#000' }]}>About Us</Text>
      <Text style={[styles.subtitle, { color: colorScheme === 'dark' ? '#DDD' : '#333' }]}>
        Learn more about our medical education platform
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
