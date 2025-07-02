import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Heartbeat } from '../types';
import { useAuth } from './AuthContext';

interface HeartbeatContextType {
  presences: Heartbeat[];
  updatePresence: () => void;
  activeUsers: number;
}

const HeartbeatContext = createContext<HeartbeatContextType | undefined>(undefined);

export const HeartbeatProvider = ({ children }: { children: ReactNode }) => {
  const { userProfile } = useAuth();
  const [presences, setPresences] = useState<Heartbeat[]>([]);
  const [activeUsers, setActiveUsers] = useState<number>(0);

  useEffect(() => {
    // Load existing heartbeats
    const storedHeartbeats = localStorage.getItem('mehfil-heartbeats');
    if (storedHeartbeats) {
      setPresences(JSON.parse(storedHeartbeats));
    }

    // Update presence on load if user exists
    if (userProfile) {
      updatePresence();
    }

    // Cleanup expired heartbeats periodically
    const interval = setInterval(() => {
      cleanupExpiredHeartbeats();
    }, 30000); // every 30 seconds

    return () => clearInterval(interval);
  }, [userProfile]);

  const updatePresence = () => {
    if (!userProfile) return;

    const now = Date.now();
    const newHeartbeat: Heartbeat = {
      userId: userProfile.id,
      timestamp: now
    };

    // Update or add the user's heartbeat
    const updated = presences.filter(p => p.userId !== userProfile.id);
    const newPresences = [...updated, newHeartbeat];
    
    setPresences(newPresences);
    localStorage.setItem('mehfil-heartbeats', JSON.stringify(newPresences));
    
    // Calculate active users (heartbeats in the last 10 minutes)
    calculateActiveUsers(newPresences);
  };

  const cleanupExpiredHeartbeats = () => {
    const now = Date.now();
    const tenMinutesAgo = now - 10 * 60 * 1000;
    
    const activeHeartbeats = presences.filter(p => p.timestamp > tenMinutesAgo);
    
    setPresences(activeHeartbeats);
    localStorage.setItem('mehfil-heartbeats', JSON.stringify(activeHeartbeats));
    
    // Recalculate active users
    calculateActiveUsers(activeHeartbeats);
  };

  const calculateActiveUsers = (heartbeats: Heartbeat[]) => {
    const now = Date.now();
    const tenMinutesAgo = now - 10 * 60 * 1000;
    const active = new Set(heartbeats
      .filter(p => p.timestamp > tenMinutesAgo)
      .map(p => p.userId)).size;
    
    setActiveUsers(active);
  };

  return (
    <HeartbeatContext.Provider value={{ 
      presences, 
      updatePresence,
      activeUsers
    }}>
      {children}
    </HeartbeatContext.Provider>
  );
};

export const useHeartbeat = () => {
  const context = useContext(HeartbeatContext);
  if (context === undefined) {
    throw new Error('useHeartbeat must be used within a HeartbeatProvider');
  }
  return context;
};
