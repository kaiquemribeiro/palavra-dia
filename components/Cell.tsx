import React from 'react';
import { LetterState } from '../types';

interface CellProps {
  letter?: string;
  state?: LetterState;
  isSubmitted?: boolean;
  isInvalidated?: boolean;
  isActive?: boolean;
  onClick?: () => void;
}

const Cell: React.FC<CellProps> = ({
  letter = '',
  state = LetterState.Empty,
  isSubmitted = false,
  isInvalidated = false,
  isActive = false,
  onClick,
}) => {
  const displayLetter = letter.trim();

  const baseClasses =
    'w-16 h-16 sm:w-20 sm:h-20 border-2 rounded-lg flex items-center justify-center text-4xl font-bold uppercase transition-all duration-500 ease-in-out';

  const perspectiveWrapper = `perspective-[1000px] ${onClick ? 'cursor-pointer' : ''}`;
  const transformStyle = { transformStyle: 'preserve-3d' as const };

  // Define a cor da borda com base no estado
  let borderColorClass = '';
  if (isActive) {
    borderColorClass = 'border-blue-600 dark:border-blue-500';
  } else {
    borderColorClass = displayLetter
      ? 'border-slate-400 dark:border-slate-600'
      : 'border-slate-500 dark:border-slate-500';
  }

  const frontFaceClasses =
    'absolute w-full h-full flex items-center justify-center backface-hidden bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50';

  let backFaceClasses =
    'absolute w-full h-full flex items-center justify-center backface-hidden [transform:rotateX(180deg)] text-white border-2';
  let backFaceTextClass = '';

  if (isInvalidated) {
    backFaceClasses += ' bg-red-600 dark:bg-red-700 border-red-700 dark:border-red-600';
  } else {
    switch (state) {
      case LetterState.Correct:
        backFaceClasses += ' bg-green-600 dark:bg-green-700 border-green-700 dark:border-green-600';
        break;
      case LetterState.Present:
        backFaceClasses += ' bg-yellow-400 dark:bg-yellow-500 border-yellow-500 dark:border-yellow-600';
        backFaceTextClass = 'text-slate-900';
        break;
      case LetterState.Absent:
        backFaceClasses += ' bg-slate-500 dark:bg-slate-700 border-slate-600 dark:border-slate-600';
        break;
      default:
        backFaceClasses += ' bg-white dark:bg-slate-900 border-slate-400 dark:border-slate-500';
        break;
    }
  }

  return (
    <div className={perspectiveWrapper} onClick={onClick}>
      <div
        className={`${baseClasses} relative ${isSubmitted ? '[transform:rotateX(180deg)]' : ''} ${borderColorClass}`}
        style={transformStyle}
      >
        <div className={frontFaceClasses}>{displayLetter}</div>
        <div className={`${backFaceClasses} ${backFaceTextClass}`}>
          <span className="inline-block transition-transform duration-500">
            {isInvalidated ? 'X' : displayLetter}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Cell;