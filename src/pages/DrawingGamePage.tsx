import { useEffect } from 'react';
import DrawingGame from '../components/DrawingGame';
import Navigation from '../components/Navigation';

export const DrawingGamePage = () => {
  useEffect(() => {
    document.title = 'Mehfil | Tasveer Bujho';
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-rose-50">
      <DrawingGame />
      <Navigation />
    </div>
  );
};

export default DrawingGamePage;
