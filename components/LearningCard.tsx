import React, { useState, useCallback } from 'react';
import { Text, View, TouchableOpacity, FlatList, StyleSheet, useColorScheme } from 'react-native';
import { Test, Answer } from '@/types/dataTypes';

import { LearningCardItem } from './LearningCardItem';

type LearningCardProps = {
  test: Test;
  questionNumber: string;
};

export const LearningCard = ({ test, questionNumber }: LearningCardProps) => {
  const [showCorrectAnswer, setShowCorrectAnswer] = useState(false);
  const colorScheme = useColorScheme();

  const renderItem = useCallback(({ item, index }: { item: Answer; index: number }) => (
    <LearningCardItem
      item={item}
      index={index}
      showCorrectAnswer={showCorrectAnswer}
      colorScheme={colorScheme}
    />
  ), [showCorrectAnswer, colorScheme]);

  const keyExtractor = useCallback((_item: Answer, index: number) => `answer-${index}`, []);

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
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        scrollEnabled={false}
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
          {showCorrectAnswer ? 'Ukryj odpowiedź' : 'Pokaż odpowiedź'}
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
    backgroundColor: '#27272a',
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