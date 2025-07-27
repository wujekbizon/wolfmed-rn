import { ExternalPathString, Link, RelativePathString } from 'expo-router';
import React from 'react'
import { Animated, StyleSheet, Text, TouchableOpacity, View , useColorScheme } from 'react-native'

export default function LearningScreen() {
  const colorScheme = useColorScheme();
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const learningMaterials = [
    {
      id: '1',
      title: 'Baza pytań',
      description: 'Pełna lista wszystkich pytań edukacyjnych',
      href: '/(drawer)/(learn)/AllQuestionsScreen',
    },
    {
      id: '2',
      title: 'Flashcards',
      description: 'Interactive flashcards for quick learning',
      href: '/(drawer)/(learn)/FlashcardsScreen',
    },
    {
      id: '3',
      title: 'Quizzes',
      description: 'Test your knowledge with timed quizzes',
      href: '/(drawer)/(learn)/QuizzesScreen',
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colorScheme === 'dark' ? '#222' : '#FFF' }]}>
      <View style={styles.briefcasesContainer}>
        {learningMaterials.map((item) => (
          <Animated.View
            key={item.id}
            style={[
              styles.briefcase,
              { opacity: fadeAnim },
              { backgroundColor: colorScheme === 'dark' ? '#333' : '#F5F5F5' },
            ]}
          >
            <Link href={item.href as RelativePathString | ExternalPathString} asChild>
              <TouchableOpacity style={styles.briefcaseContent}>
                <Text style={[styles.briefcaseTitle, { color: colorScheme === 'dark' ? '#FFF' : '#000' }]}>
                  {item.title}
                </Text>
                <Text style={[styles.briefcaseDescription, { color: colorScheme === 'dark' ? '#BBB' : '#666' }]}>
                  {item.description}
                </Text>
              </TouchableOpacity>
            </Link>
          </Animated.View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 16,
    textAlign: 'center',
  },
  briefcasesContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  briefcase: {
    width: '90%',
    padding: 20,
    marginVertical: 10,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  briefcaseContent: {
    alignItems: 'center',
  },
  briefcaseTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  briefcaseDescription: {
    fontSize: 14,
    textAlign: 'center',
  },
});