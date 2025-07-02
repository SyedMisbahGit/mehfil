import React, { createContext, useContext, useState, useEffect } from 'react';
import { MoodEntry } from '../types/types';

interface MoodContextType {
  moodLog: MoodEntry[];
  addMood: (mood: MoodEntry['mood']) => void;
  hasMoodForToday: boolean;
  todayMood: MoodEntry | null;
  totalMoodEntries: number;
  setTodayMood: (mood: string) => void;
}

const MOOD_ENTRIES_KEY = 'mehfil-totalMoodEntries';

const getTotalMoodEntries = () => {
  const val = localStorage.getItem(MOOD_ENTRIES_KEY);
  return val ? parseInt(val, 10) : 0;
};

const MoodContext = createContext<MoodContextType | undefined>(undefined);

function getTodayDate() {
  return new Date().toISOString().slice(0, 10);
}

export const MoodProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [moodLog, setMoodLog] = useState<MoodEntry[]>([]);
  const [totalMoodEntries, setTotalMoodEntries] = useState(getTotalMoodEntries());

  useEffect(() => {
    const stored = localStorage.getItem('mehfil-moodLog');
    if (stored) setMoodLog(JSON.parse(stored));
  }, []);

  const todayMood = moodLog.find(e => e.timestamp && new Date(e.timestamp).toISOString().slice(0, 10) === getTodayDate()) || null;
  const hasMoodForToday = !!todayMood;

  const addMood = (mood: MoodEntry['mood']) => {
    if (hasMoodForToday) return; // Block if already exists for today
    const entry: MoodEntry = { timestamp: Date.now(), mood };
    const updated = [entry, ...moodLog.filter(e => new Date(e.timestamp).toISOString().slice(0, 10) !== getTodayDate())];
    setMoodLog(updated);
    localStorage.setItem('mehfil-moodLog', JSON.stringify(updated));
    // Increment mood entries
    const newTotal = totalMoodEntries + 1;
    setTotalMoodEntries(newTotal);
    localStorage.setItem(MOOD_ENTRIES_KEY, newTotal.toString());
  };

  const setTodayMood = (mood: string) => {
    // ... existing logic to set today's mood ...
    // Increment mood entries
    const newTotal = totalMoodEntries + 1;
    setTotalMoodEntries(newTotal);
    localStorage.setItem(MOOD_ENTRIES_KEY, newTotal.toString());
  };

  return (
    <MoodContext.Provider value={{ moodLog, addMood, hasMoodForToday, todayMood, totalMoodEntries, setTodayMood }}>
      {children}
    </MoodContext.Provider>
  );
};

export const useMood = () => {
  const ctx = useContext(MoodContext);
  if (!ctx) throw new Error('useMood must be used within MoodProvider');
  return ctx;
}; 