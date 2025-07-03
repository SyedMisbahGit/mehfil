import React, { useState, useEffect } from 'react';
import { useDiary } from '../context/DiaryContext';

const getTodayKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
};

const DailyWhisper: React.FC = () => {
  const { addDiaryEntry, hasEntryForToday } = useDiary();
  const [text, setText] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // Reset whispersToday if date has changed
  useEffect(() => {
    const today = getTodayKey();
    const data = localStorage.getItem('mehfil-whispersToday');
    if (data) {
      try {
        const parsed = JSON.parse(data);
        if (parsed.date !== today) {
          localStorage.setItem('mehfil-whispersToday', JSON.stringify({ date: today, count: 0 }));
        }
      } catch {
        localStorage.setItem('mehfil-whispersToday', JSON.stringify({ date: today, count: 0 }));
      }
    } else {
      localStorage.setItem('mehfil-whispersToday', JSON.stringify({ date: today, count: 0 }));
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    addDiaryEntry(text.trim());
    setText('');
    setSubmitted(true);
    // Increment whispersToday
    const today = getTodayKey();
    let data = { date: today, count: 0 };
    try {
      data = JSON.parse(localStorage.getItem('mehfil-whispersToday') || '') || data;
    } catch {}
    if (data.date !== today) {
      data = { date: today, count: 0 };
    }
    data.count += 1;
    localStorage.setItem('mehfil-whispersToday', JSON.stringify(data));
  };

  if (hasEntryForToday || submitted) {
    return <div className="mb-6 text-green-700 text-center">You have already written your whisper for today. 🌱</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="mb-6 flex flex-col items-center">
      <label className="mb-2 text-gray-700 font-medium">Write your whisper (1 per day)</label>
      <div className="flex gap-2 w-full max-w-md">
        <input
          type="text"
          value={text}
          onChange={e => setText(e.target.value)}
          className="flex-1 px-3 py-2 border rounded focus:outline-none"
          placeholder="Aj Dadi ki yaad ayi."
          maxLength={100}
        />
        <button
          type="submit"
          className="px-4 py-2 bg-amber-500 text-white rounded hover:bg-amber-600 font-semibold"
          disabled={!text.trim()}
        >
          Save
        </button>
      </div>
    </form>
  );
};

export default DailyWhisper; 