import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Assessment from './pages/Assessment';
import PracticeHub from './pages/PracticeHub';
import LiveCoach from './components/LiveCoach';
import { AppProvider } from './context/AppContext';

const App = () => {
  // Check for API key in env
  const hasApiKey = !!process.env.API_KEY;

  if (!hasApiKey) {
      return (
          <div className="min-h-screen flex items-center justify-center bg-slate-50 text-center p-6">
              <div className="bg-white p-10 rounded-2xl shadow-xl max-w-lg">
                  <h1 className="text-2xl font-bold text-red-600 mb-4">Configuration Error</h1>
                  <p className="text-slate-600">
                      The application cannot start because the <code className="bg-slate-100 px-2 py-1 rounded">API_KEY</code> environment variable is missing. 
                      Please configure your environment with a valid Google Gemini API Key.
                  </p>
              </div>
          </div>
      )
  }

  return (
    <AppProvider>
        <HashRouter>
        <Layout>
            <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/assessment" element={<Assessment />} />
            <Route path="/practice" element={<PracticeHub />} />
            <Route path="/coach" element={<LiveCoach />} />
            <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Layout>
        </HashRouter>
    </AppProvider>
  );
};

export default App;
