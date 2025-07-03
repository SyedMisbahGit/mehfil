import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { v4 as uuidv4 } from '../utils/mockUuid';
import ErrorBoundary from './ErrorBoundary';

export const Onboarding = () => {
  const navigate = useNavigate();
  const { setUserProfile } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    preferredName: '',
    gender: '',
    elderCall: '',
    youngerCall: '',
    fatherBranch: ''
  });
  const [errors, setErrors] = useState({
    preferredName: '',
    gender: '',
    elderCall: '',
    youngerCall: '',
    fatherBranch: ''
  });

  // Redirect already-onboarded users
  useEffect(() => {
    const existing = localStorage.getItem("mehfil-userProfile");
    if (existing) {
      try {
        const profile = JSON.parse(existing);
        if (profile.onboardingComplete) {
          navigate("/home");
        }
      } catch (error) {
        console.error("Error parsing existing profile:", error);
      }
    }
  }, [navigate]);

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
      if (!formData.preferredName.trim()) {
        newErrors.preferredName = 'आपका नाम दर्ज करें';
        valid = false;
      }
    } else if (step === 2) {
      if (!formData.gender) {
        newErrors.gender = 'कृपया चुनें';
        valid = false;
      }
    } else if (step === 3) {
      if (!formData.elderCall.trim()) {
        newErrors.elderCall = 'बड़ों के लिए क्या कहेंगे';
        valid = false;
      }
      if (!formData.youngerCall.trim()) {
        newErrors.youngerCall = 'छोटों के लिए क्या कहेंगे';
        valid = false;
      }
    } else if (step === 4) {
      if (!formData.fatherBranch.trim()) {
        newErrors.fatherBranch = 'पिता की शाखा बताएं';
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

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    setLoading(true);
    
    try {
      const newProfile = {
        id: uuidv4(),
        preferredName: formData.preferredName.trim(),
        gender: formData.gender,
        elderCall: formData.elderCall.trim(),
        youngerCall: formData.youngerCall.trim(),
        fatherBranch: formData.fatherBranch.trim(),
        onboardingComplete: true,
      };

      // Save to localStorage
      localStorage.setItem("mehfil-userProfile", JSON.stringify(newProfile));
      
      // Set to context
      setUserProfile(newProfile);
      
      // Navigate to home
      navigate("/home");
    } catch (error) {
      console.error("Error during onboarding:", error);
      setLoading(false);
    }
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
              <label htmlFor="preferredName" className="block text-sm font-medium text-gray-700 mb-1">
                Aapka naam
              </label>
              <input
                type="text"
                id="preferredName"
                name="preferredName"
                value={formData.preferredName}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="Yahan apna naam likhein"
              />
              {errors.preferredName && <p className="mt-1 text-sm text-red-600">{errors.preferredName}</p>}
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
          >
            <h2 className="text-xl font-medium text-gray-800 mb-4">Pariwaar mein kya kahlate hain</h2>
            
            <div className="mb-4">
              <label htmlFor="elderCall" className="block text-sm font-medium text-gray-700 mb-1">
                Bade log aapko kya kehte hain
              </label>
              <input
                type="text"
                id="elderCall"
                name="elderCall"
                value={formData.elderCall}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="Jaise: beta, beti, chotu, etc."
              />
              {errors.elderCall && <p className="mt-1 text-sm text-red-600">{errors.elderCall}</p>}
            </div>

            <div className="mb-4">
              <label htmlFor="youngerCall" className="block text-sm font-medium text-gray-700 mb-1">
                Chote log aapko kya kehte hain
              </label>
              <input
                type="text"
                id="youngerCall"
                name="youngerCall"
                value={formData.youngerCall}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="Jaise: bhaiya, didi, etc."
              />
              {errors.youngerCall && <p className="mt-1 text-sm text-red-600">{errors.youngerCall}</p>}
            </div>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <h2 className="text-xl font-medium text-gray-800 mb-4">Akhri kadam</h2>
            
            <div className="mb-4">
              <label htmlFor="fatherBranch" className="block text-sm font-medium text-gray-700 mb-1">
                Aapke pitaji ki shakha
              </label>
              <input
                type="text"
                id="fatherBranch"
                name="fatherBranch"
                value={formData.fatherBranch}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="Jaise: Chaudhary, Khan, etc."
              />
              {errors.fatherBranch && <p className="mt-1 text-sm text-red-600">{errors.fatherBranch}</p>}
            </div>

            <div className="mb-8 p-4 bg-amber-50 rounded-md">
              <p className="text-gray-600 mb-2">Yeh ek mehfooz, niji jagah hai jahan cousins milkar apni yaadein, kahaniyaan aur kavitaayein sajha kar sakte hain.</p>
              <p className="text-gray-700 italic text-sm">"Yeh talluqaat ko gehra banayega"</p>
            </div>
          </motion.div>
        )}

        <div className="flex justify-between mt-8">
          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              disabled={loading}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50"
            >
              Peeche
            </button>
          )}
          {step === 1 && <div></div>}
          
          <button
            onClick={handleNext}
            disabled={loading}
            className="px-6 py-2 bg-gradient-to-r from-amber-500 to-rose-500 text-white rounded-md hover:from-amber-600 hover:to-rose-600 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Loading..." : (step < 4 ? 'Aage' : 'Shuru Karein')}
          </button>
        </div>
      </motion.div>
    </div>
    </ErrorBoundary>
  );
};

export default Onboarding;
