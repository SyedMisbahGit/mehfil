import { useEffect } from 'react';
import LudoGame from '../components/LudoGame';
import Navigation from '../components/Navigation';

export const LudoGamePage = () => {
  useEffect(() => {
    document.title = 'Mehfil | Ludo';
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-rose-50">
      <LudoGame />
      <Navigation />
    </div>
  );
};

export default LudoGamePage;
