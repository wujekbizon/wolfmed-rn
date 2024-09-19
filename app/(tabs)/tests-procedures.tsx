import React from 'react'
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  ScrollView,
  ColorSchemeName,
  useColorScheme,
} from 'react-native'
import { Link, Href } from 'expo-router'

interface CardContent {
  category: string
  title: string
  content: string
  date: string
  testsLabel: string
  testsNumber: number
  image: any // Use require('./path/to/image.png') when importing
  link: Href<string | object>
}

const TestInfoCard = ({ card, colorScheme }: { card: CardContent; colorScheme: ColorSchemeName }) => {
  return (
    <Link href={card.link} asChild>
      <TouchableOpacity style={[styles.card, { backgroundColor: colorScheme === 'dark' ? '#333' : '#ffb1b1' }]}>
        <View style={styles.cardContent}>
          <Text style={[styles.category, { color: colorScheme === 'dark' ? '#BBB' : '#666' }]}>{card.category}</Text>
          <Text style={[styles.title, { color: colorScheme === 'dark' ? '#FFF' : '#000' }]}>{card.title}</Text>
          <Text style={[styles.content, { color: colorScheme === 'dark' ? '#DDD' : '#333' }]}>{card.content}</Text>
          <View style={styles.infoContainer}>
            <View style={styles.infoItem}>
              <Image source={card.image} style={styles.icon} />
              <View>
                <Text style={[styles.infoLabel, { color: colorScheme === 'dark' ? '#BBB' : '#666' }]}>
                  Opublikowano
                </Text>
                <Text style={[styles.infoValue, { color: colorScheme === 'dark' ? '#FFF' : '#000' }]}>{card.date}</Text>
              </View>
            </View>
            <View style={styles.infoItem}>
              <Image source={card.image} style={styles.icon} />
              <View>
                <Text style={[styles.infoLabel, { color: colorScheme === 'dark' ? '#BBB' : '#666' }]}>
                  Liczba {card.testsLabel}
                </Text>
                <Text style={[styles.infoValue, { color: colorScheme === 'dark' ? '#FFF' : '#000' }]}>
                  {card.testsNumber}
                </Text>
              </View>
            </View>
          </View>
        </View>
        <Image source={card.image} style={styles.cardImage} />
      </TouchableOpacity>
    </Link>
  )
}

const Divider = ({ colorScheme }: { colorScheme: ColorSchemeName }) => (
  <View style={[styles.divider, { backgroundColor: colorScheme === 'dark' ? '#444' : '#CCC' }]} />
)

export default function TestsProceduresScreen() {
  const colorScheme = useColorScheme()

  const cards: CardContent[] = [
    {
      category: 'Testy',
      title: 'Testy Medyczne',
      content: 'Odkryj różnorodne testy medyczne i dowiedz się więcej o ich zastosowaniu.',
      date: '2024-09-18',
      testsLabel: 'testów',
      testsNumber: 587,
      image: require('../../assets/images/heart.png'),
      link: '/tests' as Href<string>,
    },
    {
      category: 'Procedury',
      title: 'Procedury Medyczne',
      content: 'Zapoznaj się z różnymi procedurami medycznymi i ich znaczeniem w opiece zdrowotnej.',
      date: '2024-09-18',
      testsLabel: 'procedur',
      testsNumber: 30,
      image: require('../../assets/images/syringie.png'),
      link: '/procedures' as Href<string>,
    },
  ]

  return (
    <ScrollView style={[styles.container, { backgroundColor: colorScheme === 'dark' ? '#222' : '#FFF' }]}>
      <Text style={[styles.screenTitle, { color: colorScheme === 'dark' ? '#FFF' : '#000' }]}>
        Tests and Procedures
      </Text>
      {cards.map((card, index) => (
        <React.Fragment key={index}>
          <TestInfoCard card={card} colorScheme={colorScheme} />
          {index < cards.length - 1 && <Divider colorScheme={colorScheme} />}
        </React.Fragment>
      ))}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  card: {
    height: 470,
    width: '100%',
    marginVertical: 20, // Add vertical margin
    borderRadius: 30,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardContent: {
    padding: 20,
    flex: 1,
  },
  category: {
    fontSize: 12,
    marginBottom: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  content: {
    fontSize: 14,
    marginBottom: 15,
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
  infoLabel: {
    fontSize: 12,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  cardImage: {
    width: '100%',
    height: 200,
    resizeMode: 'contain',
  },
  divider: {
    height: 1,
    width: '100%',
    marginVertical: 20, // Add vertical margin to the divider
  },
})
