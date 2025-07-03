import React, { useState } from 'react';
import { useTehqeeqat } from '../context/TehqeeqatContext';
import MysteryClueCard from './MysteryClueCard';
import GuessInput from './GuessInput';

const TehqeeqatGame: React.FC = () => {
  const {
    currentClue,
    setNextClue,
    submitGuess,
    hasGuessedToday,
    targetName,
    isSoloMode,
    guesses
  } = useTehqeeqat();
  const [feedback, setFeedback] = useState('');
  const [correct, setCorrect] = useState(false);
  const [clueRevealed, setClueRevealed] = useState(false);

  // Normalize for comparison
  function normalize(str: string) {
    return str.trim().toLowerCase();
  }

  const handleClueReveal = () => {
    setNextClue();
    setTimeout(() => setClueRevealed(true), 200); // slight delay for animation
  };

  const handleGuess = (guess: string) => {
    if (!currentClue || hasGuessedToday) return;
    submitGuess(guess);
    if (isSoloMode || normalize(guess) === normalize(targetName)) {
      setFeedback('✅ Sahi jawab!');
      setCorrect(true);
    } else {
      setFeedback('❌ Ghalat andāza!');
      setCorrect(false);
    }
  };

  // Onboarding state: no clue yet
  if (!currentClue) {
    return (
      <div className="flex flex-col items-center justify-center mt-12">
        <div className="bg-yellow-50 text-yellow-900 p-4 rounded-xl text-center text-base mb-4 max-w-md shadow">
          Har din Mehfil kisi aik cousin ko chhupata hai...<br />Kya aap andāza laga sakte hain kaun hai woh?
        </div>
        <button
          className="bg-accent text-white px-6 py-3 rounded-xl font-semibold shadow hover:opacity-90 transition text-lg"
          onClick={handleClueReveal}
        >
          🔍 Aaj ka clue lo
        </button>
      </div>
    );
  }

  // Clue reveal animation (shimmer)
  return (
    <div className="max-w-md mx-auto p-4 bg-white rounded shadow mt-8 flex flex-col items-center">
      <div className={`w-full transition-all duration-500 ${clueRevealed ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
        <MysteryClueCard clueText={currentClue.clueText} />
      </div>
      {/* Guess input or lockout */}
      {!hasGuessedToday ? (
        <GuessInput
          onGuess={handleGuess}
          disabled={correct}
          feedback={feedback}
          correct={correct}
          label="Apna andāza likhiye (e.g., Zaki bhai)"
        />
      ) : (
        <div className="w-full flex flex-col items-center mt-4">
          <div className="text-xs text-muted mb-2 text-center">
            Kal dubāra koshish kijiye! Aaj ka raaz parda-nashīn reh gaya hai.
          </div>
          {/* Show past guess */}
          {guesses.length > 0 && (
            <div className="bg-soft/70 rounded p-2 text-sm text-center w-full">
              <div className="mb-1 text-muted">Aapka andāza:</div>
              <div className="font-semibold text-accent">{guesses[0]}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TehqeeqatGame; 