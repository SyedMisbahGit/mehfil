import React, { createContext, useContext, useEffect, useRef } from 'react';

// --- Types ---
interface WhisperContextType {
  triggerWhisper: (slotKey?: string) => void;
  resetWhispersToday: () => void;
  getTodaysWhisper: () => { text: string; vibe: string } | null;
}

const WhisperContext = createContext<WhisperContextType | undefined>(undefined);

// --- Config ---
const SLOTS = [
  { key: 'fajr', hour: 5, min: 15, vibe: 'Subah ki dua 🌤️' },
  { key: 'dhuhr', hour: 12, min: 0, vibe: 'Thoda hausla 💭' },
  { key: 'maghrib', hour: 18, min: 10, vibe: 'Shaam ki yaad 😴' },
];
const WHISPERS: { [mood: string]: string[] } = {
  default: [
    'Aaj ka din mubarak ho!',
    'Khud pe yakeen rakho.',
    'Mehfil aapke saath hai.',
    'Dil se dua hai aapke liye.',
  ],
  tired: [
    'Aaj aaram bhi zaroori hai. 😴',
    'Shaant raho, sab theek hoga.',
  ],
  happy: [
    'Khushi baant lo, Mehfil khush hai!',
    'Muskurate raho! 😊',
  ],
};

// --- Helpers ---
const getTodayKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
};

const getWhispersSent = (): { [slotKey: string]: boolean } => {
  const key = getTodayKey();
  const data = localStorage.getItem('mehfil-whispersSent');
  if (!data) return {};
  try {
    const parsed = JSON.parse(data) as { [date: string]: { [slotKey: string]: boolean } };
    return parsed[key] || {};
  } catch {
    return {};
  }
};

const setWhisperSent = (slotKey: string) => {
  const key = getTodayKey();
  let all: { [date: string]: { [slotKey: string]: boolean } } = {};
  try {
    all = JSON.parse(localStorage.getItem('mehfil-whispersSent') || '{}');
  } catch {}
  if (!all[key]) all[key] = {};
  all[key][slotKey] = true;
  localStorage.setItem('mehfil-whispersSent', JSON.stringify(all));
};

const resetWhispersToday = () => {
  const key = getTodayKey();
  let all: { [date: string]: { [slotKey: string]: boolean } } = {};
  try {
    all = JSON.parse(localStorage.getItem('mehfil-whispersSent') || '{}');
  } catch {}
  all[key] = {};
  localStorage.setItem('mehfil-whispersSent', JSON.stringify(all));
};

const isQuietHours = () => {
  const h = new Date().getHours();
  return h >= 23 || h < 5;
};

const getSilenceUntil = () => {
  const val = localStorage.getItem('mehfil-silenceUntil');
  if (!val) return 0;
  return parseInt(val, 10) || 0;
};

const isSilenceActive = () => {
  return Date.now() < getSilenceUntil();
};

// Stub: get today's mood (replace with MoodContext integration if available)
const getTodaysMood = () => {
  return localStorage.getItem('mehfil-todaysMood') || '';
};

const pickWhisper = (mood: string) => {
  if (mood && WHISPERS[mood]) {
    const arr = WHISPERS[mood];
    return arr[Math.floor(Math.random() * arr.length)];
  }
  // fallback to default
  const arr = WHISPERS.default;
  return arr[Math.floor(Math.random() * arr.length)];
};

const getTodaysWhisper = (): { text: string; vibe: string } | null => {
  const stored = localStorage.getItem('mehfil-todaysWhisper');
  if (!stored) return null;
  
  try {
    const data = JSON.parse(stored);
    const today = getTodayKey();
    if (data.date === today) {
      return { text: data.text, vibe: data.vibe };
    }
  } catch (error) {
    console.error('Error parsing today\'s whisper:', error);
  }
  
  return null;
};

const setTodaysWhisper = (text: string, vibe: string) => {
  const today = getTodayKey();
  const data = { date: today, text, vibe };
  localStorage.setItem('mehfil-todaysWhisper', JSON.stringify(data));
};

// --- Provider ---
export const WhisperProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Use number[] for browser setTimeout
  const timersRef = useRef<number[]>([]);

  // Schedules all slot timers on mount
  useEffect(() => {
    // Clear any previous timers
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];

    const now = new Date();
    const sent = getWhispersSent();

    SLOTS.forEach(slot => {
      // If already sent today, skip
      if (sent[slot.key]) return;

      // Compute time for today
      const slotTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), slot.hour, slot.min, 0, 0);
      // If slot time already passed, skip
      if (now > slotTime) return;

      const msUntil = slotTime.getTime() - now.getTime();
      const timer = window.setTimeout(() => {
        triggerWhisper(slot.key);
      }, msUntil);
      timersRef.current.push(timer);
    });
    // Cleanup on unmount
    return () => {
      timersRef.current.forEach(clearTimeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Core whisper trigger logic
  const triggerWhisper = (slotKey?: string) => {
    if (isSilenceActive()) return;
    if (isQuietHours()) return;
    const sent = getWhispersSent();
    if (slotKey && sent[slotKey]) return;
    // Mark as sent
    if (slotKey) setWhisperSent(slotKey);
    // Pick slot
    const slot = SLOTS.find(s => s.key === slotKey) || SLOTS[0];
    // Pick mood
    const mood = getTodaysMood();
    // Pick whisper
    const msg = pickWhisper(mood);
    // Store today's whisper
    setTodaysWhisper(msg, slot.vibe);
    // Show toast/modal (for now, alert)
    window.alert(`${slot.vibe}\n${msg}`);
  };

  const value: WhisperContextType = {
    triggerWhisper,
    resetWhispersToday,
    getTodaysWhisper,
  };

  return (
    <WhisperContext.Provider value={value}>
      {children}
    </WhisperContext.Provider>
  );
};

export const useWhisper = () => {
  const ctx = useContext(WhisperContext);
  if (!ctx) throw new Error('useWhisper must be used within WhisperProvider');
  return ctx;
}; 