import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Prompt } from '../types';

interface PromptContextType {
  prompts: Prompt[];
  currentPrompt: Prompt | null;
  refreshPrompt: () => void;
  markPromptUsed: (promptId: string) => void;
}

const PromptContext = createContext<PromptContextType | undefined>(undefined);

export const PromptProvider = ({ children }: { children: ReactNode }) => {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [currentPrompt, setCurrentPrompt] = useState<Prompt | null>(null);

  // Initial prompts
  const initialPrompts: Prompt[] = [
    { id: 'p1', text: 'अगर बारिश गिरे तो...', used: false },
    { id: 'p2', text: 'वो पुरानी हवेली की यादें...', used: false },
    { id: 'p3', text: 'दादी के हाथों की खुशबू...', used: false },
    { id: 'p4', text: 'चाँद की रोशनी में...', used: false },
    { id: 'p5', text: 'जब हम बच्चे थे...', used: false },
    { id: 'p6', text: 'ईद की सुबह...', used: false },
    { id: 'p7', text: 'रमज़ान की पहली रात...', used: false },
    { id: 'p8', text: 'हमारा अपना बचपन...', used: false },
    { id: 'p9', text: 'आसमान के तारों की छांव में...', used: false },
    { id: 'p10', text: 'दरवाज़े पे दस्तक...', used: false },
    { id: 'p11', text: 'घर की छत पे बैठकर...', used: false },
    { id: 'p12', text: 'वो पुरानी किताबें...', used: false },
  ];

  useEffect(() => {
    const storedPrompts = localStorage.getItem('mehfil-prompts');
    if (storedPrompts) {
      const parsedPrompts = JSON.parse(storedPrompts);
      setPrompts(parsedPrompts);
      
      // Find unused prompts
      const unusedPrompts = parsedPrompts.filter((p: Prompt) => !p.used);
      if (unusedPrompts.length > 0) {
        // Select random prompt
        const randomIndex = Math.floor(Math.random() * unusedPrompts.length);
        setCurrentPrompt(unusedPrompts[randomIndex]);
      } else {
        // Reset all prompts if all are used
        const resetPrompts = parsedPrompts.map((p: Prompt) => ({ ...p, used: false }));
        setPrompts(resetPrompts);
        localStorage.setItem('mehfil-prompts', JSON.stringify(resetPrompts));
        
        const randomIndex = Math.floor(Math.random() * resetPrompts.length);
        setCurrentPrompt(resetPrompts[randomIndex]);
      }
    } else {
      // Initialize with default prompts
      setPrompts(initialPrompts);
      localStorage.setItem('mehfil-prompts', JSON.stringify(initialPrompts));
      
      // Select random initial prompt
      const randomIndex = Math.floor(Math.random() * initialPrompts.length);
      setCurrentPrompt(initialPrompts[randomIndex]);
    }
  }, []);

  const refreshPrompt = () => {
    // Find unused prompts
    const unusedPrompts = prompts.filter(p => !p.used);
    
    if (unusedPrompts.length > 0) {
      // Select random prompt
      const randomIndex = Math.floor(Math.random() * unusedPrompts.length);
      setCurrentPrompt(unusedPrompts[randomIndex]);
    } else {
      // Reset all prompts if all are used
      const resetPrompts = prompts.map(p => ({ ...p, used: false }));
      setPrompts(resetPrompts);
      localStorage.setItem('mehfil-prompts', JSON.stringify(resetPrompts));
      
      const randomIndex = Math.floor(Math.random() * resetPrompts.length);
      setCurrentPrompt(resetPrompts[randomIndex]);
    }
  };

  const markPromptUsed = (promptId: string) => {
    const updatedPrompts = prompts.map(p => 
      p.id === promptId ? { ...p, used: true } : p
    );
    
    setPrompts(updatedPrompts);
    localStorage.setItem('mehfil-prompts', JSON.stringify(updatedPrompts));
    
    // Get a new prompt
    refreshPrompt();
  };

  return (
    <PromptContext.Provider value={{ 
      prompts, 
      currentPrompt, 
      refreshPrompt,
      markPromptUsed
    }}>
      {children}
    </PromptContext.Provider>
  );
};

export const usePrompt = () => {
  const context = useContext(PromptContext);
  if (context === undefined) {
    throw new Error('usePrompt must be used within a PromptProvider');
  }
  return context;
};
