import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export const SplashScreen = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');

  useEffect(() => {
    // Get user profile from localStorage
    const profile = localStorage.getItem('mehfil-userProfile');
    if (!profile) {
      navigate("/onboarding");
      return;
    }
    
    try {
      const userProfile = JSON.parse(profile);
      if (!userProfile.onboardingComplete) {
        navigate("/onboarding");
        return;
      }
      setUserName(userProfile.preferredName || '');
    } catch (error) {
      console.error('Error parsing user profile:', error);
      navigate("/onboarding");
      return;
    }

    // Navigate to home after 7 seconds
    const timer = setTimeout(() => {
      navigate('/home');
    }, 7000);

    return () => clearTimeout(timer);
  }, [navigate]);

  const handleProceed = () => {
    navigate('/home');
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center">
      <motion.div
        className="text-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <motion.h1
          className="text-4xl md:text-6xl font-display text-accent mb-4"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          Mehfil
        </motion.h1>
        <motion.p
          className="text-xl md:text-2xl text-text/80 font-medium"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          Mehfil mein khush āmdeed, {userName} 🌙
        </motion.p>
        <motion.div
          className="mt-8 text-text/60"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
        >
          <p className="text-sm">makhdoompur pariwaar</p>
        </motion.div>
        
        <motion.button
          onClick={handleProceed}
          className="mt-8 bg-primary text-white px-8 py-3 rounded-lg hover:bg-accent transition-all font-medium text-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 0.8 }}
        >
          Bismillah, shurū karein
        </motion.button>
      </motion.div>
    </div>
  );
};

export default SplashScreen; 