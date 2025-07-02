import { useEffect } from 'react';
import QissaGoi from '../components/QissaGoi';
import Navigation from '../components/Navigation';

export const QissaGoiPage = () => {
  useEffect(() => {
    document.title = 'Mehfil | क़िस्सा गोई';
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-rose-50">
      <QissaGoi />
      <Navigation />
    </div>
  );
};

export default QissaGoiPage;
