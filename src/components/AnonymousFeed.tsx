import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, SendHorizontal, Sparkles, HeartCrack } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

type FeedMessage = {
  id: string;
  text: string;
  timestamp: number;
  authorId: string;
  reactions: {
    heart: number;
    fire: number;
    laugh: number;
  };
};

export const AnonymousFeed = () => {
  const [messages, setMessages] = useState<FeedMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { userProfile } = useAuth();

  useEffect(() => {
    // Load existing messages
    const stored = localStorage.getItem('mehfil-feed-messages');
    if (stored) {
      try {
        setMessages(JSON.parse(stored));
      } catch (error) {
        console.error('Error loading messages:', error);
      }
    }

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
          authorId: 'anonymous',
          reactions: { heart: 0, fire: 0, laugh: 0 }
        };
        
        setMessages(prev => {
          const updated = [...prev, newMsg];
          localStorage.setItem('mehfil-feed-messages', JSON.stringify(updated));
          return updated;
        });
      }
    }, 10000); // Check every 10 seconds
    
    return () => clearInterval(interval);
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
      authorId: userProfile?.id || 'anonymous',
      reactions: { heart: 0, fire: 0, laugh: 0 }
    };
    
    setMessages(prev => {
      const updated = [...prev, message];
      localStorage.setItem('mehfil-feed-messages', JSON.stringify(updated));
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
      
      localStorage.setItem('mehfil-feed-messages', JSON.stringify(updated));
      return updated;
    });
  };

  const deletePost = (messageId: string) => {
    if (window.confirm('Kya aap is post ko delete karna chahte hain?')) {
      setMessages(prev => {
        const updated = prev.filter(msg => msg.id !== messageId);
        localStorage.setItem('mehfil-feed-messages', JSON.stringify(updated));
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
                    {isOwner && (
                      <button 
                        onClick={() => deletePost(message.id)}
                        className="text-accent hover:text-red-500 ml-2 text-sm"
                        title="Delete post"
                      >
                        🗑️
                      </button>
                    )}
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
        </ul>
      </div>
    </div>
  );
};

export default AnonymousFeed;
