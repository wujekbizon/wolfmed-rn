import React, { useRef } from 'react'
import { StyleSheet, Text, View, useColorScheme, Linking, Dimensions, Animated, ImageBackground } from 'react-native'
import { Href, Link } from 'expo-router'

const { height, width } = Dimensions.get('window')

export default function AboutScreen() {
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'
  const scrollY = useRef(new Animated.Value(0)).current

  const openBuyMeCoffee = () => {
    Linking.openURL('https://buymeacoffee.com/grzegorzwolfinger')
  }

  return (
    <View style={styles.container}>
      <Animated.ScrollView
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: true })}
        scrollEventThrottle={16}
      >
        <Animated.View
          style={[
            styles.parallaxHeader,
            {
              transform: [
                {
                  translateY: scrollY.interpolate({
                    inputRange: [-100, 0, 100],
                    outputRange: [100, 0, 200],
                    extrapolate: 'clamp',
                  }),
                },
              ],
            },
          ]}
        >
          <ImageBackground
            source={require('../../assets/images/students.jpg')}
            style={styles.backgroundImage}
            resizeMode="cover"
          >
            <View style={styles.overlay} />
          </ImageBackground>
        </Animated.View>

        <View style={[styles.content, { backgroundColor: isDark ? '#222' : '#ffb5b5' }]}>
          <View
            style={[
              styles.infoContainer,
              { backgroundColor: isDark ? 'rgba(71, 69, 69, 0.9)' : 'rgba(254, 205, 205, 0.9)' },
            ]}
          >
            <Text style={[styles.title, { color: isDark ? '#FFF' : '#000' }]}>
              WOLFMED <Text style={{ color: isDark ? '#AAA' : '#666' }}>EDUKACJA</Text>
            </Text>
            <Text style={[styles.paragraph, { color: isDark ? '#DDD' : '#000' }]}>
              To <Text style={styles.highlight}>innowacyjny</Text> startup edukacyjny dedykowany przyszłym{' '}
              <Text style={[styles.highlight, { color: '#ff5b5b' }]}>opiekunom medycznym</Text>, którzy przygotowują się
              do egzaminów zawodowych.
            </Text>
            <Text style={[styles.paragraph, { color: isDark ? '#DDD' : '#000' }]}>
              Oferujemy <Text style={[styles.highlight, styles.underline]}>bezpłatny</Text> dostęp do najnowszych testów
              i pytań medycznych, które pomogą Ci rozwinąć swoją wiedzę i umiejętności.
            </Text>
            <Text style={[styles.paragraph, { color: isDark ? '#DDD' : '#000' }]}>
              Jesteśmy w trakcie rozwoju dlatego zachęcamy każdego do wsparcia naszego startupu:
              <Text style={[styles.highlight, { color: '#ff5b5b' }]} onPress={openBuyMeCoffee}>
                {' '}
                Kupuje serduszko ❤️
              </Text>
            </Text>
            <Text style={[styles.paragraph, { color: isDark ? '#DDD' : '#000' }]}>
              Dołącz do nas w budowaniu społeczności zmotywowanych osób zaangażowanych w pozytywny wpływ na opiekę
              zdrowotną.
            </Text>
            <Link
              href={'/contact' as Href<string>}
              asChild
              style={[styles.button, { color: isDark ? '#000' : '#FFF', backgroundColor: isDark ? '#FFF' : '#ff5b5b' }]}
            >
              <Text>Skontaktuj się</Text>
            </Link>
          </View>
        </View>
      </Animated.ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  parallaxHeader: {
    height: height * 0.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 181, 181, 0.3)',
  },
  parallaxText: {
    fontSize: 40,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  content: {
    minHeight: height * 0.6,
    borderTopLeftRadius: 46,
    borderTopRightRadius: 46,
    marginTop: -46,
    padding: 20,
  },
  infoContainer: {
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  paragraph: {
    fontSize: 16,
    marginBottom: 10,
  },
  highlight: {
    fontWeight: 'bold',
    fontSize: 18,
  },
  underline: {
    textDecorationLine: 'underline',
  },
  button: {
    alignSelf: 'flex-end',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    fontWeight: 'bold',
    overflow: 'hidden',
    marginTop: 10,
  },
})
