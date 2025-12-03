export enum Difficulty {
  EASY = 'Easy',
  MEDIUM = 'Medium',
  HARD = 'Hard',
  EXTREME = 'Extreme'
}

export type GameMode = 'CLASSIC' | 'CAMPAIGN';

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export interface QuizSettings {
  topic: string;
  difficulty: Difficulty;
  count: number;
  language: string;
  voice: string;
  mode: GameMode;
  level?: number;
}

export interface QuizResult {
  score: number;
  total: number;
  points: number; // New field for calculated score
  history: {
    question: string;
    userAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
    explanation: string;
  }[];
  levelUp?: boolean;
  newLevel?: number;
}

export type GameState = 'START' | 'LOADING' | 'PLAYING' | 'RESULT' | 'ERROR';