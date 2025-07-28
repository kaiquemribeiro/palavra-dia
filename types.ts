
export enum LetterState {
  Correct = 'correct',
  Present = 'present',
  Absent = 'absent',
  Empty = 'empty',
  Invalid = 'invalid',
}

export enum GameStatus {
  Playing = 'playing',
  Won = 'won',
  Lost = 'lost',
}

export enum PenaltyType {
  HideLetter = 'hide-letter',
  ShuffleLetters = 'shuffle-letters',
  ScrambleColors = 'scramble-colors',
}

export interface GuessState {
  word: string;
  states: LetterState[];
  penalty?: PenaltyType;
  penaltyData?: any;
  isHintPenaltyApplied?: boolean;
  isInvalidatedForHint?: boolean;
}
