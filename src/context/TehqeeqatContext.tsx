import React, { createContext, useContext, useState, useEffect } from 'react';
import { mysteryClues } from '../data/mysteryClues';
import { useAuth } from './AuthContext';

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
  hasGuessedToday: boolean;
  targetName: string;
  isSoloMode: boolean;
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
  const { userProfile } = useAuth();
  const [currentClue, setCurrentClue] = useState<MysteryClue | null>(null);
  const [guesses, setGuesses] = useState<string[]>([]);
  const [targetName, setTargetName] = useState('');
  const [isSoloMode, setIsSoloMode] = useState(false);

  // Load state from localStorage on mount
  useEffect(() => {
    const state = loadState();
    const todayKey = getTodayKey();
    if (state && state[todayKey]) {
      setCurrentClue(state[todayKey].currentClue);
      setGuesses(state[todayKey].guesses || []);
      setTargetName(state[todayKey].targetName || '');
      setIsSoloMode(!!state[todayKey].isSoloMode);
    }
  }, []);

  // Persist state to localStorage
  useEffect(() => {
    const todayKey = getTodayKey();
    const state = loadState() || {};
    state[todayKey] = { currentClue, guesses, targetName, isSoloMode };
    localStorage.setItem('mehfil-tehqeeqat', JSON.stringify(state));
  }, [currentClue, guesses, targetName, isSoloMode]);

  // Helper: get all cousin IDs and names
  function getAllCousins() {
    let ids = [];
    try {
      ids = JSON.parse(localStorage.getItem('mehfil-cousins') || '[]');
    } catch {}
    // Try to get names for each id
    const profiles = ids.map((id: string) => {
      try {
        const rawProfile = localStorage.getItem('mehfil-userProfile');
        if (rawProfile) {
          const profile = JSON.parse(rawProfile);
          if (profile && profile.id === id) return profile;
        }
      } catch {}
      return { id, preferredName: id };
    });
    return profiles;
  }

  // Pick a random cousin (not self if possible)
  function pickTargetCousin() {
    const all = getAllCousins();
    if (!userProfile || all.length <= 1) {
      setIsSoloMode(true);
      setTargetName((userProfile && userProfile.preferredName) ? userProfile.preferredName : 'Aap');
      return userProfile && typeof userProfile.id === 'string' ? userProfile.id : '';
    }
    setIsSoloMode(false);
    // Pick random cousin (not self)
    const others = all.filter((c: { id: string }) => c.id !== userProfile?.id);
    const target = others[Math.floor(Math.random() * others.length)];
    setTargetName(target?.preferredName || 'Cousin');
    return target?.id || '';
  }

  // Pick a random clue and assign a cousin
  const setNextClue = () => {
    const clue = mysteryClues[Math.floor(Math.random() * mysteryClues.length)];
    const targetId = pickTargetCousin();
    setCurrentClue({ id: clue.id, clueText: clue.template, targetId });
    setGuesses([]);
  };

  // Submit a guess
  const submitGuess = (idGuess: string) => {
    if (!currentClue) return;
    if (guesses.length >= 1) return; // Only one guess per day
    setGuesses(prev => [...prev, idGuess]);
  };

  const hasGuessedToday = guesses.length > 0;

  return (
    <TehqeeqatContext.Provider value={{ currentClue, guesses, setNextClue, submitGuess, hasGuessedToday, targetName, isSoloMode }}>
      {children}
    </TehqeeqatContext.Provider>
  );
};

export const useTehqeeqat = () => {
  const ctx = useContext(TehqeeqatContext);
  if (!ctx) throw new Error('useTehqeeqat must be used within TehqeeqatProvider');
  return ctx;
}; 