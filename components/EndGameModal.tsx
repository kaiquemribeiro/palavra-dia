import React, { useState, useEffect, useRef } from 'react';
import { GameStatus } from '../types';
import Fireworks from './Fireworks';

interface EndGameModalProps {
  status: GameStatus;
  solution: string;
  onPlayAgain: () => void;
}

const createAnagram = (word: string): string => {
  let anagram = word.split('').sort(() => Math.random() - 0.5).join('');
  while (anagram === word && word.length > 1) {
    anagram = word.split('').sort(() => Math.random() - 0.5).join('');
  }
  return anagram;
};

const EndGameModal: React.FC<EndGameModalProps> = ({ status, solution, onPlayAgain }) => {
  const [anagramGuess, setAnagramGuess] = useState('');
  const [timeLeft, setTimeLeft] = useState(15);
  const [isAnagramSolved, setIsAnagramSolved] = useState(false);
  const [showSolutionAfterLoss, setShowSolutionAfterLoss] = useState(false);
  const timerRef = useRef<number | null>(null);
  
  const anagram = React.useMemo(() => createAnagram(solution), [solution]);

  useEffect(() => {
    // Cleanup previous timers
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    if (status === GameStatus.Lost) {
      // Reset state for new modal appearance
      setTimeLeft(15);
      setAnagramGuess('');
      setIsAnagramSolved(false);
      setShowSolutionAfterLoss(false);

      timerRef.current = window.setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setShowSolutionAfterLoss(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [status, solution]); // Rerun when a new game starts

  const handleAnagramChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const guess = e.target.value.toUpperCase();
    setAnagramGuess(guess);
    if (guess === solution) {
      if (timerRef.current) clearInterval(timerRef.current);
      setIsAnagramSolved(true);
      setShowSolutionAfterLoss(true);
    }
  };

  if (status === GameStatus.Playing) return null;

  const isWin = status === GameStatus.Won;

  return (
    <div className="absolute inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center z-10 p-4">
      {isWin && <Fireworks />}
      <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-2xl shadow-black/20 border border-slate-200 dark:border-slate-700 text-center flex flex-col items-center animate-fade-in w-full max-w-md text-slate-900 dark:text-slate-50">
        {isWin ? (
          <>
            <h2 className="text-4xl font-bold mb-4 text-green-600 dark:text-green-400">Parabéns, você venceu!</h2>
            <p className="text-lg mb-6">A palavra era: <span className="font-mono tracking-widest text-2xl bg-slate-200 dark:bg-slate-700 px-4 py-2 rounded-lg text-blue-600 dark:text-blue-400">{solution}</span></p>
          </>
        ) : (
          <>
            <h2 className="text-4xl font-bold mb-4 text-red-600 dark:text-red-500">Fim de Jogo! 💀</h2>
            {!showSolutionAfterLoss ? (
              <>
                <p className="text-lg mb-2">Decifre o anagrama para revelar a palavra:</p>
                <p className="text-3xl font-mono tracking-widest text-yellow-600 dark:text-yellow-400 my-4">{anagram}</p>
                <input
                  type="text"
                  value={anagramGuess}
                  onChange={handleAnagramChange}
                  maxLength={solution.length}
                  className="w-full text-center bg-slate-100 dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-600 rounded-lg p-2 text-2xl font-mono tracking-widest uppercase focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                  disabled={timeLeft <= 0}
                  aria-label="Anagram guess input"
                />
                <p className="text-2xl mt-4" aria-live="polite">Tempo: <span className="font-bold">{timeLeft}s</span></p>
              </>
            ) : (
              <>
                {isAnagramSolved ? (
                  <p className="text-xl text-green-600 dark:text-green-400 my-4">Você conseguiu! A palavra era:</p>
                ) : (
                  <p className="text-xl text-yellow-600 dark:text-yellow-500 my-4">Tempo esgotado! A palavra era:</p>
                )}
                <p className="text-3xl font-mono tracking-widest bg-slate-200 dark:bg-slate-700 px-4 py-2 rounded-lg text-blue-600 dark:text-blue-400 mb-6">{solution}</p>
              </>
            )}
          </>
        )}
        <button
          onClick={onPlayAgain}
          className="mt-6 px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 transition-transform duration-200 transform hover:scale-105"
        >
          Jogar Novamente
        </button>
      </div>
    </div>
  );
};

export default EndGameModal;