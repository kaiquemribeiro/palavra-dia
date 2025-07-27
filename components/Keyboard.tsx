
import React from 'react';
import { KEYBOARD_LAYOUT } from '../constants';
import { LetterState } from '../types';
import { BackspaceIcon } from '@heroicons/react/24/solid';

interface KeyboardProps {
  onKeyPress: (key: string) => void;
  usedKeys: { [key: string]: LetterState };
}

const Keyboard: React.FC<KeyboardProps> = ({ onKeyPress, usedKeys }) => {
  const stateStyles: Record<LetterState, string> = {
    [LetterState.Absent]: 'bg-gray-700 text-white',
    [LetterState.Present]: 'bg-yellow-500 text-white',
    [LetterState.Correct]: 'bg-green-500 text-white',
    [LetterState.Empty]: 'bg-gray-500 hover:bg-gray-600',
    [LetterState.Tbd]: 'bg-gray-500 hover:bg-gray-600',
  };

  return (
    <div className="flex flex-col gap-2 mt-4 sm:mt-8">
      {KEYBOARD_LAYOUT.map((row, rowIndex) => (
        <div key={rowIndex} className="flex justify-center gap-1.5">
          {row.map((key) => {
            const isSpecialKey = key === 'ENTER' || key === 'BACKSPACE';
            const keyState = usedKeys[key] || LetterState.Empty;

            return (
              <button
                key={key}
                onClick={() => onKeyPress(key)}
                className={`
                  h-14 rounded-md font-bold uppercase transition-colors
                  ${isSpecialKey ? 'px-3 sm:px-4 text-xs' : 'w-8 sm:w-11'}
                  ${stateStyles[keyState]}
                `}
              >
                {key === 'BACKSPACE' ? <BackspaceIcon className="h-6 w-6 mx-auto" /> : key}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default Keyboard;
