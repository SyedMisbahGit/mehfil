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
        <button
          className="bg-green-600 text-white px-6 py-3 rounded-lg shadow font-bold text-lg mt-8"
          onClick={handleStart}
          disabled={active}
        >
          🌱 Start Qissa Goi
        </button>
      ) : (
        <QissaComposer />
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