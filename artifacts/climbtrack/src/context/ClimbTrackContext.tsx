import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { SESSIONS, ExerciseDef, TrackingType } from '../data/sessions';
import { BadgeLevel } from '../data/badges';
import { findNewlyUnlocked, applyNewUnlocks, EarnedBadgeEntry } from '../utils/badgeEngine';

// ── Types ─────────────────────────────────────────────────────────────────────

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
  sessionIds?: string[];
  hidden?: boolean;
};

export type PendingBadgeNotification = {
  badgeId: string;
  level: BadgeLevel;
};

export type AppData = {
  sessionLogs: SessionLog[];
  exerciseDefaults: Record<string, ExerciseDefaults>;
  customExercises: ExerciseDef[];
  customCategories: string[];
  exerciseOverrides: Record<string, ExerciseOverride>;
  exerciseCategoryOrder: Record<string, string[]>;
  earnedBadges: Record<string, EarnedBadgeEntry[]>;
  pendingBadgeNotifications: PendingBadgeNotification[];
};

// ── Storage ───────────────────────────────────────────────────────────────────

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
        earnedBadges: parsed.earnedBadges ?? {},
        pendingBadgeNotifications: parsed.pendingBadgeNotifications ?? [],
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
    earnedBadges: {},
    pendingBadgeNotifications: [],
  };
};

// ── Badge evaluation helper ───────────────────────────────────────────────────

function evaluateAndMergeBadges(
  logs: SessionLog[],
  currentEarned: Record<string, EarnedBadgeEntry[]>,
  date: string,
): {
  earnedBadges: Record<string, EarnedBadgeEntry[]>;
  newNotifications: PendingBadgeNotification[];
} {
  const newUnlocks = findNewlyUnlocked(logs, currentEarned);
  const earnedBadges = applyNewUnlocks(currentEarned, newUnlocks, date);
  const newNotifications = newUnlocks.map(u => ({ badgeId: u.badgeId, level: u.level }));
  return { earnedBadges, newNotifications };
}

// ── Context ───────────────────────────────────────────────────────────────────

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
  // Badge management
  clearBadgeNotification: (badgeId: string, level: BadgeLevel) => void;
  // Data management
  exportData: () => void;
  importData: (jsonData: string) => boolean;
  clearData: () => void;
};

const ClimbTrackContext = createContext<ClimbTrackContextType | undefined>(undefined);

// ── Provider ──────────────────────────────────────────────────────────────────

export function ClimbTrackProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<AppData>(getInitialData);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  // ── Session logs ───────────────────────────────────────────────────────────

  const addSessionLog = useCallback((log: SessionLog) => {
    setData(prev => {
      const newLogs = [...prev.sessionLogs, log];
      const { earnedBadges, newNotifications } = evaluateAndMergeBadges(
        newLogs,
        prev.earnedBadges,
        log.date,
      );
      return {
        ...prev,
        sessionLogs: newLogs,
        earnedBadges,
        pendingBadgeNotifications: [
          ...prev.pendingBadgeNotifications,
          ...newNotifications,
        ],
      };
    });
  }, []);

  const deleteSessionLog = useCallback((id: string) => {
    setData(prev => {
      const newLogs = prev.sessionLogs.filter(s => s.id !== id);
      // Re-evaluate badges after deletion (some may be removed)
      const { earnedBadges } = evaluateAndMergeBadges(newLogs, {}, new Date().toISOString().split('T')[0]);
      return { ...prev, sessionLogs: newLogs, earnedBadges };
    });
  }, []);

  const updateSessionLog = useCallback((id: string, log: SessionLog) => {
    setData(prev => {
      const newLogs = prev.sessionLogs.map(s => s.id === id ? log : s);
      const { earnedBadges, newNotifications } = evaluateAndMergeBadges(
        newLogs,
        prev.earnedBadges,
        log.date,
      );
      return {
        ...prev,
        sessionLogs: newLogs,
        earnedBadges,
        pendingBadgeNotifications: [
          ...prev.pendingBadgeNotifications,
          ...newNotifications,
        ],
      };
    });
  }, []);

  // ── Exercise defaults ──────────────────────────────────────────────────────

  const updateExerciseDefault = useCallback((exerciseId: string, defs: Partial<ExerciseDefaults>) => {
    setData(prev => ({
      ...prev,
      exerciseDefaults: {
        ...prev.exerciseDefaults,
        [exerciseId]: { ...prev.exerciseDefaults[exerciseId], ...defs },
      },
    }));
  }, []);

  const resetDefaults = useCallback(() => {
    const defaultExDefs: Record<string, ExerciseDefaults> = {};
    SESSIONS.forEach(s => {
      s.exercises.forEach(e => { defaultExDefs[e.id] = { ...e.defaultValues }; });
    });
    setData(prev => ({ ...prev, exerciseDefaults: defaultExDefs }));
  }, []);

  // ── Exercise management ────────────────────────────────────────────────────

  const addExercise = useCallback((ex: Omit<ExerciseDef, 'id'> & { sessionIds?: string[] }) => {
    const id = `custom-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const newEx: ExerciseDef = {
      id, name: ex.name, description: ex.description ?? '',
      category: ex.category, tracking: ex.tracking,
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
  }, []);

  const deleteExercise = useCallback((id: string) => {
    setData(prev => ({
      ...prev,
      exerciseOverrides: {
        ...prev.exerciseOverrides,
        [id]: { ...prev.exerciseOverrides[id], hidden: true },
      },
    }));
  }, []);

  const restoreExercise = useCallback((id: string) => {
    setData(prev => {
      const { hidden: _hidden, ...rest } = prev.exerciseOverrides[id] ?? {};
      return {
        ...prev,
        exerciseOverrides: { ...prev.exerciseOverrides, [id]: rest },
      };
    });
  }, []);

  const updateExerciseOverride = useCallback((id: string, override: Partial<ExerciseOverride>) => {
    setData(prev => ({
      ...prev,
      exerciseOverrides: {
        ...prev.exerciseOverrides,
        [id]: { ...prev.exerciseOverrides[id], ...override },
      },
    }));
  }, []);

  const setExerciseCategoryOrder = useCallback((category: string, orderedIds: string[]) => {
    setData(prev => ({
      ...prev,
      exerciseCategoryOrder: { ...prev.exerciseCategoryOrder, [category]: orderedIds },
    }));
  }, []);

  // ── Category management ────────────────────────────────────────────────────

  const addCategory = useCallback((name: string) => {
    setData(prev => ({
      ...prev,
      customCategories: prev.customCategories.includes(name)
        ? prev.customCategories
        : [...prev.customCategories, name],
    }));
  }, []);

  const renameCategory = useCallback((oldName: string, newName: string) => {
    setData(prev => {
      const updatedCustom = prev.customExercises.map(ex =>
        ex.category === oldName ? { ...ex, category: newName } : ex,
      );
      const updatedOverrides: Record<string, ExerciseOverride> = {};
      Object.entries(prev.exerciseOverrides).forEach(([id, ov]) => {
        updatedOverrides[id] = ov.category === oldName ? { ...ov, category: newName } : ov;
      });
      const updatedOrder = { ...prev.exerciseCategoryOrder };
      if (updatedOrder[oldName]) {
        updatedOrder[newName] = updatedOrder[oldName];
        delete updatedOrder[oldName];
      }
      return {
        ...prev,
        customExercises: updatedCustom,
        exerciseOverrides: updatedOverrides,
        exerciseCategoryOrder: updatedOrder,
        customCategories: prev.customCategories.map(c => c === oldName ? newName : c),
      };
    });
  }, []);

  const deleteCategory = useCallback((name: string, fallbackCategory: string) => {
    setData(prev => {
      const updatedCustom = prev.customExercises.map(ex =>
        ex.category === name ? { ...ex, category: fallbackCategory } : ex,
      );
      const updatedOverrides: Record<string, ExerciseOverride> = {};
      Object.entries(prev.exerciseOverrides).forEach(([id, ov]) => {
        updatedOverrides[id] = ov.category === name ? { ...ov, category: fallbackCategory } : ov;
      });
      const updatedOrder = { ...prev.exerciseCategoryOrder };
      delete updatedOrder[name];
      return {
        ...prev,
        customExercises: updatedCustom,
        exerciseOverrides: updatedOverrides,
        customCategories: prev.customCategories.filter(c => c !== name),
        exerciseCategoryOrder: updatedOrder,
      };
    });
  }, []);

  // ── Badge management ───────────────────────────────────────────────────────

  const clearBadgeNotification = useCallback((badgeId: string, level: BadgeLevel) => {
    setData(prev => ({
      ...prev,
      pendingBadgeNotifications: prev.pendingBadgeNotifications.filter(
        n => !(n.badgeId === badgeId && n.level === level),
      ),
    }));
  }, []);

  // ── Data management ────────────────────────────────────────────────────────

  const exportData = useCallback(() => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `climbtrack-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [data]);

  const importData = useCallback((jsonData: string) => {
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
          earnedBadges: parsed.earnedBadges ?? {},
          pendingBadgeNotifications: [],
        });
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, []);

  const clearData = useCallback(() => {
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
      earnedBadges: {},
      pendingBadgeNotifications: [],
    });
  }, []);

  return (
    <ClimbTrackContext.Provider value={{
      data,
      addSessionLog, deleteSessionLog, updateSessionLog,
      updateExerciseDefault, resetDefaults,
      addExercise, deleteExercise, restoreExercise,
      updateExerciseOverride, setExerciseCategoryOrder,
      addCategory, renameCategory, deleteCategory,
      clearBadgeNotification,
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
