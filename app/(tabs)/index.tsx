import React from 'react'
import { StyleSheet, Text, View, ImageBackground, TouchableOpacity, Animated, ScrollView } from 'react-native'
import { useColorScheme } from 'react-native'
import { Link, Href } from 'expo-router'

export default function HomeScreen() {
  const colorScheme = useColorScheme()
  const scrollY = new Animated.Value(0)

  const headerHeight = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [300, 200],
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
                      inputRange: [-100, 0, 100],
                      outputRange: [50, 0, -50],
                    }),
                  },
                ],
              },
            ]}
          >
            <Text style={styles.title}>Witamy w Wolfmed Edukacja</Text>
            <Text style={styles.subtitle}>Edukacja medyczna może być jeszcze łatwiejsza.</Text>
          </Animated.View>
        </ImageBackground>
      </Animated.View>

      <ScrollView
        style={styles.scrollView}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: false })}
        scrollEventThrottle={16}
      >
        <View style={styles.content}>
          <Text style={[styles.description, { color: colorScheme === 'dark' ? '#DDD' : '#333' }]}>
            Odkryj nowe możliwości w edukacji medycznej z Wolfmed. Nasza platforma oferuje szeroki zakres testów i
            procedur, które pomogą Ci w rozwoju zawodowym.
          </Text>
          <Link href={'/tests-procedures' as Href<string>} asChild>
            <TouchableOpacity
              style={[styles.ctaButton, { backgroundColor: colorScheme === 'dark' ? '#FF69B4' : '#FF1493' }]}
            >
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
    justifyContent: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  heroContent: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#FFF',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    alignItems: 'center',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  ctaButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    elevation: 3,
  },
  ctaButtonText: {
    color: '#451818',
    fontSize: 18,
    fontWeight: 'bold',
  },
})
