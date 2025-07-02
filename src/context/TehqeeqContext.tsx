import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Tehqeeq } from '../types';
import { useAuth } from './AuthContext';

interface TehqeeqContextType {
  tehqeeqs: Tehqeeq[];
  askQuestion: (question: string) => void;
  answerQuestion: (tehqeeqId: string, answer: string) => void;
}

const TehqeeqContext = createContext<TehqeeqContextType | undefined>(undefined);

export const TehqeeqProvider = ({ children }: { children: ReactNode }) => {
  const { userProfile, cousinId } = useAuth();
  const [tehqeeqs, setTehqeeqs] = useState<Tehqeeq[]>([]);

  useEffect(() => {
    const storedTehqeeqs = localStorage.getItem('mehfil-tehqeeqs');
    if (storedTehqeeqs) {
      setTehqeeqs(JSON.parse(storedTehqeeqs));
    } else {
      // Initialize with sample data if empty
      const initialTehqeeqs: Tehqeeq[] = [
        {
          id: 'tehqeeq-1',
          question: 'हमारे दादा जी की सबसे प्यारी कविता कौनसी थी?',
          answers: [],
          timestamp: Date.now() - 86400000 * 2
        },
        {
          id: 'tehqeeq-2',
          question: 'क्या कोई याद रखता है वो रात जब हम सब छत पर तारे देखते थे?',
          answers: [],
          timestamp: Date.now() - 86400000
        }
      ];
      setTehqeeqs(initialTehqeeqs);
      localStorage.setItem('mehfil-tehqeeqs', JSON.stringify(initialTehqeeqs));
    }
  }, []);

  const saveTehqeeqs = (updatedTehqeeqs: Tehqeeq[]) => {
    setTehqeeqs(updatedTehqeeqs);
    localStorage.setItem('mehfil-tehqeeqs', JSON.stringify(updatedTehqeeqs));
  };

  const askQuestion = (question: string) => {
    if (!userProfile) return;

    const newTehqeeq: Tehqeeq = {
      id: `tehqeeq-${Date.now()}`,
      question,
      answers: [],
      timestamp: Date.now()
    };

    const updatedTehqeeqs = [newTehqeeq, ...tehqeeqs];
    saveTehqeeqs(updatedTehqeeqs);
  };

  const answerQuestion = (tehqeeqId: string, answer: string) => {
    if (!userProfile) return;

    const updatedTehqeeqs = tehqeeqs.map(t => {
      if (t.id === tehqeeqId) {
        // Check if user has already answered
        const userAlreadyAnswered = t.answers.some(a => a.authorId === (cousinId || ''));
        
        if (userAlreadyAnswered) {
          // Update existing answer
          return {
            ...t,
            answers: t.answers.map(a => 
              a.authorId === (cousinId || '') 
                ? { ...a, text: answer, timestamp: Date.now() }
                : a
            )
          };
        } else {
          // Add new answer
          return {
            ...t,
            answers: [
              ...t.answers,
              {
                authorId: cousinId || '',
                text: answer,
                timestamp: Date.now()
              }
            ]
          };
        }
      }
      return t;
    });

    saveTehqeeqs(updatedTehqeeqs);
  };

  return (
    <TehqeeqContext.Provider value={{ 
      tehqeeqs, 
      askQuestion, 
      answerQuestion 
    }}>
      {children}
    </TehqeeqContext.Provider>
  );
};

export const useTehqeeq = () => {
  const context = useContext(TehqeeqContext);
  if (context === undefined) {
    throw new Error('useTehqeeq must be used within a TehqeeqProvider');
  }
  return context;
};
