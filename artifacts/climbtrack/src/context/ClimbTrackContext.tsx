import React, { createContext, useContext, useEffect, useState } from 'react';
import { SESSIONS } from '../data/sessions';

export type ExerciseDefaults = {
  sets: number;
  reps?: number;
  duration?: number;
  weight?: number;
  assistance?: string;
  restSeconds: number;
};

export type ExerciseLog = {
  exerciseId: string;
  completed: boolean;
  sets: number;
  reps?: number;
  duration?: number;
  weight?: number;
  assistance?: string;
  progressionValue?: number;
};

export type SessionLog = {
  id: string;
  date: string; // YYYY-MM-DD
  sessionId: string;
  exerciseLogs: ExerciseLog[];
  note?: string;
  isRestDay?: boolean;
  pain?: Record<string, number>;
};

export type AppData = {
  sessionLogs: SessionLog[];
  exerciseDefaults: Record<string, ExerciseDefaults>;
};

const STORAGE_KEY = 'climbtrack_data';

const getInitialData = (): AppData => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error("Failed to load ClimbTrack data", e);
  }
  
  // Create default overrides dict
  const defaultExDefs: Record<string, ExerciseDefaults> = {};
  SESSIONS.forEach(s => {
    s.exercises.forEach(e => {
      defaultExDefs[e.id] = { ...e.defaultValues };
    });
  });

  return { sessionLogs: [], exerciseDefaults: defaultExDefs };
};

type ClimbTrackContextType = {
  data: AppData;
  addSessionLog: (log: SessionLog) => void;
  deleteSessionLog: (id: string) => void;
  updateSessionLog: (id: string, log: SessionLog) => void;
  updateExerciseDefault: (exerciseId: string, defs: Partial<ExerciseDefaults>) => void;
  resetDefaults: () => void;
  exportData: () => void;
  importData: (jsonData: string) => boolean;
  clearData: () => void;
};

const ClimbTrackContext = createContext<ClimbTrackContextType | undefined>(undefined);

export function ClimbTrackProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<AppData>(getInitialData);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  const addSessionLog = (log: SessionLog) => {
    setData(prev => ({ ...prev, sessionLogs: [...prev.sessionLogs, log] }));
  };

  const deleteSessionLog = (id: string) => {
    setData(prev => ({ ...prev, sessionLogs: prev.sessionLogs.filter(s => s.id !== id) }));
  };

  const updateSessionLog = (id: string, log: SessionLog) => {
    setData(prev => ({
      ...prev,
      sessionLogs: prev.sessionLogs.map(s => s.id === id ? log : s)
    }));
  };

  const updateExerciseDefault = (exerciseId: string, defs: Partial<ExerciseDefaults>) => {
    setData(prev => ({
      ...prev,
      exerciseDefaults: {
        ...prev.exerciseDefaults,
        [exerciseId]: { ...prev.exerciseDefaults[exerciseId], ...defs }
      }
    }));
  };

  const resetDefaults = () => {
    const defaultExDefs: Record<string, ExerciseDefaults> = {};
    SESSIONS.forEach(s => {
      s.exercises.forEach(e => {
        defaultExDefs[e.id] = { ...e.defaultValues };
      });
    });
    setData(prev => ({ ...prev, exerciseDefaults: defaultExDefs }));
  };

  const exportData = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `climbtrack-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const importData = (jsonData: string) => {
    try {
      const parsed = JSON.parse(jsonData);
      if (parsed && Array.isArray(parsed.sessionLogs) && parsed.exerciseDefaults) {
        setData(parsed);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const clearData = () => {
    setData({
      sessionLogs: [],
      exerciseDefaults: getInitialData().exerciseDefaults
    });
  };

  return (
    <ClimbTrackContext.Provider value={{
      data,
      addSessionLog,
      deleteSessionLog,
      updateSessionLog,
      updateExerciseDefault,
      resetDefaults,
      exportData,
      importData,
      clearData
    }}>
      {children}
    </ClimbTrackContext.Provider>
  );
}

export const useClimbTrack = () => {
  const context = useContext(ClimbTrackContext);
  if (!context) throw new Error("useClimbTrack must be used within ClimbTrackProvider");
  return context;
};