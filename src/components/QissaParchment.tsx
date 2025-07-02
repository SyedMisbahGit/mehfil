import React from 'react';

interface QissaParchmentProps {
  open: boolean;
  story: string;
  onClose: () => void;
}

const QissaParchment: React.FC<QissaParchmentProps> = ({ open, story, onClose }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg max-w-lg w-full p-6 relative">
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-xl"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
        <div className="text-2xl font-serif mb-4 text-center">Qissa Parchment</div>
        <div className="mb-6 text-lg text-gray-800 whitespace-pre-line text-center">{story}</div>
        <div className="mt-6 text-center text-sm text-gray-500">
          Crafted from the hidden words of a few hearts.
        </div>
      </div>
    </div>
  );
};

export default QissaParchment; 