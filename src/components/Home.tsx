import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useQissa } from '../context/QissaContext';
import { useTehqeeq } from '../context/TehqeeqContext';
import { usePrompt } from '../context/PromptContext';
import { useHeartbeat } from '../context/HeartbeatContext';
import { useAuth } from '../context/AuthContext';
import { useAI } from '../context/AIContext';
import { useWhisper } from '../context/WhisperContext';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Dice3, LogOut, MessageCircle, MessageSquare, Pencil, Shield } from 'lucide-react';
import { toast } from 'react-toastify';

export const Home = () => {
  const { userProfile } = useAuth();
  const { qissas, activeQissa } = useQissa();
  const { tehqeeqs } = useTehqeeq();
  const { currentPrompt } = usePrompt();
  const { updatePresence, activeUsers } = useHeartbeat();
  const { getPersonalizedRecommendation, trackFeatureUsage } = useAI();
  const { getTodaysWhisper } = useWhisper();

  // Get personalized recommendation
  const recommendedFeature = getPersonalizedRecommendation();
  
  // Get today's whisper
  const todaysWhisper = getTodaysWhisper();
  
  useEffect(() => {
    try {
      // Update heartbeat when component mounts
      updatePresence();
      
      // Update heartbeat every minute
      const interval = setInterval(() => {
        updatePresence();
      }, 60000);
      
      return () => clearInterval(interval);
    } catch (error) {
      console.error("Error updating presence:", error);
      toast.error("Connection issue. Please refresh the app.");
    }
  }, [updatePresence]);
  
  const handleFeatureClick = (feature: string) => {
    try {
      trackFeatureUsage(feature);
    } catch (error) {
      console.error("Error tracking feature usage:", error);
    }
  };
  
  // Get current time in India
  const now = new Date();
  const hours = now.getHours();
  
  // Determine greeting based on time of day
  let greeting = "Salaam";
  if (hours >= 5 && hours < 12) {
    greeting = "Subah Bakhair";
  } else if (hours >= 12 && hours < 17) {
    greeting = "Dopahar Bakhair";
  } else if (hours >= 17 && hours < 22) {
    greeting = "Shaam Bakhair";
  } else {
    greeting = "Shab Bakhair";
  }

  return (
    <div className="max-w-2xl mx-auto p-4 pb-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Mehfil</h1>
          <div className="flex items-center gap-2">
            {userProfile?.id === 'owner' && (
              <Link
                to="/admin"
                className="text-gray-500 hover:text-gray-700 p-1"
                title="Admin Dashboard"
              >
                <Shield size={18} />
              </Link>
            )}
            <button 
              onClick={() => {}}
              className="text-gray-500 hover:text-gray-700 p-1"
              title="Log Out"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
        <p className="text-gray-500">{greeting}, {userProfile?.preferredName}</p>
        <div className="mt-1 text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full inline-block">
          Sirf cousins ke liye
        </div>
      </motion.div>

      {/* Today's Whisper Card */}
      {todaysWhisper && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg shadow-sm p-4 mb-6 border border-primary/20"
        >
          <div className="flex items-start gap-3">
            <div className="p-2 bg-primary/20 rounded-full mt-1">
              <MessageSquare size={16} className="text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-gray-800 mb-1">{todaysWhisper.vibe}</h3>
              <p className="text-gray-700 italic">"{todaysWhisper.text}"</p>
            </div>
          </div>
        </motion.div>
      )}

      <div className="bg-gradient-to-r from-amber-50 to-rose-50 rounded-lg shadow-sm p-4 mb-6 border border-amber-100">
        <div className="flex items-center justify-between">
          <p className="text-gray-700">
            {activeUsers > 1 
              ? `${activeUsers - 1} log maujud hain` 
              : "Koi aur maujud nahi hai"}
          </p>
          <motion.span
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.7, 1, 0.7]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              repeatType: "reverse"
            }}
            className="w-2 h-2 bg-rose-500 rounded-full"
          />
        </div>
      </div>

      {currentPrompt && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="bg-white/80 backdrop-blur-sm rounded-lg shadow-md p-4 mb-6 border-l-4 border-amber-400"
        >
          <h2 className="text-lg font-medium text-gray-800 mb-2">आज का ख़याल</h2>
          <p className="text-gray-700 italic">"{currentPrompt.text}"</p>
          <div className="mt-3 flex justify-end">
            <Link 
              to="/qissa-goi"
              onClick={() => handleFeatureClick('qissaGoi')}
              className="text-sm px-3 py-1 text-amber-600 hover:text-amber-800 border border-amber-200 rounded-md hover:bg-amber-50 flex items-center gap-1"
            >
              <MessageCircle size={14} />
              <span>क़िस्सा शुरू करें</span>
            </Link>
          </div>
        </motion.div>
      )}

      {recommendedFeature && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-6 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg shadow-sm p-4 border border-purple-100"
        >
          <div className="flex items-start gap-2">
            <div className="p-2 bg-purple-100 rounded-full mt-1">
              <ArrowUpRight size={16} className="text-purple-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-800 mb-1">Aapke liye suggestion</h3>
              <p className="text-sm text-gray-600 mb-2">
                {recommendedFeature === 'qissaGoi' && 'Aaj Qissa Goi ka mood hai?'}
                {recommendedFeature === 'tehqeeqat' && 'Koi sawal pucho ya jawab do?'}
                {recommendedFeature === 'tasveerBujho' && 'Kuch drawing banao aur khelo?'}
                {recommendedFeature === 'ludo' && 'Ludo khel kar maza aayega!'}
                {recommendedFeature === 'gupshup' && 'Kuch bebaak baatein karni hai?'}
              </p>
              <Link
                to={`/${recommendedFeature === 'qissaGoi' ? 'qissa-goi' : 
                     recommendedFeature === 'tehqeeqat' ? 'tehqeeqat' : 
                     recommendedFeature === 'tasveerBujho' ? 'tasveer-bujho' : 
                     recommendedFeature === 'ludo' ? 'ludo' : 'gupshup'}`}
                onClick={() => handleFeatureClick(recommendedFeature)}
                className="text-sm text-purple-600 hover:text-purple-800 flex items-center gap-1"
              >
                <span>Jaaiye</span>
                <ArrowUpRight size={14} />
              </Link>
            </div>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="bg-white/80 backdrop-blur-sm rounded-lg shadow-sm p-4 border border-rose-100"
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-medium text-gray-800">Qissa Goi</h2>
            <Link 
              to="/qissa-goi"
              onClick={() => handleFeatureClick('qissaGoi')}
              className="text-xs text-rose-600 hover:text-rose-800"
            >
              Sabhi Dekhen
            </Link>
          </div>
          
          {activeQissa ? (
            <div>
              <h3 className="font-medium text-gray-700 mb-1">{activeQissa.title}</h3>
              <p className="text-sm text-gray-600 mb-2">
                {activeQissa.lines.length} panktiyaan
              </p>
              <Link
                to="/qissa-goi"
                onClick={() => handleFeatureClick('qissaGoi')}
                className="text-sm px-3 py-1 bg-gradient-to-r from-amber-100 to-rose-100 text-rose-700 rounded-md hover:from-amber-200 hover:to-rose-200 inline-block mt-2"
              >
                Jari Rakhen
              </Link>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-500 mb-2">Koi qissa nahi chal raha hai</p>
              <Link
                to="/qissa-goi"
                onClick={() => handleFeatureClick('qissaGoi')}
                className="text-sm px-3 py-1 bg-gradient-to-r from-amber-100 to-rose-100 text-rose-700 rounded-md hover:from-amber-200 hover:to-rose-200"
              >
                Naya Qissa Shuru Karen
              </Link>
            </div>
          )}
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="bg-white/80 backdrop-blur-sm rounded-lg shadow-sm p-4 border border-amber-100"
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-medium text-gray-800">Tehqeeqat</h2>
            <Link 
              to="/tehqeeqat"
              onClick={() => handleFeatureClick('tehqeeqat')}
              className="text-xs text-amber-600 hover:text-amber-800"
            >
              Sabhi Dekhen
            </Link>
          </div>
          
          {tehqeeqs.length > 0 ? (
            <div>
              <h3 className="font-medium text-gray-700 mb-1 line-clamp-1">
                {tehqeeqs[0].question}
              </h3>
              <p className="text-sm text-gray-600 mb-2">
                {tehqeeqs[0].answers.length} jawab
              </p>
              <Link
                to="/tehqeeqat"
                onClick={() => handleFeatureClick('tehqeeqat')}
                className="text-sm px-3 py-1 bg-gradient-to-r from-amber-100 to-rose-100 text-amber-700 rounded-md hover:from-amber-200 hover:to-rose-200 inline-block mt-2"
              >
                Jawab Den
              </Link>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-500 mb-2">Koi sawal nahi hai</p>
              <Link
                to="/tehqeeqat"
                onClick={() => handleFeatureClick('tehqeeqat')}
                className="text-sm px-3 py-1 bg-gradient-to-r from-amber-100 to-rose-100 text-amber-700 rounded-md hover:from-amber-200 hover:to-rose-200"
              >
                Naya Sawal Puchen
              </Link>
            </div>
          )}
        </motion.div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="bg-white/80 backdrop-blur-sm rounded-lg shadow-sm p-4 border border-purple-100"
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-medium text-gray-800">Tasveer Bujho</h2>
            <Link 
              to="/tasveer-bujho"
              onClick={() => handleFeatureClick('tasveerBujho')}
              className="text-xs text-purple-600 hover:text-purple-800"
            >
              Khelen
            </Link>
          </div>
          
          <div className="text-center py-2">
            <p className="text-gray-600 mb-3">Kuch banao, doston se bujhwao!</p>
            <Link
              to="/tasveer-bujho"
              onClick={() => handleFeatureClick('tasveerBujho')}
              className="px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-md hover:from-purple-600 hover:to-blue-600 transition-all shadow-sm inline-flex items-center gap-2"
            >
              <Pencil size={16} />
              <span>Drawing Game</span>
            </Link>
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="bg-white/80 backdrop-blur-sm rounded-lg shadow-sm p-4 border border-green-100"
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-medium text-gray-800">Ludo</h2>
            <Link 
              to="/ludo"
              onClick={() => handleFeatureClick('ludo')}
              className="text-xs text-green-600 hover:text-green-800"
            >
              Khelen
            </Link>
          </div>
          
          <div className="text-center py-2">
            <p className="text-gray-600 mb-3">Sabki pasandida ghar ki khel!</p>
            <Link
              to="/ludo"
              onClick={() => handleFeatureClick('ludo')}
              className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-md hover:from-green-600 hover:to-emerald-600 transition-all shadow-sm inline-flex items-center gap-2"
            >
              <Dice3 size={16} />
              <span>Ludo Game</span>
            </Link>
          </div>
        </motion.div>
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.5 }}
        className="bg-white/80 backdrop-blur-sm rounded-lg shadow-sm p-4 border border-blue-100 mb-6"
      >
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-medium text-gray-800">Gupshup</h2>
          <Link 
            to="/gupshup"
            onClick={() => handleFeatureClick('gupshup')}
            className="text-xs text-blue-600 hover:text-blue-800"
          >
            Dekhein
          </Link>
        </div>
        
        <div className="text-center py-2">
          <p className="text-gray-600 mb-3">Bebaak baatein, bina naam ke!</p>
          <Link
            to="/gupshup"
            onClick={() => handleFeatureClick('gupshup')}
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-md hover:from-blue-600 hover:to-indigo-600 transition-all shadow-sm inline-flex items-center gap-2"
          >
            <MessageSquare size={16} />
            <span>Anonymous Feed</span>
          </Link>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="mt-8"
      >
        <h2 className="text-lg font-medium text-gray-800 mb-3">पूरे क़िस्से</h2>
        
        {qissas.filter(q => q.completed).length === 0 ? (
          <p className="text-center text-gray-500 italic p-4">
            अभी तक कोई पूरा क़िस्सा नहीं है
          </p>
        ) : (
          <div className="space-y-4">
            {qissas
              .filter(q => q.completed)
              .slice(0, 3)
              .map(qissa => (
                <div
                  key={qissa.id}
                  className="bg-white/70 backdrop-blur-sm rounded-lg shadow-sm p-4 border border-amber-100"
                >
                  <h3 className="font-medium text-gray-800 mb-1">{qissa.title}</h3>
                  <p className="text-xs text-gray-500 mb-2">
                    {new Date(qissa.timestamp).toLocaleDateString('hi-IN', { 
                      day: 'numeric', 
                      month: 'short', 
                      year: 'numeric'
                    })}
                  </p>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {qissa.lines.map(l => l.text).join(' ')}
                  </p>
                </div>
              ))
            }
            
            {qissas.filter(q => q.completed).length > 3 && (
              <div className="text-center mt-2">
                <Link
                  to="/qissa-goi"
                  onClick={() => handleFeatureClick('qissaGoi')}
                  className="text-sm text-amber-600 hover:text-amber-800"
                >
                  और देखें...
                </Link>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Home;
