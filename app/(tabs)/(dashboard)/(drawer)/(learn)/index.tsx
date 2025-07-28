import { learningMaterials } from '@/constants/learningMaterials'
import { ExternalPathString, Link, RelativePathString } from 'expo-router'
import {useEffect} from 'react'
import { StyleSheet, Text, TouchableOpacity, View, useColorScheme } from 'react-native'
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated'

export default function LearningScreen() {
  const colorScheme = useColorScheme()
  const fadeAnim = useSharedValue(0)

  useEffect(() => {
    fadeAnim.value = withTiming(1, { duration: 1000 })
  }, [fadeAnim])

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: fadeAnim.value,
  }))

  return (
    <View className={`flex-1 p-5 ${colorScheme === 'dark' ? 'bg-zinc-900' : 'bg-[#f4edff7f]/50' }`}>
      <View className="flex-1 items-center">
        {learningMaterials.map((item) => (
          <Animated.View
            key={item.id}
            style={[
              styles.briefcase,
              animatedStyle,
              { backgroundColor: colorScheme === 'dark' ? '#333' : '#fff' },
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
  )
}

const styles = StyleSheet.create({
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
})