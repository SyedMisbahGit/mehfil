import React, { useState, useEffect } from 'react';
import { useQissa } from '../context/QissaContext';
import { useAuth } from '../context/AuthContext';
import QissaComposer from '../components/QissaComposer';
import QissaParchment from '../components/QissaParchment';

const QissaPage: React.FC = () => {
  const { active, lines, startRound } = useQissa();
  const { cousinId } = useAuth();
  const [showParchment, setShowParchment] = useState(false);
  const [finalStory, setFinalStory] = useState('');

  // Show parchment when round just finished (lines.length === 5 and !active)
  useEffect(() => {
    if (!active && lines.length === 0) {
      // Try to get the latest story from archive
      const archiveRaw = localStorage.getItem('mehfil-qissaArchive');
      if (archiveRaw) {
        const archive = JSON.parse(archiveRaw);
        if (archive.length > 0) {
          setFinalStory(archive[archive.length - 1].story);
          setShowParchment(true);
        }
      }
    }
  }, [active, lines]);

  const handleStart = () => {
    if (cousinId) {
      startRound([cousinId]);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      {!active ? (
        <>
          <div className="bg-yellow-100 p-4 rounded-xl text-gray-800 mb-4 text-center text-sm max-w-md">
            Mehfil mein milkar ek qissa likhte hain. Har cousin ek line likhega — jab uski baari ho. Shuru karne ke liye neeche button dabao. 💭
          </div>
          <button
            className="bg-accent bg-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition mb-4"
            onClick={handleStart}
            disabled={active}
          >
            ✨ Qissa Shuru Karein
          </button>
        </>
      ) : (
        <>
          <div className="text-xs text-gray-500 mb-2 text-center">
            Qissa chal raha hai – har cousin apni baari pe ek line likhega.
          </div>
          <QissaComposer />
        </>
      )}
      <QissaParchment
        open={showParchment}
        story={finalStory}
        onClose={() => setShowParchment(false)}
      />
    </div>
  );
};

export default QissaPage; 