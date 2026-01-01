export enum UserLevel {
  Beginner = 'Beginner',
  Intermediate = 'Intermediate',
  Advanced = 'Advanced',
  Expert = 'Expert',
}

export interface UserProfile {
  name: string;
  level: UserLevel;
  goals: string[];
  streak: number;
  xp: number;
  completedSessions: number;
}

export interface FeedbackMetric {
  category: 'Pace' | 'Clarity' | 'Filler Words' | 'Sentiment' | 'Grammar';
  score: number; // 0-100
  details: string;
}

export interface SessionResult {
  id: string;
  date: string;
  type: 'Roleplay' | 'Assessment' | 'Drill';
  topic: string;
  durationSeconds: number;
  overallScore: number;
  metrics: FeedbackMetric[];
  transcript?: string;
  improvementTips: string[];
}

export enum RoleplayScenario {
  Interview = 'Job Interview',
  SalesPitch = 'Sales Pitch',
  DifficultConversation = 'Difficult Conversation',
  CasualChat = 'Casual Chat',
  PublicSpeaking = 'Public Speaking Prep',
}

export interface LiveConnectionState {
  isConnected: boolean;
  isListening: boolean;
  isSpeaking: boolean;
  error: string | null;
}