import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, BarChart3, Clock, Database, Lock, RefreshCw, Server, Settings, Shield, Users, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useStyleVector } from '../context/StyleVectorContext';
import { useMood } from '../context/MoodContext';

interface SystemMetric {
  name: string;
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
}

interface AIModel {
  name: string;
  status: 'training' | 'ready' | 'offline';
  accuracy: number;
  lastTraining: number;
}

interface ErrorLog {
  timestamp: number;
  message: string;
  stack?: string;
  componentStack?: string;
}

const getSilenceUntil = () => {
  const val = localStorage.getItem('mehfil-silenceUntil');
  if (!val) return 0;
  return parseInt(val, 10) || 0;
};

const formatDate = (timestamp: number) => {
  const d = new Date(timestamp);
  return d.toLocaleString();
};

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [systemMetrics, setSystemMetrics] = useState<SystemMetric[]>([]);
  const [aiModels, setAiModels] = useState<AIModel[]>([]);
  const [errorLogs, setErrorLogs] = useState<ErrorLog[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [recentVisitors, setRecentVisitors] = useState<number>(0);

  // Silence toggle state
  const [silenceDays, setSilenceDays] = useState(3);
  const [silenceUntil, setSilenceUntil] = useState<number>(getSilenceUntil());

  // Style stats
  const { styleVector, topWords } = useStyleVector ? useStyleVector() : { styleVector: { totalSentences: 0, totalChars: 0, totalEmojis: 0, wordFreq: {} }, topWords: [] };

  // Mood entries (stub: count of 'mehfil-todaysMood' in localStorage history, or 0 if not tracked)
  // For now, just show 0 or add logic if you have mood history
  const moodEntries = 0;

  // Diary entries = totalSentences
  const diaryEntries = styleVector.totalSentences;

  // Whispers sent: count of all true values in today's mehfil-whispersSent
  const getWhispersSentCount = () => {
    const data = localStorage.getItem('mehfil-whispersSent');
    if (!data) return 0;
    try {
      const parsed = JSON.parse(data);
      let count = 0;
      Object.values(parsed).forEach((day: any) => {
        count += Object.values(day).filter(Boolean).length;
      });
      return count;
    } catch {
      return 0;
    }
  };
  const whispersSent = getWhispersSentCount();

  const OWNER_ID = 'owner'; // This should be the ID of the owner in a real app

  const { totalMoodEntries } = useMood();

  useEffect(() => {
    // Check if current user is the owner
    if (user?.id !== OWNER_ID) {
      navigate('/');
      return;
    }

    loadMockData();
    
    // Load error logs from localStorage
    const storedErrors = localStorage.getItem('mehfil-errors');
    if (storedErrors) {
      setErrorLogs(JSON.parse(storedErrors));
    }
    
    // Calculate active users in the last day
    const heartbeats = JSON.parse(localStorage.getItem('mehfil-heartbeats') || '[]');
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    const recentUsers = new Set(
      heartbeats
        .filter((h: any) => h.timestamp > oneDayAgo)
        .map((h: any) => h.userId)
    ).size;
    
    setRecentVisitors(recentUsers);
    
    // Update every 30 seconds
    const interval = setInterval(() => {
      setRecentVisitors(Math.floor(Math.random() * 10));
    }, 30000);
    
    setSilenceUntil(getSilenceUntil());
    
    return () => {
      clearInterval(interval);
    };
  }, [navigate]);

  const loadMockData = () => {
    // Mock system metrics
    const mockMetrics: SystemMetric[] = [
      { name: 'Active Users', value: 7, unit: 'users', trend: 'up' },
      { name: 'Response Time', value: 182, unit: 'ms', trend: 'down' },
      { name: 'Memory Usage', value: 42, unit: '%', trend: 'stable' },
      { name: 'CPU Load', value: 23, unit: '%', trend: 'up' },
      { name: 'Storage', value: 16, unit: 'GB', trend: 'stable' },
    ];
    
    // Mock AI models
    const mockAiModels: AIModel[] = [
      { 
        name: 'User Preference Model', 
        status: 'ready', 
        accuracy: 91.4, 
        lastTraining: Date.now() - 3 * 60 * 60 * 1000 
      },
      { 
        name: 'Content Recommendation', 
        status: 'training', 
        accuracy: 84.7, 
        lastTraining: Date.now() - 12 * 60 * 60 * 1000 
      },
      { 
        name: 'Sentiment Analysis', 
        status: 'ready', 
        accuracy: 89.2, 
        lastTraining: Date.now() - 8 * 60 * 60 * 1000 
      },
      { 
        name: 'User Behavior Prediction', 
        status: 'offline', 
        accuracy: 78.5, 
        lastTraining: Date.now() - 3 * 24 * 60 * 60 * 1000 
      },
    ];
    
    setSystemMetrics(mockMetrics);
    setAiModels(mockAiModels);
  };

  const refreshData = () => {
    setIsRefreshing(true);
    
    // Simulate data refresh
    setTimeout(() => {
      loadMockData();
      
      // Load fresh error logs
      const storedErrors = localStorage.getItem('mehfil-errors');
      if (storedErrors) {
        setErrorLogs(JSON.parse(storedErrors));
      }
      
      setIsRefreshing(false);
    }, 800);
  };

  const clearErrorLogs = () => {
    localStorage.removeItem('mehfil-errors');
    setErrorLogs([]);
  };

  const handleSilence = () => {
    const until = Date.now() + silenceDays * 86400000;
    localStorage.setItem('mehfil-silenceUntil', until.toString());
    setSilenceUntil(until);
  };

  const handleUndoSilence = () => {
    localStorage.removeItem('mehfil-silenceUntil');
    setSilenceUntil(0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto p-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => navigate('/')}
              className="p-2 rounded-full hover:bg-gray-100"
            >
              <ArrowLeft size={20} className="text-gray-600" />
            </button>
            <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
            <p className="text-xs text-gray-500 ml-4">Build Phase: 2 / 3</p>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={refreshData}
              disabled={isRefreshing}
              className={`p-2 rounded-full ${isRefreshing ? 'text-blue-400' : 'text-blue-600 hover:bg-blue-50'}`}
            >
              <RefreshCw size={20} className={isRefreshing ? 'animate-spin' : ''} />
            </button>
            <div className="text-sm text-gray-500">
              Last updated: {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>
        
        <div className="flex gap-6">
          {/* Sidebar */}
          <div className="w-56 bg-white rounded-lg shadow-sm p-4">
            <div className="space-y-1">
              <button
                onClick={() => setActiveTab('overview')}
                className={`w-full text-left px-3 py-2 rounded-md flex items-center gap-2 ${
                  activeTab === 'overview' 
                    ? 'bg-blue-50 text-blue-600' 
                    : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                <BarChart3 size={18} />
                <span>Overview</span>
              </button>
              
              <button
                onClick={() => setActiveTab('ai')}
                className={`w-full text-left px-3 py-2 rounded-md flex items-center gap-2 ${
                  activeTab === 'ai' 
                    ? 'bg-blue-50 text-blue-600' 
                    : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                <Zap size={18} />
                <span>AI Models</span>
              </button>
              
              <button
                onClick={() => setActiveTab('users')}
                className={`w-full text-left px-3 py-2 rounded-md flex items-center gap-2 ${
                  activeTab === 'users' 
                    ? 'bg-blue-50 text-blue-600' 
                    : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                <Users size={18} />
                <span>Users</span>
              </button>
              
              <button
                onClick={() => setActiveTab('security')}
                className={`w-full text-left px-3 py-2 rounded-md flex items-center gap-2 ${
                  activeTab === 'security' 
                    ? 'bg-blue-50 text-blue-600' 
                    : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                <Shield size={18} />
                <span>Security</span>
              </button>
              
              <button
                onClick={() => setActiveTab('logs')}
                className={`w-full text-left px-3 py-2 rounded-md flex items-center gap-2 ${
                  activeTab === 'logs' 
                    ? 'bg-blue-50 text-blue-600' 
                    : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                <Server size={18} />
                <span>Error Logs</span>
              </button>
              
              <button
                onClick={() => setActiveTab('settings')}
                className={`w-full text-left px-3 py-2 rounded-md flex items-center gap-2 ${
                  activeTab === 'settings' 
                    ? 'bg-blue-50 text-blue-600' 
                    : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                <Settings size={18} />
                <span>Settings</span>
              </button>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="flex-1">
            {activeTab === 'overview' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm text-gray-500">Kulshahr Mulaqaatein</p>
                        <h3 className="text-2xl font-bold text-gray-800">{recentVisitors}</h3>
                      </div>
                      <div className="p-2 rounded-full bg-blue-50">
                        <Users size={20} className="text-blue-600" />
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Pichle 24 ghante mein
                    </p>
                  </div>
                  
                  <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm text-gray-500">Active Qisse</p>
                        <h3 className="text-2xl font-bold text-gray-800">
                          {JSON.parse(localStorage.getItem('mehfil-qissas') || '[]')
                            .filter((q: any) => !q.completed).length}
                        </h3>
                      </div>
                      <div className="p-2 rounded-full bg-amber-50">
                        <Database size={20} className="text-amber-600" />
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Is waqt jari
                    </p>
                  </div>
                  
                  <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm text-gray-500">System Uptime</p>
                        <h3 className="text-2xl font-bold text-gray-800">99.9%</h3>
                      </div>
                      <div className="p-2 rounded-full bg-green-50">
                        <Clock size={20} className="text-green-600" />
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Pichle 30 din
                    </p>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100 mb-6">
                  <h3 className="font-medium text-gray-800 mb-4">System Metrics</h3>
                  <div className="space-y-4">
                    {systemMetrics.map(metric => (
                      <div key={metric.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-700">{metric.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-800">
                            {metric.value} {metric.unit}
                          </span>
                          <span className={`text-xs ${
                            metric.trend === 'up' 
                              ? 'text-green-500' 
                              : metric.trend === 'down' 
                                ? 'text-blue-500' 
                                : 'text-gray-500'
                          }`}>
                            {metric.trend === 'up' ? '↑' : metric.trend === 'down' ? '↓' : '→'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
                  <h3 className="font-medium text-gray-800 mb-4">Recent Activity</h3>
                  <div className="text-center py-8 text-gray-500">
                    Activity graph will be displayed here
                  </div>
                </div>
              </motion.div>
            )}
            
            {activeTab === 'ai' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100 mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-medium text-gray-800">AI Models</h3>
                    <button className="px-3 py-1 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600">
                      Train All Models
                    </button>
                  </div>
                  <div className="space-y-4">
                    {aiModels.map(model => (
                      <div 
                        key={model.name}
                        className="border border-gray-200 rounded-md p-3"
                      >
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${
                              model.status === 'ready' 
                                ? 'bg-green-500' 
                                : model.status === 'training' 
                                  ? 'bg-amber-500' 
                                  : 'bg-gray-400'
                            }`} />
                            <h4 className="font-medium text-gray-800">{model.name}</h4>
                          </div>
                          <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                            {model.status === 'ready' 
                              ? 'Ready' 
                              : model.status === 'training' 
                                ? 'Training' 
                                : 'Offline'}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-600 mb-2">
                          <span>Accuracy</span>
                          <span className="font-medium">{model.accuracy.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div 
                            className="bg-blue-600 h-1.5 rounded-full" 
                            style={{ width: `${model.accuracy}%` }}
                          />
                        </div>
                        <div className="flex justify-between items-center mt-3">
                          <span className="text-xs text-gray-500">
                            Last trained: {new Date(model.lastTraining).toLocaleString()}
                          </span>
                          <button 
                            disabled={model.status === 'training'}
                            className={`text-xs px-2 py-1 rounded-md ${
                              model.status === 'training'
                                ? 'bg-gray-100 text-gray-400'
                                : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                            }`}
                          >
                            {model.status === 'training' ? 'Training...' : 'Train Model'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
                  <h3 className="font-medium text-gray-800 mb-4">AI Training Data</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">User Interactions</span>
                      <span className="font-medium text-gray-800">4,253 records</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Content Preferences</span>
                      <span className="font-medium text-gray-800">1,872 records</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Session Patterns</span>
                      <span className="font-medium text-gray-800">738 records</span>
                    </div>
                    <div className="mt-4 flex justify-end">
                      <button className="text-xs px-2 py-1 text-gray-600 hover:text-gray-800">
                        Clear Training Data
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
            
            {activeTab === 'logs' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100 mb-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-medium text-gray-800">Error Logs</h3>
                    <button 
                      onClick={clearErrorLogs}
                      className="px-3 py-1 text-xs text-gray-600 hover:text-gray-800 border border-gray-200 rounded-md"
                    >
                      Clear Logs
                    </button>
                  </div>
                  
                  {errorLogs.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No errors recorded. App is running smoothly!
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {errorLogs.map((log, index) => (
                        <div 
                          key={index}
                          className="border border-red-100 rounded-md p-3 bg-red-50"
                        >
                          <div className="flex justify-between items-start">
                            <p className="font-medium text-red-600">{log.message}</p>
                            <span className="text-xs text-gray-500">
                              {new Date(log.timestamp).toLocaleString()}
                            </span>
                          </div>
                          {log.stack && (
                            <details className="mt-2">
                              <summary className="text-xs text-gray-600 cursor-pointer">
                                Stack Trace
                              </summary>
                              <pre className="mt-1 text-xs text-gray-600 p-2 bg-gray-100 rounded overflow-x-auto">
                                {log.stack}
                              </pre>
                            </details>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
            
            {activeTab === 'security' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100 mb-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Lock size={20} className="text-green-600" />
                    <h3 className="font-medium text-gray-800">Security Status</h3>
                  </div>
                  
                  <div className="p-4 bg-green-50 rounded-md mb-4">
                    <p className="text-green-700 font-medium">All systems secure</p>
                    <p className="text-sm text-green-600 mt-1">
                      Anonymity features working correctly
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Data Encryption</span>
                      <span className="text-green-600 font-medium">Active</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Anonymity Protection</span>
                      <span className="text-green-600 font-medium">Active</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Privacy Controls</span>
                      <span className="text-green-600 font-medium">Active</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
                  <h3 className="font-medium text-gray-800 mb-4">Anonymity Settings</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label htmlFor="strict-anonymity" className="text-gray-700">
                        Strict Anonymity Mode
                      </label>
                      <input 
                        type="checkbox"
                        id="strict-anonymity"
                        checked={true}
                        readOnly
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <label htmlFor="data-retention" className="text-gray-700">
                        Minimal Data Retention
                      </label>
                      <input 
                        type="checkbox"
                        id="data-retention"
                        checked={true}
                        readOnly
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <label htmlFor="auto-delete" className="text-gray-700">
                        Auto-delete Old Data
                      </label>
                      <input 
                        type="checkbox"
                        id="auto-delete"
                        checked={true}
                        readOnly
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
            
            {activeTab === 'users' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
                  <h3 className="font-medium text-gray-800 mb-4">User Statistics</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Total Registered Users</span>
                      <span className="font-medium text-gray-800">12</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Active in Last 7 Days</span>
                      <span className="font-medium text-gray-800">9</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">New Users This Month</span>
                      <span className="font-medium text-gray-800">3</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
            
            {activeTab === 'settings' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100 mb-6">
                  <h3 className="font-medium text-gray-800 mb-4">Application Settings</h3>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="app-name" className="block text-sm font-medium text-gray-700 mb-1">
                        Application Name
                      </label>
                      <input
                        type="text"
                        id="app-name"
                        defaultValue="Mehfil"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="maintenance-mode" className="flex items-center">
                        <input
                          type="checkbox"
                          id="maintenance-mode"
                          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 mr-2"
                        />
                        <span className="text-gray-700">Maintenance Mode</span>
                      </label>
                      <p className="text-xs text-gray-500 mt-1 ml-6">
                        When enabled, only admins can access the application
                      </p>
                    </div>
                    
                    <div>
                      <label htmlFor="ai-learning" className="flex items-center">
                        <input
                          type="checkbox"
                          id="ai-learning"
                          defaultChecked={true}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 mr-2"
                        />
                        <span className="text-gray-700">AI Learning</span>
                      </label>
                      <p className="text-xs text-gray-500 mt-1 ml-6">
                        Enable AI models to learn from user interactions
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-6 flex justify-end">
                    <button
                      className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                    >
                      Save Settings
                    </button>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
                  <h3 className="font-medium text-gray-800 mb-4">Advanced Options</h3>
                  <div className="space-y-3">
                    <button
                      className="w-full px-3 py-2 text-left text-gray-700 hover:bg-gray-50 rounded-md"
                    >
                      Export All Data
                    </button>
                    <button
                      className="w-full px-3 py-2 text-left text-gray-700 hover:bg-gray-50 rounded-md"
                    >
                      Rebuild AI Models
                    </button>
                    <button
                      className="w-full px-3 py-2 text-left text-red-600 hover:bg-red-50 rounded-md"
                    >
                      Reset Application
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
        <button
          className="mt-4 px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 transition"
          onClick={() => {
            if (window.confirm("This will wipe all Mehfil data on this device. Continue?")) {
              localStorage.clear();
              window.location.href = "/onboarding";
            }
          }}
        >
          Clear My Data
        </button>

        <section style={{ margin: '2em 0', padding: '1em', border: '1px solid #eee', borderRadius: 8 }}>
          <h3>🔕 Thodi Khamoshi Chahiye?</h3>
          {silenceUntil > Date.now() ? (
            <div>
              <p>🕊️ Khamoshi chalu hai till <b>{formatDate(silenceUntil)}</b></p>
              <button onClick={handleUndoSilence}>Undo</button>
            </div>
          ) : (
            <div>
              <label>
                Mehfil will rest for{' '}
                <select value={silenceDays} onChange={e => setSilenceDays(Number(e.target.value))}>
                  <option value={1}>1 day</option>
                  <option value={3}>3 days</option>
                  <option value={7}>7 days</option>
                </select>
              </label>
              <button style={{ marginLeft: 8 }} onClick={handleSilence}>Pause</button>
            </div>
          )}
        </section>

        <section style={{ margin: '2em 0', padding: '1em', border: '1px solid #eee', borderRadius: 8 }}>
          <h3>📊 Mehfil Stats</h3>
          <div>Mood entries: {totalMoodEntries}</div>
          <div>Diary entries: {diaryEntries}</div>
          <div>Whispers sent: {whispersSent}</div>
          <div>Top 3 words: {topWords.length > 0 ? topWords.join(', ') : '—'}</div>
        </section>
      </div>
    </div>
  );
};

export default AdminDashboard;
