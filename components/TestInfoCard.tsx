import { Link } from 'expo-router'
import { CardContent } from '@/types/dataTypes'
import { ColorSchemeName, TouchableOpacity, View, Text, Image, StyleSheet } from 'react-native'

export const TestInfoCard = ({ card, colorScheme }: { card: CardContent; colorScheme: ColorSchemeName }) => {
  return (
    <Link
      href={card.link}
      style={[
        styles.card,
        {
          backgroundColor: colorScheme === 'dark' ? '#111' : '#fff1f1',
        },
      ]}
      asChild
    >
      <TouchableOpacity>
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

const styles = StyleSheet.create({
  card: {
    flex: 1,
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
})
