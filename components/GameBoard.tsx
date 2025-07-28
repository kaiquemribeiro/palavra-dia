
import React from 'react';
import { MAX_GUESSES, WORD_LENGTH } from '../constants';
import { GuessState } from '../types';
import Row from './Row';

interface GameBoardProps {
  guesses: GuessState[];
  currentGuess: string;
  currentRowIndex: number;
  solution: string;
  shakeRowIndex: number | null;
  activeCellIndex: number;
  onCellClick: (index: number) => void;
}

const GameBoard: React.FC<GameBoardProps> = ({ guesses, currentGuess, currentRowIndex, solution, shakeRowIndex, activeCellIndex, onCellClick }) => {
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: MAX_GUESSES }).map((_, i) => {
        const guessState = guesses[i];
        const isSubmitted = i < currentRowIndex;
        const isCurrentRow = i === currentRowIndex;

        const isInvalidatedForHint = guessState?.isInvalidatedForHint;
        
        return (
          <Row
            key={i}
            guess={isSubmitted ? guessState.word : (isCurrentRow ? currentGuess : '')}
            states={guessState?.states}
            penalty={guessState?.penalty}
            penaltyData={guessState?.penaltyData}
            isHintPenaltyApplied={guessState?.isHintPenaltyApplied}
            isSubmitted={isSubmitted || !!isInvalidatedForHint}
            isInvalidated={!!isInvalidatedForHint}
            shake={shakeRowIndex === i}
            isActiveRow={isCurrentRow}
            activeCellIndex={isCurrentRow ? activeCellIndex : undefined}
            onCellClick={isCurrentRow ? onCellClick : undefined}
          />
        );
      })}
    </div>
  );
};

export default GameBoard;
