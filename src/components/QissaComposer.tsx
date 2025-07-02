import React, { useState, useMemo } from 'react';
import { useQissa } from '../context/QissaContext';
import { useAuth } from '../context/AuthContext';
import { qissaPrompts } from '../data/qissaPrompts';

const QissaComposer: React.FC = () => {
  const { active, participants, lines, addLine } = useQissa();
  const { cousinId, userProfile } = useAuth();
  const [input, setInput] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // Pick a random prompt on mount
  const prompt = useMemo(() => {
    return qissaPrompts[Math.floor(Math.random() * qissaPrompts.length)];
  }, []);

  // Whose turn is it?
  const currentTurnId = participants.length > 0 ? participants[lines.length % participants.length] : null;
  const isMyTurn = cousinId && currentTurnId === cousinId;

  // Has this user already submitted?
  const hasSubmitted = lines.some(l => l.authorId === cousinId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !isMyTurn || hasSubmitted) return;
    addLine(input.trim());
    setInput('');
    setSubmitted(true);
  };

  if (!active) return <div>Qissa round is not active.</div>;

  return (
    <div className="max-w-md mx-auto p-4 bg-white rounded shadow">
      <div className="mb-4 text-lg font-semibold text-green-700">{prompt}</div>
      <ul className="mb-4 space-y-2">
        {lines.map((line, idx) => (
          <li key={line.id} className="bg-gray-100 rounded px-2 py-1 text-sm">
            <span className="font-mono text-gray-500">Cousin {idx + 1}:</span> {line.text}
          </li>
        ))}
      </ul>
      {lines.length < 5 ? (
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
          <textarea
            className="border rounded p-2"
            maxLength={90}
            value={input}
            onChange={e => setInput(e.target.value)}
            disabled={!isMyTurn || hasSubmitted || submitted}
            placeholder={isMyTurn ? 'Apni line likhiye...' : 'Dusre cousin ka intezaar...'}
            rows={2}
          />
          <button
            type="submit"
            className="bg-green-600 text-white rounded px-4 py-2 disabled:opacity-50"
            disabled={!isMyTurn || hasSubmitted || submitted || !input.trim()}
          >
            Add Line
          </button>
        </form>
      ) : (
        <div className="text-center text-green-700 font-semibold mt-4">Qissa complete! Dekhiye final story...</div>
      )}
    </div>
  );
};

export default QissaComposer; 