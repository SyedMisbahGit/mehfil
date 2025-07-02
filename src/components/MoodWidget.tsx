import React from 'react';
import { useMood } from '../context/MoodContext';

const moods = [
  { label: 'Dil halka hai', value: 'light', icon: '🌤️' },
  { label: 'Yaad aa rahi hai', value: 'nostalgic', icon: '🕰️' },
  { label: 'Thakan mehsoos ho rahi hai', value: 'tired', icon: '😴' },
  { label: 'Dil behal raha hai', value: 'cheerful', icon: '😊' },
];

const MoodWidget: React.FC = () => {
  const { addMood } = useMood();

  return (
    <div className="flex flex-col items-center mb-6">
      <div className="mb-2 text-gray-700 font-medium">Tap your mood</div>
      <div className="flex gap-3">
        {moods.map(mood => (
          <button
            key={mood.value}
            onClick={() => addMood(mood.value as any)}
            className="flex flex-col items-center px-3 py-2 bg-amber-100 rounded-lg shadow hover:bg-amber-200 focus:outline-none"
            type="button"
          >
            <span className="text-2xl mb-1">{mood.icon}</span>
            <span className="text-xs text-gray-700">{mood.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default MoodWidget;

 