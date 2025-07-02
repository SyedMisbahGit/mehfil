import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTehqeeq } from '../context/TehqeeqContext';
import { useAI } from '../context/AIContext';
import { CirclePlus, Sparkles } from 'lucide-react';
import { toast } from 'react-toastify';
import ErrorBoundary from './ErrorBoundary';

export const Tehqeeqat = () => {
  const { tehqeeqs, askQuestion, answerQuestion } = useTehqeeq();
  const { trackFeatureUsage } = useAI();
  const [newQuestion, setNewQuestion] = useState('');
  const [showNewQuestionForm, setShowNewQuestionForm] = useState(false);
  const [selectedTehqeeq, setSelectedTehqeeq] = useState<string | null>(null);
  const [answer, setAnswer] = useState('');

  useEffect(() => {
    try {
      // Track feature usage when component mounts
      trackFeatureUsage('tehqeeqat');
    } catch (error) {
      console.error("Error tracking feature usage:", error);
    }
  }, [trackFeatureUsage]);

  const handleSubmitQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (newQuestion.trim()) {
        askQuestion(newQuestion.trim());
        setNewQuestion('');
        setShowNewQuestionForm(false);
        toast.success("Aapka sawal pooch liya gaya hai!");
      }
    } catch (error) {
      console.error("Error submitting question:", error);
      toast.error("Sawal poochne mein dikkat aayi. Dobara koshish karein.");
    }
  };

  const handleSubmitAnswer = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedTehqeeq && answer.trim()) {
        answerQuestion(selectedTehqeeq, answer.trim());
        setAnswer('');
        setSelectedTehqeeq(null);
        toast.success("Aapka jawab de diya gaya hai!");
      }
    } catch (error) {
      console.error("Error submitting answer:", error);
      toast.error("Jawab dene mein dikkat aayi. Dobara koshish karein.");
    }
  };

  return (
    <ErrorBoundary>
      <div className="max-w-2xl mx-auto p-4 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6 text-center"
        >
          <h1 className="text-2xl font-bold text-gray-800">तहक़ीक़ात</h1>
          <p className="text-gray-500 text-sm">परिवार के राज़ और सवाल</p>
        </motion.div>

        <div className="mb-4 flex justify-end">
          <button
            onClick={() => setShowNewQuestionForm(true)}
            className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gradient-to-r from-amber-500 to-rose-500 text-white rounded-md hover:from-amber-600 hover:to-rose-600 transition-all shadow-sm"
          >
            <CirclePlus size={16} />
            <span>नया सवाल</span>
          </button>
        </div>

        {showNewQuestionForm && (
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleSubmitQuestion}
            className="bg-white/80 backdrop-blur-sm rounded-lg shadow-md p-4 mb-6"
          >
            <h2 className="text-lg font-medium text-gray-800 mb-3">नया सवाल पूछें</h2>
            <div className="mb-4">
              <textarea
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                placeholder="अपना सवाल यहां लिखें..."
                rows={3}
                required
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowNewQuestionForm(false)}
                className="px-3 py-1 text-gray-600 hover:text-gray-800"
              >
                रद्द करें
              </button>
              <button
                type="submit"
                className="px-4 py-1 bg-gradient-to-r from-amber-500 to-rose-500 text-white rounded-md hover:from-amber-600 hover:to-rose-600 transition-all"
              >
                पूछें
              </button>
            </div>
          </motion.form>
        )}

        {selectedTehqeeq && (
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleSubmitAnswer}
            className="bg-white/80 backdrop-blur-sm rounded-lg shadow-md p-4 mb-6 border-l-4 border-amber-400"
          >
            <h2 className="text-lg font-medium text-gray-800 mb-3">अपना जवाब दें</h2>
            <div className="mb-4 p-3 bg-amber-50 rounded-md">
              <p className="text-gray-700">
                {tehqeeqs.find(t => t.id === selectedTehqeeq)?.question}
              </p>
            </div>
            <div className="mb-4">
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                placeholder="अपना जवाब यहां लिखें..."
                rows={3}
                required
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedTehqeeq(null)}
                className="px-3 py-1 text-gray-600 hover:text-gray-800"
              >
                रद्द करें
              </button>
              <button
                type="submit"
                className="px-4 py-1 bg-gradient-to-r from-amber-500 to-rose-500 text-white rounded-md hover:from-amber-600 hover:to-rose-600 transition-all"
              >
                जवाब दें
              </button>
            </div>
          </motion.form>
        )}

        <div className="space-y-6">
          {tehqeeqs.length === 0 && (
            <p className="text-center text-gray-500 italic p-8">
              अभी तक कोई सवाल नहीं पूछा गया है
            </p>
          )}
          
          {tehqeeqs.map(tehqeeq => (
            <motion.div
              key={tehqeeq.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white/70 backdrop-blur-sm rounded-lg shadow-sm p-4 border border-amber-100"
            >
              <div className="flex items-start gap-2">
                <Sparkles size={18} className="text-amber-500 mt-1" />
                <div className="flex-1">
                  <h3 className="font-medium text-gray-800 mb-2">{tehqeeq.question}</h3>
                  
                  {tehqeeq.answers.length > 0 ? (
                    <div className="mt-4 space-y-3">
                      <h4 className="text-sm font-medium text-gray-600">परिवार के संकेत:</h4>
                      <div className="pl-3 border-l-2 border-amber-200">
                        {tehqeeq.answers.map((answer, index) => (
                          <div key={index} className="mb-2 text-gray-700">
                            <p className="text-sm italic">"{answer.text}"</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 italic">
                      अभी तक कोई जवाब नहीं...
                    </p>
                  )}
                  
                  <div className="mt-3 flex justify-between items-center">
                    <p className="text-xs text-gray-500">
                      {new Date(tehqeeq.timestamp).toLocaleDateString('hi-IN', { 
                        day: 'numeric', 
                        month: 'short', 
                        year: 'numeric'
                      })}
                    </p>
                    
                    <button
                      onClick={() => {
                        setSelectedTehqeeq(tehqeeq.id);
                        setAnswer('');
                      }}
                      className="text-xs px-2 py-1 text-amber-600 hover:text-amber-800 border border-amber-200 rounded-md hover:bg-amber-50"
                    >
                      जवाब दें
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default Tehqeeqat;
