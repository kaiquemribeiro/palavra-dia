
import { WORD_LIST, WORD_LENGTH } from '../constants';

// Simple shuffle function to randomize array
const shuffleArray = <T,>(array: T[]): T[] => {
  return array.sort(() => Math.random() - 0.5);
};

// Filter and pad words to ensure they are the correct length
const getValidWords = (): string[] => {
    return WORD_LIST.map(word => word.toUpperCase().padEnd(WORD_LENGTH, ' ')).filter(word => word.trim().length === WORD_LENGTH);
}

const shuffledWords = shuffleArray(getValidWords());
let wordIndex = 0;

export const getNewWord = (): string => {
  if (wordIndex >= shuffledWords.length) {
    wordIndex = 0; // Reset if we've used all words
  }
  const newWord = shuffledWords[wordIndex];
  wordIndex++;
  return newWord;
};
