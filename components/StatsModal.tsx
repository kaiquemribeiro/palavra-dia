import React from 'react';
import { GameStats, GuessDistribution } from '../types';
import { XMarkIcon } from '@heroicons/react/24/solid';

interface StatsModalProps {
  stats: GameStats;
  onClose: () => void;
}

const StatItem: React.FC<{ label: string; value: number | string }> = ({ label, value }) => (
  <div className="flex flex-col items-center">
    <div className="text-3xl font-bold">{value}</div>
    <div className="text-xs text-gray-400 uppercase tracking-wider">{label}</div>
  </div>
);

const DistributionBar: React.FC<{ index: number; count: number; total: number }> = ({ index, count, total }) => {
  const percentage = total > 0 ? (count / total) * 100 : 0;
  const isZero = count === 0;

  return (
    <div className="flex items-center w-full gap-2 text-sm">
      <div className="w-4 font-semibold">{index}</div>
      <div className={`flex items-center justify-end rounded-sm pr-2 h-6 ${isZero ? 'bg-gray-700' : 'bg-blue-600'}`} style={{ width: `${Math.max(percentage, 8)}%` }}>
        <span className="text-white font-bold">{count}</span>
      </div>
    </div>
  );
};


const StatsModal: React.FC<StatsModalProps> = ({ stats, onClose }) => {
  const { gamesPlayed, wins, currentStreak, maxStreak, guessDistribution } = stats;
  const winPercentage = gamesPlayed > 0 ? Math.round((wins / gamesPlayed) * 100) : 0;
  const totalWins = Object.values(guessDistribution).reduce((a, b) => a + b, 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-gray-800 rounded-lg shadow-xl p-6 text-center max-w-md w-full mx-auto relative" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-white">
          <XMarkIcon className="h-6 w-6" />
        </button>

        <h2 className="text-xl font-bold uppercase tracking-widest mb-6">Estatísticas</h2>
        
        <div className="grid grid-cols-4 gap-4 mb-6">
          <StatItem label="Jogos" value={gamesPlayed} />
          <StatItem label="Vitórias %" value={winPercentage} />
          <StatItem label="Sequência" value={currentStreak} />
          <StatItem label="Melhor Seq." value={maxStreak} />
        </div>

        <h3 className="text-lg font-bold uppercase tracking-widest mb-4">Distribuição de Tentativas</h3>
        <div className="space-y-2 w-full max-w-xs mx-auto">
            {Object.entries(guessDistribution).map(([key, value]) => (
                <DistributionBar key={key} index={parseInt(key)} count={value} total={totalWins} />
            ))}
        </div>
      </div>
    </div>
  );
};

export default StatsModal;
