
import React, { useMemo } from 'react';
import { WORD_LENGTH } from '../constants';
import { LetterState } from '../types';
import Tile from './Tile';

interface RowProps {
  guess?: string;
  solution?: string;
  isCompleted?: boolean;
  isCurrent?: boolean;
  isShaking?: boolean;
}

const getGuessStates = (guess: string, solution: string): LetterState[] => {
  const solutionChars = solution.split('');
  const guessChars = guess.split('');
  const states: LetterState[] = Array(WORD_LENGTH).fill(LetterState.Absent);
  const solutionLetterCount: Record<string, number> = {};

  solutionChars.forEach(letter => {
    solutionLetterCount[letter] = (solutionLetterCount[letter] || 0) + 1;
  });

  // 1st pass: find correct (green) letters
  guessChars.forEach((letter, index) => {
    if (solutionChars[index] === letter) {
      states[index] = LetterState.Correct;
      solutionLetterCount[letter] -= 1;
    }
  });

  // 2nd pass: find present (yellow) letters
  guessChars.forEach((letter, index) => {
    if (states[index] !== LetterState.Correct) {
      if (solutionLetterCount[letter] > 0) {
        states[index] = LetterState.Present;
        solutionLetterCount[letter] -= 1;
      }
    }
  });

  return states;
};

const Row: React.FC<RowProps> = ({ guess = '', solution = '', isCompleted = false, isCurrent = false, isShaking = false }) => {
  const letters = guess.padEnd(WORD_LENGTH, ' ').split('');
  const states = useMemo(() => isCompleted ? getGuessStates(guess, solution) : [], [isCompleted, guess, solution]);
  const rowClass = isShaking ? 'animate-shake' : '';

  if (isCompleted) {
    return (
      <div className={`grid grid-cols-5 gap-1.5 ${rowClass}`}>
        {letters.map((letter, i) => (
          <Tile key={i} letter={letter} state={states[i]} isRevealing={true} index={i} />
        ))}
      </div>
    );
  }

  if (isCurrent) {
     return (
        <div className={`grid grid-cols-5 gap-1.5 ${rowClass}`}>
            {letters.map((letter, i) => (
                <Tile key={i} letter={letter.trim()} state={letter.trim() ? LetterState.Tbd : LetterState.Empty} />
            ))}
        </div>
    );
  }

  return (
    <div className="grid grid-cols-5 gap-1.5">
      {Array.from({ length: WORD_LENGTH }).map((_, i) => (
        <Tile key={i} />
      ))}
    </div>
  );
};

export default Row;
