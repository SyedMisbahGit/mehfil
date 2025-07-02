import React from 'react';
import { useAuth } from '../context/AuthContext';
import MoodWidget from '../components/MoodWidget';
import DailyWhisper from '../components/DailyWhisper';
import Navigation from '../components/Navigation';

const HomePage: React.FC = () => {
  const { userProfile } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-rose-50 pb-20 flex flex-col items-center">
      <div className="w-full max-w-xl px-4 pt-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          {userProfile ? `Salaam, ${userProfile.preferredName}!` : 'Welcome to Mehfil'}
        </h1>
        <MoodWidget />
        <DailyWhisper />
      </div>
      <Navigation />
    </div>
  );
};

export default HomePage;
