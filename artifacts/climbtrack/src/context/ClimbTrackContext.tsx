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

function normalizePositiveNumber(
  value: unknown,
): number | undefined {
  if (
    typeof value !==
      "number" ||
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

export type KilterEntry = {
  id: string;

  angle: number;

  grade: number;

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
};

// ─────────────────────────────────────────────────────────────────────────────
// Storage
// ─────────────────────────────────────────────────────────────────────────────

const STORAGE_KEY =
  "climbtrack_data";

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
          typeof saved.sets ===
            "number"
            ? Math.max(
                0,
                saved.sets,
              )
            : fallback.sets,

        restSeconds:
          typeof saved.restSeconds ===
            "number"
            ? Math.max(
                0,
                saved.restSeconds,
              )
            : fallback.restSeconds,
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
      typeof defaults?.sets ===
        "number"
        ? Math.max(
            0,
            defaults.sets,
          )
        : 0,

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
      typeof defaults?.restSeconds ===
        "number"
        ? Math.max(
            0,
            defaults.restSeconds,
          )
        : 0,
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

    /*
     * COMPATIBILITÉ HISTORIQUE :
     *
     * Dans les anciennes versions, seuls les exercices
     * réellement effectués pouvaient être présents dans
     * exerciseLogs, et "completed" pouvait être absent.
     *
     * Une entrée ancienne sans completed doit donc être
     * interprétée comme réalisée.
     *
     * Les nouvelles entrées utilisent explicitement
     * true ou false.
     */
    completed:
      typeof log.completed ===
      "boolean"
        ? log.completed
        : true,

    sets:
      typeof log.sets ===
        "number"
        ? Math.max(
            0,
            log.sets,
          )
        : 0,

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

    grade:
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
        : 0,

    result:
      validResult
        ? entry.result!
        : "travaille",

    /*
     * Une entrée Kilter enregistrée correspond
     * forcément à au moins un essai.
     */
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

    /*
     * Même logique que pour le Kilter :
     * une voie enregistrée représente au moins un essai.
     */
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

    /*
     * Pour les anciennes séances, laisser completedAt
     * absent permet aux helpers historiques d'utiliser
     * leur fallback à midi.
     */
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

    /*
     * La description peut volontairement être vide.
     */
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

    /*
     * [] est conservé :
     * cela signifie volontairement "aucune séance".
     */
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

    hidden:
      typeof override.hidden ===
        "boolean"
        ? override.hidden
        : undefined,
  };
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

    /*
     * Conserver les badges historiques,
     * y compris ceux qui ne sont plus affichés.
     */
    earnedBadges:
      parsed.earnedBadges ??
      {},

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

      return normalizeAppData(
        parsed,
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

  /*
   * ─────────────────────────────────────────────────────────────────────────
   * 1. Recalculer TOUS les badges actuellement définis.
   * ─────────────────────────────────────────────────────────────────────────
   *
   * Important :
   *
   * evaluateAllBadges() ne retourne pas un badge
   * lorsqu'aucun de ses niveaux n'est actuellement
   * débloqué.
   *
   * Il faut donc parcourir BADGES directement.
   *
   * Sinon :
   * - un badge débloqué auparavant ;
   * - puis rendu invalide par la suppression d'une séance ;
   *
   * pourrait rester enregistré à tort.
   */
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

      /*
       * Conserver les anciennes données appartenant
       * à un niveau qui n'existe PLUS dans ce badge.
       *
       * Exemple :
       * un ancien niveau Platine enregistré avant
       * sa suppression.
       *
       * Il reste ainsi dans la sauvegarde mais ne
       * peut plus apparaître comme niveau actuel.
       */
      const archivedEntries =
        previousEntries.filter(
          (
            entry,
          ) =>
            !currentlyDefinedLevels.has(
              entry.level,
            ),
        );

      /*
       * Niveaux réellement justifiés par
       * l'historique actuel.
       *
       * Si le badge n'apparaît pas dans
       * evaluatedLevels, aucun niveau actuel
       * n'est valide.
       */
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

            /*
             * Conserver la date originale
             * lorsque le badge avait déjà
             * été débloqué.
             */
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

  /*
   * ─────────────────────────────────────────────────────────────────────────
   * 2. Conserver les badges qui n'existent PLUS du tout.
   * ─────────────────────────────────────────────────────────────────────────
   *
   * Si une future version retire complètement
   * un badge de BADGES, ses anciennes données
   * restent dans la sauvegarde.
   *
   * Elles ne sont simplement plus affichées.
   */
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

  /*
   * Recalculer les badges au chargement.
   */
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
        /*
         * Masquer uniquement.
         *
         * Les logs, defaults et ID historiques
         * restent dans la sauvegarde.
         */
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

          normalized.earnedBadges =
            recalculateEarnedBadges(
              normalized.sessionLogs,
              normalized.earnedBadges,
            );

          normalized.pendingBadgeNotifications =
            [];

          setData(
            normalized,
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