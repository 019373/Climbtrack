import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  SESSIONS,
} from "../data/sessions";

import type {
  ExerciseDef,
  TrackingType,
} from "../data/sessions";

import type {
  BadgeLevel,
  ClimbingColor,
} from "../data/badges";

import {
  applyNewUnlocks,
  evaluateAllBadges,
  findNewlyUnlocked,
} from "../utils/badgeEngine";

import type {
  EarnedBadgeEntry,
} from "../utils/badgeEngine";

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

  /**
   * Utilisé pour les variantes d’un exercice.
   * Pour les slopers :
   * 30 = sloper 30°
   * 45 = sloper 45°
   */
  progressionValue?: number;

  /**
   * Nombre maximal de prises sautées avec chaque main.
   * Le badge utilise la plus faible des deux valeurs.
   */
  leftHandJumps?: number;
  rightHandJumps?: number;
  };
  export type ClimbingIntensity =
    | "facile"
    | "moyen"
    | "dur";

  export type KilterResult =
    | "reussi"
    | "travaille"
    | "echoue";

  export type FinisherType =
    | "abs"
    | "flexibility";

  export type KilterEntry = {
    id: string;

    /**
     * Inclinaison de la Kilterboard en degrés.
     * Exemple : 30, 35 ou 45.
     */
    angle: number;

    /**
     * Cotation américaine.
     * 0 = V0, 1 = V1, 2 = V2...
     */
    grade: number;

    result: KilterResult;

    /**
     * Facultatif : nombre d’essais réalisés
     * sur cette partie.
     */
    attempts?: number;

    /**
     * Facultatif : durée de cette partie
     * de la séance Kilter.
     */
    durationMinutes?: number;
  };

export type SessionLog = {
  id: string;
  date: string;
  sessionId: string;
  exerciseLogs: ExerciseLog[];

  note?: string;
  isRestDay?: boolean;
  pain?: Record<string, number>;

  /**
   * Informations utilisées pour une séance
   * de grimpe libre.
   */
  climbingDurationMinutes?: number;
  climbingIntensity?: ClimbingIntensity;
  /**
   * Couleurs de blocs réellement réussies
   * pendant cette séance de grimpe.
   */
  climbingColorsSucceeded?: ClimbingColor[];
  /**
   * Une séance Kilter peut contenir plusieurs
   * angles, cotations et résultats.
   */
  kilterEntries?: KilterEntry[];

  /**
   * Permet de compter correctement la répartition
   * 70 % abdos / 30 % souplesse.
   */
  finisherType?: FinisherType;
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
  exerciseOverrides: Record<
    string,
    ExerciseOverride
  >;
  exerciseCategoryOrder: Record<
    string,
    string[]
  >;
  earnedBadges: Record<
    string,
    EarnedBadgeEntry[]
  >;
  pendingBadgeNotifications:
    PendingBadgeNotification[];
};

// ── Storage ───────────────────────────────────────────────────────────────────

const STORAGE_KEY = "climbtrack_data";

function buildDefaultExerciseValues(): Record<
  string,
  ExerciseDefaults
> {
  const defaults: Record<
    string,
    ExerciseDefaults
  > = {};

  SESSIONS.forEach((session) => {
    session.exercises.forEach((exercise) => {
      defaults[exercise.id] = {
        ...exercise.defaultValues,
      };
    });
  });

  return defaults;
}

function normalizeExerciseLog(
  log: Partial<ExerciseLog>,
): ExerciseLog {
  return {
    exerciseId: log.exerciseId ?? "",
    completed: log.completed ?? false,
    sets: log.sets ?? 0,
    reps: log.reps,
    duration: log.duration,
    weight: log.weight,
    assistance: log.assistance,
    progressionValue:
      log.progressionValue,
    leftHandJumps:
      log.leftHandJumps,
    rightHandJumps:
      log.rightHandJumps,
  };
}

function normalizeKilterEntry(
  entry: Partial<KilterEntry>,
): KilterEntry {
  const validResult =
    entry.result === "reussi" ||
    entry.result === "travaille" ||
    entry.result === "echoue";

  return {
    id:
      entry.id ??
      crypto.randomUUID(),

    angle:
      typeof entry.angle === "number"
        ? Math.max(
            0,
            Math.min(
              70,
              entry.angle,
            ),
          )
        : 30,

    grade:
      typeof entry.grade === "number"
        ? Math.max(
            0,
            Math.min(
              17,
              entry.grade,
            ),
          )
        : 0,

    result: validResult
      ? entry.result!
      : "travaille",

    attempts:
      typeof entry.attempts ===
      "number"
        ? Math.max(
            0,
            entry.attempts,
          )
        : undefined,

    durationMinutes:
      typeof entry.durationMinutes ===
      "number"
        ? Math.max(
            0,
            entry.durationMinutes,
          )
        : undefined,
  };
}
function normalizeSessionLog(
  log: Partial<SessionLog>,
): SessionLog {
  const validClimbingIntensity =
    log.climbingIntensity ===
      "facile" ||
    log.climbingIntensity ===
      "moyen" ||
    log.climbingIntensity ===
      "dur";

  const validFinisher =
    log.finisherType ===
      "abs" ||
    log.finisherType ===
      "flexibility";
  const validClimbingColors: ClimbingColor[] = [
    "rose",
    "jaune",
    "vert",
    "turquoise",
    "bleu",
    "orange",
    "rouge",
    "noir",
    "blanc",
  ];

  const climbingColorsSucceeded =
    Array.isArray(log.climbingColorsSucceeded)
      ? log.climbingColorsSucceeded.filter(
          (color): color is ClimbingColor =>
            validClimbingColors.includes(
              color as ClimbingColor,
            ),
        )
      : undefined;
  return {
    id:
      log.id ??
      crypto.randomUUID(),

    date:
    log.date ??
    new Date(
      Date.now() -
        new Date().getTimezoneOffset() * 60_000,
    )
      .toISOString()
      .split("T")[0],

    sessionId:
      log.sessionId ?? "",

    exerciseLogs: Array.isArray(
      log.exerciseLogs,
    )
      ? log.exerciseLogs.map(
          normalizeExerciseLog,
        )
      : [],

    note: log.note,

    isRestDay:
      log.isRestDay,

    pain:
      log.pain,

    climbingDurationMinutes:
      typeof log.climbingDurationMinutes ===
      "number"
        ? Math.max(
            0,
            log.climbingDurationMinutes,
          )
        : undefined,

    climbingIntensity:
      validClimbingIntensity
        ? log.climbingIntensity
        : undefined,

    climbingColorsSucceeded,
    
    kilterEntries: Array.isArray(
      log.kilterEntries,
    )
      ? log.kilterEntries.map(
          normalizeKilterEntry,
        )
      : undefined,

    finisherType:
      validFinisher
        ? log.finisherType
        : undefined,
  };
}

function normalizeAppData(
  parsed: Partial<AppData>,
): AppData {
  const builtInDefaults =
    buildDefaultExerciseValues();

  return {
    sessionLogs: Array.isArray(
      parsed.sessionLogs,
    )
      ? parsed.sessionLogs.map(
          normalizeSessionLog,
        )
      : [],

    exerciseDefaults: {
      ...builtInDefaults,
      ...(parsed.exerciseDefaults ?? {}),
    },

    customExercises: Array.isArray(
      parsed.customExercises,
    )
      ? parsed.customExercises
      : [],

    customCategories: Array.isArray(
      parsed.customCategories,
    )
      ? parsed.customCategories
      : [],

    exerciseOverrides:
      parsed.exerciseOverrides ?? {},

    exerciseCategoryOrder:
      parsed.exerciseCategoryOrder ?? {},

    earnedBadges:
      parsed.earnedBadges ?? {},

    pendingBadgeNotifications:
      Array.isArray(
        parsed.pendingBadgeNotifications,
      )
        ? parsed.pendingBadgeNotifications
        : [],
  };
}

function getInitialData(): AppData {
  try {
    const saved =
      localStorage.getItem(STORAGE_KEY);

    if (saved) {
      const parsed = JSON.parse(
        saved,
      ) as Partial<AppData>;

      return normalizeAppData(parsed);
    }
  } catch (error) {
    console.error(
      "Failed to load ClimbTrack data",
      error,
    );
  }

  return {
    sessionLogs: [],
    exerciseDefaults:
      buildDefaultExerciseValues(),
    customExercises: [],
    customCategories: [],
    exerciseOverrides: {},
    exerciseCategoryOrder: {},
    earnedBadges: {},
    pendingBadgeNotifications: [],
  };
}

// ── Badge helpers ─────────────────────────────────────────────────────────────

function evaluateAndMergeBadges(
  logs: SessionLog[],
  currentEarned: Record<
    string,
    EarnedBadgeEntry[]
  >,
  date: string,
): {
  earnedBadges: Record<
    string,
    EarnedBadgeEntry[]
  >;
  newNotifications:
    PendingBadgeNotification[];
} {
  const newUnlocks =
    findNewlyUnlocked(
      logs,
      currentEarned,
    );

  const earnedBadges =
    applyNewUnlocks(
      currentEarned,
      newUnlocks,
      date,
    );

  const newNotifications =
    newUnlocks.map(
      ({ badgeId, level }) => ({
        badgeId,
        level,
      }),
    );

  return {
    earnedBadges,
    newNotifications,
  };
}

function recalculateEarnedBadges(
  sessionLogs: SessionLog[],
  previousEarned: Record<
    string,
    EarnedBadgeEntry[]
  >,
): Record<string, EarnedBadgeEntry[]> {
  const validLevels =
    evaluateAllBadges(sessionLogs);

  const recalculated: Record<
    string,
    EarnedBadgeEntry[]
  > = {};

  Object.entries(validLevels).forEach(
    ([badgeId, levels]) => {
      recalculated[badgeId] =
        levels.map((level) => {
          const previousEntry = (
            previousEarned[badgeId] ??
            []
          ).find(
            (entry) =>
              entry.level === level,
          );

          return {
            level,
            earnedAt:
              previousEntry?.earnedAt ??
              new Date()
                .toISOString()
                .split("T")[0],
          };
        });
    },
  );

  return recalculated;
}

// ── Context ───────────────────────────────────────────────────────────────────

type ClimbTrackContextType = {
  data: AppData;

  addSessionLog: (
    log: SessionLog,
  ) => void;

  deleteSessionLog: (
    id: string,
  ) => void;

  updateSessionLog: (
    id: string,
    log: SessionLog,
  ) => void;

  updateExerciseDefault: (
    exerciseId: string,
    defaults: Partial<ExerciseDefaults>,
  ) => void;

  resetDefaults: () => void;

  addExercise: (
    exercise: Omit<
      ExerciseDef,
      "id"
    > & {
      sessionIds?: string[];
    },
  ) => void;

  deleteExercise: (
    id: string,
  ) => void;

  restoreExercise: (
    id: string,
  ) => void;

  updateExerciseOverride: (
    id: string,
    override: Partial<ExerciseOverride>,
  ) => void;

  setExerciseCategoryOrder: (
    category: string,
    orderedIds: string[],
  ) => void;

  addCategory: (
    name: string,
  ) => void;

  renameCategory: (
    oldName: string,
    newName: string,
  ) => void;

  deleteCategory: (
    name: string,
    fallbackCategory: string,
  ) => void;

  clearBadgeNotification: (
    badgeId: string,
    level: BadgeLevel,
  ) => void;

  exportData: () => void;

  importData: (
    jsonData: string,
  ) => boolean;

  clearData: () => void;
};

const ClimbTrackContext =
  createContext<
    ClimbTrackContextType | undefined
  >(undefined);

// ── Provider ──────────────────────────────────────────────────────────────────

export function ClimbTrackProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [data, setData] =
    useState<AppData>(getInitialData);

  /*
   * Au chargement, les badges sont recalculés à partir
   * de l’historique actuel.
   *
   * Cela permet aussi d’appliquer les nouveaux badges
   * aux anciennes séances compatibles.
   */
  useEffect(() => {
    setData((previous) => ({
      ...previous,
      earnedBadges:
        recalculateEarnedBadges(
          previous.sessionLogs,
          previous.earnedBadges,
        ),
      pendingBadgeNotifications: [],
    }));
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(data),
      );
    } catch (error) {
      console.error(
        "Failed to save ClimbTrack data",
        error,
      );
    }
  }, [data]);

  // ── Session logs ───────────────────────────────────────────────────────────

  const addSessionLog =
    useCallback(
      (log: SessionLog) => {
        setData((previous) => {
          const normalizedLog =
            normalizeSessionLog(log);

          const newLogs = [
            ...previous.sessionLogs,
            normalizedLog,
          ];

          const {
            earnedBadges,
            newNotifications,
          } = evaluateAndMergeBadges(
            newLogs,
            previous.earnedBadges,
            normalizedLog.date,
          );

          return {
            ...previous,
            sessionLogs: newLogs,
            earnedBadges,
            pendingBadgeNotifications: [
              ...previous.pendingBadgeNotifications,
              ...newNotifications,
            ],
          };
        });
      },
      [],
    );

  const deleteSessionLog =
    useCallback((id: string) => {
      setData((previous) => {
        const newLogs =
          previous.sessionLogs.filter(
            (session) =>
              session.id !== id,
          );

        const earnedBadges =
          recalculateEarnedBadges(
            newLogs,
            previous.earnedBadges,
          );

        return {
          ...previous,
          sessionLogs: newLogs,
          earnedBadges,
          pendingBadgeNotifications: [],
        };
      });
    }, []);

  const updateSessionLog =
    useCallback(
      (
        id: string,
        log: SessionLog,
      ) => {
        setData((previous) => {
          const normalizedLog =
            normalizeSessionLog(log);

          const newLogs =
            previous.sessionLogs.map(
              (session) =>
                session.id === id
                  ? normalizedLog
                  : session,
            );

          const previouslyValid =
            recalculateEarnedBadges(
              newLogs,
              previous.earnedBadges,
            );

          const {
            earnedBadges,
            newNotifications,
          } = evaluateAndMergeBadges(
            newLogs,
            previouslyValid,
            normalizedLog.date,
          );

          return {
            ...previous,
            sessionLogs: newLogs,
            earnedBadges,
            pendingBadgeNotifications: [
              ...previous.pendingBadgeNotifications,
              ...newNotifications,
            ],
          };
        });
      },
      [],
    );

  // ── Exercise defaults ──────────────────────────────────────────────────────

  const updateExerciseDefault =
    useCallback(
      (
        exerciseId: string,
        defaults: Partial<ExerciseDefaults>,
      ) => {
        setData((previous) => {
          const currentDefaults =
            previous.exerciseDefaults[
              exerciseId
            ] ?? {
              sets: 0,
              restSeconds: 0,
            };

          return {
            ...previous,
            exerciseDefaults: {
              ...previous.exerciseDefaults,
              [exerciseId]: {
                ...currentDefaults,
                ...defaults,
              },
            },
          };
        });
      },
      [],
    );

  const resetDefaults =
    useCallback(() => {
      setData((previous) => ({
        ...previous,
        exerciseDefaults:
          buildDefaultExerciseValues(),
      }));
    }, []);

  // ── Exercise management ────────────────────────────────────────────────────

  const addExercise =
    useCallback(
      (
        exercise: Omit<
          ExerciseDef,
          "id"
        > & {
          sessionIds?: string[];
        },
      ) => {
        const id = `custom-${Date.now()}-${Math.random()
          .toString(36)
          .slice(2, 7)}`;

        const newExercise: ExerciseDef =
          {
            id,
            name: exercise.name,
            description:
              exercise.description ??
              "",
            category:
              exercise.category,
            tracking:
              exercise.tracking,
            defaultValues: {
              ...exercise.defaultValues,
            },
            assistanceOptions:
              exercise.assistanceOptions,
            isHangboard:
              exercise.isHangboard,
            sessionIds:
              exercise.sessionIds ??
              [],
          };

        setData((previous) => ({
          ...previous,

          customExercises: [
            ...previous.customExercises,
            newExercise,
          ],

          exerciseDefaults: {
            ...previous.exerciseDefaults,
            [id]: {
              ...exercise.defaultValues,
            },
          },
        }));
      },
      [],
    );

  const deleteExercise =
    useCallback((id: string) => {
      setData((previous) => ({
        ...previous,

        exerciseOverrides: {
          ...previous.exerciseOverrides,

          [id]: {
            ...previous
              .exerciseOverrides[id],
            hidden: true,
          },
        },
      }));
    }, []);

  const restoreExercise =
    useCallback((id: string) => {
      setData((previous) => {
        const {
          hidden: _hidden,
          ...remainingOverride
        } =
          previous.exerciseOverrides[
            id
          ] ?? {};

        return {
          ...previous,

          exerciseOverrides: {
            ...previous.exerciseOverrides,
            [id]:
              remainingOverride,
          },
        };
      });
    }, []);

  const updateExerciseOverride =
    useCallback(
      (
        id: string,
        override: Partial<ExerciseOverride>,
      ) => {
        setData((previous) => ({
          ...previous,

          exerciseOverrides: {
            ...previous.exerciseOverrides,

            [id]: {
              ...previous
                .exerciseOverrides[id],
              ...override,
            },
          },
        }));
      },
      [],
    );

  const setExerciseCategoryOrder =
    useCallback(
      (
        category: string,
        orderedIds: string[],
      ) => {
        setData((previous) => ({
          ...previous,

          exerciseCategoryOrder: {
            ...previous
              .exerciseCategoryOrder,

            [category]: orderedIds,
          },
        }));
      },
      [],
    );

  // ── Category management ────────────────────────────────────────────────────

  const addCategory =
    useCallback((name: string) => {
      const trimmedName =
        name.trim();

      if (!trimmedName) return;

      setData((previous) => ({
        ...previous,

        customCategories:
          previous.customCategories.includes(
            trimmedName,
          )
            ? previous.customCategories
            : [
                ...previous.customCategories,
                trimmedName,
              ],
      }));
    }, []);

  const renameCategory =
    useCallback(
      (
        oldName: string,
        newName: string,
      ) => {
        const trimmedName =
          newName.trim();

        if (!trimmedName) return;

        setData((previous) => {
          const updatedCustomExercises =
            previous.customExercises.map(
              (exercise) =>
                exercise.category ===
                oldName
                  ? {
                      ...exercise,
                      category:
                        trimmedName,
                    }
                  : exercise,
            );

          const updatedOverrides: Record<
            string,
            ExerciseOverride
          > = {};

          Object.entries(
            previous.exerciseOverrides,
          ).forEach(
            ([id, override]) => {
              updatedOverrides[id] =
                override.category ===
                oldName
                  ? {
                      ...override,
                      category:
                        trimmedName,
                    }
                  : override;
            },
          );

          const updatedOrder = {
            ...previous.exerciseCategoryOrder,
          };

          if (
            updatedOrder[oldName]
          ) {
            updatedOrder[trimmedName] =
              updatedOrder[oldName];

            delete updatedOrder[
              oldName
            ];
          }

          return {
            ...previous,

            customExercises:
              updatedCustomExercises,

            exerciseOverrides:
              updatedOverrides,

            exerciseCategoryOrder:
              updatedOrder,

            customCategories:
              previous.customCategories.map(
                (category) =>
                  category === oldName
                    ? trimmedName
                    : category,
              ),
          };
        });
      },
      [],
    );

  const deleteCategory =
    useCallback(
      (
        name: string,
        fallbackCategory: string,
      ) => {
        setData((previous) => {
          const updatedCustomExercises =
            previous.customExercises.map(
              (exercise) =>
                exercise.category ===
                name
                  ? {
                      ...exercise,
                      category:
                        fallbackCategory,
                    }
                  : exercise,
            );

          const updatedOverrides: Record<
            string,
            ExerciseOverride
          > = {};

          Object.entries(
            previous.exerciseOverrides,
          ).forEach(
            ([id, override]) => {
              updatedOverrides[id] =
                override.category ===
                name
                  ? {
                      ...override,
                      category:
                        fallbackCategory,
                    }
                  : override;
            },
          );

          const updatedOrder = {
            ...previous.exerciseCategoryOrder,
          };

          delete updatedOrder[name];

          return {
            ...previous,

            customExercises:
              updatedCustomExercises,

            exerciseOverrides:
              updatedOverrides,

            customCategories:
              previous.customCategories.filter(
                (category) =>
                  category !== name,
              ),

            exerciseCategoryOrder:
              updatedOrder,
          };
        });
      },
      [],
    );

  // ── Badge management ───────────────────────────────────────────────────────

  const clearBadgeNotification =
    useCallback(
      (
        badgeId: string,
        level: BadgeLevel,
      ) => {
        setData((previous) => ({
          ...previous,

          pendingBadgeNotifications:
            previous.pendingBadgeNotifications.filter(
              (notification) =>
                !(
                  notification.badgeId ===
                    badgeId &&
                  notification.level ===
                    level
                ),
            ),
        }));
      },
      [],
    );

  // ── Data management ────────────────────────────────────────────────────────

  const exportData =
    useCallback(() => {
      const blob = new Blob(
        [
          JSON.stringify(
            data,
            null,
            2,
          ),
        ],
        {
          type: "application/json",
        },
      );

      const url =
        URL.createObjectURL(blob);

      const anchor =
        document.createElement("a");

      anchor.href = url;

      anchor.download =
        `climbtrack-backup-${
          new Date()
            .toISOString()
            .split("T")[0]
        }.json`;

      document.body.appendChild(
        anchor,
      );

      anchor.click();

      document.body.removeChild(
        anchor,
      );

      URL.revokeObjectURL(url);
    }, [data]);

  const importData =
    useCallback(
      (jsonData: string) => {
        try {
          const parsed = JSON.parse(
            jsonData,
          ) as Partial<AppData>;

          if (
            !parsed ||
            !Array.isArray(
              parsed.sessionLogs,
            )
          ) {
            return false;
          }

          const normalized =
            normalizeAppData(parsed);

          normalized.earnedBadges =
            recalculateEarnedBadges(
              normalized.sessionLogs,
              normalized.earnedBadges,
            );

          normalized.pendingBadgeNotifications =
            [];

          setData(normalized);

          return true;
        } catch (error) {
          console.error(
            "Failed to import ClimbTrack data",
            error,
          );

          return false;
        }
      },
      [],
    );

  const clearData =
    useCallback(() => {
      setData({
        sessionLogs: [],
        exerciseDefaults:
          buildDefaultExerciseValues(),
        customExercises: [],
        customCategories: [],
        exerciseOverrides: {},
        exerciseCategoryOrder: {},
        earnedBadges: {},
        pendingBadgeNotifications: [],
      });
    }, []);

  return (
    <ClimbTrackContext.Provider
      value={{
        data,

        addSessionLog,
        deleteSessionLog,
        updateSessionLog,

        updateExerciseDefault,
        resetDefaults,

        addExercise,
        deleteExercise,
        restoreExercise,
        updateExerciseOverride,
        setExerciseCategoryOrder,

        addCategory,
        renameCategory,
        deleteCategory,

        clearBadgeNotification,

        exportData,
        importData,
        clearData,
      }}
    >
      {children}
    </ClimbTrackContext.Provider>
  );
}

export function useClimbTrack() {
  const context =
    useContext(ClimbTrackContext);

  if (!context) {
    throw new Error(
      "useClimbTrack must be used within ClimbTrackProvider",
    );
  }

  return context;
}