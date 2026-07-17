import { SessionLog } from '../context/ClimbTrackContext';
import { BADGES, BADGE_LEVELS, BadgeDef, BadgeLevel, BadgeLevelDef } from '../data/badges';

// Assistance options mapped to index (higher = harder)
const ASSISTANCE_INDEX: Record<string, number> = {
  'Deux pieds au sol, appui fort':  0,
  'Deux pieds au sol, appui moyen': 1,
  'Deux pieds au sol, appui léger': 2,
  'Un pied au sol':                 3,
  'Pointes des pieds':              4,
  'Sans assistance':                5,
  'Lesté':                          6,
};

export type EarnedBadgeEntry = { level: BadgeLevel; earnedAt: string };

/**
 * Compute a single numeric "best" for a badge given all session logs.
 * Returns -Infinity if no relevant data is found.
 */
export function computeBest(badge: BadgeDef, sessionLogs: SessionLog[]): number {
  if (!badge.exerciseId && badge.metric !== 'records') return -Infinity;

  const allLogs = sessionLogs.flatMap(sl => sl.exerciseLogs);
  const completed = badge.exerciseId
    ? allLogs.filter(el => el.exerciseId === badge.exerciseId && el.completed)
    : [];

  switch (badge.metric) {
    case 'weight':
      if (completed.length === 0) return -Infinity;
      return Math.max(...completed.map(l => l.weight ?? 0));

    case 'duration':
      if (completed.length === 0) return -Infinity;
      return Math.max(...completed.map(l => l.duration ?? 0));

    case 'reps':
      if (completed.length === 0) return -Infinity;
      return Math.max(...completed.map(l => l.reps ?? 0));

    case 'first':
      return completed.length > 0 ? 1 : -Infinity;

    case 'no-assistance-duration': {
      const noAssist = completed.filter(l =>
        l.assistance === 'Sans assistance' || l.assistance === 'Lesté'
      );
      if (noAssist.length === 0) return -Infinity;
      return Math.max(...noAssist.map(l => l.duration ?? 1)); // at least 1 = "first"
    }

    case 'assistance-min': {
      // Returns the max assistance index ever reached (higher = less assistance = harder)
      if (completed.length === 0) return -Infinity;
      // Special encoding: threshold 50 = "Sans assistance (index 5) × 3 separate sessions"
      const sessionsWithNoAssist = sessionLogs.filter(sl =>
        sl.exerciseLogs.some(el =>
          el.exerciseId === badge.exerciseId &&
          el.completed &&
          (el.assistance === 'Sans assistance' || el.assistance === 'Lesté')
        )
      ).length;
      if (sessionsWithNoAssist >= 3) return 50; // encoded threshold for gold

      return Math.max(
        ...completed.map(l => ASSISTANCE_INDEX[l.assistance ?? ''] ?? 0)
      );
    }

    case 'records':
      return countAllTimeRecords(sessionLogs);

    default:
      return -Infinity;
  }
}

/**
 * Count how many personal records were beaten across all exercises
 * (iterating session logs chronologically).
 */
export function countAllTimeRecords(sessionLogs: SessionLog[]): number {
  // Sort chronologically
  const sorted = [...sessionLogs].sort((a, b) => a.date.localeCompare(b.date));
  const prs: Record<string, number> = {}; // exerciseId → best value so far
  let count = 0;

  sorted.forEach(sl => {
    sl.exerciseLogs.forEach(el => {
      if (!el.completed) return;
      // Determine primary metric value
      let val: number | null = null;
      if ((el.weight ?? 0) > 0) val = el.weight ?? 0;
      else if ((el.duration ?? 0) > 0) val = el.duration ?? 0;
      else if ((el.reps ?? 0) > 0) val = el.reps ?? 0;

      if (val === null) return;

      const prev = prs[el.exerciseId];
      if (prev === undefined || val > prev) {
        prs[el.exerciseId] = val;
        if (prev !== undefined) count++; // only count if it's actually beating a previous best
      }
    });
  });

  return count;
}

/**
 * For one badge definition, return the list of levels that are NOW unlocked
 * based on session logs.
 */
export function getUnlockedLevels(badge: BadgeDef, sessionLogs: SessionLog[]): BadgeLevel[] {
  const best = computeBest(badge, sessionLogs);
  if (best === -Infinity) return [];

  return badge.levels
    .filter(levelDef => best >= levelDef.threshold)
    .map(levelDef => levelDef.level);
}

/**
 * Evaluate ALL badges and return which levels are currently earned.
 * Returns Record<badgeId, BadgeLevel[]>
 */
export function evaluateAllBadges(sessionLogs: SessionLog[]): Record<string, BadgeLevel[]> {
  const result: Record<string, BadgeLevel[]> = {};
  BADGES.forEach(badge => {
    result[badge.id] = getUnlockedLevels(badge, sessionLogs);
  });
  return result;
}

/**
 * Compute newly unlocked badge levels by comparing previous earnedBadges
 * to current evaluation result.
 *
 * Returns array of { badgeId, level } pairs that are newly unlocked.
 */
export function findNewlyUnlocked(
  sessionLogs: SessionLog[],
  earnedBadges: Record<string, EarnedBadgeEntry[]>,
): { badgeId: string; level: BadgeLevel }[] {
  const newUnlocks: { badgeId: string; level: BadgeLevel }[] = [];
  const current = evaluateAllBadges(sessionLogs);

  Object.entries(current).forEach(([badgeId, levels]) => {
    const alreadyEarned = new Set((earnedBadges[badgeId] ?? []).map(e => e.level));
    levels.forEach(level => {
      if (!alreadyEarned.has(level)) {
        newUnlocks.push({ badgeId, level });
      }
    });
  });

  return newUnlocks;
}

/**
 * Given the current earned badges (from AppData), apply newly unlocked entries.
 * Returns updated earnedBadges map.
 */
export function applyNewUnlocks(
  earnedBadges: Record<string, EarnedBadgeEntry[]>,
  newUnlocks: { badgeId: string; level: BadgeLevel }[],
  date: string,
): Record<string, EarnedBadgeEntry[]> {
  const updated = { ...earnedBadges };
  newUnlocks.forEach(({ badgeId, level }) => {
    updated[badgeId] = [...(updated[badgeId] ?? []), { level, earnedAt: date }];
  });
  return updated;
}

/**
 * Get the highest unlocked level for a badge (null if none).
 */
export function getHighestLevel(
  badgeId: string,
  earnedBadges: Record<string, EarnedBadgeEntry[]>,
): BadgeLevel | null {
  const earned = earnedBadges[badgeId] ?? [];
  if (earned.length === 0) return null;
  // Order: bronze < silver < gold < diamond
  const order: Record<BadgeLevel, number> = { bronze: 0, silver: 1, gold: 2, diamond: 3 };
  return earned.reduce((best, entry) =>
    order[entry.level] > order[best.level] ? entry : best
  ).level;
}
