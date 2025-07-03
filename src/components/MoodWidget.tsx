import React from 'react';
import { useMood } from '../context/MoodContext';

const moods = [
  { label: 'Dil halka hai', value: 'light', icon: '🌤️' },
  { label: 'Yaad aa rahi hai', value: 'nostalgic', icon: '🕰️' },
  { label: 'Thakan mehsoos ho rahi hai', value: 'tired', icon: '😴' },
  { label: 'Dil behal raha hai', value: 'cheerful', icon: '😊' },
];

const MoodWidget: React.FC = () => {
  const { addMood, todayMood } = useMood();

  return (
    <div className="flex flex-col items-center mb-6">
      <div className="mb-2 text-text font-medium">Tap your mood</div>
      <div className="flex gap-3">
        {moods.map(mood => {
          const isSelected = todayMood?.mood === mood.value;
          return (
            <button
              key={mood.value}
              onClick={() => addMood(mood.value as any)}
              className={`flex flex-col items-center px-3 py-2 rounded-lg shadow focus:outline-none transition-all ${
                isSelected 
                  ? 'bg-accent text-white' 
                  : 'bg-soft hover:bg-soft/80 text-text'
              }`}
              type="button"
            >
              <span className="text-2xl mb-1">{mood.icon}</span>
              <span className="text-xs">{mood.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MoodWidget;

 