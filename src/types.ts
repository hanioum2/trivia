export type Language = 'en' | 'ar';

export interface Question {
  id: number;
  question: {
    en: string;
    ar: string;
  };
  options: {
    en: string[];
    ar: string[];
  };
  correctAnswer: number;
}

export interface GameResult {
  playerName: string;
  score: number;
  totalQuestions: number;
  time: number; // in milliseconds
  language: Language;
  timestamp: number;
  quizId?: string;
}

export interface QuizConfig {
  id: string;
  title: string;
  backgroundImageUrl: string | null;
  gradientColor1: string; // Top-left color
  gradientColor2: string; // Bottom-right color
  logoUrl: string | null;
  buttonColorArabic: string;
  buttonColorEnglish: string;
  scoreboardBackgroundImageUrl: string | null;
  scoreboardGradientColor1: string; // Top-left color for scoreboard
  scoreboardGradientColor2: string; // Bottom-right color for scoreboard
}

export interface Score {
  id: number;
  quiz_id: string;
  player_name: string;
  score: number;
  total_questions: number;
  time: number; // in milliseconds
  language: string;
  created_at: string;
}
