
import React from 'react';
import { MAX_GUESSES } from '../constants';
import Row from './Row';

interface GridProps {
  guesses: string[];
  currentGuess: string;
  solution: string;
  turn: number;
  isShaking: boolean;
}

const Grid: React.FC<GridProps> = ({ guesses, currentGuess, solution, turn, isShaking }) => {
  return (
    <div className="grid grid-rows-6 gap-1.5 w-full max-w-sm mx-auto">
      {Array.from({ length: MAX_GUESSES }).map((_, i) => {
        const isCurrentRow = i === turn;
        if (i < turn) {
          return <Row key={i} guess={guesses[i]} solution={solution} isCompleted />;
        }
        return <Row key={i} isCurrent={isCurrentRow} guess={isCurrentRow ? currentGuess : ''} isShaking={isCurrentRow && isShaking} />;
      })}
    </div>
  );
};

export default Grid;
