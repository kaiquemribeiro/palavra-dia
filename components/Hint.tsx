import React from 'react';
import { GameStatus } from '../types';

interface HintProps {
  onGetHint: () => void;
  hint: string | null;
  isLoading: boolean;
  gameStatus: GameStatus;
}

const Hint: React.FC<HintProps> = ({ onGetHint, hint, isLoading, gameStatus }) => {
  return (
    <div className="mt-8 flex flex-col items-center w-full max-w-md">
      <button
        onClick={onGetHint}
        disabled={isLoading || gameStatus !== GameStatus.Playing}
        className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 transition-all duration-200 transform hover:scale-105 active:scale-95"
      >
        {isLoading ? 'Gerando...' : 'Pedir Dica (perde 1 chance)'}
      </button>
      {hint && (
        <div className="mt-4 p-4 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-center w-full animate-fade-in">
          <p className="text-lg italic text-cyan-700 dark:text-cyan-300">"{hint}"</p>
        </div>
      )}
    </div>
  );
};

export default Hint;