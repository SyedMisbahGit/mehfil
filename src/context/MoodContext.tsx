import React, { createContext, useContext, useState, useEffect } from 'react';
import { MoodEntry } from '../types/types';
import { toast } from 'react-hot-toast';

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

const suggestionFor = (mood: MoodEntry['mood']): string => {
  switch (mood) {
    case 'light':
      return "Qur'an se ek ayat parh lo.";
    case 'nostalgic':
      return "Purani tasveer dekh kar dua karo.";
    case 'tired':
      return "5-min walk lo, fresh hawa.";
    case 'cheerful':
      return "Kisi ko chhoti khushi share karo.";
    default:
      return "Allah aapko khush rakhe.";
  }
};

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
    
    // Show suggestion toast
    toast(suggestionFor(mood), {
      duration: 4000,
      position: 'top-center',
      style: {
        background: '#0f5132',
        color: '#f1f5f9',
        borderRadius: '8px',
        fontSize: '14px',
      },
    });
  };

  const setTodayMood = (_mood: string) => {
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