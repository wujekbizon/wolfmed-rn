import React from 'react';
import { StyleSheet, Text, View , useColorScheme } from 'react-native';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { TestList } from '@/components/TestList';
import { useTests } from '@/hooks/useTests';

export default function QuestionsScreen () {
  const colorScheme = useColorScheme();
  const { tests, isLoading, error } = useTests();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingSpinner isLoading={true} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={[styles.errorText, { color: colorScheme === 'dark' ? '#FFF' : '#000' }]}>
         Blad wczytywania materialow.
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colorScheme === 'dark' ? '#222' : '#FFF' }]}>
      <TestList tests={tests} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 16,
    textAlign: 'center',
  },
  errorText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
  },
});
