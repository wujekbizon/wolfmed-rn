import React from 'react'
import { StyleSheet, Text, View, ImageBackground, TouchableOpacity, Animated, ScrollView } from 'react-native'
import { useColorScheme } from 'react-native'
import { Link, Href } from 'expo-router'

export default function HomeScreen() {
  const colorScheme = useColorScheme()
  const scrollY = new Animated.Value(0)

  const headerHeight = scrollY.interpolate({
    inputRange: [0, 200],
    outputRange: [400, 300],
    extrapolate: 'clamp',
  })

  return (
    <View style={[styles.container, { backgroundColor: colorScheme === 'dark' ? '#222' : '#FFF' }]}>
      <Animated.View style={[styles.heroContainer, { height: headerHeight }]}>
        <ImageBackground source={require('../../assets/images/hero.jpg')} style={styles.heroImage} resizeMode="cover">
          <View style={styles.overlay} />
          <Animated.View
            style={[
              styles.heroContent,
              {
                transform: [
                  {
                    translateY: scrollY.interpolate({
                      inputRange: [-100, 0, 40],
                      outputRange: [50, 0, -50],
                    }),
                  },
                ],
              },
            ]}
          >
            <Text style={styles.title}>
              Witamy w <Text style={{ fontWeight: 'bold' }}>Wolfmed Edukacja</Text>
            </Text>
            <Text style={styles.subtitle}>
              Edukacja <Text style={{ color: '#FF69B4', fontWeight: 'bold' }}>medyczna</Text> może być jeszcze
              łatwiejsza.
            </Text>
          </Animated.View>
        </ImageBackground>
      </Animated.View>

      <ScrollView
        style={styles.scrollView}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: false })}
        scrollEventThrottle={16}
      >
        <View style={[styles.content, { backgroundColor: colorScheme === 'dark' ? '#222' : '#ffecec' }]}>
          <Text style={[styles.description, { color: colorScheme === 'dark' ? '#DDD' : '#333' }]}>
            Odkryj nowe możliwości w edukacji medycznej z Wolfmed. Nasza platforma oferuje szeroki zakres testów i
            procedur, które pomogą Ci w rozwoju zawodowym.
          </Text>

          <Text style={[styles.description, { color: colorScheme === 'dark' ? '#DDD' : '#2e2d2d' }]}>
            Ponadto oferujemy dostęp do bloga medycznego, gdzie można znależc wiele ciekawych artykułów i materiałów
            edukacyjnych. W niedalekiej przyszłści planujemy dodać do naszej platformy kursy i szkolenia poszerzające
            wiedzę medyczną.
          </Text>
          <Link
            href={'/tests-procedures' as Href<string>}
            style={[styles.ctaButton, { backgroundColor: colorScheme === 'dark' ? '#FF69B4' : '#FF1493' }]}
            asChild
          >
            <TouchableOpacity>
              <Text style={styles.ctaButtonText}>Rozpocznij naukę</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  heroContainer: {
    height: 300,
    overflow: 'hidden',
  },
  heroImage: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  heroContent: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 34,
    fontWeight: '400',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 10,
    lineHeight: 40,
  },
  subtitle: {
    fontSize: 20,
    color: '#d7d7d7',
    textAlign: 'center',
    lineHeight: 28,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    alignItems: 'center',
  },
  description: {
    fontSize: 16,
    textAlign: 'left',
    lineHeight: 26,
  },
  ctaButton: {
    paddingVertical: 12,
    paddingHorizontal: 48,
    borderRadius: 25,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#FF69B4',
    marginVertical: 20,
  },
  ctaButtonText: {
    color: '#080808',
    fontSize: 18,
    fontWeight: '500',
  },
})
