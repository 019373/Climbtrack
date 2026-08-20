import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  MUSCLE_CATALOG,
  SESSIONS,
} from "../data/sessions";

import type {
  ExerciseDef,
  ExerciseMuscleLoad,
  MuscleId,
  MuscleIntensity,
  TrackingType,
} from "../data/sessions";

import {
  BADGES,
  BADGE_BY_ID,
} from "../data/badges";

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

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function generateId(): string {
  if (
    typeof crypto !==
      "undefined" &&
    typeof crypto.randomUUID ===
      "function"
  ) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 10)}`;
}

function getLocalDateString(
  date = new Date(),
): string {
  const offset =
    date.getTimezoneOffset() *
    60_000;

  return new Date(
    date.getTime() -
      offset,
  )
    .toISOString()
    .split("T")[0];
}

function createCompletedAt(
  sessionDate: string,
): string {
  const today =
    getLocalDateString();

  if (
    sessionDate ===
    today
  ) {
    return new Date().toISOString();
  }

  return new Date(
    `${sessionDate}T12:00:00`,
  ).toISOString();
}

function getSessionTimestamp(
  log: Pick<
    SessionLog,
    "date" | "completedAt"
  >,
): number {
  if (
    log.completedAt
  ) {
    const timestamp =
      new Date(
        log.completedAt,
      ).getTime();

    if (
      !Number.isNaN(
        timestamp,
      )
    ) {
      return timestamp;
    }
  }

  const fallback =
    new Date(
      `${log.date}T12:00:00`,
    ).getTime();

  return Number.isNaN(
    fallback,
  )
    ? 0
    : fallback;
}

function normalizePositiveNumber(
  value: unknown,
): number | undefined {
  if (
    typeof value ===
    "number"
  ) {
    if (
      !Number.isFinite(
        value,
      )
    ) {
      return undefined;
    }

    return Math.max(
      0,
      value,
    );
  }

  if (
    typeof value ===
    "string"
  ) {
    const normalized =
      value
        .trim()
        .replace(
          ",",
          ".",
        );

    if (
      !normalized
    ) {
      return undefined;
    }

    const parsed =
      Number(
        normalized,
      );

    if (
      Number.isFinite(
        parsed,
      )
    ) {
      return Math.max(
        0,
        parsed,
      );
    }
  }

  return undefined;
}

function normalizeOptionalText(
  value: unknown,
): string | undefined {
  if (
    typeof value !==
    "string"
  ) {
    return undefined;
  }

  const trimmed =
    value.trim();

  return trimmed ||
    undefined;
}

function normalizeStringArray(
  value: unknown,
): string[] | undefined {
  if (
    !Array.isArray(
      value,
    )
  ) {
    return undefined;
  }

  const normalized =
    value.filter(
      (
        item,
      ): item is string =>
        typeof item ===
          "string" &&
        item.trim().length >
          0,
    );

  return normalized.length >
    0
    ? normalized
    : [];
}

function numbersEqual(
  first:
    | number
    | undefined,
  second:
    | number
    | undefined,
  tolerance = 0.001,
): boolean {
  if (
    typeof first !==
      "number" ||
    typeof second !==
      "number"
  ) {
    return false;
  }

  return (
    Math.abs(
      first -
        second,
    ) <=
    tolerance
  );
}

function roundToQuarter(
  value: number,
): number {
  return (
    Math.round(
      value * 4,
    ) / 4
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Muscle helpers
// ─────────────────────────────────────────────────────────────────────────────

const VALID_MUSCLE_IDS =
  new Set<MuscleId>(
    MUSCLE_CATALOG.map(
      (muscle) =>
        muscle.id,
    ),
  );

const VALID_MUSCLE_INTENSITIES =
  new Set<MuscleIntensity>([
    "low",
    "medium",
    "high",
  ]);

function normalizeMuscleLoads(
  value: unknown,
): ExerciseMuscleLoad[] | undefined {
  if (
    !Array.isArray(
      value,
    )
  ) {
    return undefined;
  }

  const intensityRank: Record<
    MuscleIntensity,
    number
  > = {
    low: 1,
    medium: 2,
    high: 3,
  };

  const normalized =
    new Map<
      MuscleId,
      ExerciseMuscleLoad
    >();

  value.forEach(
    (item) => {
      if (
        !item ||
        typeof item !==
          "object" ||
        Array.isArray(
          item,
        )
      ) {
        return;
      }

      const record =
        item as Record<
          string,
          unknown
        >;

      const muscleId =
        record.muscleId;

      const intensity =
        record.intensity;

      if (
        typeof muscleId !==
          "string" ||
        !VALID_MUSCLE_IDS.has(
          muscleId as MuscleId,
        )
      ) {
        return;
      }

      if (
        typeof intensity !==
          "string" ||
        !VALID_MUSCLE_INTENSITIES.has(
          intensity as MuscleIntensity,
        )
      ) {
        return;
      }

      const current: ExerciseMuscleLoad =
        {
          muscleId:
            muscleId as MuscleId,

          intensity:
            intensity as MuscleIntensity,
        };

      const previous =
        normalized.get(
          current.muscleId,
        );

      if (
        !previous ||
        intensityRank[
          current.intensity
        ] >
          intensityRank[
            previous.intensity
          ]
      ) {
        normalized.set(
          current.muscleId,
          current,
        );
      }
    },
  );

  return [
    ...normalized.values(),
  ];
}

// ─────────────────────────────────────────────────────────────────────────────
// Exercise types
// ─────────────────────────────────────────────────────────────────────────────

export type ResistanceBandColor =
  | "jaune"
  | "rouge"
  | "noir"
  | "violet"
  | "vert"
  | "bleu"
  | "orange";

export type ExerciseDefaults = {
  sets: number;

  reps?: number;
  secondaryReps?: number;

  duration?: number;

  weight?: number;
  secondaryWeight?: number;

  assistance?: string;

  progressionValue?: number;

  bandColor?: ResistanceBandColor;
  bandStretch?: number;

  restSeconds: number;
};

export type ExerciseLog = {
  exerciseId: string;

  completed: boolean;

  sets: number;

  reps?: number;

  secondaryReps?: number;

  duration?: number;

  weight?: number;

  secondaryWeight?: number;

  assistance?: string;

  progressionValue?: number;

  leftHandJumps?: number;
  rightHandJumps?: number;

  variant?: string;

  bandColor?: ResistanceBandColor;

  bandStretch?: number;
};

// ─────────────────────────────────────────────────────────────────────────────
// Progression automatique
// ─────────────────────────────────────────────────────────────────────────────

export type AutomaticProgressionField =
  | "sets"
  | "reps"
  | "secondaryReps"
  | "duration"
  | "weight"
  | "secondaryWeight"
  | "progressionValue"
  | "bandStretch";

export type PendingAutomaticProgression = {
  exerciseId: string;

  field:
    AutomaticProgressionField;

  previousValue:
    number;

  targetValue:
    number;

  createdAt:
    string;
};

// ─────────────────────────────────────────────────────────────────────────────
// Climbing types
// ─────────────────────────────────────────────────────────────────────────────

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

// ─────────────────────────────────────────────────────────────────────────────
// Kilter V / Fontainebleau
// ─────────────────────────────────────────────────────────────────────────────

export type KilterGradeSystem =
  | "v"
  | "font";

export const KILTER_FONT_GRADES = [
  "4a",
  "4b",
  "4c",

  "5a",
  "5b",
  "5c",

  "6a",
  "6a+",
  "6b",
  "6b+",
  "6c",
  "6c+",

  "7a",
  "7a+",
  "7b",
  "7b+",
  "7c",
  "7c+",

  "8a",
  "8a+",
  "8b",
  "8b+",
  "8c",
  "8c+",

  "9a",
] as const;

export type KilterFontGrade =
  (
    typeof KILTER_FONT_GRADES
  )[number];

const FONT_TO_V: Record<
  KilterFontGrade,
  number
> = {
  "4a": 0,
  "4b": 0,
  "4c": 0,

  "5a": 1,
  "5b": 1,
  "5c": 2,

  "6a": 3,
  "6a+": 3,

  "6b": 4,
  "6b+": 4,

  "6c": 5,
  "6c+": 5,

  "7a": 6,

  "7a+": 7,

  "7b": 8,
  "7b+": 8,

  "7c": 9,

  "7c+": 10,

  "8a": 11,

  "8a+": 12,

  "8b": 13,

  "8b+": 14,

  "8c": 15,

  "8c+": 16,

  "9a": 17,
};

const DEFAULT_FONT_FOR_V: Record<
  number,
  KilterFontGrade
> = {
  0: "4a",
  1: "5a",
  2: "5c",
  3: "6a",
  4: "6b",
  5: "6c",
  6: "7a",
  7: "7a+",
  8: "7b",
  9: "7c",
  10: "7c+",
  11: "8a",
  12: "8a+",
  13: "8b",
  14: "8b+",
  15: "8c",
  16: "8c+",
  17: "9a",
};

export function fontGradeToV(
  grade: KilterFontGrade,
): number {
  return FONT_TO_V[
    grade
  ];
}

export function getDefaultFontGradeForV(
  grade: number,
): KilterFontGrade {
  const normalized =
    Math.max(
      0,
      Math.min(
        17,
        Math.round(
          grade,
        ),
      ),
    );

  return (
    DEFAULT_FONT_FOR_V[
      normalized
    ] ??
    "4a"
  );
}

export type KilterEntry = {
  id: string;

  angle: number;

  grade: number;

  gradeSystem?: KilterGradeSystem;

  displayGrade?: string;

  result: KilterResult;

  attempts?: number;

  durationMinutes?: number;
};

export type RouteClimbingMode =
  | "moulinette"
  | "tete";

export type RouteClimbingResult =
  | "reussi"
  | "travaille"
  | "echoue";

export type RouteGrade =
  | "3a"
  | "3a+"
  | "3b"
  | "3b+"
  | "3c"
  | "3c+"
  | "4a"
  | "4a+"
  | "4b"
  | "4b+"
  | "4c"
  | "4c+"
  | "5a"
  | "5a+"
  | "5b"
  | "5b+"
  | "5c"
  | "5c+"
  | "6a"
  | "6a+"
  | "6b"
  | "6b+"
  | "6c"
  | "6c+"
  | "7a"
  | "7a+"
  | "7b"
  | "7b+"
  | "7c"
  | "7c+"
  | "8a"
  | "8a+"
  | "8b"
  | "8b+"
  | "8c"
  | "8c+"
  | "9a"
  | "9a+"
  | "9b"
  | "9b+"
  | "9c";

export const ROUTE_GRADES: RouteGrade[] = [
  "3a",
  "3a+",
  "3b",
  "3b+",
  "3c",
  "3c+",

  "4a",
  "4a+",
  "4b",
  "4b+",
  "4c",
  "4c+",

  "5a",
  "5a+",
  "5b",
  "5b+",
  "5c",
  "5c+",

  "6a",
  "6a+",
  "6b",
  "6b+",
  "6c",
  "6c+",

  "7a",
  "7a+",
  "7b",
  "7b+",
  "7c",
  "7c+",

  "8a",
  "8a+",
  "8b",
  "8b+",
  "8c",
  "8c+",

  "9a",
  "9a+",
  "9b",
  "9b+",
  "9c",
];

export type RouteClimbingEntry = {
  id: string;

  grade: RouteGrade;

  mode: RouteClimbingMode;

  result: RouteClimbingResult;

  attempts?: number;
};

// ─────────────────────────────────────────────────────────────────────────────
// Injury types
// ─────────────────────────────────────────────────────────────────────────────

export type InjurySide =
  | "gauche"
  | "droite"
  | "deux"
  | "non-applicable";

export type InjuryStatus =
  | "active"
  | "amelioration"
  | "guerie";

export type Injury = {
  id: string;

  area: string;

  side: InjurySide;

  injuryType: string;

  painLevel: number;

  startDate: string;

  note?: string;

  status: InjuryStatus;
};

// ─────────────────────────────────────────────────────────────────────────────
// Session types
// ─────────────────────────────────────────────────────────────────────────────

export type SessionLog = {
  id: string;

  date: string;

  completedAt?: string;

  sessionId: string;

  exerciseLogs: ExerciseLog[];

  note?: string;

  isRestDay?: boolean;

  pain?: Record<
    string,
    number
  >;

  climbingDurationMinutes?: number;

  climbingIntensity?: ClimbingIntensity;

  climbingColorsSucceeded?: ClimbingColor[];

  kilterEntries?: KilterEntry[];

  routeClimbingDurationMinutes?: number;

  routeClimbingEntries?: RouteClimbingEntry[];

  finisherType?: FinisherType;
};

// ─────────────────────────────────────────────────────────────────────────────
// Exercise overrides
// ─────────────────────────────────────────────────────────────────────────────

export type ExerciseOverride = {
  name?: string;

  description?: string;

  category?: string;

  tracking?: TrackingType;

  sessionIds?: string[];

  assistanceOptions?: string[];

  isHangboard?: boolean;

  variantOptions?: string[];

  bandOptions?: ResistanceBandColor[];

  totalWeight?: boolean;

  perSide?: boolean;

  primaryRepsLabel?: string;

  secondaryRepsLabel?: string;

  primaryWeightLabel?: string;

  secondaryWeightLabel?: string;

  muscleLoads?: ExerciseMuscleLoad[];

  hidden?: boolean;
};

export type PendingBadgeNotification = {
  badgeId: string;

  level: BadgeLevel;
};

export type AppData = {
  sessionLogs: SessionLog[];

  injuries: Injury[];

  exerciseDefaults: Record<
    string,
    ExerciseDefaults
  >;

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

  pendingAutomaticProgressions: Record<
    string,
    PendingAutomaticProgression
  >;

  /*
   * Permet d'exécuter les migrations historiques
   * une seule fois.
   */
  exerciseAdaptationHistoryVersion:
    number;
};

// ─────────────────────────────────────────────────────────────────────────────
// Storage / migrations
// ─────────────────────────────────────────────────────────────────────────────

const STORAGE_KEY =
  "climbtrack_data";

const EXERCISE_ADAPTATION_HISTORY_VERSION =
  1;

function buildDefaultExerciseValues(): Record<
  string,
  ExerciseDefaults
> {
  const defaults: Record<
    string,
    ExerciseDefaults
  > = {};

  SESSIONS.forEach(
    (session) => {
      session.exercises.forEach(
        (exercise) => {
          defaults[
            exercise.id
          ] = {
            ...exercise.defaultValues,
          };
        },
      );
    },
  );

  return defaults;
}

function mergeExerciseDefaults(
  savedDefaults:
    | Record<
        string,
        ExerciseDefaults
      >
    | undefined,
): Record<
  string,
  ExerciseDefaults
> {
  const builtInDefaults =
    buildDefaultExerciseValues();

  if (
    !savedDefaults
  ) {
    return builtInDefaults;
  }

  const merged: Record<
    string,
    ExerciseDefaults
  > = {
    ...builtInDefaults,
  };

  Object.entries(
    savedDefaults,
  ).forEach(
    (
      [
        exerciseId,
        saved,
      ],
    ) => {
      const fallback =
        builtInDefaults[
          exerciseId
        ] ?? {
          sets: 0,
          restSeconds: 0,
        };

      merged[
        exerciseId
      ] = {
        ...fallback,
        ...saved,

        sets:
          normalizePositiveNumber(
            saved.sets,
          ) ??
          fallback.sets,

        reps:
          normalizePositiveNumber(
            saved.reps,
          ),

        secondaryReps:
          normalizePositiveNumber(
            saved.secondaryReps,
          ),

        duration:
          normalizePositiveNumber(
            saved.duration,
          ),

        weight:
          normalizePositiveNumber(
            saved.weight,
          ),

        secondaryWeight:
          normalizePositiveNumber(
            saved.secondaryWeight,
          ),

        progressionValue:
          normalizePositiveNumber(
            saved.progressionValue,
          ),

        bandStretch:
          normalizePositiveNumber(
            saved.bandStretch,
          ),

        restSeconds:
          normalizePositiveNumber(
            saved.restSeconds,
          ) ??
          fallback.restSeconds,
      };
    },
  );

  return merged;
}

// ─────────────────────────────────────────────────────────────────────────────
// Normalisation
// ─────────────────────────────────────────────────────────────────────────────

function normalizeExerciseDefaults(
  defaults:
    | Partial<ExerciseDefaults>
    | undefined,
): ExerciseDefaults {
  return {
    sets:
      normalizePositiveNumber(
        defaults?.sets,
      ) ??
      0,

    reps:
      normalizePositiveNumber(
        defaults?.reps,
      ),

    secondaryReps:
      normalizePositiveNumber(
        defaults?.secondaryReps,
      ),

    duration:
      normalizePositiveNumber(
        defaults?.duration,
      ),

    weight:
      normalizePositiveNumber(
        defaults?.weight,
      ),

    secondaryWeight:
      normalizePositiveNumber(
        defaults?.secondaryWeight,
      ),

    assistance:
      normalizeOptionalText(
        defaults?.assistance,
      ),

    progressionValue:
      normalizePositiveNumber(
        defaults?.progressionValue,
      ),

    bandColor:
      defaults?.bandColor,

    bandStretch:
      normalizePositiveNumber(
        defaults?.bandStretch,
      ),

    restSeconds:
      normalizePositiveNumber(
        defaults?.restSeconds,
      ) ??
      0,
  };
}

function normalizeExerciseLog(
  log: Partial<ExerciseLog>,
): ExerciseLog {
  const validBandColors:
    ResistanceBandColor[] = [
      "jaune",
      "rouge",
      "noir",
      "violet",
      "vert",
      "bleu",
      "orange",
    ];

  const bandColor =
    validBandColors.includes(
      log.bandColor as ResistanceBandColor,
    )
      ? (
          log.bandColor as ResistanceBandColor
        )
      : undefined;

  return {
    exerciseId:
      log.exerciseId ??
      "",

    completed:
      typeof log.completed ===
      "boolean"
        ? log.completed
        : true,

    sets:
      normalizePositiveNumber(
        log.sets,
      ) ??
      0,

    reps:
      normalizePositiveNumber(
        log.reps,
      ),

    secondaryReps:
      normalizePositiveNumber(
        log.secondaryReps,
      ),

    duration:
      normalizePositiveNumber(
        log.duration,
      ),

    weight:
      normalizePositiveNumber(
        log.weight,
      ),

    secondaryWeight:
      normalizePositiveNumber(
        log.secondaryWeight,
      ),

    assistance:
      normalizeOptionalText(
        log.assistance,
      ),

    progressionValue:
      normalizePositiveNumber(
        log.progressionValue,
      ),

    leftHandJumps:
      normalizePositiveNumber(
        log.leftHandJumps,
      ),

    rightHandJumps:
      normalizePositiveNumber(
        log.rightHandJumps,
      ),

    variant:
      normalizeOptionalText(
        log.variant,
      ),

    bandColor,

    bandStretch:
      normalizePositiveNumber(
        log.bandStretch,
      ),
  };
}

function normalizeKilterEntry(
  entry: Partial<KilterEntry>,
): KilterEntry {
  const validResult =
    entry.result ===
      "reussi" ||
    entry.result ===
      "travaille" ||
    entry.result ===
      "echoue";

  const normalizedAttempts =
    normalizePositiveNumber(
      entry.attempts,
    );

  const grade =
    typeof entry.grade ===
      "number"
      ? Math.max(
          0,
          Math.min(
            17,
            Math.round(
              entry.grade,
            ),
          ),
        )
      : 0;

  const gradeSystem:
    KilterGradeSystem =
      entry.gradeSystem ===
        "font"
        ? "font"
        : "v";

  let displayGrade:
    string;

  if (
    typeof entry.displayGrade ===
      "string" &&
    entry.displayGrade.trim()
  ) {
    displayGrade =
      entry.displayGrade.trim();
  } else if (
    gradeSystem ===
    "font"
  ) {
    displayGrade =
      getDefaultFontGradeForV(
        grade,
      );
  } else {
    displayGrade =
      `V${grade}`;
  }

  return {
    id:
      entry.id ??
      generateId(),

    angle:
      typeof entry.angle ===
        "number"
        ? Math.max(
            0,
            Math.min(
              70,
              entry.angle,
            ),
          )
        : 30,

    grade,

    gradeSystem,

    displayGrade,

    result:
      validResult
        ? entry.result!
        : "travaille",

    attempts:
      normalizedAttempts ===
      undefined
        ? undefined
        : Math.max(
            1,
            Math.round(
              normalizedAttempts,
            ),
          ),

    durationMinutes:
      normalizePositiveNumber(
        entry.durationMinutes,
      ),
  };
}

function normalizeRouteClimbingEntry(
  entry: Partial<RouteClimbingEntry>,
): RouteClimbingEntry {
  const grade =
    ROUTE_GRADES.includes(
      entry.grade as RouteGrade,
    )
      ? (
          entry.grade as RouteGrade
        )
      : "4a";

  const mode:
    RouteClimbingMode =
      entry.mode ===
        "tete"
        ? "tete"
        : "moulinette";

  const result:
    RouteClimbingResult =
      entry.result ===
        "reussi" ||
      entry.result ===
        "travaille" ||
      entry.result ===
        "echoue"
        ? entry.result
        : "travaille";

  const normalizedAttempts =
    normalizePositiveNumber(
      entry.attempts,
    );

  return {
    id:
      entry.id ??
      generateId(),

    grade,

    mode,

    result,

    attempts:
      normalizedAttempts ===
      undefined
        ? undefined
        : Math.max(
            1,
            Math.round(
              normalizedAttempts,
            ),
          ),
  };
}

function normalizeInjury(
  injury: Partial<Injury>,
): Injury {
  const side:
    InjurySide =
      injury.side ===
        "gauche" ||
      injury.side ===
        "droite" ||
      injury.side ===
        "deux" ||
      injury.side ===
        "non-applicable"
        ? injury.side
        : "non-applicable";

  const status:
    InjuryStatus =
      injury.status ===
        "active" ||
      injury.status ===
        "amelioration" ||
      injury.status ===
        "guerie"
        ? injury.status
        : "active";

  return {
    id:
      injury.id ??
      generateId(),

    area:
      injury.area?.trim() ||
      "Zone non renseignée",

    side,

    injuryType:
      injury.injuryType?.trim() ||
      "Blessure non renseignée",

    painLevel:
      typeof injury.painLevel ===
        "number"
        ? Math.max(
            0,
            Math.min(
              10,
              injury.painLevel,
            ),
          )
        : 0,

    startDate:
      injury.startDate ??
      getLocalDateString(),

    note:
      normalizeOptionalText(
        injury.note,
      ),

    status,
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

  const validClimbingColors:
    ClimbingColor[] = [
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
    Array.isArray(
      log.climbingColorsSucceeded,
    )
      ? log.climbingColorsSucceeded.filter(
          (
            color,
          ): color is ClimbingColor =>
            validClimbingColors.includes(
              color as ClimbingColor,
            ),
        )
      : undefined;

  const date =
    log.date ??
    getLocalDateString();

  const completedAtIsValid =
    typeof log.completedAt ===
      "string" &&
    !Number.isNaN(
      new Date(
        log.completedAt,
      ).getTime(),
    );

  const pain =
    log.pain &&
    typeof log.pain ===
      "object"
      ? Object.fromEntries(
          Object.entries(
            log.pain,
          ).map(
            (
              [
                area,
                value,
              ],
            ) => [
              area,

              typeof value ===
                "number"
                ? Math.max(
                    0,
                    Math.min(
                      10,
                      value,
                    ),
                  )
                : 0,
            ],
          ),
        )
      : undefined;

  return {
    id:
      log.id ??
      generateId(),

    date,

    completedAt:
      completedAtIsValid
        ? log.completedAt
        : undefined,

    sessionId:
      log.sessionId ??
      "",

    exerciseLogs:
      Array.isArray(
        log.exerciseLogs,
      )
        ? log.exerciseLogs.map(
            normalizeExerciseLog,
          )
        : [],

    note:
      normalizeOptionalText(
        log.note,
      ),

    isRestDay:
      log.isRestDay,

    pain,

    climbingDurationMinutes:
      normalizePositiveNumber(
        log.climbingDurationMinutes,
      ),

    climbingIntensity:
      validClimbingIntensity
        ? log.climbingIntensity
        : undefined,

    climbingColorsSucceeded,

    kilterEntries:
      Array.isArray(
        log.kilterEntries,
      )
        ? log.kilterEntries.map(
            normalizeKilterEntry,
          )
        : undefined,

    routeClimbingDurationMinutes:
      normalizePositiveNumber(
        log.routeClimbingDurationMinutes,
      ),

    routeClimbingEntries:
      Array.isArray(
        log.routeClimbingEntries,
      )
        ? log.routeClimbingEntries.map(
            normalizeRouteClimbingEntry,
          )
        : undefined,

    finisherType:
      validFinisher
        ? log.finisherType
        : undefined,
  };
}

function normalizeCustomExercise(
  exercise: ExerciseDef,
): ExerciseDef {
  const validBandColors:
    ResistanceBandColor[] = [
      "jaune",
      "rouge",
      "noir",
      "violet",
      "vert",
      "bleu",
      "orange",
    ];

  const bandOptions =
    Array.isArray(
      exercise.bandOptions,
    )
      ? exercise.bandOptions.filter(
          (
            color,
          ): color is ResistanceBandColor =>
            validBandColors.includes(
              color as ResistanceBandColor,
            ),
        )
      : undefined;

  return {
    id:
      typeof exercise.id ===
        "string" &&
      exercise.id.trim()
        ? exercise.id
        : `custom-${generateId()}`,

    name:
      typeof exercise.name ===
        "string" &&
      exercise.name.trim()
        ? exercise.name.trim()
        : "Exercice personnalisé",

    description:
      typeof exercise.description ===
        "string"
        ? exercise.description
        : "",

    category:
      typeof exercise.category ===
        "string" &&
      exercise.category.trim()
        ? exercise.category.trim()
        : "Personnalisé",

    tracking:
      exercise.tracking ??
      "none",

    defaultValues:
      normalizeExerciseDefaults(
        exercise.defaultValues,
      ),

    assistanceOptions:
      normalizeStringArray(
        exercise.assistanceOptions,
      ),

    isHangboard:
      Boolean(
        exercise.isHangboard,
      ),

    variantOptions:
      normalizeStringArray(
        exercise.variantOptions,
      ),

    bandOptions,

    totalWeight:
      Boolean(
        exercise.totalWeight,
      ),

    perSide:
      Boolean(
        exercise.perSide,
      ),

    primaryRepsLabel:
      normalizeOptionalText(
        exercise.primaryRepsLabel,
      ),

    secondaryRepsLabel:
      normalizeOptionalText(
        exercise.secondaryRepsLabel,
      ),

    primaryWeightLabel:
      normalizeOptionalText(
        exercise.primaryWeightLabel,
      ),

    secondaryWeightLabel:
      normalizeOptionalText(
        exercise.secondaryWeightLabel,
      ),

    sessionIds:
      normalizeStringArray(
        exercise.sessionIds,
      ) ?? [],

    muscleLoads:
      normalizeMuscleLoads(
        exercise.muscleLoads,
      ) ?? [],
  };
}

function normalizeExerciseOverride(
  override: ExerciseOverride,
): ExerciseOverride {
  const validBandColors:
    ResistanceBandColor[] = [
      "jaune",
      "rouge",
      "noir",
      "violet",
      "vert",
      "bleu",
      "orange",
    ];

  return {
    name:
      normalizeOptionalText(
        override.name,
      ),

    description:
      typeof override.description ===
        "string"
        ? override.description
        : undefined,

    category:
      normalizeOptionalText(
        override.category,
      ),

    tracking:
      override.tracking,

    sessionIds:
      normalizeStringArray(
        override.sessionIds,
      ),

    assistanceOptions:
      normalizeStringArray(
        override.assistanceOptions,
      ),

    isHangboard:
      typeof override.isHangboard ===
        "boolean"
        ? override.isHangboard
        : undefined,

    variantOptions:
      normalizeStringArray(
        override.variantOptions,
      ),

    bandOptions:
      Array.isArray(
        override.bandOptions,
      )
        ? override.bandOptions.filter(
            (
              color,
            ): color is ResistanceBandColor =>
              validBandColors.includes(
                color,
              ),
          )
        : undefined,

    totalWeight:
      typeof override.totalWeight ===
        "boolean"
        ? override.totalWeight
        : undefined,

    perSide:
      typeof override.perSide ===
        "boolean"
        ? override.perSide
        : undefined,

    primaryRepsLabel:
      normalizeOptionalText(
        override.primaryRepsLabel,
      ),

    secondaryRepsLabel:
      normalizeOptionalText(
        override.secondaryRepsLabel,
      ),

    primaryWeightLabel:
      normalizeOptionalText(
        override.primaryWeightLabel,
      ),

    secondaryWeightLabel:
      normalizeOptionalText(
        override.secondaryWeightLabel,
      ),

    muscleLoads:
      Array.isArray(
        override.muscleLoads,
      )
        ? (
            normalizeMuscleLoads(
              override.muscleLoads,
            ) ?? []
          )
        : undefined,

    hidden:
      typeof override.hidden ===
        "boolean"
        ? override.hidden
        : undefined,
  };
}

function normalizePendingAutomaticProgressions(
  value: unknown,
): Record<
  string,
  PendingAutomaticProgression
> {
  if (
    !value ||
    typeof value !==
      "object" ||
    Array.isArray(
      value,
    )
  ) {
    return {};
  }

  const validFields =
    new Set<
      AutomaticProgressionField
    >([
      "sets",
      "reps",
      "secondaryReps",
      "duration",
      "weight",
      "secondaryWeight",
      "progressionValue",
      "bandStretch",
    ]);

  const result: Record<
    string,
    PendingAutomaticProgression
  > = {};

  Object.entries(
    value as Record<
      string,
      unknown
    >,
  ).forEach(
    (
      [
        exerciseId,
        raw,
      ],
    ) => {
      if (
        !raw ||
        typeof raw !==
          "object" ||
        Array.isArray(
          raw,
        )
      ) {
        return;
      }

      const record =
        raw as Record<
          string,
          unknown
        >;

      const field =
        record.field;

      const previousValue =
        normalizePositiveNumber(
          record.previousValue,
        );

      const targetValue =
        normalizePositiveNumber(
          record.targetValue,
        );

      if (
        typeof field !==
          "string" ||
        !validFields.has(
          field as AutomaticProgressionField,
        ) ||
        previousValue ===
          undefined ||
        targetValue ===
          undefined
      ) {
        return;
      }

      result[
        exerciseId
      ] = {
        exerciseId,

        field:
          field as AutomaticProgressionField,

        previousValue,

        targetValue,

        createdAt:
          typeof record.createdAt ===
            "string"
            ? record.createdAt
            : new Date().toISOString(),
      };
    },
  );

  return result;
}

function normalizeAppData(
  parsed: Partial<AppData>,
): AppData {
  const customExercises =
    Array.isArray(
      parsed.customExercises,
    )
      ? parsed.customExercises.map(
          normalizeCustomExercise,
        )
      : [];

  const exerciseOverrides: Record<
    string,
    ExerciseOverride
  > = {};

  if (
    parsed.exerciseOverrides &&
    typeof parsed.exerciseOverrides ===
      "object"
  ) {
    Object.entries(
      parsed.exerciseOverrides,
    ).forEach(
      (
        [
          id,
          override,
        ],
      ) => {
        if (
          override &&
          typeof override ===
            "object"
        ) {
          exerciseOverrides[
            id
          ] =
            normalizeExerciseOverride(
              override,
            );
        }
      },
    );
  }

  return {
    sessionLogs:
      Array.isArray(
        parsed.sessionLogs,
      )
        ? parsed.sessionLogs.map(
            normalizeSessionLog,
          )
        : [],

    injuries:
      Array.isArray(
        parsed.injuries,
      )
        ? parsed.injuries.map(
            normalizeInjury,
          )
        : [],

    exerciseDefaults:
      mergeExerciseDefaults(
        parsed.exerciseDefaults,
      ),

    customExercises,

    customCategories:
      Array.isArray(
        parsed.customCategories,
      )
        ? parsed.customCategories.filter(
            (
              category,
            ): category is string =>
              typeof category ===
                "string" &&
              category.trim().length >
                0,
          )
        : [],

    exerciseOverrides,

    exerciseCategoryOrder:
      parsed.exerciseCategoryOrder &&
      typeof parsed.exerciseCategoryOrder ===
        "object"
        ? parsed.exerciseCategoryOrder
        : {},

    earnedBadges:
      parsed.earnedBadges ??
      {},

    pendingBadgeNotifications:
      Array.isArray(
        parsed.pendingBadgeNotifications,
      )
        ? parsed.pendingBadgeNotifications
        : [],

    pendingAutomaticProgressions:
      normalizePendingAutomaticProgressions(
        parsed.pendingAutomaticProgressions,
      ),

    exerciseAdaptationHistoryVersion:
      typeof parsed.exerciseAdaptationHistoryVersion ===
        "number" &&
      Number.isFinite(
        parsed.exerciseAdaptationHistoryVersion,
      )
        ? Math.max(
            0,
            Math.floor(
              parsed.exerciseAdaptationHistoryVersion,
            ),
          )
        : 0,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Badge helpers
// ─────────────────────────────────────────────────────────────────────────────

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
      ({
        badgeId,
        level,
      }) => ({
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
): Record<
  string,
  EarnedBadgeEntry[]
> {
  const evaluatedLevels =
    evaluateAllBadges(
      sessionLogs,
    );

  const recalculated: Record<
    string,
    EarnedBadgeEntry[]
  > = {};

  BADGES.forEach(
    (
      badge,
    ) => {
      const previousEntries =
        previousEarned[
          badge.id
        ] ?? [];

      const currentlyDefinedLevels =
        new Set(
          badge.levels.map(
            (
              levelDefinition,
            ) =>
              levelDefinition.level,
          ),
        );

      const archivedEntries =
        previousEntries.filter(
          (
            entry,
          ) =>
            !currentlyDefinedLevels.has(
              entry.level,
            ),
        );

      const validCurrentLevels =
        evaluatedLevels[
          badge.id
        ] ?? [];

      const activeEntries =
        validCurrentLevels.map(
          (
            level,
          ) => {
            const previousEntry =
              previousEntries.find(
                (
                  entry,
                ) =>
                  entry.level ===
                  level,
              );

            return {
              level,

              earnedAt:
                previousEntry?.earnedAt ??
                new Date().toISOString(),
            };
          },
        );

      const combinedEntries = [
        ...archivedEntries,
        ...activeEntries,
      ];

      if (
        combinedEntries.length >
        0
      ) {
        recalculated[
          badge.id
        ] =
          combinedEntries;
      }
    },
  );

  Object.entries(
    previousEarned,
  ).forEach(
    (
      [
        badgeId,
        entries,
      ],
    ) => {
      if (
        BADGE_BY_ID[
          badgeId
        ]
      ) {
        return;
      }

      recalculated[
        badgeId
      ] = [
        ...entries,
      ];
    },
  );

  return recalculated;
}

// ─────────────────────────────────────────────────────────────────────────────
// Progression helpers
// ─────────────────────────────────────────────────────────────────────────────

function getExerciseDefinition(
  exerciseId: string,
  data: Pick<
    AppData,
    | "customExercises"
    | "exerciseOverrides"
  >,
): ExerciseDef | null {
  const custom =
    data.customExercises.find(
      (exercise) =>
        exercise.id ===
        exerciseId,
    );

  if (
    custom
  ) {
    return {
      ...custom,

      ...(data.exerciseOverrides[
        exerciseId
      ] ?? {}),
    };
  }

  for (
    const session of SESSIONS
  ) {
    const exercise =
      session.exercises.find(
        (candidate) =>
          candidate.id ===
          exerciseId,
      );

    if (
      exercise
    ) {
      return {
        ...exercise,

        ...(data.exerciseOverrides[
          exerciseId
        ] ?? {}),
      };
    }
  }

  return null;
}

function trackingSupportsWeight(
  tracking: TrackingType,
): boolean {
  return [
    "weight",
    "weight+reps",
    "weight+duration",
    "dual-reps+dual-weight",
    "dual-reps+weight",
    "weight+reps+duration",
    "variant+weight+duration",
  ].includes(
    tracking,
  );
}

function trackingSupportsReps(
  tracking: TrackingType,
): boolean {
  return [
    "reps",
    "weight+reps",
    "assistance",
    "dual-reps+dual-weight",
    "dual-reps+weight",
    "reps+duration",
    "weight+reps+duration",
    "variant+reps",
  ].includes(
    tracking,
  );
}

function trackingSupportsDuration(
  tracking: TrackingType,
): boolean {
  return [
    "duration",
    "duration+assistance",
    "weight+duration",
    "duration+band",
    "reps+duration",
    "weight+reps+duration",
    "variant+weight+duration",
    "assistance",
  ].includes(
    tracking,
  );
}

type ExerciseOccurrence = {
  session:
    SessionLog;

  exercise:
    ExerciseLog;
};

function getExerciseOccurrences(
  logs: SessionLog[],
  exerciseId: string,
): ExerciseOccurrence[] {
  return [
    ...logs,
  ]
    .sort(
      (
        first,
        second,
      ) =>
        getSessionTimestamp(
          second,
        ) -
        getSessionTimestamp(
          first,
        ),
    )
    .flatMap(
      (session) => {
        const exercise =
          session.exerciseLogs.find(
            (candidate) =>
              candidate.exerciseId ===
              exerciseId,
          );

        if (
          !exercise
        ) {
          return [];
        }

        return [
          {
            session,
            exercise,
          },
        ];
      },
    );
}

function getProgressionField(
  exercise: ExerciseDef,
  defaults: ExerciseDefaults,
): AutomaticProgressionField {
  if (
    trackingSupportsWeight(
      exercise.tracking,
    ) &&
    typeof defaults.weight ===
      "number"
  ) {
    return "weight";
  }

  if (
    trackingSupportsReps(
      exercise.tracking,
    ) &&
    typeof defaults.reps ===
      "number"
  ) {
    return "reps";
  }

  if (
    trackingSupportsDuration(
      exercise.tracking,
    ) &&
    typeof defaults.duration ===
      "number"
  ) {
    return "duration";
  }

  if (
    typeof defaults.progressionValue ===
      "number"
  ) {
    return "progressionValue";
  }

  if (
    typeof defaults.bandStretch ===
      "number"
  ) {
    return "bandStretch";
  }

  return "sets";
}

function getExerciseLogNumericValue(
  log: ExerciseLog,
  field: AutomaticProgressionField,
): number | undefined {
  if (
    field ===
    "sets"
  ) {
    return log.sets;
  }

  return log[
    field
  ] as
    | number
    | undefined;
}

function getDefaultNumericValue(
  defaults: ExerciseDefaults,
  field: AutomaticProgressionField,
): number | undefined {
  if (
    field ===
    "sets"
  ) {
    return defaults.sets;
  }

  return defaults[
    field
  ] as
    | number
    | undefined;
}

function getNextProgressionValue(
  field: AutomaticProgressionField,
  current: number,
): number {
  if (
    field ===
      "weight" ||
    field ===
      "secondaryWeight"
  ) {
    return roundToQuarter(
      current +
        2.5,
    );
  }

  if (
    field ===
      "duration"
  ) {
    return (
      current +
      5
    );
  }

  if (
    field ===
      "bandStretch"
  ) {
    return roundToQuarter(
      current +
        0.25,
    );
  }

  return (
    current +
    1
  );
}

function logMatchesProgressionTarget(
  log: ExerciseLog,
  progression: PendingAutomaticProgression,
): boolean {
  const value =
    getExerciseLogNumericValue(
      log,
      progression.field,
    );

  return numbersEqual(
    value,
    progression.targetValue,
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Apprentissage silencieux du poids
// ─────────────────────────────────────────────────────────────────────────────

const WEIGHT_LEARNING_TOLERANCE_KG =
  1.5;

function getLearnedWeightCandidate(
  logs: SessionLog[],
  exerciseId: string,
): number | null {
  const weights =
    getExerciseOccurrences(
      logs,
      exerciseId,
    )
      .filter(
        (
          occurrence,
        ) =>
          occurrence.exercise.completed ===
          true,
      )
      .map(
        (
          occurrence,
        ) =>
          occurrence.exercise.weight,
      )
      .filter(
        (
          weight,
        ): weight is number =>
          typeof weight ===
            "number" &&
          Number.isFinite(
            weight,
          ),
      )
      .slice(
        0,
        3,
      );

  if (
    weights.length <
    2
  ) {
    return null;
  }

  const newest =
    weights[0];

  const second =
    weights[1];

  if (
    Math.abs(
      newest -
        second,
    ) <=
    WEIGHT_LEARNING_TOLERANCE_KG
  ) {
    return roundToQuarter(
      Math.min(
        newest,
        second,
      ),
    );
  }

  const third =
    weights[2];

  if (
    typeof third ===
      "number" &&
    Math.abs(
      newest -
        third,
    ) <=
      WEIGHT_LEARNING_TOLERANCE_KG
  ) {
    return roundToQuarter(
      Math.min(
        newest,
        third,
      ),
    );
  }

  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Migration des anciennes séances
// ─────────────────────────────────────────────────────────────────────────────

function migrateHistoricalExerciseAdaptations(
  data: AppData,
): AppData {
  if (
    data.exerciseAdaptationHistoryVersion >=
    EXERCISE_ADAPTATION_HISTORY_VERSION
  ) {
    return data;
  }

  const exerciseDefaults = {
    ...data.exerciseDefaults,
  };

  const pendingAutomaticProgressions = {
    ...data.pendingAutomaticProgressions,
  };

  const exerciseIds =
    new Set<string>();

  data.sessionLogs.forEach(
    (sessionLog) => {
      sessionLog.exerciseLogs.forEach(
        (exerciseLog) => {
          if (
            exerciseLog.exerciseId
          ) {
            exerciseIds.add(
              exerciseLog.exerciseId,
            );
          }
        },
      );
    },
  );

  exerciseIds.forEach(
    (exerciseId) => {
      /*
       * Si le nouveau système avait déjà commencé
       * à suivre cet exercice avant la migration,
       * on conserve son état actuel.
       */
      if (
        pendingAutomaticProgressions[
          exerciseId
        ]
      ) {
        return;
      }

      const exercise =
        getExerciseDefinition(
          exerciseId,
          data,
        );

      if (
        !exercise
      ) {
        return;
      }

      const currentDefaults =
        exerciseDefaults[
          exerciseId
        ] ?? {
          ...exercise.defaultValues,
        };

      // ───────────────────────────────────────────────────────────────────────
      // 1. Anciennes charges réellement utilisées
      // ───────────────────────────────────────────────────────────────────────

      if (
        trackingSupportsWeight(
          exercise.tracking,
        ) &&
        typeof currentDefaults.weight ===
          "number"
      ) {
        const learnedWeight =
          getLearnedWeightCandidate(
            data.sessionLogs,
            exerciseId,
          );

        if (
          learnedWeight !==
            null &&
          !numbersEqual(
            learnedWeight,
            currentDefaults.weight,
          )
        ) {
          exerciseDefaults[
            exerciseId
          ] = {
            ...currentDefaults,

            weight:
              learnedWeight,
          };

          /*
           * Important :
           *
           * Les séances ayant servi à apprendre
           * cette nouvelle charge ne comptent PAS
           * immédiatement comme deux validations
           * de la nouvelle prescription.
           *
           * Donc pas de ↗ ici.
           */
          return;
        }
      }

      // ───────────────────────────────────────────────────────────────────────
      // 2. Progression automatique depuis l'ancien historique
      // ───────────────────────────────────────────────────────────────────────

      const eligibleOccurrences =
        getExerciseOccurrences(
          data.sessionLogs,
          exerciseId,
        ).filter(
          (occurrence) =>
            occurrence.session.sessionId !==
            "s7-prevention",
        );

      if (
        eligibleOccurrences.length <
        2
      ) {
        return;
      }

      const latest =
        eligibleOccurrences[
          0
        ].exercise;

      const previous =
        eligibleOccurrences[
          1
        ].exercise;

      if (
        !latest.completed ||
        !previous.completed
      ) {
        return;
      }

      const field =
        getProgressionField(
          exercise,
          currentDefaults,
        );

      const currentTarget =
        getDefaultNumericValue(
          currentDefaults,
          field,
        );

      if (
        typeof currentTarget !==
        "number"
      ) {
        return;
      }

      const latestValue =
        getExerciseLogNumericValue(
          latest,
          field,
        );

      const previousValue =
        getExerciseLogNumericValue(
          previous,
          field,
        );

      if (
        !numbersEqual(
          latestValue,
          currentTarget,
        ) ||
        !numbersEqual(
          previousValue,
          currentTarget,
        )
      ) {
        return;
      }

      const nextValue =
        getNextProgressionValue(
          field,
          currentTarget,
        );

      exerciseDefaults[
        exerciseId
      ] = {
        ...currentDefaults,

        [field]:
          nextValue,
      };

      pendingAutomaticProgressions[
        exerciseId
      ] = {
        exerciseId,

        field,

        previousValue:
          currentTarget,

        targetValue:
          nextValue,

        createdAt:
          new Date().toISOString(),
      };
    },
  );

  return {
    ...data,

    exerciseDefaults,

    pendingAutomaticProgressions,

    exerciseAdaptationHistoryVersion:
      EXERCISE_ADAPTATION_HISTORY_VERSION,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Application progression + apprentissage des nouvelles séances
// ─────────────────────────────────────────────────────────────────────────────

function processExerciseAdaptations(
  previous: AppData,
  normalizedLog: SessionLog,
): {
  exerciseDefaults: Record<
    string,
    ExerciseDefaults
  >;

  pendingAutomaticProgressions: Record<
    string,
    PendingAutomaticProgression
  >;
} {
  const exerciseDefaults = {
    ...previous.exerciseDefaults,
  };

  const pendingAutomaticProgressions = {
    ...previous.pendingAutomaticProgressions,
  };

  const allLogs = [
    ...previous.sessionLogs,
    normalizedLog,
  ];

  normalizedLog.exerciseLogs.forEach(
    (
      currentExerciseLog,
    ) => {
      if (
        !currentExerciseLog.exerciseId
      ) {
        return;
      }

      const exerciseId =
        currentExerciseLog.exerciseId;

      const pending =
        pendingAutomaticProgressions[
          exerciseId
        ];

      // ───────────────────────────────────────────────────────────────────────
      // 1. Validation d'une progression déjà proposée
      // ───────────────────────────────────────────────────────────────────────

      if (
        pending
      ) {
        if (
          currentExerciseLog.completed &&
          logMatchesProgressionTarget(
            currentExerciseLog,
            pending,
          )
        ) {
          delete pendingAutomaticProgressions[
            exerciseId
          ];
        }

        return;
      }

      if (
        !currentExerciseLog.completed
      ) {
        return;
      }

      const exercise =
        getExerciseDefinition(
          exerciseId,
          previous,
        );

      if (
        !exercise
      ) {
        return;
      }

      const currentDefaults =
        exerciseDefaults[
          exerciseId
        ] ?? {
          ...exercise.defaultValues,
        };

      // ───────────────────────────────────────────────────────────────────────
      // 2. Apprentissage silencieux du poids
      // ───────────────────────────────────────────────────────────────────────

      if (
        trackingSupportsWeight(
          exercise.tracking,
        ) &&
        typeof currentExerciseLog.weight ===
          "number"
      ) {
        const learnedWeight =
          getLearnedWeightCandidate(
            allLogs,
            exerciseId,
          );

        if (
          learnedWeight !==
            null &&
          !numbersEqual(
            learnedWeight,
            currentDefaults.weight,
          )
        ) {
          exerciseDefaults[
            exerciseId
          ] = {
            ...currentDefaults,

            weight:
              learnedWeight,
          };

          return;
        }
      }

      // ───────────────────────────────────────────────────────────────────────
      // 3. Prévention
      // ───────────────────────────────────────────────────────────────────────

      if (
        normalizedLog.sessionId ===
        "s7-prevention"
      ) {
        return;
      }

      // ───────────────────────────────────────────────────────────────────────
      // 4. Deux réussites consécutives
      // ───────────────────────────────────────────────────────────────────────

      const occurrences =
        getExerciseOccurrences(
          allLogs,
          exerciseId,
        );

      if (
        occurrences.length <
        2
      ) {
        return;
      }

      const latest =
        occurrences[0]
          .exercise;

      const previousOccurrence =
        occurrences[1]
          .exercise;

      if (
        !latest.completed ||
        !previousOccurrence.completed
      ) {
        return;
      }

      const field =
        getProgressionField(
          exercise,
          currentDefaults,
        );

      const currentTarget =
        getDefaultNumericValue(
          currentDefaults,
          field,
        );

      if (
        typeof currentTarget !==
        "number"
      ) {
        return;
      }

      const latestValue =
        getExerciseLogNumericValue(
          latest,
          field,
        );

      const previousValue =
        getExerciseLogNumericValue(
          previousOccurrence,
          field,
        );

      if (
        !numbersEqual(
          latestValue,
          currentTarget,
        ) ||
        !numbersEqual(
          previousValue,
          currentTarget,
        )
      ) {
        return;
      }

      const nextValue =
        getNextProgressionValue(
          field,
          currentTarget,
        );

      exerciseDefaults[
        exerciseId
      ] = {
        ...currentDefaults,

        [field]:
          nextValue,
      };

      pendingAutomaticProgressions[
        exerciseId
      ] = {
        exerciseId,

        field,

        previousValue:
          currentTarget,

        targetValue:
          nextValue,

        createdAt:
          new Date().toISOString(),
      };
    },
  );

  return {
    exerciseDefaults,

    pendingAutomaticProgressions,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Initial data
// ─────────────────────────────────────────────────────────────────────────────

function getInitialData(): AppData {
  try {
    const saved =
      localStorage.getItem(
        STORAGE_KEY,
      );

    if (
      saved
    ) {
      const parsed =
        JSON.parse(
          saved,
        ) as Partial<AppData>;

      const normalized =
        normalizeAppData(
          parsed,
        );

      return migrateHistoricalExerciseAdaptations(
        normalized,
      );
    }
  } catch (
    error
  ) {
    console.error(
      "Failed to load ClimbTrack data",
      error,
    );
  }

  return {
    sessionLogs: [],

    injuries: [],

    exerciseDefaults:
      buildDefaultExerciseValues(),

    customExercises: [],

    customCategories: [],

    exerciseOverrides: {},

    exerciseCategoryOrder: {},

    earnedBadges: {},

    pendingBadgeNotifications:
      [],

    pendingAutomaticProgressions:
      {},

    exerciseAdaptationHistoryVersion:
      EXERCISE_ADAPTATION_HISTORY_VERSION,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Context
// ─────────────────────────────────────────────────────────────────────────────

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

  addInjury: (
    injury: Omit<
      Injury,
      "id"
    >,
  ) => void;

  updateInjury: (
    id: string,
    injury: Injury,
  ) => void;

  deleteInjury: (
    id: string,
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

// ─────────────────────────────────────────────────────────────────────────────
// Provider
// ─────────────────────────────────────────────────────────────────────────────

export function ClimbTrackProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [
    data,
    setData,
  ] =
    useState<AppData>(
      getInitialData,
    );

  useEffect(
    () => {
      setData(
        (previous) => ({
          ...previous,

          earnedBadges:
            recalculateEarnedBadges(
              previous.sessionLogs,
              previous.earnedBadges,
            ),

          pendingBadgeNotifications:
            [],
        }),
      );
    },
    [],
  );

  useEffect(
    () => {
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(
            data,
          ),
        );
      } catch (
        error
      ) {
        console.error(
          "Failed to save ClimbTrack data",
          error,
        );
      }
    },
    [
      data,
    ],
  );

  // ───────────────────────────────────────────────────────────────────────────
  // Session logs
  // ───────────────────────────────────────────────────────────────────────────

  const addSessionLog =
    useCallback(
      (
        log: SessionLog,
      ) => {
        setData(
          (previous) => {
            const normalizedLog =
              normalizeSessionLog({
                ...log,

                completedAt:
                  log.completedAt ??
                  createCompletedAt(
                    log.date,
                  ),
              });

            const adaptations =
              processExerciseAdaptations(
                previous,
                normalizedLog,
              );

            const newLogs = [
              ...previous.sessionLogs,
              normalizedLog,
            ];

            const {
              earnedBadges,
              newNotifications,
            } =
              evaluateAndMergeBadges(
                newLogs,
                previous.earnedBadges,
                normalizedLog.date,
              );

            return {
              ...previous,

              sessionLogs:
                newLogs,

              exerciseDefaults:
                adaptations.exerciseDefaults,

              pendingAutomaticProgressions:
                adaptations.pendingAutomaticProgressions,

              earnedBadges,

              pendingBadgeNotifications:
                [
                  ...previous.pendingBadgeNotifications,
                  ...newNotifications,
                ],
            };
          },
        );
      },
      [],
    );

  const deleteSessionLog =
    useCallback(
      (
        id: string,
      ) => {
        setData(
          (previous) => {
            const newLogs =
              previous.sessionLogs.filter(
                (session) =>
                  session.id !==
                  id,
              );

            return {
              ...previous,

              sessionLogs:
                newLogs,

              earnedBadges:
                recalculateEarnedBadges(
                  newLogs,
                  previous.earnedBadges,
                ),

              pendingBadgeNotifications:
                [],
            };
          },
        );
      },
      [],
    );

  const updateSessionLog =
    useCallback(
      (
        id: string,
        log: SessionLog,
      ) => {
        setData(
          (previous) => {
            const existingLog =
              previous.sessionLogs.find(
                (session) =>
                  session.id ===
                  id,
              );

            const normalizedLog =
              normalizeSessionLog({
                ...log,

                id,

                completedAt:
                  log.completedAt ??
                  existingLog?.completedAt ??
                  createCompletedAt(
                    log.date,
                  ),
              });

            const newLogs =
              previous.sessionLogs.map(
                (session) =>
                  session.id ===
                  id
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
            } =
              evaluateAndMergeBadges(
                newLogs,
                previouslyValid,
                normalizedLog.date,
              );

            return {
              ...previous,

              sessionLogs:
                newLogs,

              earnedBadges,

              pendingBadgeNotifications:
                [
                  ...previous.pendingBadgeNotifications,
                  ...newNotifications,
                ],
            };
          },
        );
      },
      [],
    );

  // ───────────────────────────────────────────────────────────────────────────
  // Exercise defaults
  // ───────────────────────────────────────────────────────────────────────────

  const updateExerciseDefault =
    useCallback(
      (
        exerciseId: string,
        defaults: Partial<ExerciseDefaults>,
      ) => {
        setData(
          (previous) => {
            const currentDefaults =
              previous.exerciseDefaults[
                exerciseId
              ] ?? {
                sets: 0,
                restSeconds: 0,
              };

            const updatedPending = {
              ...previous.pendingAutomaticProgressions,
            };

            delete updatedPending[
              exerciseId
            ];

            return {
              ...previous,

              exerciseDefaults: {
                ...previous.exerciseDefaults,

                [exerciseId]: {
                  ...currentDefaults,
                  ...defaults,

                  sets:
                    defaults.sets !==
                    undefined
                      ? Math.max(
                          0,
                          defaults.sets,
                        )
                      : currentDefaults.sets,

                  restSeconds:
                    defaults.restSeconds !==
                    undefined
                      ? Math.max(
                          0,
                          defaults.restSeconds,
                        )
                      : currentDefaults.restSeconds,
                },
              },

              pendingAutomaticProgressions:
                updatedPending,
            };
          },
        );
      },
      [],
    );

  const resetDefaults =
    useCallback(
      () => {
        setData(
          (previous) => {
            const builtInDefaults =
              buildDefaultExerciseValues();

            const customDefaults: Record<
              string,
              ExerciseDefaults
            > = {};

            previous.customExercises.forEach(
              (
                exercise,
              ) => {
                customDefaults[
                  exercise.id
                ] =
                  previous.exerciseDefaults[
                    exercise.id
                  ] ?? {
                    ...exercise.defaultValues,
                  };
              },
            );

            return {
              ...previous,

              exerciseDefaults: {
                ...builtInDefaults,
                ...customDefaults,
              },

              pendingAutomaticProgressions:
                {},
            };
          },
        );
      },
      [],
    );

  // ───────────────────────────────────────────────────────────────────────────
  // Exercise management
  // ───────────────────────────────────────────────────────────────────────────

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
        const id =
          `custom-${Date.now()}-${Math.random()
            .toString(36)
            .slice(2, 7)}`;

        const newExercise: ExerciseDef =
          normalizeCustomExercise({
            id,

            name:
              exercise.name,

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
              exercise.assistanceOptions
                ? [
                    ...exercise.assistanceOptions,
                  ]
                : undefined,

            isHangboard:
              exercise.isHangboard,

            variantOptions:
              exercise.variantOptions
                ? [
                    ...exercise.variantOptions,
                  ]
                : undefined,

            bandOptions:
              exercise.bandOptions
                ? [
                    ...exercise.bandOptions,
                  ]
                : undefined,

            totalWeight:
              exercise.totalWeight,

            perSide:
              exercise.perSide,

            primaryRepsLabel:
              exercise.primaryRepsLabel,

            secondaryRepsLabel:
              exercise.secondaryRepsLabel,

            primaryWeightLabel:
              exercise.primaryWeightLabel,

            secondaryWeightLabel:
              exercise.secondaryWeightLabel,

            sessionIds:
              exercise.sessionIds
                ? [
                    ...exercise.sessionIds,
                  ]
                : [],

            muscleLoads:
              exercise.muscleLoads
                ? [
                    ...exercise.muscleLoads,
                  ]
                : [],
          });

        setData(
          (previous) => ({
            ...previous,

            customExercises: [
              ...previous.customExercises,
              newExercise,
            ],

            exerciseDefaults: {
              ...previous.exerciseDefaults,

              [id]: {
                ...newExercise.defaultValues,
              },
            },
          }),
        );
      },
      [],
    );

  const deleteExercise =
    useCallback(
      (
        id: string,
      ) => {
        setData(
          (previous) => ({
            ...previous,

            exerciseOverrides: {
              ...previous.exerciseOverrides,

              [id]: {
                ...previous.exerciseOverrides[
                  id
                ],

                hidden:
                  true,
              },
            },
          }),
        );
      },
      [],
    );

  const restoreExercise =
    useCallback(
      (
        id: string,
      ) => {
        setData(
          (previous) => {
            const currentOverride =
              previous.exerciseOverrides[
                id
              ] ?? {};

            const {
              hidden:
                _hidden,
              ...remainingOverride
            } =
              currentOverride;

            const updatedOverrides = {
              ...previous.exerciseOverrides,
            };

            if (
              Object.keys(
                remainingOverride,
              ).length ===
              0
            ) {
              delete updatedOverrides[
                id
              ];
            } else {
              updatedOverrides[
                id
              ] =
                remainingOverride;
            }

            return {
              ...previous,

              exerciseOverrides:
                updatedOverrides,
            };
          },
        );
      },
      [],
    );

  const updateExerciseOverride =
    useCallback(
      (
        id: string,
        override: Partial<ExerciseOverride>,
      ) => {
        setData(
          (previous) => ({
            ...previous,

            exerciseOverrides: {
              ...previous.exerciseOverrides,

              [id]:
                normalizeExerciseOverride({
                  ...previous.exerciseOverrides[
                    id
                  ],

                  ...override,
                }),
            },
          }),
        );
      },
      [],
    );

  const setExerciseCategoryOrder =
    useCallback(
      (
        category: string,
        orderedIds: string[],
      ) => {
        setData(
          (previous) => ({
            ...previous,

            exerciseCategoryOrder: {
              ...previous.exerciseCategoryOrder,

              [category]: [
                ...orderedIds,
              ],
            },
          }),
        );
      },
      [],
    );

  // ───────────────────────────────────────────────────────────────────────────
  // Category management
  // ───────────────────────────────────────────────────────────────────────────

  const addCategory =
    useCallback(
      (
        name: string,
      ) => {
        const trimmedName =
          name.trim();

        if (
          !trimmedName
        ) {
          return;
        }

        setData(
          (previous) => ({
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
          }),
        );
      },
      [],
    );

  const renameCategory =
    useCallback(
      (
        oldName: string,
        newName: string,
      ) => {
        const trimmedName =
          newName.trim();

        if (
          !trimmedName
        ) {
          return;
        }

        setData(
          (previous) => {
            const updatedCustomExercises =
              previous.customExercises.map(
                (
                  exercise,
                ) =>
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
              (
                [
                  id,
                  override,
                ],
              ) => {
                updatedOverrides[
                  id
                ] =
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
              updatedOrder[
                oldName
              ]
            ) {
              updatedOrder[
                trimmedName
              ] =
                updatedOrder[
                  oldName
                ];

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
                  (
                    category,
                  ) =>
                    category ===
                    oldName
                      ? trimmedName
                      : category,
                ),
            };
          },
        );
      },
      [],
    );

  const deleteCategory =
    useCallback(
      (
        name: string,
        fallbackCategory: string,
      ) => {
        setData(
          (previous) => {
            const updatedCustomExercises =
              previous.customExercises.map(
                (
                  exercise,
                ) =>
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
              (
                [
                  id,
                  override,
                ],
              ) => {
                updatedOverrides[
                  id
                ] =
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

            delete updatedOrder[
              name
            ];

            return {
              ...previous,

              customExercises:
                updatedCustomExercises,

              exerciseOverrides:
                updatedOverrides,

              customCategories:
                previous.customCategories.filter(
                  (
                    category,
                  ) =>
                    category !==
                    name,
                ),

              exerciseCategoryOrder:
                updatedOrder,
            };
          },
        );
      },
      [],
    );

  // ───────────────────────────────────────────────────────────────────────────
  // Injury management
  // ───────────────────────────────────────────────────────────────────────────

  const addInjury =
    useCallback(
      (
        injury: Omit<
          Injury,
          "id"
        >,
      ) => {
        setData(
          (previous) => ({
            ...previous,

            injuries: [
              ...previous.injuries,

              normalizeInjury({
                ...injury,

                id:
                  generateId(),
              }),
            ],
          }),
        );
      },
      [],
    );

  const updateInjury =
    useCallback(
      (
        id: string,
        injury: Injury,
      ) => {
        setData(
          (previous) => ({
            ...previous,

            injuries:
              previous.injuries.map(
                (
                  current,
                ) =>
                  current.id ===
                  id
                    ? normalizeInjury({
                        ...injury,

                        id,
                      })
                    : current,
              ),
          }),
        );
      },
      [],
    );

  const deleteInjury =
    useCallback(
      (
        id: string,
      ) => {
        setData(
          (previous) => ({
            ...previous,

            injuries:
              previous.injuries.filter(
                (
                  injury,
                ) =>
                  injury.id !==
                  id,
              ),
          }),
        );
      },
      [],
    );

  // ───────────────────────────────────────────────────────────────────────────
  // Badge management
  // ───────────────────────────────────────────────────────────────────────────

  const clearBadgeNotification =
    useCallback(
      (
        badgeId: string,
        level: BadgeLevel,
      ) => {
        setData(
          (previous) => ({
            ...previous,

            pendingBadgeNotifications:
              previous.pendingBadgeNotifications.filter(
                (
                  notification,
                ) =>
                  !(
                    notification.badgeId ===
                      badgeId &&
                    notification.level ===
                      level
                  ),
              ),
          }),
        );
      },
      [],
    );

  // ───────────────────────────────────────────────────────────────────────────
  // Data management
  // ───────────────────────────────────────────────────────────────────────────

  const exportData =
    useCallback(
      () => {
        const blob =
          new Blob(
            [
              JSON.stringify(
                data,
                null,
                2,
              ),
            ],
            {
              type:
                "application/json",
            },
          );

        const url =
          URL.createObjectURL(
            blob,
          );

        const anchor =
          document.createElement(
            "a",
          );

        anchor.href =
          url;

        anchor.download =
          `climbtrack-backup-${getLocalDateString()}.json`;

        document.body.appendChild(
          anchor,
        );

        anchor.click();

        document.body.removeChild(
          anchor,
        );

        URL.revokeObjectURL(
          url,
        );
      },
      [
        data,
      ],
    );

  const importData =
    useCallback(
      (
        jsonData: string,
      ) => {
        try {
          const parsed =
            JSON.parse(
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
            normalizeAppData(
              parsed,
            );

          const migrated =
            migrateHistoricalExerciseAdaptations(
              normalized,
            );

          migrated.earnedBadges =
            recalculateEarnedBadges(
              migrated.sessionLogs,
              migrated.earnedBadges,
            );

          migrated.pendingBadgeNotifications =
            [];

          setData(
            migrated,
          );

          return true;
        } catch (
          error
        ) {
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
    useCallback(
      () => {
        setData({
          sessionLogs:
            [],

          injuries:
            [],

          exerciseDefaults:
            buildDefaultExerciseValues(),

          customExercises:
            [],

          customCategories:
            [],

          exerciseOverrides:
            {},

          exerciseCategoryOrder:
            {},

          earnedBadges:
            {},

          pendingBadgeNotifications:
            [],

          pendingAutomaticProgressions:
            {},

          exerciseAdaptationHistoryVersion:
            EXERCISE_ADAPTATION_HISTORY_VERSION,
        });
      },
      [],
    );

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

        addInjury,
        updateInjury,
        deleteInjury,

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
    useContext(
      ClimbTrackContext,
    );

  if (
    !context
  ) {
    throw new Error(
      "useClimbTrack must be used within ClimbTrackProvider",
    );
  }

  return context;
}