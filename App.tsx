import React, { useState, useEffect, useCallback } from 'react';
import { WORDS, WORD_LENGTH, MAX_GUESSES } from './constants';
import { GameState, LetterState, GameStats, GuessDistribution } from './types';
import Grid from './components/Grid';
import Keyboard from './components/Keyboard';
import Modal from './components/Modal';
import Fireworks from './components/Fireworks';
import StatsModal from './components/StatsModal';
import { QuestionMarkCircleIcon, LightBulbIcon, ArrowPathIcon, XMarkIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const getInitialState = () => {
    const solution = WORDS[Math.floor(Math.random() * WORDS.length)];
    console.log("Palavra correta:", solution); // For debugging
    return {
        solution,
        gameState: GameState.Playing,
        guesses: [],
        currentGuess: '',
        turn: 0,
        usedKeys: {},
        isShaking: false,
        hint: null,
        hintUsed: false,
        isHintLoading: false,
    };
};

const getGuessStates = (guess: string, solution: string): LetterState[] => {
  const solutionChars = solution.split('');
  const guessChars = guess.split('');
  const states: LetterState[] = Array(WORD_LENGTH).fill(LetterState.Absent);
  const solutionLetterCount: Record<string, number> = {};

  solutionChars.forEach(letter => {
    solutionLetterCount[letter] = (solutionLetterCount[letter] || 0) + 1;
  });

  // 1st pass: find correct (green) letters
  guessChars.forEach((letter, index) => {
    if (solutionChars[index] === letter) {
      states[index] = LetterState.Correct;
      solutionLetterCount[letter] -= 1;
    }
  });

  // 2nd pass: find present (yellow) letters
  guessChars.forEach((letter, index) => {
    if (states[index] !== LetterState.Correct) {
      if (solutionLetterCount[letter] > 0) {
        states[index] = LetterState.Present;
        solutionLetterCount[letter] -= 1;
      }
    }
  });

  return states;
};


const defaultStats: GameStats = {
    gamesPlayed: 0,
    wins: 0,
    currentStreak: 0,
    maxStreak: 0,
    guessDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 },
};


function App() {
    const [solution, setSolution] = useState(getInitialState().solution);
    const [gameState, setGameState] = useState(getInitialState().gameState);
    const [guesses, setGuesses] = useState<string[]>(getInitialState().guesses);
    const [currentGuess, setCurrentGuess] = useState(getInitialState().currentGuess);
    const [turn, setTurn] = useState(getInitialState().turn);
    const [usedKeys, setUsedKeys] = useState<{ [key: string]: LetterState }>(getInitialState().usedKeys);
    const [isShaking, setIsShaking] = useState(false);
    
    const [showHelpModal, setShowHelpModal] = useState(false);
    const [showStatsModal, setShowStatsModal] = useState(false);
    const [showCopiedToast, setShowCopiedToast] = useState(false);
    
    // AI Hint State
    const [hint, setHint] = useState<string | null>(getInitialState().hint);
    const [hintUsed, setHintUsed] = useState(getInitialState().hintUsed);
    const [isHintLoading, setIsHintLoading] = useState(getInitialState().isHintLoading);

    // Stats State
    const [stats, setStats] = useState<GameStats>(() => {
        const savedStats = localStorage.getItem('gameStats');
        return savedStats ? JSON.parse(savedStats) : defaultStats;
    });

    useEffect(() => {
        localStorage.setItem('gameStats', JSON.stringify(stats));
    }, [stats]);


    const updateStats = useCallback((won: boolean) => {
        setStats(prev => {
            const newStats = { ...prev };
            newStats.gamesPlayed += 1;
            if (won) {
                newStats.wins += 1;
                newStats.currentStreak += 1;
                if (newStats.currentStreak > newStats.maxStreak) {
                    newStats.maxStreak = newStats.currentStreak;
                }
                const newDistribution = { ...newStats.guessDistribution };
                newDistribution[turn + 1] = (newDistribution[turn + 1] || 0) + 1;
                newStats.guessDistribution = newDistribution;
            } else {
                newStats.currentStreak = 0;
            }
            return newStats;
        });
    }, [turn]);


    const resetGame = useCallback(() => {
        const newState = getInitialState();
        setSolution(newState.solution);
        setGameState(newState.gameState);
        setGuesses(newState.guesses);
        setCurrentGuess(newState.currentGuess);
        setTurn(newState.turn);
        setUsedKeys(newState.usedKeys);
        setIsShaking(false);
        setHint(newState.hint);
        setHintUsed(newState.hintUsed);
        setIsHintLoading(newState.isHintLoading);
    }, []);

    const handleGetHint = useCallback(async () => {
        if (hintUsed || isHintLoading) return;
        setIsHintLoading(true);
        try {
            const prompt = `Gere uma dica criativa e curta, em português, para a palavra de 5 letras "${solution}". A dica não deve conter a palavra em si, nem variações dela. A dica deve ter no máximo 15 palavras.`;
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt,
            });
            setHint(response.text);
            setHintUsed(true);
        } catch (error) {
            console.error("Erro ao buscar dica da IA:", error);
            alert("Não foi possível obter uma dica no momento. Tente novamente.");
        } finally {
            setIsHintLoading(false);
        }
    }, [solution, hintUsed, isHintLoading]);

    const handleKeyPress = useCallback((key: string) => {
        if (gameState !== GameState.Playing) return;

        if (key === 'ENTER') {
            if (currentGuess.length !== WORD_LENGTH) {
                 setIsShaking(true);
                 setTimeout(() => setIsShaking(false), 600);
                return;
            }
            
            setGuesses(prev => [...prev, currentGuess]);

            const newUsedKeys = { ...usedKeys };
            currentGuess.split('').forEach((letter, i) => {
                const correctLetter = solution[i];
                if (correctLetter === letter) {
                    newUsedKeys[letter] = LetterState.Correct;
                } else if (solution.includes(letter) && newUsedKeys[letter] !== LetterState.Correct) {
                    newUsedKeys[letter] = LetterState.Present;
                } else if (!solution.includes(letter)) {
                    newUsedKeys[letter] = LetterState.Absent;
                }
            });
            setUsedKeys(newUsedKeys);

            const isWin = currentGuess === solution;
            if (isWin) {
                setGameState(GameState.Won);
                updateStats(true);
            } else if (turn + 1 === MAX_GUESSES) {
                setGameState(GameState.Lost);
                updateStats(false);
            }

            setTurn(prev => prev + 1);
            setCurrentGuess('');
            return;
        }

        if (key === 'BACKSPACE') {
            setCurrentGuess(prev => prev.slice(0, -1));
            return;
        }

        if (currentGuess.length < WORD_LENGTH && /^[a-zA-Z]$/.test(key)) {
            setCurrentGuess(prev => prev + key.toUpperCase());
        }
    }, [currentGuess, gameState, turn, solution, usedKeys, updateStats]);
    
    const handleShare = useCallback(() => {
        const emojiMap = {
            [LetterState.Correct]: '🟩',
            [LetterState.Present]: '🟨',
            [LetterState.Absent]: '⬛',
        };

        const title = `Palavra-Dia ${gameState === GameState.Won ? guesses.length : 'X'}/${MAX_GUESSES}`;
        
        const grid = guesses.map(guess => {
            const states = getGuessStates(guess, solution);
            return states.map(state => emojiMap[state] || '⬛').join('');
        }).join('\n');

        const shareText = `${title}\n\n${grid}`;
        navigator.clipboard.writeText(shareText);
        setShowCopiedToast(true);
        setTimeout(() => setShowCopiedToast(false), 3000);
    }, [guesses, solution, gameState]);


    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            const isModalOpen = showHelpModal || showStatsModal || gameState !== GameState.Playing;
            if (event.ctrlKey || event.metaKey || isModalOpen) return;
            
            let key = event.key.toUpperCase();
            if (key === 'BACKSPACE' || key === 'ENTER') {
                handleKeyPress(key);
            } else if (key.length === 1 && key >= 'A' && key <= 'Z') {
                handleKeyPress(key);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyPress, showHelpModal, showStatsModal, gameState]);

    const HelpModal = () => (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4" onClick={() => setShowHelpModal(false)}>
             <div className="bg-gray-800 rounded-lg shadow-xl p-6 text-left max-w-md w-full mx-auto" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-bold mb-4 text-white">Como Jogar</h2>
                <p className="text-gray-300 mb-4">Adivinhe a palavra em 6 tentativas.</p>
                <p className="text-gray-300 mb-4">Cada tentativa deve ser uma palavra válida de 5 letras. Pressione enter para submeter.</p>
                <p className="text-gray-300 mb-4">Após cada tentativa, a cor das letras mudará para mostrar o quão perto você está da solução.</p>
                 <p className="text-gray-300 mb-4">Use o ícone de lâmpada <LightBulbIcon className="h-5 w-5 inline-block -mt-1"/> para uma dica da IA após a segunda tentativa!</p>
                <hr className="border-gray-600 my-4" />
                <div className="space-y-4">
                    <div>
                        <strong className="block text-white mb-2">Exemplos</strong>
                        <div className="flex items-center gap-2 mb-2">
                           <div className="w-10 h-10 flex items-center justify-center bg-green-500 border-green-500 rounded font-bold">F</div>
                           <div className="w-10 h-10 flex items-center justify-center border-2 border-gray-500 rounded font-bold">L</div>
                           <div className="w-10 h-10 flex items-center justify-center border-2 border-gray-500 rounded font-bold">O</div>
                           <div className="w-10 h-10 flex items-center justify-center border-2 border-gray-500 rounded font-bold">R</div>
                           <div className="w-10 h-10 flex items-center justify-center border-2 border-gray-500 rounded font-bold">A</div>
                        </div>
                        <p className="text-gray-400">A letra <strong className="text-green-400">F</strong> está na palavra e na posição correta.</p>
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                           <div className="w-10 h-10 flex items-center justify-center border-2 border-gray-500 rounded font-bold">V</div>
                           <div className="w-10 h-10 flex items-center justify-center bg-yellow-500 border-yellow-500 rounded font-bold">E</div>
                           <div className="w-10 h-10 flex items-center justify-center border-2 border-gray-500 rounded font-bold">N</div>
                           <div className="w-10 h-10 flex items-center justify-center border-2 border-gray-500 rounded font-bold">T</div>
                           <div className="w-10 h-10 flex items-center justify-center border-2 border-gray-500 rounded font-bold">O</div>
                        </div>
                        <p className="text-gray-400">A letra <strong className="text-yellow-400">E</strong> está na palavra mas na posição errada.</p>
                    </div>
                     <div>
                        <div className="flex items-center gap-2 mb-2">
                           <div className="w-10 h-10 flex items-center justify-center border-2 border-gray-500 rounded font-bold">R</div>
                           <div className="w-10 h-10 flex items-center justify-center border-2 border-gray-500 rounded font-bold">O</div>
                           <div className="w-10 h-10 flex items-center justify-center border-2 border-gray-500 rounded font-bold">S</div>
                           <div className="w-10 h-10 flex items-center justify-center border-2 border-gray-500 rounded font-bold">T</div>
                           <div className="w-10 h-10 flex items-center justify-center bg-gray-700 border-gray-700 rounded font-bold">O</div>
                        </div>
                        <p className="text-gray-400">A letra <strong className="text-gray-400">O</strong> não está na palavra.</p>
                    </div>
                </div>
                 <button onClick={() => setShowHelpModal(false)} className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg">Entendi!</button>
            </div>
        </div>
    );

    return (
        <div className="flex flex-col h-screen max-h-[100vh] w-full text-white p-2 sm:p-4">
            {gameState === GameState.Won && <Fireworks />}
            <Modal gameState={gameState} solution={solution} onReset={resetGame} onShare={handleShare} onShowStats={() => setShowStatsModal(true)} />
            {showHelpModal && <HelpModal />}
            {showStatsModal && <StatsModal stats={stats} onClose={() => setShowStatsModal(false)} />}
            
            {showCopiedToast && (
              <div className="absolute top-10 left-1/2 -translate-x-1/2 bg-gray-100 text-gray-900 font-semibold py-2 px-4 rounded-full shadow-lg z-50 animate-fade-in-out">
                Resultados copiados!
              </div>
            )}
            
            <header className="flex items-center justify-center relative border-b border-gray-700 pb-2 mb-4 sm:pb-4 sm:mb-8 w-full max-w-lg mx-auto">
                 <div className="absolute left-0 top-1/2 -translate-y-1/2 flex gap-2">
                    <button 
                        onClick={handleGetHint}
                        disabled={turn < 2 || hintUsed || isHintLoading || gameState !== GameState.Playing}
                        className="text-gray-400 hover:text-white disabled:text-gray-600 disabled:cursor-not-allowed transition-colors"
                        aria-label="Obter dica da IA"
                        >
                        {isHintLoading ? (
                            <ArrowPathIcon className="h-6 w-6 sm:h-7 sm:w-7 animate-spin-slow" />
                        ) : (
                            <LightBulbIcon className="h-6 w-6 sm:h-7 sm:w-7" />
                        )}
                    </button>
                 </div>
                 <h1 className="text-3xl sm:text-4xl font-bold tracking-wider text-center">PALAVRA-DIA</h1>
                 <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    <button onClick={() => setShowStatsModal(true)} className="text-gray-400 hover:text-white" aria-label="Ver estatísticas">
                        <ChartBarIcon className="h-6 w-6 sm:h-7 sm:w-7" />
                    </button>
                    <button onClick={() => setShowHelpModal(true)} className="text-gray-400 hover:text-white" aria-label="Ajuda">
                        <QuestionMarkCircleIcon className="h-6 w-6 sm:h-7 sm:w-7" />
                    </button>
                 </div>
            </header>
            
            {hint && (
                <div className="absolute top-24 left-1/2 -translate-x-1/2 w-11/12 max-w-sm bg-indigo-800 text-white p-3 rounded-lg shadow-lg z-20 animate-fade-in-down">
                    <div className="flex items-start justify-between gap-2">
                        <p className="text-sm leading-tight"><strong className="font-bold">Dica da IA:</strong> {hint}</p>
                        <button onClick={() => setHint(null)} className="text-indigo-200 hover:text-white flex-shrink-0 -mt-1 -mr-1">
                            <XMarkIcon className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            )}
           
            <main className="flex-grow flex flex-col items-center justify-center w-full">
                <Grid guesses={guesses} currentGuess={currentGuess} solution={solution} turn={turn} isShaking={isShaking} />
            </main>
            
            <footer className="w-full flex justify-center">
                <Keyboard onKeyPress={handleKeyPress} usedKeys={usedKeys} />
            </footer>
        </div>
    );
}

export default App;
