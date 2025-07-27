
import React from 'react';
import { LetterState } from '../types';

interface TileProps {
  letter?: string;
  state?: LetterState;
  isRevealing?: boolean;
  index?: number;
}

const Tile: React.FC<TileProps> = ({ letter, state = LetterState.Empty, isRevealing = false, index = 0 }) => {
  const stateStyles: Record<LetterState, string> = {
    [LetterState.Empty]: 'border-gray-500',
    [LetterState.Tbd]: 'border-gray-400 bg-gray-900 animate-pop-in',
    [LetterState.Absent]: 'bg-gray-700 border-gray-700',
    [LetterState.Present]: 'bg-yellow-500 border-yellow-500',
    [LetterState.Correct]: 'bg-green-500 border-green-500',
  };

  const baseClasses = "w-14 h-14 sm:w-16 sm:h-16 border-2 flex items-center justify-center text-3xl font-bold uppercase transition-colors duration-500";
  const revealingClasses = isRevealing ? 'animate-flip' : '';
  const animationDelay = isRevealing ? `${index * 100}ms` : '0ms';

  return (
    <div
      className={`${baseClasses} ${stateStyles[state]} ${revealingClasses}`}
      style={{ animationDelay }}
    >
      {letter}
    </div>
  );
};

export default Tile;
