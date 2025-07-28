
import React from 'react';
import { WORD_LENGTH } from '../constants';
import { LetterState, PenaltyType } from '../types';
import Cell from './Cell';

interface RowProps {
  guess?: string;
  states?: LetterState[];
  penalty?: PenaltyType;
  penaltyData?: any;
  isHintPenaltyApplied?: boolean;
  isSubmitted?: boolean;
  isInvalidated?: boolean;
  shake?: boolean;
  isActiveRow?: boolean;
  activeCellIndex?: number;
  onCellClick?: (index: number) => void;
}

const Row: React.FC<RowProps> = ({ guess = '', states = [], penalty, penaltyData, isHintPenaltyApplied = false, isSubmitted = false, isInvalidated = false, shake = false, isActiveRow = false, activeCellIndex, onCellClick }) => {
  const animationClass = shake ? 'animate-jiggle' : '';

  let displayGuess = guess;
  if (penalty === PenaltyType.ShuffleLetters && penaltyData?.shuffledWord) {
    displayGuess = penaltyData.shuffledWord;
  }
  
  let displayStates = states;
  if (penalty === PenaltyType.ScrambleColors && penaltyData?.scrambledStates) {
    displayStates = penaltyData.scrambledStates;
  }

  return (
    <div className={`grid grid-cols-5 gap-2 ${animationClass}`}>
      {Array.from({ length: WORD_LENGTH }).map((_, i) => {
        let letter = displayGuess[i] || ' ';
        let state = displayStates[i] || LetterState.Empty;

        if (penalty === PenaltyType.HideLetter && penaltyData?.hiddenIndex === i) {
          letter = ' ';
        }

        if (isHintPenaltyApplied) {
            letter = 'X';
            state = LetterState.Absent;
        }

        return <Cell 
          key={i} 
          letter={letter} 
          state={state} 
          isSubmitted={isSubmitted} 
          isInvalidated={isInvalidated}
          isActive={isActiveRow && activeCellIndex === i}
          onClick={isActiveRow && onCellClick ? () => onCellClick(i) : undefined}
        />;
      })}
    </div>
  );
};

export default Row;
