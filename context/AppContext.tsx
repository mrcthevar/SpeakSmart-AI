import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserProfile, UserLevel, SessionResult } from '../types';

interface AppContextType {
  user: UserProfile;
  sessions: SessionResult[];
  addSession: (session: SessionResult) => void;
  updateUserGoals: (goals: string[]) => void;
  updateUserLevel: (level: UserLevel) => void;
}

const defaultUser: UserProfile = {
  name: "Guest User",
  level: UserLevel.Beginner,
  goals: [],
  streak: 0,
  xp: 0,
  completedSessions: 0,
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children?: ReactNode }) => {
  const [user, setUser] = useState<UserProfile>(defaultUser);
  const [sessions, setSessions] = useState<SessionResult[]>([]);

  const addSession = (session: SessionResult) => {
    setSessions(prev => [session, ...prev]);
    setUser(prev => ({
        ...prev,
        xp: prev.xp + 50,
        completedSessions: prev.completedSessions + 1
    }));
  };

  const updateUserGoals = (goals: string[]) => {
    setUser(prev => ({ ...prev, goals }));
  };

  const updateUserLevel = (level: UserLevel) => {
    setUser(prev => ({ ...prev, level }));
  };

  return (
    <AppContext.Provider value={{ user, sessions, addSession, updateUserGoals, updateUserLevel }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};