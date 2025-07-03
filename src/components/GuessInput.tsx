import React, { useState } from 'react';

interface GuessInputProps {
  onGuess: (guess: string) => void;
  disabled: boolean;
  feedback: string;
  correct: boolean;
  label?: string;
}

const GuessInput: React.FC<GuessInputProps> = ({ onGuess, disabled, feedback, correct, label }) => {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || disabled) return;
    onGuess(input.trim());
    setInput('');
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      {label && <label className="text-sm text-muted mb-1">{label}</label>}
      <input
        type="text"
        className="border rounded p-2"
        value={input}
        onChange={e => setInput(e.target.value)}
        disabled={disabled || correct}
        placeholder={correct ? 'Sahi jawab!' : 'Cousin ka naam ya ID...'}
      />
      <button
        type="submit"
        className="bg-blue-600 text-white rounded px-4 py-2 disabled:opacity-50"
        disabled={disabled || correct || !input.trim()}
      >
        Submit Guess
      </button>
      {feedback && (
        <div className={`mt-2 text-center text-lg ${correct ? 'text-green-700' : 'text-red-600'}`}>
          {feedback}
        </div>
      )}
    </form>
  );
};

export default GuessInput; 