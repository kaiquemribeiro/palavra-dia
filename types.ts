
export enum LetterState {
  Correct = 'correct',
  Present = 'present',
  Absent = 'absent',
  Empty = 'empty',
  Tbd = 'tbd',
}

export enum GameState {
  Playing = 'playing',
  Won = 'won',
  Lost = 'lost',
}

export interface GuessDistribution {
  [key: number]: number; // e.g. { 1: 0, 2: 5, 3: 10, 4: 8, 5: 3, 6: 1 }
}

export interface GameStats {
  gamesPlayed: number;
  wins: number;
  currentStreak: number;
  maxStreak: number;
  guessDistribution: GuessDistribution;
}
