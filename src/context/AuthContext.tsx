import React, { createContext, useContext, useState, useEffect } from 'react';
import { CousinProfile } from '../types/types';

interface AuthContextType {
  cousinId: string | null;
  userProfile: CousinProfile | null;
  setUserProfile: (profile: CousinProfile) => void;
  logout: () => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cousinId, setCousinId] = useState<string | null>(() => {
    let id = localStorage.getItem('mehfil-cousinId');
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem('mehfil-cousinId', id);
    }
    return id;
  });
  const [userProfile, setUserProfileState] = useState<CousinProfile | null>(null);

  useEffect(() => {
    const storedProfile = localStorage.getItem('mehfil-userProfile');
    if (storedProfile) setUserProfileState(JSON.parse(storedProfile));
  }, []);

  const setUserProfile = (profile: CousinProfile) => {
    setUserProfileState(profile);
    setCousinId(profile.id);
    localStorage.setItem('mehfil-userProfile', JSON.stringify(profile));
    localStorage.setItem('mehfil-cousinId', profile.id);
  };

  const logout = () => {
    setCousinId(null);
    setUserProfileState(null);
    localStorage.removeItem('mehfil-cousinId');
    localStorage.removeItem('mehfil-userProfile');
  };

  // Check if user is admin (Misbah)
  const isAdmin = userProfile?.preferredName === "Misbah";

  return (
    <AuthContext.Provider value={{ cousinId, userProfile, setUserProfile, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
