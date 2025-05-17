import React, { useState } from 'react';
import { Text, View, TouchableOpacity, FlatList, StyleSheet , useColorScheme } from 'react-native';
import {Test } from '@/types/dataTypes';

import { LearningCardItem } from './LearningCardItem';

type LearningCardProps = {
  test: Test;
  questionNumber: string;
};

export const LearningCard = ({ test, questionNumber }: LearningCardProps) => {
  const [showCorrectAnswer, setShowCorrectAnswer] = useState(false);
  const colorScheme = useColorScheme();

  return (
    <View
      style={[
        styles.card,
        colorScheme === 'dark' ? styles.cardDark : styles.cardLight,
      ]}
    >
      <Text
        style={[
          styles.questionNumber,
          colorScheme === 'dark' ? styles.textDark : styles.textLight,
        ]}
      >
        {questionNumber}
      </Text>

      <Text
        style={[
          styles.questionText,
          colorScheme === 'dark' ? styles.textDark : styles.textLight,
        ]}
      >
        {test.data.question}
      </Text>

      <FlatList
        data={test.data.answers}
        renderItem={({ item, index }) => (
          <LearningCardItem
            item={item}
            index={index}
            showCorrectAnswer={showCorrectAnswer}
            colorScheme={colorScheme}
          />
        )}
        keyExtractor={(_item, index) => `answer-${index}`}
      />

      <TouchableOpacity
        style={[
          styles.toggleButton,
          colorScheme === 'dark' ? styles.buttonDark : styles.buttonLight,
        ]}
        onPress={() => setShowCorrectAnswer((prev) => !prev)}
        activeOpacity={0.8}
      >
        <Text style={styles.toggleButtonText}>
          {showCorrectAnswer ? 'Hide Answer' : 'Show Answer'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardLight: {
    backgroundColor: '#FFFFFF',
  },
  cardDark: {
    backgroundColor: '#333333',
  },
  questionNumber: {
    position: 'absolute',
    right: 16,
    top: 16,
    fontSize: 12,
    opacity: 0.7
  },
  questionText: {
    fontSize: 16,
    fontWeight: '600',
    marginVertical: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  toggleButton: {
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  buttonLight: {
    backgroundColor: '#FF6B6B',
  },
  buttonDark: {
    backgroundColor: '#FF8E8E',
  },
  toggleButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  textLight: {
    color: '#000000',
  },
  textDark: {
    color: '#FFFFFF',
  },
});