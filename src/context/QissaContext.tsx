import { createContext, useContext, useState, useEffect } from 'react';
import { Qissa, QissaLine, QissaTurn } from '../types';
import { useAuth } from './AuthContext';
import { useHeartbeat } from './HeartbeatContext';

// Types
export interface QissaContextType {
  qissas: Qissa[];
  activeQissa: Qissa | null;
  addLine: (text: string) => void;
  startNewQissa: (title: string) => void;
  completeQissa: (qissaId: string) => void;
  currentTurn: QissaTurn | null;
  isMyTurn: boolean;
  timeRemaining: number;
  joinActiveQissa: () => void;
  qissaNotification: { isNew: boolean; title: string } | null;
  dismissNotification: () => void;
  participants: string[];
  active: boolean;
  lines: QissaLine[];
  startRound: (participants: string[]) => void;
  finishRound: () => void;
}

const QissaContext = createContext<QissaContextType | undefined>(undefined);

// Archive type for finished stories
interface QissaArchiveEntry {
  id: string;
  createdAt: number;
  participantIds: string[];
  story: string;
}

function loadQissaRound() {
  const raw = localStorage.getItem('mehfil-qissaActive');
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
function loadQissaArchive(): QissaArchiveEntry[] {
  const raw = localStorage.getItem('mehfil-qissaArchive');
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export const QissaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { userProfile } = useAuth();
  const { activeUsers } = useHeartbeat();
  const [qissas, setQissas] = useState<Qissa[]>([]);
  const [activeQissa, setActiveQissa] = useState<Qissa | null>(null);
  const [currentTurn, setCurrentTurn] = useState<QissaTurn | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(30);
  const [participants, setParticipants] = useState<string[]>([]);
  const [qissaNotification, setQissaNotification] = useState<{ isNew: boolean; title: string } | null>(null);
  const [active, setActive] = useState(false);
  const [lines, setLines] = useState<QissaLine[]>([]);
  const [roundStart, setRoundStart] = useState<number | null>(null);

  useEffect(() => {
    const storedQissas = localStorage.getItem('mehfil-qissas');
    if (storedQissas) {
      const parsedQissas = JSON.parse(storedQissas);
      setQissas(parsedQissas);
      
      // Find the most recent uncompleted qissa
      const uncompleted = parsedQissas.find((q: Qissa) => !q.completed);
      setActiveQissa(uncompleted || null);
      
      // Load turn data if it exists
      const storedTurn = localStorage.getItem('mehfil-current-turn');
      if (storedTurn && uncompleted) {
        const parsedTurn = JSON.parse(storedTurn);
        setCurrentTurn(parsedTurn);
        
        // Load participants
        const storedParticipants = localStorage.getItem('mehfil-participants');
        if (storedParticipants) {
          setParticipants(JSON.parse(storedParticipants));
        }
      }
    } else {
      // Initialize with sample data if empty
      const initialQissa: Qissa = {
        id: 'initial-qissa',
        title: 'वो रात जो चाँदनी थी',
        lines: [
          {
            id: 'line-1',
            text: 'वो रात जो चाँदनी थी, हम दोनों थे अकेले',
            timestamp: Date.now() - 86400000,
            authorId: 'ancestor'
          }
        ],
        timestamp: Date.now() - 86400000,
        completed: false
      };
      setQissas([initialQissa]);
      setActiveQissa(initialQissa);
      localStorage.setItem('mehfil-qissas', JSON.stringify([initialQissa]));
    }
    
    // Check for new qissa notifications
    const notification = localStorage.getItem('mehfil-qissa-notification');
    if (notification) {
      setQissaNotification(JSON.parse(notification));
    }
  }, []);
  
  // Check for turn updates every 2 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (activeQissa) {
        const storedTurn = localStorage.getItem('mehfil-current-turn');
        if (storedTurn) {
          const parsedTurn = JSON.parse(storedTurn);
          setCurrentTurn(parsedTurn);
          
          // Update time remaining
          if (parsedTurn) {
            const elapsed = Math.floor((Date.now() - parsedTurn.startTime) / 1000);
            const remaining = Math.max(0, 30 - elapsed);
            setTimeRemaining(remaining);
            
            // Auto-skip turn if time runs out
            if (remaining === 0 && parsedTurn.userId === userProfile?.id) {
              nextTurn();
            }
          }
        }
        
        // Check for participants updates
        const storedParticipants = localStorage.getItem('mehfil-participants');
        if (storedParticipants) {
          setParticipants(JSON.parse(storedParticipants));
        }
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [activeQissa, userProfile]);

  // Load round from localStorage on mount
  useEffect(() => {
    const round = loadQissaRound();
    if (round) {
      setActive(round.active);
      setParticipants(round.participants);
      setLines(round.lines);
      setRoundStart(round.roundStart || null);
    }
  }, []);

  // Persist round to localStorage
  useEffect(() => {
    if (active) {
      localStorage.setItem(
        'mehfil-qissaActive',
        JSON.stringify({ active, participants, lines, roundStart })
      );
    } else {
      localStorage.removeItem('mehfil-qissaActive');
    }
  }, [active, participants, lines, roundStart]);

  const saveQissas = (updatedQissas: Qissa[]) => {
    setQissas(updatedQissas);
    localStorage.setItem('mehfil-qissas', JSON.stringify(updatedQissas));
  };
  
  const nextTurn = () => {
    if (!activeQissa || !userProfile || participants.length < 2) return;
    
    // Find next participant (circular)
    const currentIndex = participants.findIndex(id => id === currentTurn?.userId);
    const nextIndex = (currentIndex + 1) % participants.length;
    const nextUserId = participants[nextIndex];
    
    const newTurn: QissaTurn = {
      qissaId: activeQissa.id,
      userId: nextUserId,
      startTime: Date.now()
    };
    
    setCurrentTurn(newTurn);
    localStorage.setItem('mehfil-current-turn', JSON.stringify(newTurn));
    setTimeRemaining(30);
  };
  
  const dismissNotification = () => {
    setQissaNotification(null);
    localStorage.removeItem('mehfil-qissa-notification');
  };
  
  const joinActiveQissa = () => {
    if (!activeQissa || !userProfile) return;
    
    // Add user to participants if not already there
    if (!participants.includes(userProfile.id)) {
      const newParticipants = [...participants, userProfile.id];
      setParticipants(newParticipants);
      localStorage.setItem('mehfil-participants', JSON.stringify(newParticipants));
      
      // If this is the second participant, start the first turn
      if (newParticipants.length === 2) {
        const firstTurn: QissaTurn = {
          qissaId: activeQissa.id,
          userId: newParticipants[0], // First person who joined goes first
          startTime: Date.now()
        };
        
        setCurrentTurn(firstTurn);
        localStorage.setItem('mehfil-current-turn', JSON.stringify(firstTurn));
      }
    }
    
    // Dismiss notification if it exists
    dismissNotification();
  };
  
  // Computed property to check if it's the current user's turn
  const isMyTurn = !!userProfile && !!currentTurn && currentTurn.userId === userProfile.id;

  const addLine = (text: string) => {
    if (!active || !participants.length) return;
    // Find current user (simulate with first participant for now)
    const authorId = participants[lines.length % participants.length];
    const newLine: QissaLine = {
      id: `line-${Date.now()}`,
      authorId,
      text: text.slice(0, 90),
      timestamp: Date.now()
    };
    const updatedLines = [...lines, newLine];
    setLines(updatedLines);
    // If 5 lines, finish round
    if (updatedLines.length === 5) {
      finishRound(updatedLines);
    }
  };

  const startNewQissa = (title: string) => {
    if (!userProfile) return;
    
    // Check if enough users are online (at least 2)
    if (activeUsers < 2) {
      alert("Kam se kam do log hone chahiye Qissa Goi ke liye. Intezaar kijiye jab tak doosre aayein.");
      return;
    }

    // First complete any active qissa
    if (activeQissa && !activeQissa.completed) {
      completeQissa(activeQissa.id);
    }

    const newQissa: Qissa = {
      id: `qissa-${Date.now()}`,
      title,
      lines: [],
      timestamp: Date.now(),
      completed: false
    };

    const updatedQissas = [newQissa, ...qissas];
    setActiveQissa(newQissa);
    saveQissas(updatedQissas);
    
    // Add current user as first participant
    const newParticipants = [userProfile.id];
    setParticipants(newParticipants);
    localStorage.setItem('mehfil-participants', JSON.stringify(newParticipants));
    
    // Create a notification for other users
    const notification = { isNew: true, title };
    localStorage.setItem('mehfil-qissa-notification', JSON.stringify(notification));
    
    // No turn yet until someone else joins
    setCurrentTurn(null);
    localStorage.removeItem('mehfil-current-turn');
  };

  const completeQissa = (qissaId: string) => {
    const updatedQissas = qissas.map(q => 
      q.id === qissaId ? { ...q, completed: true } : q
    );

    // If we're completing the active qissa, set activeQissa to null
    if (activeQissa && activeQissa.id === qissaId) {
      setActiveQissa(null);
      
      // Clear turn and participants data
      setCurrentTurn(null);
      setParticipants([]);
      localStorage.removeItem('mehfil-current-turn');
      localStorage.removeItem('mehfil-participants');
    }

    saveQissas(updatedQissas);
  };

  const startRound = (p: string[]) => {
    // Auto-fallback: if no participants, use current user for solo demo
    let participantsList = p;
    if ((!p || p.length === 0) && userProfile) {
      participantsList = [userProfile.id];
    }
    setActive(true);
    setParticipants(participantsList);
    setLines([]);
    setRoundStart(Date.now());
    localStorage.setItem(
      'mehfil-qissaActive',
      JSON.stringify({ active: true, participants: participantsList, lines: [], roundStart: Date.now() })
    );
  };

  const finishRound = (finalLines?: QissaLine[]) => {
    const storyLines = finalLines || lines;
    if (!active || !storyLines.length) return;
    const story = storyLines.map(l => l.text.trim()).join(' ');
    const archiveEntry: QissaArchiveEntry = {
      id: `qissa-${Date.now()}`,
      createdAt: Date.now(),
      participantIds: participants,
      story
    };
    // Save to archive
    const archive = loadQissaArchive();
    archive.push(archiveEntry);
    localStorage.setItem('mehfil-qissaArchive', JSON.stringify(archive));
    // Clear round
    setActive(false);
    setParticipants([]);
    setLines([]);
    setRoundStart(null);
    localStorage.removeItem('mehfil-qissaActive');
  };

  return (
    <QissaContext.Provider value={{ 
      qissas, 
      activeQissa, 
      addLine, 
      startNewQissa, 
      completeQissa,
      currentTurn,
      isMyTurn,
      timeRemaining,
      joinActiveQissa,
      qissaNotification,
      dismissNotification,
      participants,
      active,
      lines,
      startRound,
      finishRound
    }}>
      {children}
    </QissaContext.Provider>
  );
};

export const useQissa = () => {
  const context = useContext(QissaContext);
  if (context === undefined) {
    throw new Error('useQissa must be used within a QissaProvider');
  }
  return context;
};
