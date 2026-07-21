import { SessionLog } from "../context/ClimbTrackContext";
import {
  BADGES,
  BadgeDef,
  BadgeLevel,
  BadgeLevelDef,
} from "../data/badges";

const ASSISTANCE_INDEX: Record<string, number> = {
  "Deux pieds au sol, appui fort": 0,
  "Deux pieds au sol, appui moyen": 1,
  "Deux pieds au sol, appui léger": 2,
  "Un pied au sol": 3,
  "Pointes des pieds": 4,
  "Sans assistance": 5,
  "Lesté": 6,
};

export type EarnedBadgeEntry = {
  level: BadgeLevel;
  earnedAt: string;
};

export function computeBest(
  badge: BadgeDef,
  sessionLogs: SessionLog[],
): number {
  if (
    !badge.exerciseId &&
    badge.metric !== "records"
  ) {
    return -Infinity;
  }

  const allExerciseLogs = sessionLogs.flatMap(
    (sessionLog) => sessionLog.exerciseLogs,
  );

  const completedLogs = badge.exerciseId
    ? allExerciseLogs.filter(
        (exerciseLog) =>
          exerciseLog.exerciseId ===
            badge.exerciseId &&
          exerciseLog.completed,
      )
    : [];

  switch (badge.metric) {
    case "weight":
      if (completedLogs.length === 0) {
        return -Infinity;
      }

      return Math.max(
        ...completedLogs.map(
          (exerciseLog) =>
            exerciseLog.weight ?? 0,
        ),
      );

    case "duration":
      if (completedLogs.length === 0) {
        return -Infinity;
      }

      return Math.max(
        ...completedLogs.map(
          (exerciseLog) =>
            exerciseLog.duration ?? 0,
        ),
      );

    case "reps":
      if (completedLogs.length === 0) {
        return -Infinity;
      }

      return Math.max(
        ...completedLogs.map(
          (exerciseLog) =>
            exerciseLog.reps ?? 0,
        ),
      );

    case "sets":
      if (completedLogs.length === 0) {
        return -Infinity;
      }

      return Math.max(
        ...completedLogs.map(
          (exerciseLog) =>
            exerciseLog.sets ?? 0,
        ),
      );

    case "sessions": {
      if (!badge.exerciseId) {
        return -Infinity;
      }

      const completedSessions =
        sessionLogs.filter((sessionLog) =>
          sessionLog.exerciseLogs.some(
            (exerciseLog) =>
              exerciseLog.exerciseId ===
                badge.exerciseId &&
              exerciseLog.completed,
          ),
        ).length;

      return completedSessions > 0
        ? completedSessions
        : -Infinity;
    }

    case "first":
      return completedLogs.length > 0
        ? 1
        : -Infinity;

    case "no-assistance-duration": {
      const noAssistanceLogs =
        completedLogs.filter(
          (exerciseLog) =>
            exerciseLog.assistance ===
              "Sans assistance" ||
            exerciseLog.assistance === "Lesté",
        );

      if (noAssistanceLogs.length === 0) {
        return -Infinity;
      }

      return Math.max(
        ...noAssistanceLogs.map(
          (exerciseLog) =>
            exerciseLog.duration ?? 1,
        ),
      );
    }

    case "assistance-min": {
      if (completedLogs.length === 0) {
        return -Infinity;
      }

      const sessionsWithoutAssistance =
        sessionLogs.filter((sessionLog) =>
          sessionLog.exerciseLogs.some(
            (exerciseLog) =>
              exerciseLog.exerciseId ===
                badge.exerciseId &&
              exerciseLog.completed &&
              (
                exerciseLog.assistance ===
                  "Sans assistance" ||
                exerciseLog.assistance ===
                  "Lesté"
              ),
          ),
        ).length;

      if (sessionsWithoutAssistance >= 3) {
        return 50;
      }

      return Math.max(
        ...completedLogs.map(
          (exerciseLog) =>
            ASSISTANCE_INDEX[
              exerciseLog.assistance ?? ""
            ] ?? 0,
        ),
      );
    }

    case "sloper-duration":
      if (completedLogs.length === 0) {
        return -Infinity;
      }

      /*
       * Pour l’affichage du record, on montre la meilleure
       * durée, tous angles confondus.
       *
       * Le déblocage vérifie ensuite précisément l’angle
       * et le nombre de séries.
       */
      return Math.max(
        ...completedLogs.map(
          (exerciseLog) =>
            exerciseLog.duration ?? 0,
        ),
      );

    case "records":
      return countAllTimeRecords(sessionLogs);

    default:
      return -Infinity;
  }
}

function isSloperLevelUnlocked(
  badge: BadgeDef,
  levelDefinition: BadgeLevelDef,
  sessionLogs: SessionLog[],
): boolean {
  if (!badge.exerciseId) return false;

  return sessionLogs.some((sessionLog) =>
    sessionLog.exerciseLogs.some(
      (exerciseLog) =>
        exerciseLog.exerciseId ===
          badge.exerciseId &&
        exerciseLog.completed &&
        (exerciseLog.sets ?? 0) >=
          (levelDefinition.minSets ?? 0) &&
        (exerciseLog.duration ?? 0) >=
          levelDefinition.threshold &&
        exerciseLog.progressionValue ===
          levelDefinition.angle,
    ),
  );
}

function isStandardLevelUnlocked(
  badge: BadgeDef,
  levelDefinition: BadgeLevelDef,
  sessionLogs: SessionLog[],
): boolean {
  const best = computeBest(badge, sessionLogs);

  if (best === -Infinity) return false;
  if (best < levelDefinition.threshold) return false;

  if (
    !badge.exerciseId ||
    levelDefinition.minSets === undefined
  ) {
    return true;
  }

  return sessionLogs.some((sessionLog) =>
    sessionLog.exerciseLogs.some(
      (exerciseLog) =>
        exerciseLog.exerciseId ===
          badge.exerciseId &&
        exerciseLog.completed &&
        (exerciseLog.sets ?? 0) >=
          levelDefinition.minSets! &&
        (
          badge.metric !== "reps" ||
          (exerciseLog.reps ?? 0) >=
            levelDefinition.threshold
        ),
    ),
  );
}

export function getUnlockedLevels(
  badge: BadgeDef,
  sessionLogs: SessionLog[],
): BadgeLevel[] {
  /*
   * Cas spécial des slopers :
   * les niveaux 30° et 45° sont deux progressions séparées.
   */
  if (badge.metric === "sloper-duration") {
    const unlocked: BadgeLevel[] = [];

    const levels30 = badge.levels.filter(
      (level) => level.angle === 30,
    );

    const levels45 = badge.levels.filter(
      (level) => level.angle === 45,
    );

    let highest30Index = -1;

    levels30.forEach((level, index) => {
      if (
        isSloperLevelUnlocked(
          badge,
          level,
          sessionLogs,
        )
      ) {
        highest30Index = Math.max(
          highest30Index,
          index,
        );
      }
    });

    if (highest30Index >= 0) {
      unlocked.push(
        ...levels30
          .slice(0, highest30Index + 1)
          .map((level) => level.level),
      );
    }

    let highest45Index = -1;

    levels45.forEach((level, index) => {
      if (
        isSloperLevelUnlocked(
          badge,
          level,
          sessionLogs,
        )
      ) {
        highest45Index = Math.max(
          highest45Index,
          index,
        );
      }
    });

    if (highest45Index >= 0) {
      unlocked.push(
        ...levels45
          .slice(0, highest45Index + 1)
          .map((level) => level.level),
      );
    }

    return unlocked;
  }

  /*
   * Tous les autres badges restent cumulatifs normalement.
   */
  let highestUnlockedIndex = -1;

  badge.levels.forEach(
    (levelDefinition, index) => {
      if (
        isStandardLevelUnlocked(
          badge,
          levelDefinition,
          sessionLogs,
        )
      ) {
        highestUnlockedIndex = Math.max(
          highestUnlockedIndex,
          index,
        );
      }
    },
  );

  if (highestUnlockedIndex === -1) {
    return [];
  }

  return badge.levels
    .slice(0, highestUnlockedIndex + 1)
    .map((level) => level.level);
}

export function countAllTimeRecords(
  sessionLogs: SessionLog[],
): number {
  const sortedLogs = [...sessionLogs].sort(
    (first, second) =>
      first.date.localeCompare(second.date),
  );

  const personalRecords: Record<
    string,
    number
  > = {};

  let recordCount = 0;

  sortedLogs.forEach((sessionLog) => {
    sessionLog.exerciseLogs.forEach(
      (exerciseLog) => {
        if (!exerciseLog.completed) return;

        let value: number | null = null;

        if ((exerciseLog.weight ?? 0) > 0) {
          value = exerciseLog.weight ?? 0;
        } else if (
          (exerciseLog.duration ?? 0) > 0
        ) {
          value = exerciseLog.duration ?? 0;
        } else if (
          (exerciseLog.reps ?? 0) > 0
        ) {
          value = exerciseLog.reps ?? 0;
        }

        if (value === null) return;

        const previousRecord =
          personalRecords[
            exerciseLog.exerciseId
          ];

        if (
          previousRecord === undefined ||
          value > previousRecord
        ) {
          personalRecords[
            exerciseLog.exerciseId
          ] = value;

          if (previousRecord !== undefined) {
            recordCount += 1;
          }
        }
      },
    );
  });

  return recordCount;
}

export function evaluateAllBadges(
  sessionLogs: SessionLog[],
): Record<string, BadgeLevel[]> {
  const result: Record<
    string,
    BadgeLevel[]
  > = {};

  BADGES.forEach((badge) => {
    result[badge.id] = getUnlockedLevels(
      badge,
      sessionLogs,
    );
  });

  return result;
}

export function findNewlyUnlocked(
  sessionLogs: SessionLog[],
  earnedBadges: Record<
    string,
    EarnedBadgeEntry[]
  >,
): {
  badgeId: string;
  level: BadgeLevel;
}[] {
  const newUnlocks: {
    badgeId: string;
    level: BadgeLevel;
  }[] = [];

  const current =
    evaluateAllBadges(sessionLogs);

  Object.entries(current).forEach(
    ([badgeId, levels]) => {
      const alreadyEarned = new Set(
        (earnedBadges[badgeId] ?? []).map(
          (entry) => entry.level,
        ),
      );

      levels.forEach((level) => {
        if (!alreadyEarned.has(level)) {
          newUnlocks.push({
            badgeId,
            level,
          });
        }
      });
    },
  );

  return newUnlocks;
}

export function applyNewUnlocks(
  earnedBadges: Record<
    string,
    EarnedBadgeEntry[]
  >,
  newUnlocks: {
    badgeId: string;
    level: BadgeLevel;
  }[],
  date: string,
): Record<string, EarnedBadgeEntry[]> {
  const updated = { ...earnedBadges };

  newUnlocks.forEach(
    ({ badgeId, level }) => {
      updated[badgeId] = [
        ...(updated[badgeId] ?? []),
        {
          level,
          earnedAt: date,
        },
      ];
    },
  );

  return updated;
}

export function getHighestLevel(
  badgeId: string,
  earnedBadges: Record<
    string,
    EarnedBadgeEntry[]
  >,
): BadgeLevel | null {
  const earned =
    earnedBadges[badgeId] ?? [];

  if (earned.length === 0) return null;

  const order: Record<
    BadgeLevel,
    number
  > = {
    bronze: 0,
    silver: 1,
    gold: 2,
    diamond: 3,
  };

  return earned.reduce(
    (best, entry) =>
      order[entry.level] >
      order[best.level]
        ? entry
        : best,
  ).level;
}
