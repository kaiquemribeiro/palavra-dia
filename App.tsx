import React, { useState, useEffect, useCallback } from 'react';
import GameBoard from './components/GameBoard';
import EndGameModal from './components/EndGameModal';
import Hint from './components/Hint';
import Keyboard from './components/Keyboard';
import { getNewWord } from './services/wordService';
import { getWordHint } from './services/geminiService';
import { GameStatus, LetterState, PenaltyType, GuessState } from './types';
import { WORD_LENGTH, MAX_GUESSES } from './constants';
import { BrainCircuit, Sun, Moon, BadgeX } from 'lucide-react';

const getLetterStates = (guess: string, solution: string): LetterState[] => {
  const states: LetterState[] = Array(WORD_LENGTH).fill(LetterState.Absent);
  if (!guess || !solution) return states;

  const solutionChars = solution.split('');
  const guessChars = guess.split('');
  const usedSolutionIndices = new Set<number>();

  // First pass: find correct letters
  guessChars.forEach((char, i) => {
    if (solutionChars[i] === char) {
      states[i] = LetterState.Correct;
      usedSolutionIndices.add(i);
    }
  });

  // Second pass: find present letters
  guessChars.forEach((char, i) => {
    if (states[i] === LetterState.Correct) return;

    const presentIndex = solutionChars.findIndex(
      (solChar, j) => !usedSolutionIndices.has(j) && solChar === char
    );

    if (presentIndex !== -1) {
      states[i] = LetterState.Present;
      usedSolutionIndices.add(presentIndex);
    }
  });

  return states;
};

const shuffleArray = <T,>(array: T[]): T[] => {
  return [...array].sort(() => Math.random() - 0.5);
};


const App: React.FC = () => {
  const [solution, setSolution] = useState<string>('');
  const [guesses, setGuesses] = useState<GuessState[]>([]);
  const [currentGuess, setCurrentGuess] = useState<string>('');
  const [currentRowIndex, setCurrentRowIndex] = useState<number>(0);
  const [gameStatus, setGameStatus] = useState<GameStatus>(GameStatus.Playing);
  const [hint, setHint] = useState<string | null>(null);
  const [isHintLoading, setIsHintLoading] = useState<boolean>(false);
  const [shakeRowIndex, setShakeRowIndex] = useState<number | null>(null);
  const [keyStates, setKeyStates] = useState<{ [key: string]: LetterState }>({});
  const [activeCellIndex, setActiveCellIndex] = useState<number>(0);
  const [theme, setTheme] = useState<'light' | 'dark'>(
    () => (localStorage.getItem('theme') as 'light' | 'dark') || 'dark'
  );

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);
  
  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };


  const initializeGame = useCallback(() => {
    setSolution(getNewWord());
    setGuesses([]);
    setCurrentGuess(' '.repeat(WORD_LENGTH));
    setCurrentRowIndex(0);
    setGameStatus(GameStatus.Playing);
    setHint(null);
    setIsHintLoading(false);
    setShakeRowIndex(null);
    setKeyStates({});
    setActiveCellIndex(0);
  }, []);

  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  const handleCellClick = (index: number) => {
    if (gameStatus === GameStatus.Playing) {
      setActiveCellIndex(index);
    }
  };

  const handleKeyInput = useCallback((key: string) => {
    if (gameStatus !== GameStatus.Playing) return;

    const upperKey = key.toUpperCase();

    // Arrow key navigation
    if (key === 'ArrowLeft') {
      setActiveCellIndex(prev => Math.max(0, prev - 1));
      return;
    }
    if (key === 'ArrowRight') {
      setActiveCellIndex(prev => Math.min(WORD_LENGTH - 1, prev + 1));
      return;
    }

    if (upperKey === 'ENTER') {
      if (currentGuess.trim().length === WORD_LENGTH) {
        // Submit guess
        const submittedWord = currentGuess;
        const calculatedStates = getLetterStates(submittedWord, solution);
        const newGuessState: GuessState = { word: submittedWord, states: calculatedStates };
        const newGuesses = [...guesses, newGuessState];

        // Update key states
        const newKeyStates = { ...keyStates };
        submittedWord.split('').forEach((char, i) => {
          const currentState = newKeyStates[char];
          const newState = calculatedStates[i];
          if (currentState === LetterState.Correct || (currentState === LetterState.Present && newState === LetterState.Absent)) {
            return;
          }
          newKeyStates[char] = newState;
        });
        setKeyStates(newKeyStates);

        // Update game state
        setGuesses(newGuesses);
        setCurrentRowIndex(prev => prev + 1);
        setCurrentGuess(' '.repeat(WORD_LENGTH));
        setActiveCellIndex(0);

        if (submittedWord === solution) {
          setGameStatus(GameStatus.Won);
        } else if (newGuesses.length === MAX_GUESSES) {
          setGameStatus(GameStatus.Lost);
        } else {
          // Incorrect guess animation
          setShakeRowIndex(currentRowIndex);
          setTimeout(() => setShakeRowIndex(null), 700);
          
          // Apply random penalty
          const penalties: PenaltyType[] = [PenaltyType.HideLetter, PenaltyType.ShuffleLetters, PenaltyType.ScrambleColors];
          const randomPenalty = penalties[Math.floor(Math.random() * penalties.length)];
          const randomRowIndex = Math.floor(Math.random() * newGuesses.length);
          
          const guessesWithPenalty = [...newGuesses];
          const targetGuess = { ...guessesWithPenalty[randomRowIndex] };
          targetGuess.penalty = randomPenalty;

          if (randomPenalty === PenaltyType.ShuffleLetters) {
              let shuffledWord = shuffleArray(targetGuess.word.split('')).join('');
              while (shuffledWord === targetGuess.word && targetGuess.word.length > 1) {
                  shuffledWord = shuffleArray(targetGuess.word.split('')).join('');
              }
              targetGuess.penaltyData = { shuffledWord };
          }
          if (randomPenalty === PenaltyType.HideLetter) {
              targetGuess.penaltyData = { hiddenIndex: Math.floor(Math.random() * WORD_LENGTH) };
          }
          if (randomPenalty === PenaltyType.ScrambleColors) {
              targetGuess.penaltyData = { scrambledStates: shuffleArray(targetGuess.states) };
          }

          guessesWithPenalty[randomRowIndex] = targetGuess;
          setGuesses(guessesWithPenalty);
        }
      } else {
        setShakeRowIndex(currentRowIndex);
        setTimeout(() => setShakeRowIndex(null), 700);
      }
    } else if (upperKey === 'BACKSPACE') {
      const newGuessChars = currentGuess.split('');
      const charAtActive = newGuessChars[activeCellIndex];
      let indexToDelete = activeCellIndex;

      // If the current cell is empty and we are not at the beginning,
      // target the previous cell for deletion.
      if (charAtActive === ' ' && activeCellIndex > 0) {
        indexToDelete = activeCellIndex - 1;
      }
      
      // Clear the character at the target index.
      newGuessChars[indexToDelete] = ' ';
      setCurrentGuess(newGuessChars.join(''));

      // Move the cursor to the now-empty spot.
      setActiveCellIndex(indexToDelete);
    } else if (/^[A-Z]$/.test(upperKey) && upperKey.length === 1) {
      const newGuessChars = currentGuess.split('');
      newGuessChars[activeCellIndex] = upperKey;
      setCurrentGuess(newGuessChars.join(''));
      setActiveCellIndex(prev => Math.min(WORD_LENGTH - 1, prev + 1));
    }
  }, [currentGuess, gameStatus, guesses, solution, currentRowIndex, keyStates, activeCellIndex]);
  
  const handleGetHint = async () => {
    if (gameStatus !== GameStatus.Playing || isHintLoading || currentRowIndex >= MAX_GUESSES -1) return;
    
    setIsHintLoading(true);
    
    // Penalty: obscure previous guesses and lose a turn
    const penalizedGuesses = guesses.map(g => ({ ...g, isHintPenaltyApplied: true }));
    const sacrificedGuess: GuessState = { 
        word: ' '.repeat(WORD_LENGTH), 
        states: Array(WORD_LENGTH).fill(LetterState.Empty),
        isInvalidatedForHint: true 
    };
    const newGuesses = [...penalizedGuesses, sacrificedGuess];
    setGuesses(newGuesses);
    setCurrentRowIndex(prev => prev + 1);
    setCurrentGuess(' '.repeat(WORD_LENGTH));
    setActiveCellIndex(0);

    const fetchedHint = await getWordHint(solution);
    setHint(fetchedHint);
    setIsHintLoading(false);

    if (newGuesses.length >= MAX_GUESSES) {
      setGameStatus(GameStatus.Lost);
    }
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (['ArrowLeft', 'ArrowRight'].includes(event.key)) {
        event.preventDefault();
      }
      handleKeyInput(event.key);
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyInput]);
  
  const customStyles = `
    @keyframes jiggle {
      0%, 100% { transform: translateX(0); }
      10% { transform: translateX(-2px) rotate(-1deg); }
      20% { transform: translateX(2px) rotate(1deg); }
      30% { transform: translateX(-3px) rotate(-2deg); }
      40% { transform: translateX(3px) rotate(2deg); }
      50% { transform: translateX(-3px) rotate(-2deg); }
      60% { transform: translateX(3px) rotate(2deg); }
      70% { transform: translateX(-2px) rotate(-1deg); }
      80% { transform: translateX(2px) rotate(1deg); }
      90% { transform: translateX(-1px) rotate(0); }
    }
    @keyframes fade-in {
      from { opacity: 0; transform: scale(0.95); }
      to { opacity: 1; transform: scale(1); }
    }
    .animate-jiggle { animation: jiggle 0.7s ease-in-out; }
    .animate-fade-in { animation: fade-in 0.3s ease-out; }
    .backface-hidden { backface-visibility: hidden; }

    /* New Fireworks */
    .fireworks-container {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      overflow: hidden;
      pointer-events: none;
    }
    .firework-particle {
      position: absolute;
      width: var(--particle-size);
      height: var(--particle-size);
      background: hsl(var(--hue), 100%, 65%);
      border-radius: 50%;
      opacity: 0;
      /* The animation now loops indefinitely */
      animation: firework-explode 1.8s ease-out infinite;
      box-shadow: 0 0 10px hsl(var(--hue), 100%, 65%), 0 0 20px hsl(var(--hue), 100%, 50%);
    }
    @keyframes firework-explode {
      0% {
        /* Start at full size and visible */
        transform: translate(0, 0) scale(1);
        opacity: 1;
      }
      100% {
        /* Explode outwards and fade away */
        transform: translate(var(--x-end), var(--y-end)) scale(0);
        opacity: 0;
      }
    }
  `;

  return (
    <>
      <style>{customStyles}</style>
      <div className="flex flex-col items-center justify-between min-h-screen p-2 sm:p-4 font-sans bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 transition-colors duration-300">
        <header className="relative text-center my-4 sm:my-8 w-full max-w-xl lg:max-w-3xl">
          <div className="absolute top-0 right-0 sm:right-4">
              <button
                  onClick={toggleTheme}
                  className="p-2 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                  aria-label="Toggle theme"
              >
                  {theme === 'light' ? <Moon size={24} /> : <Sun size={24} />}
              </button>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-wider uppercase text-blue-600 dark:text-blue-500 flex items-center justify-center gap-3">
            <BrainCircuit size={48} className="animate-pulse text-blue-500" /> Evil Termo
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">Adivinhe a palavra. Nunca confie na dica anterior</p>
        </header>
        
        <main className="flex flex-col items-center justify-center flex-grow w-full">
          <GameBoard 
            guesses={guesses}
            currentGuess={currentGuess}
            currentRowIndex={currentRowIndex}
            solution={solution}
            shakeRowIndex={shakeRowIndex}
            activeCellIndex={activeCellIndex}
            onCellClick={handleCellClick}
          />
          <Hint 
            onGetHint={handleGetHint} 
            hint={hint}
            isLoading={isHintLoading}
            gameStatus={gameStatus}
          />
          <Keyboard 
            onKeyPress={handleKeyInput}
            letterStates={keyStates}
          />
        </main>

        <EndGameModal 
          status={gameStatus} 
          solution={solution} 
          onPlayAgain={initializeGame} 
        />
        
        <footer className="w-full text-center text-slate-500 dark:text-slate-400 text-sm py-4">
          <p>Feito com React, Tailwind CSS, e Gemini API.</p>
        </footer>
      </div>
    </>
  );
};

export default App;