import React, { createContext, useContext, useState, useEffect } from 'react';
import { DiaryEntry } from '../types/types';

interface DiaryContextType {
  diaryLog: DiaryEntry[];
  addDiaryEntry: (text: string) => void;
  hasEntryForToday: boolean;
}

const DiaryContext = createContext<DiaryContextType | undefined>(undefined);

function getTodayDate() {
  return new Date().toISOString().slice(0, 10);
}

export const DiaryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [diaryLog, setDiaryLog] = useState<DiaryEntry[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('mehfil-diaryLog');
    if (stored) setDiaryLog(JSON.parse(stored));
  }, []);

  const hasEntryForToday = diaryLog.some(e => e.date === getTodayDate());

  const addDiaryEntry = (text: string) => {
    if (hasEntryForToday) return; // Block if already exists for today
    const entry: DiaryEntry = { date: getTodayDate(), text };
    const updated = [entry, ...diaryLog.filter(e => e.date !== entry.date)];
    setDiaryLog(updated);
    localStorage.setItem('mehfil-diaryLog', JSON.stringify(updated));
  };

  return (
    <DiaryContext.Provider value={{ diaryLog, addDiaryEntry, hasEntryForToday }}>
      {children}
    </DiaryContext.Provider>
  );
};

export const useDiary = () => {
  const ctx = useContext(DiaryContext);
  if (!ctx) throw new Error('useDiary must be used within DiaryProvider');
  return ctx;
}; 