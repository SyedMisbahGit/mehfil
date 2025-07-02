import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';

interface UserPreference {
  userId: string;
  preferredFeatures: string[];
  activityScores: {
    qissaGoi: number;
    tehqeeqat: number;
    tasveerBujho: number;
    ludo: number;
    gupshup: number;
  };
  lastUpdated: number;
}

interface AIContextType {
  getPersonalizedRecommendation: () => string;
  trackFeatureUsage: (feature: string) => void;
  userPreferences: UserPreference | null;
}

const AIContext = createContext<AIContextType | undefined>(undefined);

export const AIProvider = ({ children }: { children: ReactNode }) => {
  const { userProfile } = useAuth();
  const [userPreferences, setUserPreferences] = useState<UserPreference | null>(null);
  
  useEffect(() => {
    if (!userProfile) return;
    
    // Load user preferences from localStorage
    const storedPreferences = localStorage.getItem(`mehfil-ai-prefs-${userProfile.id}`);
    if (storedPreferences) {
      setUserPreferences(JSON.parse(storedPreferences));
    } else {
      // Initialize with default preferences
      const initialPreferences: UserPreference = {
        userId: userProfile.id,
        preferredFeatures: [],
        activityScores: {
          qissaGoi: 0,
          tehqeeqat: 0,
          tasveerBujho: 0,
          ludo: 0,
          gupshup: 0
        },
        lastUpdated: Date.now()
      };
      
      setUserPreferences(initialPreferences);
      localStorage.setItem(`mehfil-ai-prefs-${userProfile.id}`, JSON.stringify(initialPreferences));
    }
  }, [userProfile]);
  
  const trackFeatureUsage = (feature: string) => {
    if (!userProfile || !userPreferences) return;
    
    // Update activity scores
    const updatedPreferences = { ...userPreferences };
    const featureKey = feature as keyof typeof updatedPreferences.activityScores;
    
    if (updatedPreferences.activityScores[featureKey] !== undefined) {
      updatedPreferences.activityScores[featureKey] += 1;
    }
    
    // Update preferred features list based on usage
    const scores = Object.entries(updatedPreferences.activityScores)
      .sort((a, b) => b[1] - a[1])
      .map(([key]) => key);
    
    updatedPreferences.preferredFeatures = scores.slice(0, 3);
    updatedPreferences.lastUpdated = Date.now();
    
    setUserPreferences(updatedPreferences);
    localStorage.setItem(`mehfil-ai-prefs-${userProfile.id}`, JSON.stringify(updatedPreferences));
    
    // Also update the global AI learning data
    updateGlobalAIData(userProfile.id, feature);
  };
  
  const updateGlobalAIData = (userId: string, feature: string) => {
    // Get existing data
    const aiData = JSON.parse(localStorage.getItem('mehfil-ai-global-data') || '{}');
    
    // Initialize feature data if it doesn't exist
    if (!aiData[feature]) {
      aiData[feature] = { totalUsage: 0, userCounts: {} };
    }
    
    // Update counts
    aiData[feature].totalUsage += 1;
    aiData[feature].userCounts[userId] = (aiData[feature].userCounts[userId] || 0) + 1;
    
    // Store updated data
    localStorage.setItem('mehfil-ai-global-data', JSON.stringify(aiData));
  };
  
  const getPersonalizedRecommendation = (): string => {
    if (!userPreferences) return 'qissaGoi'; // Default recommendation
    
    // Simple recommendation based on least used feature from the top 3 features
    const topFeatures = userPreferences.preferredFeatures;
    
    if (topFeatures.length === 0) {
      // If no preferences yet, recommend a random feature
      const allFeatures = ['qissaGoi', 'tehqeeqat', 'tasveerBujho', 'ludo', 'gupshup'];
      return allFeatures[Math.floor(Math.random() * allFeatures.length)];
    }
    
    // Return the least recently used top feature
    return topFeatures[topFeatures.length - 1];
  };
  
  return (
    <AIContext.Provider value={{ 
      getPersonalizedRecommendation,
      trackFeatureUsage,
      userPreferences
    }}>
      {children}
    </AIContext.Provider>
  );
};

export const useAI = () => {
  const context = useContext(AIContext);
  if (context === undefined) {
    throw new Error('useAI must be used within an AIProvider');
  }
  return context;
};
