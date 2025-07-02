import React, { createContext, useContext, useState, useEffect } from 'react';
import { mysteryClues } from '../data/mysteryClues';

export interface MysteryClue {
  id: string;
  clueText: string;
  targetId: string;
}

export interface TehqeeqatContextType {
  currentClue: MysteryClue | null;
  guesses: string[];
  setNextClue: () => void;
  submitGuess: (idGuess: string) => void;
}

const TehqeeqatContext = createContext<TehqeeqatContextType | undefined>(undefined);

function getTodayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function loadState() {
  const raw = localStorage.getItem('mehfil-tehqeeqat');
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export const TehqeeqatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentClue, setCurrentClue] = useState<MysteryClue | null>(null);
  const [guesses, setGuesses] = useState<string[]>([]);

  // Load state from localStorage on mount
  useEffect(() => {
    const state = loadState();
    const todayKey = getTodayKey();
    if (state && state[todayKey]) {
      setCurrentClue(state[todayKey].currentClue);
      setGuesses(state[todayKey].guesses || []);
    }
  }, []);

  // Persist state to localStorage
  useEffect(() => {
    const todayKey = getTodayKey();
    const state = loadState() || {};
    state[todayKey] = { currentClue, guesses };
    localStorage.setItem('mehfil-tehqeeqat', JSON.stringify(state));
  }, [currentClue, guesses]);

  // Pick a random cousin ID from inviteTokens
  function getRandomCousinId() {
    return crypto.randomUUID();
  }

  // Pick a random clue and assign a cousin
  const setNextClue = () => {
    const clue = mysteryClues[Math.floor(Math.random() * mysteryClues.length)];
    const targetId = getRandomCousinId();
    setCurrentClue({ id: clue.id, clueText: clue.template, targetId });
    setGuesses([]);
  };

  // Submit a guess
  const submitGuess = (idGuess: string) => {
    if (!currentClue) return;
    setGuesses(prev => [...prev, idGuess]);
    // No further logic here; UI will check if guess is correct
  };

  return (
    <TehqeeqatContext.Provider value={{ currentClue, guesses, setNextClue, submitGuess }}>
      {children}
    </TehqeeqatContext.Provider>
  );
};

export const useTehqeeqat = () => {
  const ctx = useContext(TehqeeqatContext);
  if (!ctx) throw new Error('useTehqeeqat must be used within TehqeeqatProvider');
  return ctx;
}; 