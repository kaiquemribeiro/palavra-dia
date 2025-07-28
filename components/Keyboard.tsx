import React from 'react';
import { LetterState } from '../types';

interface KeyboardProps {
  onKeyPress: (key: string) => void;
  letterStates: { [key: string]: LetterState };
}

const KEY_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACKSPACE'],
];

const Keyboard: React.FC<KeyboardProps> = ({ onKeyPress, letterStates }) => {
  const getKeyClass = (key: string) => {
    const baseClass = "h-12 sm:h-14 flex items-center justify-center rounded-lg font-bold uppercase cursor-pointer transition-colors duration-200 transform hover:scale-105 active:scale-95 text-sm sm:text-base";
    const state = letterStates[key];

    switch (state) {
      case LetterState.Correct:
        return `${baseClass} bg-green-600 dark:bg-green-700 text-white`;
      case LetterState.Present:
        return `${baseClass} bg-yellow-400 dark:bg-yellow-500 text-slate-900`;
      case LetterState.Absent:
        return `${baseClass} bg-slate-500 dark:bg-slate-700 text-white`;
      default:
        return `${baseClass} bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500 text-slate-800 dark:text-slate-100`;
    }
  };

  return (
    <div className="flex flex-col gap-2 w-full max-w-xl lg:max-w-3xl mt-auto pt-4">
      {KEY_ROWS.map((row, rowIndex) => (
        <div key={rowIndex} className={`flex justify-center gap-1.5`}>
          {rowIndex === 1 && <div style={{ flex: 0.5 }}></div>}
          {row.map(key => {
            const isSpecialKey = key === 'ENTER' || key === 'BACKSPACE';
            const keyClass = getKeyClass(key);
            return (
              <button
                key={key}
                style={{ flex: isSpecialKey ? 1.5 : 1 }}
                className={`${keyClass} ${isSpecialKey ? 'text-xs px-1' : ''}`}
                onClick={() => onKeyPress(key)}
                aria-label={`Key ${key}`}
              >
                {key === 'BACKSPACE' ? '⌫' : key}
              </button>
            );
          })}
          {rowIndex === 1 && <div style={{ flex: 0.5 }}></div>}
        </div>
      ))}
    </div>
  );
};

export default Keyboard;