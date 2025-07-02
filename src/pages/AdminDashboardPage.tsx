import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useDiary } from '../context/DiaryContext';
import { useMood } from '../context/MoodContext';

const AdminDashboardPage: React.FC = () => {
  const { userProfile } = useAuth();
  const { diaryLog } = useDiary();
  const { moodLog } = useMood();

  // Helper to count all sent whispers
  const getWhispersSentCount = () => {
    const data = localStorage.getItem('mehfil-whispersSent');
    if (!data) return 0;
    try {
      const parsed = JSON.parse(data);
      let count = 0;
      Object.values(parsed).forEach((day: any) => {
        count += Object.values(day).filter(Boolean).length;
      });
      return count;
    } catch {
      return 0;
    }
  };

  const handleClear = () => {
    if (window.confirm('Wipe all local data and start over?')) {
      localStorage.clear();
      window.location.href = '/invite-expired';
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 p-4">
      <div className="bg-white/90 rounded-xl shadow-lg p-6 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4 text-gray-800 text-center">Admin Dashboard</h1>
        <div className="mb-6 p-4 bg-blue-50 rounded shadow flex flex-col items-center">
          <div className="text-xs text-gray-500 mb-1">Cousin ID</div>
          <div className="font-mono text-blue-700 text-lg">{userProfile?.id || 'N/A'}</div>
          <div className="text-xs text-gray-500 mt-2 mb-1">Preferred Name</div>
          <div className="font-semibold text-blue-900">{userProfile?.preferredName || 'N/A'}</div>
        </div>
        <ul className="mb-6 grid grid-cols-3 gap-2 text-center">
          <li className="bg-amber-100 rounded p-2">
            <div className="text-lg font-bold">{diaryLog.length}</div>
            <div className="text-xs text-gray-600">Diary</div>
          </li>
          <li className="bg-amber-100 rounded p-2">
            <div className="text-lg font-bold">{moodLog.length}</div>
            <div className="text-xs text-gray-600">Mood</div>
          </li>
          <li className="bg-amber-100 rounded p-2">
            <div className="text-lg font-bold">{getWhispersSentCount()}</div>
            <div className="text-xs text-gray-600">Whispers</div>
          </li>
        </ul>
        <button
          onClick={handleClear}
          className="w-full py-2 bg-rose-500 text-white rounded hover:bg-rose-600 font-semibold mt-2"
        >
          Clear My Data
        </button>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
