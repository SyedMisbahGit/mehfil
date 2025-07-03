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

  // Mini-Usage Analytics
  const getUniqueCousins = () => {
    try {
      const cousins = JSON.parse(localStorage.getItem('mehfil-cousins') || '[]');
      return Array.isArray(cousins) ? cousins.length : 0;
    } catch {
      return 0;
    }
  };
  const getActiveToday = () => {
    try {
      const lastActive = JSON.parse(localStorage.getItem('mehfil-lastActive') || '{}');
      const today = new Date();
      let count = 0;
      Object.values(lastActive).forEach((ts: any) => {
        const d = new Date(ts);
        if (
          d.getFullYear() === today.getFullYear() &&
          d.getMonth() === today.getMonth() &&
          d.getDate() === today.getDate()
        ) {
          count++;
        }
      });
      return count;
    } catch {
      return 0;
    }
  };
  const getWhispersToday = () => {
    try {
      const data = JSON.parse(localStorage.getItem('mehfil-whispersToday') || '{}');
      const today = new Date();
      if (data.date === `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`) return data.count;
      return 0;
    } catch {
      return 0;
    }
  };

  const handleClear = () => {
    if (window.confirm('Wipe all local data and start over?')) {
      localStorage.clear();
      window.location.href = '/onboarding';
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-surface p-4">
      <div className="card w-full max-w-md">
        <h1 className="text-2xl font-display text-accent mb-6 text-center">Admin Dashboard</h1>

        {/* Feedback Button */}
        <div className="flex justify-center mb-4">
          <a
            href={`https://wa.me/919120159093?text=Mehfil%20feedback%3A%20${encodeURIComponent(userProfile?.preferredName || '')}%20(${encodeURIComponent(userProfile?.id || '')})%20-%20`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-primary rounded-lg font-medium shadow hover:bg-primary hover:text-accent transition-all"
          >
            💌 Send Feedback
          </a>
        </div>
        
        {/* Mini-Usage Analytics */}
        <div className="mb-6 grid grid-cols-3 gap-3 text-center">
          <div className="bg-soft/50 rounded-lg p-3">
            <div className="text-lg font-bold text-accent">{getUniqueCousins()}</div>
            <div className="text-xs text-text/70">Unique Cousins</div>
          </div>
          <div className="bg-soft/50 rounded-lg p-3">
            <div className="text-lg font-bold text-accent">{getActiveToday()}</div>
            <div className="text-xs text-text/70">Active Today</div>
          </div>
          <div className="bg-soft/50 rounded-lg p-3">
            <div className="text-lg font-bold text-accent">{getWhispersToday()}</div>
            <div className="text-xs text-text/70">Whispers Today</div>
          </div>
        </div>
        
        <div className="mb-6 p-4 bg-soft/50 rounded-lg shadow flex flex-col items-center">
          <div className="text-xs text-text/60 mb-1">Cousin ID</div>
          <div className="font-mono text-accent text-lg">{userProfile?.id || 'N/A'}</div>
          
          <div className="text-xs text-text/60 mt-4 mb-1">Naam</div>
          <div className="font-semibold text-text text-lg">{userProfile?.preferredName || 'N/A'}</div>
          
          <div className="text-xs text-text/60 mt-4 mb-1">Umar</div>
          <div className="font-semibold text-text">{userProfile?.age || 'N/A'} saal</div>
          
          <div className="text-xs text-text/60 mt-4 mb-1">Jins</div>
          <div className="font-semibold text-text capitalize">{userProfile?.gender || 'N/A'}</div>
        </div>
        
        <ul className="mb-6 grid grid-cols-3 gap-3 text-center">
          <li className="bg-soft/50 rounded-lg p-3">
            <div className="text-lg font-bold text-accent">{diaryLog.length}</div>
            <div className="text-xs text-text/70">Diary</div>
          </li>
          <li className="bg-soft/50 rounded-lg p-3">
            <div className="text-lg font-bold text-accent">{moodLog.length}</div>
            <div className="text-xs text-text/70">Mood</div>
          </li>
          <li className="bg-soft/50 rounded-lg p-3">
            <div className="text-lg font-bold text-accent">{getWhispersSentCount()}</div>
            <div className="text-xs text-text/70">Whispers</div>
          </li>
        </ul>
        
        <button
          onClick={handleClear}
          className="w-full py-3 bg-primary text-white rounded-lg hover:bg-accent transition-all font-medium"
        >
          Clear My Data
        </button>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
