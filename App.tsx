import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Assessment from './pages/Assessment';
import PracticeHub from './pages/PracticeHub';
import LiveCoach from './components/LiveCoach';
import { AppProvider } from './context/AppContext';

const App = () => {
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