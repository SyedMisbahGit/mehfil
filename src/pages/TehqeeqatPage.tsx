import { useEffect } from 'react';
import TehqeeqatGame from '../components/TehqeeqatGame';
import Navigation from '../components/Navigation';

export const TehqeeqatPage = () => {
  useEffect(() => {
    document.title = 'Mehfil | तहक़ीक़ात';
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-rose-50">
      <TehqeeqatGame />
      <Navigation />
    </div>
  );
};

export default TehqeeqatPage;
