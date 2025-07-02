import React, { useState } from 'react';
import { useTehqeeqat } from '../context/TehqeeqatContext';
import MysteryClueCard from './MysteryClueCard';
import GuessInput from './GuessInput';

const TehqeeqatGame: React.FC = () => {
  const { currentClue, guesses, setNextClue, submitGuess } = useTehqeeqat();
  const [feedback, setFeedback] = useState('');
  const [correct, setCorrect] = useState(false);

  // Normalize for comparison
  function normalize(str: string) {
    return str.trim().toLowerCase();
  }

  const handleGuess = (guess: string) => {
    if (!currentClue) return;
    submitGuess(guess);
    if (normalize(guess) === normalize(currentClue.targetId)) {
      setFeedback('✨ Dil ki baat pakad li!');
      setCorrect(true);
    } else {
      setFeedback('🕊️ Shayad agle dafa.');
      setCorrect(false);
    }
  };

  if (!currentClue) {
    return (
      <div className="flex flex-col items-center justify-center mt-12">
        <button
          className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow font-bold text-lg"
          onClick={setNextClue}
        >
          🔍 Get Today's Clue
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-4 bg-white rounded shadow mt-8">
      <MysteryClueCard clueText={currentClue.clueText} />
      <GuessInput
        onGuess={handleGuess}
        disabled={correct}
        feedback={feedback}
        correct={correct}
      />
    </div>
  );
};

export default TehqeeqatGame; 