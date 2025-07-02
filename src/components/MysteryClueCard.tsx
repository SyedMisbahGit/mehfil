import React from 'react';

interface MysteryClueCardProps {
  clueText: string;
}

const MysteryClueCard: React.FC<MysteryClueCardProps> = ({ clueText }) => {
  return (
    <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 rounded mb-4 text-lg font-semibold">
      {clueText}
    </div>
  );
};

export default MysteryClueCard; 