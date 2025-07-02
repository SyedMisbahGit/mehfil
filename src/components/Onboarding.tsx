import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { v4 as uuidv4 } from '../utils/mockUuid';
import ErrorBoundary from './ErrorBoundary';

export const Onboarding = () => {
  const { setUserProfile } = useAuth();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    gender: ''
  });
  const [errors, setErrors] = useState({
    name: '',
    gender: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user types
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateStep = () => {
    let valid = true;
    const newErrors = { ...errors };

    if (step === 1) {
      if (!formData.name.trim()) {
        newErrors.name = 'आपका नाम दर्ज करें';
        valid = false;
      }
    } else if (step === 2) {
      if (!formData.gender) {
        newErrors.gender = 'कृपया चुनें';
        valid = false;
      }
    }

    setErrors(newErrors);
    return valid;
  };

  const handleNext = () => {
    if (validateStep()) {
      if (step < 4) {
        setStep(step + 1);
      } else {
        handleSubmit();
      }
    }
  };

  const handleSubmit = () => {
    setUserProfile({
      id: uuidv4(),
      preferredName: formData.name,
      gender: formData.gender,
      elderCall: '',
      youngerCall: '',
      fatherBranch: ''
    });
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-rose-50 flex items-center justify-center p-4">
      <motion.div 
        className="max-w-md w-full bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 sm:p-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Mehfil</h1>
          <p className="text-gray-500">ek kavita, ek parivaar</p>
          <p className="mt-2 text-xs text-gray-400 italic">Only cousins with this link can join. Your answers stay on your device.</p>
        </div>

        {step === 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <h2 className="text-xl font-medium text-gray-800 mb-4">Khush Aamdeed</h2>
            <p className="text-gray-600 mb-6">Aapke pariwaar ki kahaniyaan aur kavitaayein samaitne ke liye yeh ek niji jagah hai.</p>
            
            <div className="mb-4">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Aapka naam
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="Yahan apna naam likhein"
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
              <p className="mt-1 text-xs text-gray-500">Yeh naam sirf aapko dikhega</p>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <h2 className="text-xl font-medium text-gray-800 mb-4">Thoda aur batayein</h2>
            
            <div className="mb-4">
              <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
                Aap hain
              </label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="">Chunein</option>
                <option value="male">Ladka</option>
                <option value="female">Ladki</option>
                <option value="other">Kuch aur</option>
              </select>
              {errors.gender && <p className="mt-1 text-sm text-red-600">{errors.gender}</p>}
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center"
          >
            <h2 className="text-xl font-medium text-gray-800 mb-4">Akhri kadam</h2>
            
            <div className="mb-8">
              <p className="text-gray-600 mb-4">Yeh ek mehfooz, niji jagah hai jahan cousins milkar apni yaadein, kahaniyaan aur kavitaein sajha kar sakte hain.</p>
              <p className="text-gray-700 italic">"Shuruat karein..."</p>
            </div>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center"
          >
            <h2 className="text-xl font-medium text-gray-800 mb-4">Ek aakhri baat</h2>
            
            <div className="mb-8">
              <p className="text-gray-600 mb-4">Yeh ek surakshit, niji jagah hai jahan cousins milkar apni yaadein, kahaniyaan aur kavitaayein sajha kar sakte hain.</p>
              <p className="text-gray-700 italic">"Yeh talluqaat ko gehra banayega"</p>
            </div>
          </motion.div>
        )}

        <div className="flex justify-between mt-8">
          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Peeche
            </button>
          )}
          {step === 1 && <div></div>}
          
          <button
            onClick={handleNext}
            className="px-6 py-2 bg-gradient-to-r from-amber-500 to-rose-500 text-white rounded-md hover:from-amber-600 hover:to-rose-600 transition-all shadow-sm"
          >
            {step < 4 ? 'Aage' : 'Shuru Karein'}
          </button>
        </div>
      </motion.div>
    </div>
    </ErrorBoundary>
  );
};

export default Onboarding;
