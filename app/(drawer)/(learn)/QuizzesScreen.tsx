import React from 'react';
import { View, Text, StyleSheet , useColorScheme } from 'react-native';


export default function QuizzesScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#222' : '#FFF' }]}>
      <Text style={[styles.text, { color: isDark ? '#FFF' : '#000' }]}>
        Quizzes Screen (Coming Soon)
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 18,
    fontWeight: '600',
  },
}); 