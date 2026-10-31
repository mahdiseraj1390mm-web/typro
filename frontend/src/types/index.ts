// Typro.ir - Core Domain Types matching Master Product Specification

export type LanguageMode = 'fa' | 'en';
export type LessonLevel = 'foundation' | 'beginner' | 'advanced';

export interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  mobile: string;
  email?: string;
  workplace?: string;
  gender?: string;
  workplaceAddress?: string;
  bio?: string;
  avatarUrl?: string;
  level: number; // 1 to 1000
  xp: number; // 1000 XP = 1 Level
  coins: number;
  banknotes: number;
  gems?: number;
  stars: number; // Daily activity stars
  cup: string; // Evolves with Level / Competition
  typingSkills: {
    verifiedWpm: number;
    verifiedAccuracy: number;
    verifiedConsistency: number;
    bestWpm: number;
    totalTypedChars: number;
    totalTypingSeconds: number;
  };
  selectedSkinId: string;
  selectedTrackId: string;
  selectedAbilities: string[];
  isPremium: boolean;
  completionPercentage: number;
}

export interface TypingMetrics {
  rawWpm: number;
  netWpm: number;
  wpm: number;
  accuracy: number; // 0 - 100 %
  errors: number;
  errorIndices: number[];
  consistency: number; // 0 - 100 %
  elapsedSeconds: number;
  charactersTyped: number;
  correctCharacters: number;
  incorrectCharacters: number;
  reactionTimeMs?: number;
  weakKeys: string[];
  weakWords: string[];
}

export interface LessonItem {
  id: string;
  title: string;
  titleFa: string;
  level: LessonLevel;
  language: LanguageMode;
  category: 'fundamentals' | 'quran' | 'hadith' | 'literature' | 'science' | 'technology' | 'code' | 'words' | 'sentences';
  content: string;
  targetWpm: number;
  targetAccuracy: number;
  focusKeys: string[];
  isFixed: boolean;
  isPremium?: boolean;
}

export type RaceState = 'IDLE' | 'LOBBY' | 'READY' | 'COUNTDOWN' | 'ACTIVE' | 'FINISHING' | 'INTERMISSION' | 'RESULT' | 'NEXT_ROUND';

export interface RaceParticipant {
  id: string;
  odUserId: string;
  name: string;
  level: number;
  cup: string;
  skinId: string;
  lane: number;
  progressPercent: number; // 0 to 100
  wpm: number;
  accuracy: number;
  errors: number;
  isActive: boolean; // Active Typer
  isAbandoned: boolean;
  isFinished: boolean;
  finishPosition?: number;
  lastTypingTimestamp: number;
  requestedTextChange: boolean;
  voteChangeText?: boolean;
  joinedDuringActive?: boolean;
  isSpectator?: boolean;
}

export interface RaceRoomData {
  id: string;
  title: string;
  language: LanguageMode;
  topic: string;
  mode: string;
  maxScore: number;
  capacity: number;
  state: RaceState;
  text: string;
  countdownSeconds: number;
  roundDurationSeconds?: number;
  roundRemainingSeconds?: number;
  intermissionSeconds?: number;
  currentRound?: number;
  textPool?: string[];
  participants: RaceParticipant[];
  trackTheme: string;
}
