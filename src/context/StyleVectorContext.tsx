import React, { createContext, useContext, useEffect, useRef, useState } from 'react';

interface WordFreqEntry {
  count: number;
  lastUsed: number;
}

interface StyleVector {
  totalSentences: number;
  totalChars: number;
  totalEmojis: number;
  wordFreq: { [word: string]: WordFreqEntry };
}

interface StyleVectorContextType {
  styleVector: StyleVector;
  updateStyleVector: (text: string) => void;
  topWords: string[];
}

const defaultStyleVector: StyleVector = {
  totalSentences: 0,
  totalChars: 0,
  totalEmojis: 0,
  wordFreq: {},
};

const StyleVectorContext = createContext<StyleVectorContextType | undefined>(undefined);

const STYLE_VECTOR_KEY = 'mehfil-styleVector';
const MAX_WORDS = 20;
const WORD_EXPIRY_MS = 7 * 86400000; // 7 days

function countEmojis(str: string) {
  // Simple emoji regex
  return (str.match(/[\p{Emoji}]/gu) || []).length;
}

function cleanWord(word: string) {
  return word.replace(/[.,?!;:"'()\[\]{}]/g, '').toLowerCase();
}

function getNow() {
  return Date.now();
}

function pruneWordFreq(wordFreq: { [word: string]: WordFreqEntry }): { [word: string]: WordFreqEntry } {
  const now = getNow();
  // Remove words not used in 7 days
  let entries = Object.entries(wordFreq).filter(([, v]) => now - v.lastUsed < WORD_EXPIRY_MS);
  // Sort by count desc, then lastUsed desc
  entries = entries.sort((a, b) => b[1].count - a[1].count || b[1].lastUsed - a[1].lastUsed);
  // Keep top 20
  return Object.fromEntries(entries.slice(0, MAX_WORDS));
}

export const StyleVectorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [styleVector, setStyleVector] = useState<StyleVector>(() => {
    const raw = localStorage.getItem(STYLE_VECTOR_KEY);
    if (raw) {
      try {
        return { ...defaultStyleVector, ...JSON.parse(raw) };
      } catch {}
    }
    return { ...defaultStyleVector };
  });

  // Prune on mount and every 6 hours
  useEffect(() => {
    const prune = () => {
      setStyleVector(prev => {
        const pruned = { ...prev, wordFreq: pruneWordFreq(prev.wordFreq) };
        localStorage.setItem(STYLE_VECTOR_KEY, JSON.stringify(pruned));
        return pruned;
      });
    };
    prune();
    const interval = setInterval(prune, 6 * 3600 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Update localStorage on change
  useEffect(() => {
    localStorage.setItem(STYLE_VECTOR_KEY, JSON.stringify(styleVector));
  }, [styleVector]);

  const updateStyleVector = (text: string) => {
    const chars = text.length;
    const emojis = countEmojis(text);
    const words = text
      .split(/\s+/)
      .map(cleanWord)
      .filter(Boolean);
    setStyleVector(prev => {
      const now = getNow();
      const wordFreq = { ...prev.wordFreq };
      words.forEach(word => {
        if (!wordFreq[word]) wordFreq[word] = { count: 0, lastUsed: now };
        wordFreq[word].count += 1;
        wordFreq[word].lastUsed = now;
      });
      return {
        totalSentences: prev.totalSentences + 1,
        totalChars: prev.totalChars + chars,
        totalEmojis: prev.totalEmojis + emojis,
        wordFreq,
      };
    });
  };

  // Compute top words
  const topWords = Object.entries(styleVector.wordFreq)
    .sort((a, b) => b[1].count - a[1].count || b[1].lastUsed - a[1].lastUsed)
    .slice(0, 3)
    .map(([word]) => word);

  const value: StyleVectorContextType = {
    styleVector,
    updateStyleVector,
    topWords,
  };

  return (
    <StyleVectorContext.Provider value={value}>
      {children}
    </StyleVectorContext.Provider>
  );
};

export const useStyleVector = () => {
  const ctx = useContext(StyleVectorContext);
  if (!ctx) throw new Error('useStyleVector must be used within StyleVectorProvider');
  return ctx;
}; 