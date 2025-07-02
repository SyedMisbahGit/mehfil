import React, { useState } from 'react';
import { useDiary } from '../context/DiaryContext';

const DailyWhisper: React.FC = () => {
  const { addDiaryEntry, hasEntryForToday } = useDiary();
  const [text, setText] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    addDiaryEntry(text.trim());
    setText('');
    setSubmitted(true);
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