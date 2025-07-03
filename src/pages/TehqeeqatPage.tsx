import { useEffect } from 'react';
import TehqeeqatGame from '../components/TehqeeqatGame';
import Navigation from '../components/Navigation';
import { TehqeeqatProvider } from '../context/TehqeeqatContext';

export const TehqeeqatPage = () => {
  useEffect(() => {
    document.title = 'Mehfil | तहक़ीक़ात';
  }, []);

  return (
    <TehqeeqatProvider>
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-rose-50">
        <TehqeeqatGame />
        <Navigation />
      </div>
    </TehqeeqatProvider>
  );
};

export default TehqeeqatPage;
