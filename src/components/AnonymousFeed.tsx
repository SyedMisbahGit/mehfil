import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, SendHorizontal, Sparkles, HeartCrack } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

type FeedMessage = {
  id: string;
  text: string;
  timestamp: number;
  authorId: string;
  createdAt: number;
  reactions: {
    heart: number;
    fire: number;
    laugh: number;
  };
};

const GUPSHUP_STORAGE_KEY = 'mehfil-gupshupThreads';

export const AnonymousFeed = () => {
  const [messages, setMessages] = useState<FeedMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { userProfile } = useAuth();

  // Load messages from localStorage
  const loadMessages = () => {
    const stored = localStorage.getItem(GUPSHUP_STORAGE_KEY);
    if (stored) {
      try {
        setMessages(JSON.parse(stored));
      } catch (error) {
        console.error('Error loading messages:', error);
      }
    }
  };

  // Save messages to localStorage
  const saveMessages = (updatedMessages: FeedMessage[]) => {
    localStorage.setItem(GUPSHUP_STORAGE_KEY, JSON.stringify(updatedMessages));
  };

  // Sync messages across tabs
  const handleStorageChange = (e: StorageEvent) => {
    if (e.key === GUPSHUP_STORAGE_KEY && e.newValue) {
      try {
        setMessages(JSON.parse(e.newValue));
      } catch (error) {
        console.error('Error syncing messages:', error);
      }
    }
  };

  useEffect(() => {
    // Load existing messages
    loadMessages();

    // Add storage event listener for cross-tab sync
    window.addEventListener('storage', handleStorageChange);

    // Simulate new messages from other users
    const interval = setInterval(() => {
      const randomMessages = [
        "Aaj ka din kaisa jaa raha hai?",
        "Koi khaas baat share karni hai?",
        "Mehfil mein sab theek hai?",
        "Koi sawal hai to puch sakte hain",
        "Dil ki baat share karein"
      ];
      
      const shouldAddMessage = Math.random() < 0.1; // 10% chance
      if (shouldAddMessage && messages.length < 20) {
        const newMsg: FeedMessage = {
          id: `msg-${Date.now()}-${Math.random()}`,
          text: randomMessages[Math.floor(Math.random() * randomMessages.length)],
          timestamp: Date.now(),
          createdAt: Date.now(),
          authorId: 'anonymous',
          reactions: { heart: 0, fire: 0, laugh: 0 }
        };
        
        setMessages(prev => {
          const updated = [...prev, newMsg];
          saveMessages(updated);
          return updated;
        });
      }
    }, 10000); // Check every 10 seconds
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);
  
  useEffect(() => {
    // Scroll to bottom when new messages arrive
    scrollToBottom();
  }, [messages]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;
    
    const message: FeedMessage = {
      id: `msg-${Date.now()}`,
      text: newMessage.trim(),
      timestamp: Date.now(),
      createdAt: Date.now(),
      authorId: userProfile?.id || 'anonymous',
      reactions: { heart: 0, fire: 0, laugh: 0 }
    };
    
    setMessages(prev => {
      const updated = [...prev, message];
      saveMessages(updated);
      return updated;
    });
    
    setNewMessage('');
  };
  
  const handleReaction = (messageId: string, reaction: 'heart' | 'fire' | 'laugh') => {
    setMessages(prev => {
      const updated = prev.map(msg => {
        if (msg.id === messageId) {
          return {
            ...msg,
            reactions: {
              ...msg.reactions,
              [reaction]: msg.reactions[reaction] + 1
            }
          };
        }
        return msg;
      });
      
      saveMessages(updated);
      return updated;
    });
  };

  const deletePost = (messageId: string) => {
    if (window.confirm('Kya aap is post ko delete karna chahte hain?')) {
      setMessages(prev => {
        const updated = prev.filter(msg => msg.id !== messageId);
        saveMessages(updated);
        return updated;
      });
    }
  };

  const editPost = (messageId: string) => {
    const message = messages.find(msg => msg.id === messageId);
    if (!message) return;
    
    const newText = prompt('Apni baat edit karein:', message.text);
    if (newText && newText.trim() && newText !== message.text) {
      setMessages(prev => {
        const updated = prev.map(msg => 
          msg.id === messageId 
            ? { ...msg, text: newText.trim() }
            : msg
        );
        saveMessages(updated);
        return updated;
      });
    }
  };
  
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      return `${diffInMinutes} minute pehle`;
    } else if (diffInHours < 24) {
      return `${diffInHours} ghante pehle`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} din pehle`;
    }
  };

  const canEdit = (message: FeedMessage) => {
    const isOwner = message.authorId === userProfile?.id;
    const isWithinEditWindow = Date.now() < message.createdAt + 10 * 60 * 1000; // 10 minutes
    return isOwner && isWithinEditWindow;
  };
  
  return (
    <div className="max-w-2xl mx-auto p-4 pb-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6 text-center"
      >
        <h1 className="text-2xl font-bold text-gray-800">Gupshup</h1>
        <p className="text-gray-500 text-sm">Bebaak baatein, bina naam ke</p>
      </motion.div>
      
      <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-md p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-medium text-gray-800 flex items-center">
            <MessageCircle size={20} className="mr-2 text-amber-500" />
            <span>Live Feed</span>
          </h2>
          <div className="text-xs text-gray-500">
            Koi nahi janega ke kisne kya kaha
          </div>
        </div>
        
        <div className="bg-amber-50/50 rounded-lg p-3 mb-4 border border-amber-100">
          <div className="flex items-start gap-2">
            <Sparkles size={16} className="text-amber-500 mt-1" />
            <p className="text-sm text-amber-800">
              Yahan aap kuch bhi likh sakte hain - koi aapko pehchan nahi payega. Dil ki baat, koi sawaal, koi fikr - kuch bhi!
            </p>
          </div>
        </div>
        
        <div className="mb-4 max-h-[60vh] overflow-y-auto pr-2">
          <AnimatePresence>
            {messages.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-10"
              >
                <HeartCrack size={40} className="mx-auto text-gray-300 mb-2" />
                <p className="text-gray-400">Abhi tak koi baat nahi hui</p>
              </motion.div>
            )}
            
            {messages.map((message) => {
              const isOwner = message.authorId === userProfile?.id;
              const canEditMessage = canEdit(message);
              
              return (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mb-3 p-3 bg-white rounded-lg shadow-sm border border-gray-100"
                >
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-gray-800 flex-1">{message.text}</p>
                    <div className="flex gap-1 ml-2">
                      {canEditMessage && (
                        <button 
                          onClick={() => editPost(message.id)}
                          className="text-accent hover:text-blue-500 text-sm"
                          title="Edit post (10 min window)"
                        >
                          ✏️
                        </button>
                      )}
                      {!canEditMessage && isOwner && (
                        <span 
                          className="text-gray-400 text-xs"
                          title="Whispers can't be deleted, only edited for 10 min"
                        >
                          ⏰
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleReaction(message.id, 'heart')}
                        className="flex items-center text-xs text-gray-500 hover:text-rose-500"
                      >
                        ❤️ {message.reactions.heart}
                      </button>
                      <button 
                        onClick={() => handleReaction(message.id, 'fire')}
                        className="flex items-center text-xs text-gray-500 hover:text-amber-500"
                      >
                        🔥 {message.reactions.fire}
                      </button>
                      <button 
                        onClick={() => handleReaction(message.id, 'laugh')}
                        className="flex items-center text-xs text-gray-500 hover:text-green-500"
                      >
                        😂 {message.reactions.laugh}
                      </button>
                    </div>
                    <p className="text-xs text-gray-400">{formatTime(message.timestamp)}</p>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>
        
        <form onSubmit={handleSubmit} className="flex items-end gap-2">
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-grow p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
            placeholder="Apni baat yahan likhein..."
            rows={2}
            required
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className={`p-3 rounded-full ${
              newMessage.trim()
                ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-white' 
                : 'bg-gray-200 text-gray-400'
            }`}
          >
            <SendHorizontal size={20} />
          </button>
        </form>
      </div>
      
      <div className="text-center text-sm text-gray-500 mt-4">
        <p>Aap bina naam ke likh rahe hain. Kripya yaad rakhein:</p>
        <ul className="text-xs mt-2 space-y-1">
          <li>• Dusron ka ehteraam karein</li>
          <li>• Koi bhi niji jaankari na share karein</li>
          <li>• Mehfil ko khushgawar rakhein</li>
          <li>• Posts 10 minute tak edit kar sakte hain</li>
        </ul>
      </div>
    </div>
  );
};

export default AnonymousFeed;
