export enum GameState {
  IDLE = 'IDLE',
  MATCHMAKING = 'MATCHMAKING',
  COUNTDOWN = 'COUNTDOWN',
  PLAYING = 'PLAYING',
  EVALUATING = 'EVALUATING',
  FINISHED = 'FINISHED',
  WAITING_FOR_OPPONENT = 'WAITING_FOR_OPPONENT'
}

export enum Difficulty {
  EASY = 'Easy',
  MEDIUM = 'Medium',
  HARD = 'Hard'
}

export enum Language {
  JAVASCRIPT = 'JavaScript',
  PYTHON = 'Python',
  C = 'C',
  CPP = 'C++'
}

export interface Problem {
  id: string;
  title: string;
  description: string;
  difficulty: Difficulty;
  language: Language;
  examples: {
    input: string;
    output: string;
    explanation?: string;
  }[];
  starterCode: string;
}

export interface PlayerState {
  id: string;
  name: string;
  avatar: string; // URL
  status: 'idle' | 'coding' | 'submitted' | 'won' | 'lost';
  progress: number; // 0-100% (simulated for opponent)
}

export interface MatchResult {
  winnerId: string | null; // null if draw
  message: string;
  scoreChange: number;
  aiReason?: string;
  opponentCode?: string;
  opponentName?: string;
  opponentAvatar?: string;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  avatar: string;
  bio: string;
  rating: number;
  wins: number;
  losses: number;
  status: 'online' | 'offline' | 'in-game';
  deviceType?: 'mobile' | 'desktop';
  lastSeen?: number;
}

export interface Challenge {
  id: string;
  fromId: string;
  fromName: string;
  fromAvatar: string;
  toId: string;
  toName: string;
  toAvatar?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'expired' | 'completed' | 'in_progress';
  difficulty: Difficulty;
  language: Language;
  problem?: Problem;
  timestamp: number;
  // Scheduling fields
  scheduledTime?: number; // Timestamp for when the duel starts
  fromCheckedIn?: boolean;
  toCheckedIn?: boolean;
  // Result fields
  winnerId?: string | null;
  winReason?: string;
  // Submission fields
  fromCode?: string;
  toCode?: string;
}