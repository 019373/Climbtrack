import React, { createContext, useContext, useEffect, useState } from 'react';
import { SESSIONS, ExerciseDef, TrackingType } from '../data/sessions';

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

export type ExerciseOverride = {
  name?: string;
  category?: string;
  tracking?: TrackingType;
  description?: string;
  /** Explicit session assignment (overrides built-in or custom default). */
  sessionIds?: string[];
  /** If true, exercise is hidden from all sessions (data kept for history). */
  hidden?: boolean;
};

export type AppData = {
  sessionLogs: SessionLog[];
  exerciseDefaults: Record<string, ExerciseDefaults>;
  /** User-created exercises */
  customExercises: ExerciseDef[];
  /** User-created category names */
  customCategories: string[];
  /** Per-exercise metadata overrides (name, category, sessions, hidden) */
  exerciseOverrides: Record<string, ExerciseOverride>;
  /** Ordered exercise IDs per category name */
  exerciseCategoryOrder: Record<string, string[]>;
};

const STORAGE_KEY = 'climbtrack_data';

const getInitialData = (): AppData => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        sessionLogs: parsed.sessionLogs ?? [],
        exerciseDefaults: parsed.exerciseDefaults ?? {},
        customExercises: parsed.customExercises ?? [],
        customCategories: parsed.customCategories ?? [],
        exerciseOverrides: parsed.exerciseOverrides ?? {},
        exerciseCategoryOrder: parsed.exerciseCategoryOrder ?? {},
      };
    }
  } catch (e) {
    console.error('Failed to load ClimbTrack data', e);
  }

  const defaultExDefs: Record<string, ExerciseDefaults> = {};
  SESSIONS.forEach(s => {
    s.exercises.forEach(e => { defaultExDefs[e.id] = { ...e.defaultValues }; });
  });

  return {
    sessionLogs: [],
    exerciseDefaults: defaultExDefs,
    customExercises: [],
    customCategories: [],
    exerciseOverrides: {},
    exerciseCategoryOrder: {},
  };
};

type ClimbTrackContextType = {
  data: AppData;
  // Session logs
  addSessionLog: (log: SessionLog) => void;
  deleteSessionLog: (id: string) => void;
  updateSessionLog: (id: string, log: SessionLog) => void;
  // Exercise defaults
  updateExerciseDefault: (exerciseId: string, defs: Partial<ExerciseDefaults>) => void;
  resetDefaults: () => void;
  // Exercise management
  addExercise: (ex: Omit<ExerciseDef, 'id'> & { sessionIds?: string[] }) => void;
  deleteExercise: (id: string) => void;
  restoreExercise: (id: string) => void;
  updateExerciseOverride: (id: string, override: Partial<ExerciseOverride>) => void;
  setExerciseCategoryOrder: (category: string, orderedIds: string[]) => void;
  // Category management
  addCategory: (name: string) => void;
  renameCategory: (oldName: string, newName: string) => void;
  deleteCategory: (name: string, fallbackCategory: string) => void;
  // Data management
  exportData: () => void;
  importData: (jsonData: string) => boolean;
  clearData: () => void;
};

const ClimbTrackContext = createContext<ClimbTrackContextType | undefined>(undefined);

export function ClimbTrackProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<AppData>(getInitialData);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  const addSessionLog = (log: SessionLog) =>
    setData(prev => ({ ...prev, sessionLogs: [...prev.sessionLogs, log] }));

  const deleteSessionLog = (id: string) =>
    setData(prev => ({ ...prev, sessionLogs: prev.sessionLogs.filter(s => s.id !== id) }));

  const updateSessionLog = (id: string, log: SessionLog) =>
    setData(prev => ({
      ...prev,
      sessionLogs: prev.sessionLogs.map(s => s.id === id ? log : s),
    }));

  const updateExerciseDefault = (exerciseId: string, defs: Partial<ExerciseDefaults>) =>
    setData(prev => ({
      ...prev,
      exerciseDefaults: {
        ...prev.exerciseDefaults,
        [exerciseId]: { ...prev.exerciseDefaults[exerciseId], ...defs },
      },
    }));

  const resetDefaults = () => {
    const defaultExDefs: Record<string, ExerciseDefaults> = {};
    SESSIONS.forEach(s => {
      s.exercises.forEach(e => { defaultExDefs[e.id] = { ...e.defaultValues }; });
    });
    setData(prev => ({ ...prev, exerciseDefaults: defaultExDefs }));
  };

  // ── Exercise management ────────────────────────────────────────────────────

  const addExercise = (ex: Omit<ExerciseDef, 'id'> & { sessionIds?: string[] }) => {
    const id = `custom-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const newEx: ExerciseDef = {
      id,
      name: ex.name,
      description: ex.description ?? '',
      category: ex.category,
      tracking: ex.tracking,
      defaultValues: ex.defaultValues,
      assistanceOptions: ex.assistanceOptions,
      isHangboard: ex.isHangboard,
      sessionIds: ex.sessionIds ?? [],
    };
    setData(prev => ({
      ...prev,
      customExercises: [...prev.customExercises, newEx],
      exerciseDefaults: { ...prev.exerciseDefaults, [id]: { ...ex.defaultValues } },
    }));
  };

  const deleteExercise = (id: string) =>
    setData(prev => ({
      ...prev,
      exerciseOverrides: {
        ...prev.exerciseOverrides,
        [id]: { ...prev.exerciseOverrides[id], hidden: true },
      },
    }));

  const restoreExercise = (id: string) =>
    setData(prev => {
      const { hidden: _hidden, ...rest } = prev.exerciseOverrides[id] ?? {};
      return {
        ...prev,
        exerciseOverrides: { ...prev.exerciseOverrides, [id]: rest },
      };
    });

  const updateExerciseOverride = (id: string, override: Partial<ExerciseOverride>) =>
    setData(prev => ({
      ...prev,
      exerciseOverrides: {
        ...prev.exerciseOverrides,
        [id]: { ...prev.exerciseOverrides[id], ...override },
      },
    }));

  const setExerciseCategoryOrder = (category: string, orderedIds: string[]) =>
    setData(prev => ({
      ...prev,
      exerciseCategoryOrder: { ...prev.exerciseCategoryOrder, [category]: orderedIds },
    }));

  // ── Category management ────────────────────────────────────────────────────

  const addCategory = (name: string) =>
    setData(prev => ({
      ...prev,
      customCategories: prev.customCategories.includes(name)
        ? prev.customCategories
        : [...prev.customCategories, name],
    }));

  const renameCategory = (oldName: string, newName: string) => {
    setData(prev => {
      // Update custom exercises whose category matches
      const updatedCustom = prev.customExercises.map(ex =>
        ex.category === oldName ? { ...ex, category: newName } : ex,
      );
      // Update overrides whose category matches
      const updatedOverrides: Record<string, ExerciseOverride> = {};
      Object.entries(prev.exerciseOverrides).forEach(([id, ov]) => {
        updatedOverrides[id] = ov.category === oldName ? { ...ov, category: newName } : ov;
      });
      // Update category order map
      const updatedOrder = { ...prev.exerciseCategoryOrder };
      if (updatedOrder[oldName]) {
        updatedOrder[newName] = updatedOrder[oldName];
        delete updatedOrder[oldName];
      }
      // Update custom categories list
      const updatedCustomCats = prev.customCategories.map(c => c === oldName ? newName : c);
      return {
        ...prev,
        customExercises: updatedCustom,
        exerciseOverrides: updatedOverrides,
        exerciseCategoryOrder: updatedOrder,
        customCategories: updatedCustomCats,
      };
    });
  };

  const deleteCategory = (name: string, fallbackCategory: string) => {
    setData(prev => {
      // Move custom exercises in this category to fallback
      const updatedCustom = prev.customExercises.map(ex =>
        ex.category === name ? { ...ex, category: fallbackCategory } : ex,
      );
      // Move built-in exercise overrides with this category to fallback
      const updatedOverrides: Record<string, ExerciseOverride> = {};
      Object.entries(prev.exerciseOverrides).forEach(([id, ov]) => {
        updatedOverrides[id] = ov.category === name ? { ...ov, category: fallbackCategory } : ov;
      });
      // Remove from custom categories
      const updatedCustomCats = prev.customCategories.filter(c => c !== name);
      // Clean up category order
      const updatedOrder = { ...prev.exerciseCategoryOrder };
      delete updatedOrder[name];
      return {
        ...prev,
        customExercises: updatedCustom,
        exerciseOverrides: updatedOverrides,
        customCategories: updatedCustomCats,
        exerciseCategoryOrder: updatedOrder,
      };
    });
  };

  // ── Data management ────────────────────────────────────────────────────────

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
        setData({
          sessionLogs: parsed.sessionLogs ?? [],
          exerciseDefaults: parsed.exerciseDefaults ?? {},
          customExercises: parsed.customExercises ?? [],
          customCategories: parsed.customCategories ?? [],
          exerciseOverrides: parsed.exerciseOverrides ?? {},
          exerciseCategoryOrder: parsed.exerciseCategoryOrder ?? {},
        });
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const clearData = () => {
    const defaultExDefs: Record<string, ExerciseDefaults> = {};
    SESSIONS.forEach(s => {
      s.exercises.forEach(e => { defaultExDefs[e.id] = { ...e.defaultValues }; });
    });
    setData({
      sessionLogs: [],
      exerciseDefaults: defaultExDefs,
      customExercises: [],
      customCategories: [],
      exerciseOverrides: {},
      exerciseCategoryOrder: {},
    });
  };

  return (
    <ClimbTrackContext.Provider value={{
      data,
      addSessionLog, deleteSessionLog, updateSessionLog,
      updateExerciseDefault, resetDefaults,
      addExercise, deleteExercise, restoreExercise,
      updateExerciseOverride, setExerciseCategoryOrder,
      addCategory, renameCategory, deleteCategory,
      exportData, importData, clearData,
    }}>
      {children}
    </ClimbTrackContext.Provider>
  );
}

export const useClimbTrack = () => {
  const context = useContext(ClimbTrackContext);
  if (!context) throw new Error('useClimbTrack must be used within ClimbTrackProvider');
  return context;
};
