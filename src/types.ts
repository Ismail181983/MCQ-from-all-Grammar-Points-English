export interface Question {
  id: number;
  question: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  explanation: string;
  topic: string;
}

export interface ModelQuestionSet {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  totalQuestions: number;
  questions: Question[];
}

export interface ScoreRecord {
  id: string;
  userName: string;
  roll: string;
  modelNumber: number;
  modelTitle: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  timeSpentSeconds: number;
  date: string;
}

export interface QuizSettings {
  // Speech synthesis
  enableSpeech: boolean;
  speechRate: number;
  speechPitch: number;
  speechVolume: number;
  
  // Sound effects & Ambient
  soundEffects: boolean;
  ambientSound: boolean;
  
  // Timers
  enableTotalTimer: boolean;
  totalTimeMinutes: number;
  enableQuestionTimer: boolean;
  questionTimeSeconds: number;
  autoAdvanceOnAnswer?: boolean;
  
  // Visuals & Aquarium
  enableAquariumAnimation: boolean;
  aquariumFishCount: number;
  aquariumFlowerCount: number;
  
  // Explanations
  showExplanationInQuiz: boolean;
  
  // Password expiration simulation
  enablePasswordExpiry: boolean;
  passwordExpiryMinutes: number;
  passwordExpiryDate?: string;
  isManuallyExpired: boolean;
}

export interface StudentProfile {
  name: string;
  roll: string;
}
