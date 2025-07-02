import { useEffect } from 'react';
import AnonymousFeed from '../components/AnonymousFeed';
import Navigation from '../components/Navigation';

export const AnonymousFeedPage = () => {
  useEffect(() => {
    document.title = 'Mehfil | Gupshup';
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-rose-50">
      <AnonymousFeed />
      <Navigation />
    </div>
  );
};

export default AnonymousFeedPage;
