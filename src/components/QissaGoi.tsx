import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQissa } from '../context/QissaContext';
import { usePrompt } from '../context/PromptContext';
import { useHeartbeat } from '../context/HeartbeatContext';
import { useAuth } from '../context/AuthContext';
import { useAI } from '../context/AIContext';
import { AlertTriangle, Bell, Clock, RefreshCw, SendHorizontal, Users } from 'lucide-react';
import { toast } from 'react-toastify';
import ErrorBoundary from './ErrorBoundary';

export const QissaGoi = () => {
  const { user } = useAuth();
  const { 
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
    participants
  } = useQissa();
  const { activeUsers } = useHeartbeat();
  const { currentPrompt, markPromptUsed, refreshPrompt } = usePrompt();
  const { trackFeatureUsage } = useAI();
  const [newLine, setNewLine] = useState('');
  const [newQissaTitle, setNewQissaTitle] = useState('');
  const [showNewQissaForm, setShowNewQissaForm] = useState(false);
  const lineInputRef = useRef<HTMLTextAreaElement>(null);
  const [formattedDate, setFormattedDate] = useState('');

  useEffect(() => {
    try {
      // Track feature usage when component mounts
      trackFeatureUsage('qissaGoi');
      
      // Set up date display
      const date = new Date();
      const options: Intl.DateTimeFormatOptions = { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric',
        weekday: 'long'
      };
      setFormattedDate(date.toLocaleDateString('hi-IN', options));
    } catch (error) {
      console.error("Error in QissaGoi component initialization:", error);
    }
  }, [trackFeatureUsage]);

  const handleSubmitLine = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (newLine.trim() && activeQissa && isMyTurn) {
        addLine(newLine.trim());
        setNewLine('');
        
        // Use the prompt if it was used for inspiration
        if (currentPrompt) {
          markPromptUsed(currentPrompt.id);
        }
        
        toast.success("Aapki pankti jud gayi hai!");
      }
    } catch (error) {
      console.error("Error submitting line:", error);
      toast.error("Line add karne mein dikkat aayi. Dobara koshish karein.");
    }
  };

  const handleStartNewQissa = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (newQissaTitle.trim()) {
        startNewQissa(newQissaTitle.trim());
        setNewQissaTitle('');
        setShowNewQissaForm(false);
        toast.success("Naya Qissa shuru ho gaya hai!");
      }
    } catch (error) {
      console.error("Error starting new qissa:", error);
      toast.error("Qissa shuru karne mein dikkat aayi. Dobara koshish karein.");
    }
  };

  useEffect(() => {
    // Focus the input when it becomes the user's turn
    if (isMyTurn && lineInputRef.current) {
      lineInputRef.current.focus();
    }
  }, [isMyTurn]);

  return (
    <ErrorBoundary>
      <div className="max-w-2xl mx-auto p-4 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6 text-center"
        >
          <h1 className="text-2xl font-bold text-gray-800">क़िस्सा गोई</h1>
          <p className="text-gray-500 text-sm">{formattedDate}</p>
        </motion.div>
        
        {/* Notification for new Qissa */}
        <AnimatePresence>
          {qissaNotification && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-4 rounded-md shadow-sm"
            >
              <div className="flex items-start">
                <Bell size={20} className="text-amber-500 mr-2 mt-1" />
                <div className="flex-1">
                  <h3 className="font-medium text-gray-800 mb-1">
                    Naya Qissa shuru hua hai!
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    "{qissaNotification.title}" - Kya aap shamil hona chahte hain?
                  </p>
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={dismissNotification}
                      className="text-xs px-3 py-1 text-gray-600 hover:text-gray-800"
                    >
                      Nahi, shukriya
                    </button>
                    <button
                      onClick={joinActiveQissa}
                      className="text-xs px-3 py-1 bg-gradient-to-r from-amber-500 to-rose-500 text-white rounded-md hover:from-amber-600 hover:to-rose-600"
                    >
                      Haan, main shamil hoon
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Active Users Counter */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white/80 backdrop-blur-sm rounded-lg shadow-sm p-3 mb-4 border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Users size={18} className="text-gray-500 mr-2" />
              <p className="text-sm text-gray-700">
                {activeUsers} log online hain
              </p>
            </div>
            {activeUsers < 2 && (
              <div className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
                Qissa ke liye kam se kam 2 log chahiye
              </div>
            )}
          </div>
        </motion.div>

        {!activeQissa && !showNewQissaForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center p-8"
          >
            <p className="mb-4 text-gray-600">कोई क़िस्सा नहीं चल रहा है। नया क़िस्सा शुरू करें?</p>
            <button
              onClick={() => setShowNewQissaForm(true)}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-rose-500 text-white rounded-md hover:from-amber-600 hover:to-rose-600 transition-all"
              disabled={activeUsers < 2}
            >
              नया क़िस्सा
            </button>
            {activeUsers < 2 && (
              <p className="mt-2 text-sm text-gray-500">
                Intezaar kijiye jab tak doosre log online aayein
              </p>
            )}
          </motion.div>
        )}

        {showNewQissaForm && (
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleStartNewQissa}
            className="bg-white/80 backdrop-blur-sm rounded-lg shadow-md p-4 mb-6"
          >
            <h2 className="text-lg font-medium text-gray-800 mb-3">नया क़िस्सा शुरू करें</h2>
            <div className="mb-4">
              <label htmlFor="qissaTitle" className="block text-sm font-medium text-gray-700 mb-1">
                क़िस्से का शीर्षक
              </label>
              <input
                type="text"
                id="qissaTitle"
                value={newQissaTitle}
                onChange={(e) => setNewQissaTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="शीर्षक यहां लिखें..."
                required
              />
            </div>
            {activeUsers < 2 && (
              <div className="mb-4 p-3 bg-amber-50 rounded-md flex items-center text-amber-700">
                <AlertTriangle size={18} className="mr-2" />
                <p className="text-sm">
                  Qissa Goi ke liye kam se kam 2 log online hone chahiye
                </p>
              </div>
            )}
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowNewQissaForm(false)}
                className="px-3 py-1 text-gray-600 hover:text-gray-800"
              >
                रद्द करें
              </button>
              <button
                type="submit"
                disabled={activeUsers < 2}
                className={`px-4 py-1 ${
                  activeUsers >= 2
                    ? "bg-gradient-to-r from-amber-500 to-rose-500 text-white hover:from-amber-600 hover:to-rose-600"
                    : "bg-gray-200 text-gray-500"
                } rounded-md transition-all`}
              >
                शुरू करें
              </button>
            </div>
          </motion.form>
        )}

        {activeQissa && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-8"
          >
            <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-md p-4 mb-4">
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-lg font-medium text-gray-800">{activeQissa.title}</h2>
                <div className="flex items-center gap-2">
                  <div className="flex items-center text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                    <Users size={14} className="mr-1" />
                    <span>{participants.length} log</span>
                  </div>
                  <button
                    onClick={() => completeQissa(activeQissa.id)}
                    className="text-xs px-2 py-1 text-gray-500 hover:text-gray-700 border border-gray-300 rounded-md"
                  >
                    समाप्त करें
                  </button>
                </div>
              </div>
              
              <div className="space-y-3">
                {activeQissa.lines.map((line, index) => (
                  <motion.div
                    key={line.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-2 rounded-md bg-gradient-to-r from-amber-50 to-rose-50 text-gray-800"
                  >
                    <p className="text-md">{line.text}</p>
                    <p className="text-xs text-right text-gray-500 mt-1">
                      {new Date(line.timestamp).toLocaleTimeString('hi-IN', { 
                        hour: '2-digit', 
                        minute: '2-digit'
                      })}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Turn Information */}
            {participants.length > 0 && (
              <div className="mb-4 bg-white/80 backdrop-blur-sm rounded-lg p-3 border border-gray-200">
                {currentTurn ? (
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-700">
                        {isMyTurn 
                          ? <span className="font-medium text-rose-600">Aapki baari hai!</span>
                          : <span>Doosre ki baari...</span>
                        }
                      </p>
                    </div>
                    <div className="flex items-center">
                      <Clock size={16} className="text-amber-500 mr-1" />
                      <span className={`text-sm ${timeRemaining < 10 ? 'text-rose-600 font-medium' : 'text-gray-600'}`}>
                        {timeRemaining} seconds
                      </span>
                    </div>
                  </div>
                ) : participants.length === 1 ? (
                  <div className="text-center text-amber-600 text-sm">
                    Intezaar kijiye... kisi aur ke shamil hone ka
                  </div>
                ) : (
                  <div className="text-center text-amber-600 text-sm">
                    Qissa jald hi shuru hoga...
                  </div>
                )}
              </div>
            )}

            {participants.length === 0 && (
              <div className="mb-4 p-3 bg-amber-50 rounded-md text-center">
                <p className="text-sm text-amber-700 mb-2">
                  Is Qissa mein abhi koi shamil nahi hai
                </p>
                <button
                  onClick={joinActiveQissa}
                  className="text-xs px-3 py-1 bg-gradient-to-r from-amber-500 to-rose-500 text-white rounded-md hover:from-amber-600 hover:to-rose-600"
                >
                  Main shamil hona chahta hoon
                </button>
              </div>
            )}

            {participants.includes(user?.id || '') && (
              <form onSubmit={handleSubmitLine} className="relative">
                {currentPrompt && (
                  <div className="absolute -top-8 right-0 flex items-center">
                    <p className="text-xs italic text-gray-500 mr-2">{currentPrompt.text}</p>
                    <button 
                      type="button"
                      onClick={refreshPrompt}
                      className="text-gray-400 hover:text-gray-600"
                      title="नया सुझाव"
                    >
                      <RefreshCw size={14} />
                    </button>
                  </div>
                )}
                
                <div className="flex items-end gap-2">
                  <textarea
                    ref={lineInputRef}
                    value={newLine}
                    onChange={(e) => setNewLine(e.target.value)}
                    className={`flex-grow p-3 border ${
                      isMyTurn ? 'border-amber-300 bg-amber-50' : 'border-gray-300 bg-gray-50'
                    } rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none ${
                      !isMyTurn ? 'cursor-not-allowed' : ''
                    }`}
                    placeholder={isMyTurn ? "अपनी पंक्ति जोड़ें..." : "दूसरे व्यक्ति की बारी है..."}
                    rows={2}
                    disabled={!isMyTurn}
                  />
                  <button
                    type="submit"
                    disabled={!newLine.trim() || !isMyTurn}
                    className={`p-3 rounded-full ${
                      newLine.trim() && isMyTurn
                        ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-white' 
                        : 'bg-gray-200 text-gray-400'
                    }`}
                  >
                    <SendHorizontal size={20} />
                  </button>
                </div>
                
                {!isMyTurn && participants.includes(user?.id || '') && (
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    Intezaar kijiye... aapki baari jald hi aayegi
                  </p>
                )}
              </form>
            )}
          </motion.div>
        )}

        <div className="space-y-6 mt-8">
          <h3 className="text-lg font-medium text-gray-800 mb-3">पिछले क़िस्से</h3>
          
          {qissas.filter(q => q.completed).length === 0 && (
            <p className="text-center text-gray-500 italic p-4">
              अभी तक कोई पूरा क़िस्सा नहीं है
            </p>
          )}
          
          {qissas
            .filter(q => q.completed)
            .map(qissa => (
              <motion.div
                key={qissa.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white/70 backdrop-blur-sm rounded-lg shadow-sm p-4 border border-amber-100"
              >
                <h4 className="font-medium text-gray-800 mb-2">{qissa.title}</h4>
                <div className="pl-3 border-l-2 border-amber-200 text-gray-700">
                  {qissa.lines.map((line, index) => (
                    <p key={line.id} className="mb-1">
                      {line.text}
                    </p>
                  ))}
                </div>
                <p className="text-xs text-right text-gray-500 mt-2">
                  {new Date(qissa.timestamp).toLocaleDateString('hi-IN', { 
                    day: 'numeric', 
                    month: 'short', 
                    year: 'numeric'
                  })}
                </p>
              </motion.div>
            ))
          }
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default QissaGoi;
