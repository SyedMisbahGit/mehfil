import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { MoodProvider } from './context/MoodContext';
import { DiaryProvider } from './context/DiaryContext';
import { WhisperProvider } from './context/WhisperContext';
import { Toaster } from 'react-hot-toast';

import HomePage from './pages/HomePage';
import TehqeeqatPage from './pages/TehqeeqatPage';
import AnonymousFeedPage from './pages/AnonymousFeedPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import SplashScreen from './components/SplashScreen';

const QissaPage = React.lazy(() => import('./pages/QissaPage'));
const GamesPage = React.lazy(() => import('./pages/GamesPage'));
import Onboarding from './components/Onboarding';

function RequireProfile({ children }: { children: React.ReactNode }) {
  const profile = localStorage.getItem('mehfil-userProfile');
  if (!profile) {
    return <Navigate to="/onboarding" replace />;
  }
  return <>{children}</>;
}

const App: React.FC = () => {
  const hasProfile = !!localStorage.getItem('mehfil-userProfile');
  
  return (
    <>
      <Toaster />
      <AuthProvider>
        <MoodProvider>
          <DiaryProvider>
            <WhisperProvider>
              <Router>
                <React.Suspense fallback={<div>Loading...</div>}>
                  <Routes>
                    <Route path="/onboarding" element={<Onboarding />} />
                    <Route path="/welcome" element={<SplashScreen />} />
                    <Route
                      path="/"
                      element={<Navigate to={hasProfile ? "/home" : "/onboarding"} replace />} />
                    <Route
                      path="*"
                      element={
                        <RequireProfile>
                          <Routes>
                            <Route path="/home" element={<HomePage />} />
                            <Route path="/qissa" element={<QissaPage />} />
                            <Route path="/tehqeeqat" element={<TehqeeqatPage />} />
                            <Route path="/gupshup" element={<AnonymousFeedPage />} />
                            <Route path="/games" element={<GamesPage />} />
                            <Route path="/admin" element={<AdminDashboardPage />} />
                            <Route path="*" element={<Navigate to="/home" replace />} />
                          </Routes>
                        </RequireProfile>
                      }
                    />
                  </Routes>
                </React.Suspense>
              </Router>
            </WhisperProvider>
          </DiaryProvider>
        </MoodProvider>
      </AuthProvider>
    </>
  );
};

export default App;
