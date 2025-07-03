import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { v4 as uuidv4 } from '../utils/mockUuid';
import ErrorBoundary from './ErrorBoundary';

export const Onboarding = () => {
  const navigate = useNavigate();
  const { setUserProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    preferredName: '',
    age: '',
    gender: ''
  });
  const [errors, setErrors] = useState({
    preferredName: '',
    age: '',
    gender: ''
  });

  // Redirect already-onboarded users
  useEffect(() => {
    const existing = localStorage.getItem("mehfil-userProfile");
    if (existing) {
      try {
        const profile = JSON.parse(existing);
        if (profile.onboardingComplete) {
          navigate("/welcome");
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

  const validateForm = () => {
    let valid = true;
    const newErrors = { ...errors };

    if (!formData.preferredName.trim()) {
      newErrors.preferredName = 'Naam zaroori hai';
      valid = false;
    }

    if (!formData.age) {
      newErrors.age = 'Umar zaroori hai';
      valid = false;
    } else {
      const age = parseInt(formData.age);
      if (age < 10 || age > 110) {
        newErrors.age = 'Umar 10-110 ke beech honi chahiye';
        valid = false;
      }
    }

    if (!formData.gender) {
      newErrors.gender = 'Jins chunein';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      const newProfile = {
        preferredName: formData.preferredName.trim(),
        age: parseInt(formData.age),
        gender: formData.gender,
        id: `mehfil_${uuidv4()}`,
        onboardingComplete: true,
      };

      // Save to localStorage
      localStorage.setItem("mehfil-userProfile", JSON.stringify(newProfile));
      
      // Set to context
      setUserProfile(newProfile);
      
      // Navigate to welcome splash
      navigate("/welcome");
    } catch (error) {
      console.error("Error during onboarding:", error);
      setLoading(false);
    }
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-surface flex items-center justify-center p-4">
        <motion.div 
          className="max-w-md w-full card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl font-display text-accent mb-2">Mehfil</h1>
            <p className="text-text/70">ek kavita, ek parivaar</p>
            <p className="mt-2 text-xs text-text/50 italic">Only cousins with this link can join. Your answers stay on your device.</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              <div>
                <label htmlFor="preferredName" className="block text-sm font-medium text-text mb-2">
                  Naam
                </label>
                <input
                  type="text"
                  id="preferredName"
                  name="preferredName"
                  value={formData.preferredName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-soft/50 border border-primary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-text placeholder-text/50"
                  placeholder="Apna naam likhein"
                />
                {errors.preferredName && <p className="mt-1 text-sm text-red-400">{errors.preferredName}</p>}
              </div>

              <div>
                <label htmlFor="age" className="block text-sm font-medium text-text mb-2">
                  Umar (Age)
                </label>
                <input
                  type="number"
                  id="age"
                  name="age"
                  min="10"
                  max="110"
                  value={formData.age}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-soft/50 border border-primary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-text placeholder-text/50"
                  placeholder="Apni umar"
                />
                {errors.age && <p className="mt-1 text-sm text-red-400">{errors.age}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-text mb-2">
                  Jins (Gender)
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="gender"
                      value="male"
                      checked={formData.gender === 'male'}
                      onChange={handleChange}
                      className="mr-2 text-accent focus:ring-accent"
                    />
                    <span className="text-text">Male</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="gender"
                      value="female"
                      checked={formData.gender === 'female'}
                      onChange={handleChange}
                      className="mr-2 text-accent focus:ring-accent"
                    />
                    <span className="text-text">Female</span>
                  </label>
                </div>
                {errors.gender && <p className="mt-1 text-sm text-red-400">{errors.gender}</p>}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-8 bg-primary text-white px-6 py-3 rounded-lg hover:bg-accent transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {loading ? "Loading..." : 'Shuru karein'}
            </button>
          </form>
        </motion.div>
      </div>
    </ErrorBoundary>
  );
};

export default Onboarding;
