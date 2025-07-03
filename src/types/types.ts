// Mehfil Phase 1 Types

export interface CousinProfile {
  id: string;
  preferredName: string;
  age: number;
  gender: string;
  onboardingComplete?: boolean;
}

export interface Whisper {
  id: string;
  text: string;
  tags: string[];
  sentTo: string[];
  moods: string[];
}

export interface MoodEntry {
  timestamp: number;
  mood: 'nostalgic' | 'light' | 'tired' | 'cheerful';
}

export interface DiaryEntry {
  date: string;
  text: string;
}

export interface WhisperSentEntry {
  whisperId: string;
  timestamp: number;
} 