import { AppData } from '../context/ClimbTrackContext';
import { ExerciseDef, SESSIONS, TrackingType } from '../data/sessions';

export const BUILTIN_CATEGORIES = [
  'Suspensions', 'Préhension', 'Tractions', 'Musculation', 'Gainage', 'Mobilité', 'Prévention',
];

export const TRACKING_LABELS: Record<TrackingType, string> = {
  'duration+assistance': 'Durée + Assistance',
  'reps': 'Répétitions',
  'weight': 'Charge',
  'weight+duration': 'Charge + Durée',
  'assistance': 'Assistance',
  'weight+reps': 'Charge + Répétitions',
  'duration': 'Durée',
  'none': 'Aucun suivi',
};

export const TRACKING_TYPES: TrackingType[] = [
  'duration+assistance', 'reps', 'weight', 'weight+duration',
  'assistance', 'weight+reps', 'duration', 'none',
];

/** Returns built-in exercise→session(s) mapping (an exercise may appear in one session). */
export function getBuiltinSessionMap(): Record<string, string[]> {
  const map: Record<string, string[]> = {};
  SESSIONS.forEach(s => {
    s.exercises.forEach(ex => {
      if (!map[ex.id]) map[ex.id] = [];
      map[ex.id].push(s.id);
    });
  });
  return map;
}

/** All built-in exercises, deduplicated by id. */
export function getAllBuiltinExercises(): ExerciseDef[] {
  const seen = new Set<string>();
  const result: ExerciseDef[] = [];
  SESSIONS.forEach(s => {
    s.exercises.forEach(ex => {
      if (!seen.has(ex.id)) { seen.add(ex.id); result.push(ex); }
    });
  });
  return result;
}

/** Returns all categories (built-in first, then custom). */
export function getAllCategories(data: AppData): string[] {
  const custom = (data.customCategories ?? []).filter(c => !BUILTIN_CATEGORIES.includes(c));
  return [...BUILTIN_CATEGORIES, ...custom];
}

/** Apply overrides (name, category, tracking) to an exercise. */
export function applyOverride(ex: ExerciseDef, data: AppData): ExerciseDef {
  const ov = data.exerciseOverrides?.[ex.id];
  if (!ov) return ex;
  return {
    ...ex,
    name: ov.name ?? ex.name,
    category: ov.category ?? ex.category,
    tracking: ov.tracking ?? ex.tracking,
    description: ov.description ?? ex.description,
  };
}

/** 
 * Returns effective exercises for a given session, respecting overrides,
 * custom exercises, hidden flags, and category ordering.
 */
export function getSessionExercises(sessionId: string, data: AppData): ExerciseDef[] {
  const session = SESSIONS.find(s => s.id === sessionId);
  if (!session) return [];

  const overrides = data.exerciseOverrides ?? {};
  const orderMap = data.exerciseCategoryOrder ?? {};
  const result: ExerciseDef[] = [];

  // 1. Built-in exercises for this session
  session.exercises.forEach(ex => {
    const ov = overrides[ex.id];
    if (ov?.hidden) return;
    // If sessionIds override exists, respect it
    if (ov?.sessionIds !== undefined && !ov.sessionIds.includes(sessionId)) return;
    result.push(applyOverride(ex, data));
  });

  // 2. Custom exercises assigned to this session
  (data.customExercises ?? []).forEach(ex => {
    const ov = overrides[ex.id];
    if (ov?.hidden) return;
    const sessionIds = ov?.sessionIds ?? ex.sessionIds ?? [];
    if (sessionIds.includes(sessionId)) {
      result.push(applyOverride(ex, data));
    }
  });

  // 3. Sort by exerciseCategoryOrder within each category
  result.sort((a, b) => {
    if (a.category !== b.category) return 0;
    const order = orderMap[a.category];
    if (!order) return 0;
    const ia = order.indexOf(a.id);
    const ib = order.indexOf(b.id);
    if (ia === -1 && ib === -1) return 0;
    if (ia === -1) return 1;
    if (ib === -1) return -1;
    return ia - ib;
  });

  return result;
}

/** All managed exercises (built-in + custom) with overrides applied — for the manager UI. */
export function getAllManagedExercises(data: AppData): ExerciseDef[] {
  const seen = new Set<string>();
  const result: ExerciseDef[] = [];

  getAllBuiltinExercises().forEach(ex => {
    seen.add(ex.id);
    result.push(applyOverride(ex, data));
  });

  (data.customExercises ?? []).forEach(ex => {
    if (!seen.has(ex.id)) {
      seen.add(ex.id);
      result.push(applyOverride(ex, data));
    }
  });

  return result;
}

/** Which sessions an exercise currently appears in (considering overrides). */
export function getExerciseSessionIds(exerciseId: string, data: AppData): string[] {
  const ov = data.exerciseOverrides?.[exerciseId];
  if (ov?.sessionIds !== undefined) return ov.sessionIds;

  // Check custom exercises
  const custom = (data.customExercises ?? []).find(e => e.id === exerciseId);
  if (custom) return custom.sessionIds ?? [];

  // Built-in: derive from SESSIONS
  return getBuiltinSessionMap()[exerciseId] ?? [];
}

/** Whether an exercise is hidden (deleted from sessions). */
export function isExerciseHidden(exerciseId: string, data: AppData): boolean {
  return data.exerciseOverrides?.[exerciseId]?.hidden === true;
}
