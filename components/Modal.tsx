import React from 'react';
import { GameState } from '../types';
import { ShareIcon, ChartBarIcon } from '@heroicons/react/24/outline';


interface ModalProps {
  gameState: GameState;
  solution: string;
  onReset: () => void;
  onShare: () => void;
  onShowStats: () => void;
}

const Modal: React.FC<ModalProps> = ({ gameState, solution, onReset, onShare, onShowStats }) => {
  if (gameState === GameState.Playing) {
    return null;
  }

  const isWin = gameState === GameState.Won;
  const title = isWin ? 'Parabéns!' : 'Fim de Jogo';
  const message = isWin ? 'Você acertou a palavra!' : 'Você não conseguiu adivinhar a palavra.';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg shadow-xl p-8 text-center max-w-sm w-full mx-4">
        <h2 className={`text-3xl font-bold mb-4 ${isWin ? 'text-green-400' : 'text-red-400'}`}>{title}</h2>
        <p className="text-lg text-gray-300 mb-2">{message}</p>
        <p className="text-lg text-gray-300 mb-6">
          A palavra era: <strong className="text-2xl text-yellow-400 tracking-widest">{solution}</strong>
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          <button
            onClick={onShowStats}
            className="flex items-center justify-center gap-2 bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-4 rounded-lg transition-transform transform hover:scale-105"
          >
            <ChartBarIcon className="h-6 w-6" />
            Estatísticas
          </button>
           <button
            onClick={onShare}
            className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition-transform transform hover:scale-105"
          >
            <ShareIcon className="h-6 w-6" />
            Compartilhar
          </button>
        </div>
        <button
          onClick={onReset}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-transform transform hover:scale-105"
        >
          Jogar Novamente
        </button>
      </div>
    </div>
  );
};

export default Modal;
