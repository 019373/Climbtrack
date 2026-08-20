import {
  SESSIONS,
} from "@/data/sessions";

import type {
  FinisherType,
  Injury,
  SessionLog,
} from "@/context/ClimbTrackContext";

import {
  calculateMuscleRecovery,
} from "@/utils/muscleRecovery";

import type {
  RecoveryExerciseData,
} from "@/utils/muscleRecovery";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type DailyPreference =
  | "unknown"
  | "climbing"
  | "kilter"
  | "climbing+kilter"
  | "rest"
  | string;

export type ClimbingPreference =
  | "none"
  | "climbing"
  | "kilter"
  | "climbing+kilter";

export type SuggestedStepType =
  | "warmup"
  | "kilter"
  | "climbing"
  | "full-session"
  | "abs"
  | "flexibility"
  | "rest";

export type KilterPreset = {
  angle: number;
  minGrade: number;
  maxGrade: number;
  durationMinutes: number;
};

export type SuggestedStep = {
  id: string;
  type: SuggestedStepType;
  title: string;
  subtitle?: string;
  description?: string;
  durationMinutes: number;
  sessionId?: string;
  exercises?: string[];
  finisherType?: FinisherType;
  kilterPreset?: KilterPreset;
  isTemporarySuggestion?: boolean;
  warning?: string;
};

export type DailySuggestion = {
  date: string;
  title: string;
  explanation: string;
  availableMinutes: number | null;
  plannedMinutes: number;
  steps: SuggestedStep[];
  signature: string;
};

export type SuggestionExerciseReference = {
  id: string;
  name: string;
};

type GenerateSuggestionOptions = {
  logs: SessionLog[];
  injuries?: Injury[];

  date: string;

  availableMinutes:
    | number
    | null;

  preference: DailyPreference;

  climbingPreference?: ClimbingPreference;

  requestedSessionIds?: string[];

  customSessionExercises?: Record<
    string,
    SuggestionExerciseReference[]
  >;

  recoveryExerciseData?: RecoveryExerciseData;

  variation: number;

  recentSuggestionSignatures?: string[];
};

type RecoveryLoadScores = Record<
  string,
  number
>;

type PartialSession = {
  sessionId: string;
  date: string;

  completedExerciseIds: string[];
  remainingExerciseIds: string[];

  completionRatio: number;
};

type KilterResult = {
  angle: number;
  grade: number;
  result: string;
  attempts: number;
  date: string;
};

type KilterAngleProfile = {
  angle: number;
  confirmedGrade: number;
  highestSuccessfulGrade: number;
  nextGrade: number;
  nextGradeUnlocked: boolean;
  sendsAtConfirmedGrade: number;
};

type BoulderResult = {
  grade: number;
  result: string;
  attempts: number;
  date: string;
};

type AutomaticSessionCandidate = {
  sessionId: string;
  score: number;
  recoveryPenalty: number;
};

// ─────────────────────────────────────────────────────────────────────────────
// Durées
// ─────────────────────────────────────────────────────────────────────────────

/*
 * Si aucun temps n'est indiqué :
 * on construit une proposition autour de 1 h 30.
 */
const DEFAULT_UNKNOWN_TOTAL_TIME_MINUTES =
  90;

/*
 * Si l'utilisateur donne un temps total,
 * on garde 10 minutes de marge pour :
 *
 * - se changer ;
 * - se doucher ;
 * - ranger ;
 * - se déplacer dans la salle.
 */
const USER_TIME_MARGIN_MINUTES =
  10;

const SESSION_DURATION: Record<
  string,
  number
> = {
  "s1-force-doigts":
    35,

  "s2-resistance":
    40,

  "s3-dos-epaules":
    45,

  "s4-gainage":
    30,

  "s5-souplesse":
    30,

  "s6-jambes":
    40,

  "s7-prevention":
    25,

  "s8-pompes-activation":
    10,
};

// ─────────────────────────────────────────────────────────────────────────────
// Séances disponibles
// ─────────────────────────────────────────────────────────────────────────────

export const REQUESTABLE_SESSION_IDS = [
  "s1-force-doigts",
  "s2-resistance",
  "s3-dos-epaules",
  "s4-gainage",
  "s6-jambes",
];

const AUTO_MAIN_SESSION_IDS = [
  "s1-force-doigts",
  "s2-resistance",
  "s3-dos-epaules",
  "s4-gainage",
  "s6-jambes",
  "s7-prevention",
];

const NON_REQUESTABLE_SESSION_IDS =
  new Set([
    "s5-souplesse",
    "s7-prevention",
    "s8-pompes-activation",
  ]);

const KILTER_ANGLES = [
  20,
  25,
  30,
  35,
  40,
  45,
  50,
  55,
  60,
  65,
  70,
];

// ─────────────────────────────────────────────────────────────────────────────
// Helpers généraux
// ─────────────────────────────────────────────────────────────────────────────

function stringHash(
  value: string,
): number {
  let hash =
    0;

  for (
    let index = 0;
    index < value.length;
    index += 1
  ) {
    hash =
      (
        hash *
          31 +
        value.charCodeAt(
          index,
        )
      ) >>>
      0;
  }

  return hash;
}

function localDateFromDate(
  date: Date,
): string {
  const offset =
    date.getTimezoneOffset() *
    60_000;

  return new Date(
    date.getTime() -
      offset,
  )
    .toISOString()
    .split(
      "T",
    )[0];
}

function differenceInDays(
  newerDate: string,
  olderDate: string,
): number {
  const newer =
    new Date(
      `${newerDate}T12:00:00`,
    );

  const older =
    new Date(
      `${olderDate}T12:00:00`,
    );

  return Math.floor(
    (
      newer.getTime() -
      older.getTime()
    ) /
      86_400_000,
  );
}

function getSessionTimestamp(
  log: SessionLog,
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

  return new Date(
    `${log.date}T12:00:00`,
  ).getTime();
}

function getLogsDuringLastDays(
  logs: SessionLog[],
  date: string,
  days: number,
): SessionLog[] {
  return logs.filter(
    (
      log,
    ) => {
      const difference =
        differenceInDays(
          date,
          log.date,
        );

      return (
        difference >=
          0 &&
        difference <
          days
      );
    },
  );
}

function hasTodaySession(
  logs: SessionLog[],
  date: string,
  sessionId: string,
): boolean {
  return logs.some(
    (
      log,
    ) =>
      log.date ===
        date &&
      log.sessionId ===
        sessionId,
  );
}

/*
 * Budget réellement utilisable par le générateur.
 *
 * Exemples :
 *
 * 2 h 30 saisi
 * = 150 min totales
 * = 140 min d'entraînement proposées
 *
 * 1 h saisi
 * = 60 min totales
 * = 50 min d'entraînement proposées
 *
 * rien saisi
 * = 90 min d'entraînement par défaut.
 */
function getPlanningBudget(
  availableMinutes:
    | number
    | null,
): number {
  /*
   * Aucun temps indiqué :
   *
   * 1 h 30 TOTAL par défaut
   * - 10 min de marge
   * = 1 h 20 maximum d'entraînement.
   */
  if (
    availableMinutes ===
    null
  ) {
    return Math.max(
      0,
      DEFAULT_UNKNOWN_TOTAL_TIME_MINUTES -
        USER_TIME_MARGIN_MINUTES,
    );
  }

  const rounded =
    Math.max(
      0,
      Math.round(
        availableMinutes,
      ),
    );

  if (
    rounded ===
    0
  ) {
    return 0;
  }

  /*
   * Même sur un temps très court, la valeur saisie
   * représente toujours le temps TOTAL disponible.
   *
   * On conserve donc la règle des 10 minutes de marge.
   */
  return Math.max(
    0,
    rounded -
      USER_TIME_MARGIN_MINUTES,
  );
}

function getSession(
  sessionId: string,
) {
  return SESSIONS.find(
    (
      session,
    ) =>
      session.id ===
      sessionId,
  );
}

function getSessionName(
  sessionId: string,
): string {
  return (
    getSession(
      sessionId,
    )?.name ??
    "Séance"
  );
}

function getSessionDuration(
  sessionId: string,
): number {
  return (
    SESSION_DURATION[
      sessionId
    ] ??
    30
  );
}

function getSessionExerciseReferences(
  sessionId: string,
  customSessionExercises?: Record<
    string,
    SuggestionExerciseReference[]
  >,
): SuggestionExerciseReference[] {
  const session =
    getSession(
      sessionId,
    );

  const builtIn =
    session?.exercises.map(
      (
        exercise,
      ) => ({
        id:
          exercise.id,

        name:
          exercise.name,
      }),
    ) ??
    [];

  const custom =
    customSessionExercises?.[
      sessionId
    ] ??
    [];

  const seen =
    new Set<string>();

  return [
    ...builtIn,
    ...custom,
  ].filter(
    (
      exercise,
    ) => {
      if (
        seen.has(
          exercise.id,
        )
      ) {
        return false;
      }

      seen.add(
        exercise.id,
      );

      return true;
    },
  );
}

function getExerciseName(
  exerciseId: string,
  customSessionExercises?: Record<
    string,
    SuggestionExerciseReference[]
  >,
): string {
  for (
    const session of SESSIONS
  ) {
    const exercise =
      session.exercises.find(
        (
          item,
        ) =>
          item.id ===
          exerciseId,
      );

    if (
      exercise
    ) {
      return exercise.name;
    }
  }

  if (
    customSessionExercises
  ) {
    for (
      const exercises of Object.values(
        customSessionExercises,
      )
    ) {
      const exercise =
        exercises.find(
          (
            item,
          ) =>
            item.id ===
            exerciseId,
        );

      if (
        exercise
      ) {
        return exercise.name;
      }
    }
  }

  return exerciseId;
}

function getUnknownRecord(
  value: unknown,
): Record<
  string,
  unknown
> | null {
  if (
    !value ||
    typeof value !==
      "object" ||
    Array.isArray(
      value,
    )
  ) {
    return null;
  }

  return value as Record<
    string,
    unknown
  >;
}

function getStringValue(
  value: unknown,
): string | null {
  return typeof value ===
    "string"
    ? value
    : null;
}

function getNumberValue(
  value: unknown,
  fallback = 0,
): number {
  if (
    typeof value ===
      "number" &&
    Number.isFinite(
      value,
    )
  ) {
    return value;
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

    const parsed =
      Number(
        normalized,
      );

    if (
      Number.isFinite(
        parsed,
      )
    ) {
      return parsed;
    }
  }

  return fallback;
}

function getArrayValue(
  value: unknown,
): unknown[] {
  return Array.isArray(
    value,
  )
    ? value
    : [];
}

function getPlannedMinutes(
  steps: SuggestedStep[],
): number {
  return steps.reduce(
    (
      total,
      step,
    ) =>
      total +
      step.durationMinutes,
    0,
  );
}

function getRemainingMinutes(
  steps: SuggestedStep[],
  budget: number,
): number {
  return Math.max(
    0,
    budget -
      getPlannedMinutes(
        steps,
      ),
  );
}

function canFitStep(
  steps: SuggestedStep[],
  step: SuggestedStep,
  budget: number,
): boolean {
  return (
    getPlannedMinutes(
      steps,
    ) +
      step.durationMinutes <=
    budget
  );
}

function addStepIfFits(
  steps: SuggestedStep[],
  step: SuggestedStep | null,
  budget: number,
): boolean {
  if (
    !step
  ) {
    return false;
  }

  if (
    !canFitStep(
      steps,
      step,
      budget,
    )
  ) {
    return false;
  }

  steps.push(
    step,
  );

  return true;
}

function deriveLegacyClimbingPreference(
  preference: DailyPreference,
): ClimbingPreference {
  if (
    preference ===
    "climbing"
  ) {
    return "climbing";
  }

  if (
    preference ===
    "kilter"
  ) {
    return "kilter";
  }

  if (
    preference ===
    "climbing+kilter"
  ) {
    return "climbing+kilter";
  }

  return "none";
}

function normalizeRequestedSessionIds(
  requestedSessionIds:
    | string[]
    | undefined,
  legacyPreference: DailyPreference,
): string[] {
  const raw =
    requestedSessionIds &&
    requestedSessionIds.length >
      0
      ? requestedSessionIds
      : getSession(
            legacyPreference,
          ) &&
          !NON_REQUESTABLE_SESSION_IDS.has(
            legacyPreference,
          )
        ? [
            legacyPreference,
          ]
        : [];

  const unique =
    new Set<string>();

  raw.forEach(
    (
      sessionId,
    ) => {
      if (
        getSession(
          sessionId,
        ) &&
        !NON_REQUESTABLE_SESSION_IDS.has(
          sessionId,
        )
      ) {
        unique.add(
          sessionId,
        );
      }
    },
  );

  return [
    ...unique,
  ];
}

// ─────────────────────────────────────────────────────────────────────────────
// Séances partielles
// ─────────────────────────────────────────────────────────────────────────────

function findPartialSession(
  logs: SessionLog[],
  date: string,
  requestedSessionIds: string[],
  customSessionExercises?: Record<
    string,
    SuggestionExerciseReference[]
  >,
): PartialSession | null {
  if (
    requestedSessionIds.length ===
    0
  ) {
    return null;
  }

  const requested =
    new Set(
      requestedSessionIds,
    );

  const recentLogs =
    getLogsDuringLastDays(
      logs,
      date,
      4,
    )
      .filter(
        (
          log,
        ) =>
          requested.has(
            log.sessionId,
          ),
      )
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
      );

  for (
    const log of recentLogs
  ) {
    const session =
      getSession(
        log.sessionId,
      );

    if (
      !session ||
      !Array.isArray(
        log.exerciseLogs,
      ) ||
      log.exerciseLogs.length ===
        0
    ) {
      continue;
    }

    const currentExerciseIds =
      new Set(
        getSessionExerciseReferences(
          session.id,
          customSessionExercises,
        ).map(
          (
            exercise,
          ) =>
            exercise.id,
        ),
      );

    const completedExerciseIds =
      log.exerciseLogs
        .filter(
          (
            exercise,
          ) =>
            exercise.completed ===
            true,
        )
        .map(
          (
            exercise,
          ) =>
            exercise.exerciseId,
        )
        .filter(
          (
            exerciseId,
          ) =>
            currentExerciseIds.has(
              exerciseId,
            ),
        );

    const remainingExerciseIds =
      log.exerciseLogs
        .filter(
          (
            exercise,
          ) =>
            exercise.completed ===
            false,
        )
        .map(
          (
            exercise,
          ) =>
            exercise.exerciseId,
        )
        .filter(
          (
            exerciseId,
          ) =>
            currentExerciseIds.has(
              exerciseId,
            ),
        );

    if (
      completedExerciseIds.length ===
        0 ||
      remainingExerciseIds.length ===
        0
    ) {
      continue;
    }

    const total =
      completedExerciseIds.length +
      remainingExerciseIds.length;

    return {
      sessionId:
        session.id,

      date:
        log.date,

      completedExerciseIds,

      remainingExerciseIds,

      completionRatio:
        total >
        0
          ? completedExerciseIds.length /
            total
          : 0,
    };
  }

  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Récupération musculaire
// ─────────────────────────────────────────────────────────────────────────────

function calculateRecoveryLoadScores(
  logs: SessionLog[],
  injuries: Injury[],
  recoveryExerciseData?: RecoveryExerciseData,
): RecoveryLoadScores {
  const recovery =
    calculateMuscleRecovery(
      logs,
      injuries,
      new Date(),
      recoveryExerciseData,
    );

  return Object.fromEntries(
    recovery.map(
      (
        muscle,
      ) => [
        muscle.id,

        Math.max(
          0,
          100 -
            muscle.recoveryPercent,
        ),
      ],
    ),
  );
}

function getRecoveryPenalty(
  sessionId: string,
  recoveryScores: RecoveryLoadScores,
): number {
  const fingers =
    recoveryScores.doigts ??
    0;

  const forearms =
    recoveryScores[
      "avant-bras"
    ] ??
    0;

  const back =
    recoveryScores.dorsaux ??
    0;

  const lowerBack =
    recoveryScores.lombaires ??
    0;

  const shoulders =
    recoveryScores.epaules ??
    0;

  const chest =
    recoveryScores.pectoraux ??
    0;

  const biceps =
    recoveryScores.biceps ??
    0;

  const triceps =
    recoveryScores.triceps ??
    0;

  const abs =
    recoveryScores.abdominaux ??
    0;

  const obliques =
    recoveryScores.obliques ??
    0;

  const legs =
    (
      recoveryScores.quadriceps ??
      0
    ) +
    (
      recoveryScores.ischios ??
      0
    ) +
    (
      recoveryScores.fessiers ??
      0
    ) +
    (
      recoveryScores.adducteurs ??
      0
    );

  if (
    sessionId ===
    "s1-force-doigts"
  ) {
    return (
      fingers *
        0.2 +
      forearms *
        0.16 +
      shoulders *
        0.05
    );
  }

  if (
    sessionId ===
    "s2-resistance"
  ) {
    return (
      fingers *
        0.13 +
      forearms *
        0.16 +
      back *
        0.07 +
      biceps *
        0.06
    );
  }

  if (
    sessionId ===
    "s3-dos-epaules"
  ) {
    return (
      back *
        0.12 +
      shoulders *
        0.13 +
      chest *
        0.08 +
      biceps *
        0.07 +
      triceps *
        0.07
    );
  }

  if (
    sessionId ===
    "s4-gainage"
  ) {
    return (
      lowerBack *
        0.05 +
      shoulders *
        0.025 +
      abs *
        0.06 +
      obliques *
        0.06
    );
  }

  if (
    sessionId ===
    "s6-jambes"
  ) {
    return (
      legs *
        0.07 +
      lowerBack *
        0.09
    );
  }

  if (
    sessionId ===
    "s7-prevention"
  ) {
    return (
      shoulders +
      forearms
    ) *
      0.012;
  }

  if (
    sessionId ===
    "s8-pompes-activation"
  ) {
    return (
      shoulders *
        0.08 +
      chest *
        0.11 +
      triceps *
        0.1
    );
  }

  return 0;
}

// ─────────────────────────────────────────────────────────────────────────────
// Choix automatique
// ─────────────────────────────────────────────────────────────────────────────

function rankAutomaticMainSessions(
  logs: SessionLog[],
  injuries: Injury[],
  date: string,
  seed: number,
  recoveryExerciseData?: RecoveryExerciseData,
): AutomaticSessionCandidate[] {
  const recoveryScores =
    calculateRecoveryLoadScores(
      logs,
      injuries,
      recoveryExerciseData,
    );

  const candidates =
    AUTO_MAIN_SESSION_IDS.filter(
      (
        sessionId,
      ) =>
        !hasTodaySession(
          logs,
          date,
          sessionId,
        ),
    );

  const recentLogs =
    getLogsDuringLastDays(
      logs,
      date,
      14,
    );

  return candidates
    .map(
      (
        sessionId,
        index,
      ) => {
        const lastLog =
          logs
            .filter(
              (
                log,
              ) =>
                log.sessionId ===
                sessionId,
            )
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
            )[0];

        const daysSince =
          lastLog
            ? differenceInDays(
                date,
                lastLog.date,
              )
            : 30;

        const countLast14 =
          recentLogs.filter(
            (
              log,
            ) =>
              log.sessionId ===
              sessionId,
          ).length;

        const recoveryPenalty =
          getRecoveryPenalty(
            sessionId,
            recoveryScores,
          );

        let score =
          Math.min(
            14,
            Math.max(
              0,
              daysSince,
            ),
          ) *
            4 -
          countLast14 *
            11 -
          recoveryPenalty +
          (
            (
              seed +
              index *
                7
            ) %
            11
          );

        if (
          daysSince <=
          1
        ) {
          score -=
            110;
        } else if (
          daysSince ===
          2
        ) {
          score -=
            40;
        }

        return {
          sessionId,
          score,
          recoveryPenalty,
        };
      },
    )
    .filter(
      (
        candidate,
      ) =>
        candidate.recoveryPenalty <
        45,
    )
    .sort(
      (
        first,
        second,
      ) =>
        second.score -
        first.score,
    );
}

/*
 * Évite de mettre automatiquement Force doigts
 * et Résistance dans la même grosse proposition.
 *
 * Les deux sollicitent fortement doigts /
 * avant-bras.
 */
function automaticSessionsAreCompatible(
  alreadySelected: string[],
  candidateId: string,
): boolean {
  const hasFingerStrength =
    alreadySelected.includes(
      "s1-force-doigts",
    );

  const hasResistance =
    alreadySelected.includes(
      "s2-resistance",
    );

  if (
    candidateId ===
      "s1-force-doigts" &&
    hasResistance
  ) {
    return false;
  }

  if (
    candidateId ===
      "s2-resistance" &&
    hasFingerStrength
  ) {
    return false;
  }

  return true;
}

function chooseAutomaticSessionsForBudget(
  logs: SessionLog[],
  injuries: Injury[],
  date: string,
  seed: number,
  budget: number,
  recoveryExerciseData?: RecoveryExerciseData,
): string[] {
  const ranked =
    rankAutomaticMainSessions(
      logs,
      injuries,
      date,
      seed,
      recoveryExerciseData,
    );

  if (
    ranked.length ===
      0 ||
    budget <=
      0
  ) {
    return [];
  }

  const selected:
    string[] = [];

  /*
   * On réserve approximativement un éventuel
   * finisher de 10 minutes lorsque le temps
   * le permet.
   */
  const sessionBudget =
    budget >=
    55
      ? budget -
        10
      : budget;

  let usedMinutes =
    0;

  for (
    const candidate of ranked
  ) {
    if (
      !automaticSessionsAreCompatible(
        selected,
        candidate.sessionId,
      )
    ) {
      continue;
    }

    const duration =
      getSessionDuration(
        candidate.sessionId,
      );

    /*
     * Si la première séance demande un échauffement,
     * prévoir également celui-ci.
     */
    const requiresWarmup =
      candidate.sessionId ===
        "s1-force-doigts" ||
      candidate.sessionId ===
        "s2-resistance";

    const alreadyNeedsWarmup =
      selected.some(
        (
          sessionId,
        ) =>
          sessionId ===
            "s1-force-doigts" ||
          sessionId ===
            "s2-resistance",
      );

    const additionalWarmup =
      requiresWarmup &&
      !alreadyNeedsWarmup
        ? 15
        : 0;

    if (
      usedMinutes +
        duration +
        additionalWarmup >
      sessionBudget
    ) {
      continue;
    }

    selected.push(
      candidate.sessionId,
    );

    usedMinutes +=
      duration +
      additionalWarmup;

    /*
     * Trois séances principales maximum.
     *
     * Au-delà, la proposition devient inutilement
     * fragmentée même avec énormément de temps.
     */
    if (
      selected.length >=
      3
    ) {
      break;
    }
  }

  /*
   * S'il n'y a rien qui rentre avec la réserve
   * du finisher, essayer simplement la meilleure
   * séance qui tient réellement dans le budget.
   */
  if (
    selected.length ===
    0
  ) {
    for (
      const candidate of ranked
    ) {
      const duration =
        getSessionDuration(
          candidate.sessionId,
        );

      const warmup =
        candidate.sessionId ===
          "s1-force-doigts" ||
        candidate.sessionId ===
          "s2-resistance"
          ? 10
          : 0;

      if (
        duration +
          warmup <=
        budget
      ) {
        selected.push(
          candidate.sessionId,
        );

        break;
      }
    }
  }

  return selected;
}

// ─────────────────────────────────────────────────────────────────────────────
// Finisher
// ─────────────────────────────────────────────────────────────────────────────

function chooseFinisher(
  logs: SessionLog[],
  date: string,
): FinisherType {
  const last30 =
    getLogsDuringLastDays(
      logs,
      date,
      30,
    );

  const absCount =
    last30.filter(
      (
        log,
      ) =>
        log.finisherType ===
          "abs" ||
        log.sessionId ===
          "s4-gainage",
    ).length;

  const flexibilityCount =
    last30.filter(
      (
        log,
      ) =>
        log.finisherType ===
          "flexibility" ||
        log.sessionId ===
          "s5-souplesse",
    ).length;

  if (
    absCount ===
      0 &&
    flexibilityCount ===
      0
  ) {
    return "abs";
  }

  return absCount <=
    flexibilityCount
    ? "abs"
    : "flexibility";
}

// ─────────────────────────────────────────────────────────────────────────────
// Résultats
// ─────────────────────────────────────────────────────────────────────────────

function isSuccessfulResult(
  result: string,
): boolean {
  const normalized =
    result
      .toLowerCase()
      .trim();

  return [
    "reussi",
    "réussi",
    "top",
    "send",
    "envoye",
    "envoyé",
    "completed",
    "success",
  ].includes(
    normalized,
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Kilter
// ─────────────────────────────────────────────────────────────────────────────

function clampKilterGrade(
  grade: number,
): number {
  return Math.max(
    0,
    Math.min(
      17,
      Math.round(
        grade,
      ),
    ),
  );
}

function extractKilterResults(
  logs: SessionLog[],
): KilterResult[] {
  const results:
    KilterResult[] =
    [];

  logs.forEach(
    (
      log,
    ) => {
      const raw =
        log as unknown as Record<
          string,
          unknown
        >;

      getArrayValue(
        raw.kilterEntries,
      ).forEach(
        (
          value,
        ) => {
          const entry =
            getUnknownRecord(
              value,
            );

          if (
            !entry
          ) {
            return;
          }

          results.push({
            angle:
              getNumberValue(
                entry.angle,
                30,
              ),

            grade:
              clampKilterGrade(
                getNumberValue(
                  entry.grade,
                  0,
                ),
              ),

            result:
              getStringValue(
                entry.result,
              ) ??
              "essai",

            attempts:
              Math.max(
                1,
                Math.round(
                  getNumberValue(
                    entry.attempts ??
                      entry.tries,
                    1,
                  ),
                ),
              ),

            date:
              log.date,
          });
        },
      );
    },
  );

  return results;
}

function buildKilterAngleProfile(
  entries: KilterResult[],
  angle: number,
): KilterAngleProfile {
  const atAngle =
    entries.filter(
      (
        entry,
      ) =>
        entry.angle ===
        angle,
    );

  const successful =
    atAngle.filter(
      (
        entry,
      ) =>
        isSuccessfulResult(
          entry.result,
        ),
    );

  const highestSuccessfulGrade =
    successful.length >
    0
      ? Math.max(
          ...successful.map(
            (
              entry,
            ) =>
              entry.grade,
          ),
        )
      : 0;

  let confirmedGrade =
    0;

  for (
    let grade = 0;
    grade <= 17;
    grade += 1
  ) {
    const sendsAtGrade =
      successful.filter(
        (
          entry,
        ) =>
          entry.grade ===
          grade,
      );

    if (
      sendsAtGrade.length >=
      2
    ) {
      confirmedGrade =
        grade;
    }
  }

  const sendsAtConfirmedGrade =
    successful.filter(
      (
        entry,
      ) =>
        entry.grade ===
        confirmedGrade,
    );

  const nextGrade =
    clampKilterGrade(
      confirmedGrade +
        1,
    );

  const nextGradeUnlocked =
    confirmedGrade <
      17 &&
    sendsAtConfirmedGrade.length >=
      2 &&
    sendsAtConfirmedGrade.some(
      (
        entry,
      ) =>
        entry.attempts <=
        4,
    );

  return {
    angle,

    confirmedGrade:
      clampKilterGrade(
        confirmedGrade,
      ),

    highestSuccessfulGrade:
      clampKilterGrade(
        highestSuccessfulGrade,
      ),

    nextGrade,

    nextGradeUnlocked,

    sendsAtConfirmedGrade:
      sendsAtConfirmedGrade.length,
  };
}

function chooseKilterProfile(
  logs: SessionLog[],
  seed: number,
): KilterAngleProfile {
  const entries =
    extractKilterResults(
      logs,
    );

  const profiles =
    KILTER_ANGLES.map(
      (
        angle,
      ) =>
        buildKilterAngleProfile(
          entries,
          angle,
        ),
    );

  const practised =
    profiles.filter(
      (
        profile,
      ) =>
        entries.some(
          (
            entry,
          ) =>
            entry.angle ===
            profile.angle,
        ),
    );

  if (
    practised.length ===
    0
  ) {
    return buildKilterAngleProfile(
      [],
      30,
    );
  }

  const ordered =
    [
      ...practised,
    ].sort(
      (
        first,
        second,
      ) => {
        const firstAdjusted =
          first.confirmedGrade +
          (
            first.angle -
            30
          ) /
            20;

        const secondAdjusted =
          second.confirmedGrade +
          (
            second.angle -
            30
          ) /
            20;

        return (
          firstAdjusted -
          secondAdjusted
        );
      },
    );

  if (
    seed %
      100 <
    70
  ) {
    return ordered[0];
  }

  return practised[
    seed %
      practised.length
  ];
}

function getKilterStep(
  logs: SessionLog[],
  seed: number,
): SuggestedStep {
  const profile =
    chooseKilterProfile(
      logs,
      seed,
    );

  const currentGrade =
    profile.confirmedGrade;

  if (
    profile.nextGradeUnlocked
  ) {
    return {
      id:
        `kilter-progress-${profile.angle}`,

      type:
        "kilter",

      title:
        "Progresser au Kilterboard",

      subtitle:
        `${profile.angle}° · V${currentGrade} → V${profile.nextGrade}`,

      description:
        `Commencer par 2 à 3 blocs propres en V${Math.max(
          0,
          currentGrade -
            1,
        )} ou V${currentGrade}, puis travailler au maximum deux projets en V${profile.nextGrade}. Garder la même inclinaison pour comparer correctement la progression.`,

      durationMinutes:
        25,

      isTemporarySuggestion:
        true,

      kilterPreset: {
        angle:
          profile.angle,

        minGrade:
          Math.max(
            0,
            currentGrade -
              1,
          ),

        maxGrade:
          profile.nextGrade,

        durationMinutes:
          25,
      },
    };
  }

  return {
    id:
      `kilter-consolidate-${profile.angle}`,

    type:
      "kilter",

    title:
      "Consolider au Kilterboard",

    subtitle:
      `${profile.angle}° · V${Math.max(
        0,
        currentGrade -
          1,
      )} à V${currentGrade}`,

    description:
      profile.sendsAtConfirmedGrade >=
      2
        ? `Le V${profile.nextGrade} reste bloqué pour le moment. Le V${currentGrade} a déjà été réussi plusieurs fois, mais il faut encore réduire le nombre d’essais et améliorer la qualité avant de progresser.`
        : `Le V${profile.nextGrade} reste bloqué pour le moment. Réussir au moins deux blocs en V${currentGrade} à ${profile.angle}° avant de cibler régulièrement le niveau suivant.`,

    durationMinutes:
      22,

    isTemporarySuggestion:
      true,

    kilterPreset: {
      angle:
        profile.angle,

      minGrade:
        Math.max(
          0,
          currentGrade -
            1,
        ),

      maxGrade:
        currentGrade,

      durationMinutes:
        22,
    },
  };
}

function fitKilterStepToTime(
  step: SuggestedStep,
  availableMinutes: number,
): SuggestedStep | null {
  if (
    availableMinutes <
    10
  ) {
    return null;
  }

  const duration =
    Math.min(
      step.durationMinutes,
      availableMinutes,
    );

  return {
    ...step,

    durationMinutes:
      duration,

    description:
      duration <
      step.durationMinutes
        ? `${step.description ?? ""} Séance raccourcie pour respecter le temps disponible.`.trim()
        : step.description,

    kilterPreset:
      step.kilterPreset
        ? {
            ...step.kilterPreset,

            durationMinutes:
              duration,
          }
        : undefined,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Bloc libre
// ─────────────────────────────────────────────────────────────────────────────

function extractBoulderResults(
  logs: SessionLog[],
): BoulderResult[] {
  const results:
    BoulderResult[] =
    [];

  logs.forEach(
    (
      log,
    ) => {
      const raw =
        log as unknown as Record<
          string,
          unknown
        >;

      const possibleArrays = [
        raw.boulderEntries,
        raw.blockEntries,
        raw.climbingEntries,
      ];

      possibleArrays.forEach(
        (
          possibleArray,
        ) => {
          getArrayValue(
            possibleArray,
          ).forEach(
            (
              value,
            ) => {
              const entry =
                getUnknownRecord(
                  value,
                );

              if (
                !entry
              ) {
                return;
              }

              const grade =
                getNumberValue(
                  entry.grade ??
                    entry.level ??
                    entry.gradeIndex,
                  -1,
                );

              if (
                grade <
                0
              ) {
                return;
              }

              results.push({
                grade,

                result:
                  getStringValue(
                    entry.result,
                  ) ??
                  "essai",

                attempts:
                  Math.max(
                    1,
                    getNumberValue(
                      entry.attempts ??
                        entry.tries,
                      1,
                    ),
                  ),

                date:
                  log.date,
              });
            },
          );
        },
      );
    },
  );

  return results;
}

function getBoulderGuidance(
  logs: SessionLog[],
): {
  title: string;
  description: string;
} {
  const entries =
    extractBoulderResults(
      logs,
    );

  const successful =
    entries.filter(
      (
        entry,
      ) =>
        isSuccessfulResult(
          entry.result,
        ),
    );

  if (
    successful.length ===
    0
  ) {
    return {
      title:
        "Construire une base",

      description:
        "Commencer par des blocs faciles et noter leur niveau. Réussir plusieurs blocs propres avant d’augmenter la difficulté.",
    };
  }

  const highestGrade =
    Math.max(
      ...successful.map(
        (
          entry,
        ) =>
          entry.grade,
      ),
    );

  const sendsAtHighest =
    successful.filter(
      (
        entry,
      ) =>
        entry.grade ===
        highestGrade,
    );

  if (
    sendsAtHighest.length <
    2
  ) {
    return {
      title:
        "Consolider le niveau actuel",

      description:
        "Réussir au moins deux blocs du meilleur niveau actuel avant de considérer le niveau suivant comme réellement prêt.",
    };
  }

  const bestAttempts =
    Math.min(
      ...sendsAtHighest.map(
        (
          entry,
        ) =>
          entry.attempts,
      ),
    );

  if (
    bestAttempts >
    4
  ) {
    return {
      title:
        "Rendre le niveau plus propre",

      description:
        "Le meilleur niveau a déjà été réussi plusieurs fois, mais demande encore beaucoup d’essais. Chercher d’abord à le réussir plus efficacement.",
    };
  }

  return {
    title:
      "Tester le niveau suivant",

    description:
      "Commencer par plusieurs blocs propres du niveau maîtrisé, puis limiter le niveau suivant à deux ou trois projets.",
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Étapes
// ─────────────────────────────────────────────────────────────────────────────

function getWarmupStep(
  durationMinutes =
    15,
): SuggestedStep {
  return {
    id:
      "warmup-climbing",

    type:
      "warmup",

    title:
      "S’échauffer",

    subtitle:
      "Articulations · épaules · doigts",

    description:
      durationMinutes <
      15
        ? "Échauffement raccourci : mobiliser les articulations puis augmenter progressivement l’intensité. Ne jamais commencer directement à intensité maximale."
        : "Commencer très facilement puis augmenter progressivement l’intensité. Arrêter tout mouvement qui augmente une douleur.",

    durationMinutes,

    isTemporarySuggestion:
      true,

    exercises: [
      "Mobiliser les poignets, les coudes et les épaules",
      "Réaliser 10 squats contrôlés",
      "Réaliser des rotations externes légères",
      "Effectuer quelques tractions faciles sur de gros bacs",
      "Effectuer des suspensions très faciles",
      "Réaliser quelques blocs ou voies très faciles",
    ],
  };
}

function getFinisher(
  type: FinisherType,
  seed: number,
): SuggestedStep {
  if (
    type ===
    "abs"
  ) {
    const variants = [
      [
        "Planche avant-bras",
        "Planche latérale",
        "Superman hold",
      ],

      [
        "Dead bug",
        "Pallof press isométrique",
        "Superman hold",
      ],

      [
        "Relevés de genoux suspendus avec twist",
        "Planche latérale",
        "Dead bug",
      ],
    ];

    return {
      id:
        `abs-${
          seed %
          variants.length
        }`,

      type:
        "abs",

      title:
        "Terminer par le gainage",

      subtitle:
        "Abdominaux · obliques · lombaires",

      durationMinutes:
        10,

      sessionId:
        "s4-gainage",

      finisherType:
        "abs",

      isTemporarySuggestion:
        true,

      exercises:
        variants[
          seed %
            variants.length
        ],
    };
  }

  return {
    id:
      "flexibility",

    type:
      "flexibility",

    title:
      "Terminer par la mobilité",

    subtitle:
      "Poignets · épaules · hanches",

    durationMinutes:
      10,

    sessionId:
      "s5-souplesse",

    finisherType:
      "flexibility",

    isTemporarySuggestion:
      true,

    exercises: [
      "Étirement poignet — paume vers l’avant",
      "Épaules sur chaise ou banc",
      "Dos rond / dos creux",
      "Montée de genou active contre le mur",
      "Pont une jambe — talon surélevé",
    ],
  };
}

function buildSessionStep(
  sessionId: string,
): SuggestedStep | null {
  const session =
    getSession(
      sessionId,
    );

  if (
    !session
  ) {
    return null;
  }

  return {
    id:
      `main-${sessionId}`,

    type:
      "full-session",

    title:
      session.name,

    subtitle:
      "Réaliser la séance",

    durationMinutes:
      getSessionDuration(
        sessionId,
      ),

    sessionId,

    isTemporarySuggestion:
      true,
  };
}

function buildPartialSessionStep(
  partial: PartialSession,
  customSessionExercises?: Record<
    string,
    SuggestionExerciseReference[]
  >,
): SuggestedStep | null {
  if (
    partial.remainingExerciseIds.length ===
    0
  ) {
    return null;
  }

  const estimatedDuration =
    Math.max(
      10,
      Math.round(
        getSessionDuration(
          partial.sessionId,
        ) *
          (
            1 -
            partial.completionRatio
          ),
      ),
    );

  return {
    id:
      `finish-${partial.sessionId}-${partial.date}`,

    type:
      "full-session",

    title:
      `Terminer ${getSessionName(
        partial.sessionId,
      )}`,

    subtitle:
      `${partial.remainingExerciseIds.length} exercice${
        partial.remainingExerciseIds.length >
        1
          ? "s"
          : ""
      } restant${
        partial.remainingExerciseIds.length >
        1
          ? "s"
          : ""
      }`,

    description:
      "Le temps disponible est court. Reprendre seulement les exercices non réalisés permet de terminer cette séance sans refaire ceux déjà validés.",

    durationMinutes:
      estimatedDuration,

    sessionId:
      partial.sessionId,

    exercises:
      partial.remainingExerciseIds.map(
        (
          exerciseId,
        ) =>
          getExerciseName(
            exerciseId,
            customSessionExercises,
          ),
      ),

    isTemporarySuggestion:
      true,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Pompes
// ─────────────────────────────────────────────────────────────────────────────

function shouldSuggestPushups(
  recoveryScores: RecoveryLoadScores,
  selectedSessionIds: string[],
  hasClimbing: boolean,
  hasKilter: boolean,
): boolean {
  if (
    hasClimbing ||
    hasKilter
  ) {
    return false;
  }

  if (
    selectedSessionIds.some(
      (
        sessionId,
      ) =>
        sessionId ===
          "s3-dos-epaules" ||
        sessionId ===
          "s1-force-doigts" ||
        sessionId ===
          "s2-resistance",
    )
  ) {
    return false;
  }

  const chest =
    recoveryScores.pectoraux ??
    0;

  const shoulders =
    recoveryScores.epaules ??
    0;

  const triceps =
    recoveryScores.triceps ??
    0;

  return (
    chest <
      40 &&
    shoulders <
      40 &&
    triceps <
      40
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Blessures
// ─────────────────────────────────────────────────────────────────────────────

function getActiveInjuryWarning(
  injuries: Injury[],
): string | undefined {
  const active =
    injuries
      .filter(
        (
          injury,
        ) =>
          injury.status !==
          "guerie",
      )
      .sort(
        (
          first,
          second,
        ) =>
          second.painLevel -
          first.painLevel,
      );

  if (
    active.length ===
    0
  ) {
    return undefined;
  }

  const mostImportant =
    active[0];

  return `Blessure enregistrée : ${mostImportant.area}, douleur ${mostImportant.painLevel}/10. Adapter ou arrêter les mouvements douloureux.`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Signature
// ─────────────────────────────────────────────────────────────────────────────

function buildSignature(
  steps: SuggestedStep[],
): string {
  return steps
    .map(
      (
        step,
      ) => {
        const preset =
          step.kilterPreset;

        return [
          step.type,

          step.sessionId ??
            "",

          step.durationMinutes,

          preset?.angle ??
            "",

          preset?.minGrade ??
            "",

          preset?.maxGrade ??
            "",

          (
            step.exercises ??
            []
          ).join(
            ",",
          ),
        ].join(
          ":",
        );
      },
    )
    .join(
      "|",
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Récupération
// ─────────────────────────────────────────────────────────────────────────────

function buildRecoverySuggestion(
  date: string,
  availableMinutes:
    | number
    | null,
  injuryWarning?: string,
): DailySuggestion {
  const budget =
    getPlanningBudget(
      availableMinutes,
    );

  const steps:
    SuggestedStep[] = [
      {
        id:
          "rest",

        type:
          "rest",

        title:
          "Récupérer",

        description:
          "Éviter les efforts intenses sur les zones encore fatiguées.",

        durationMinutes:
          0,

        isTemporarySuggestion:
          true,

        warning:
          injuryWarning,
      },
    ];

  const mobilityMinutes =
    Math.min(
      10,
      budget,
    );

  if (
    mobilityMinutes >
    0
  ) {
    steps.push({
      id:
        "mobility",

      type:
        "flexibility",

      title:
        "Effectuer une mobilité douce",

      durationMinutes:
        mobilityMinutes,

      sessionId:
        "s5-souplesse",

      finisherType:
        "flexibility",

      isTemporarySuggestion:
        true,

      exercises: [
        "Dos rond / dos creux",
        "Papillon",
        "Étirement mollet contre un mur",
        "Mobilité cheville sur chapeau mexicain",
      ],
    });
  }

  return {
    date,

    title:
      "Proposition de récupération",

    explanation:
      injuryWarning
        ? "Une blessure active ou une récupération insuffisante a été détectée."
        : "Privilégier une journée légère pour mieux récupérer.",

    availableMinutes,

    plannedMinutes:
      getPlannedMinutes(
        steps,
      ),

    steps,

    signature:
      buildSignature(
        steps,
      ),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Suggestion principale
// ─────────────────────────────────────────────────────────────────────────────

function buildSuggestion(
  options: GenerateSuggestionOptions,
  seedOffset: number,
): DailySuggestion {
  const {
    logs,
    date,
    availableMinutes,
    preference,
    variation,
  } =
    options;

  const injuries =
    options.injuries ??
    [];

  const climbingPreference =
    options.climbingPreference ??
    deriveLegacyClimbingPreference(
      preference,
    );

  const requestedSessionIds =
    normalizeRequestedSessionIds(
      options.requestedSessionIds,
      preference,
    );

  const todayLogs =
    logs.filter(
      (
        log,
      ) =>
        log.date ===
        date,
    );

  const seed =
    stringHash(
      `${date}-${variation}-${seedOffset}-${climbingPreference}-${requestedSessionIds.join(
        ",",
      )}-${todayLogs
        .map(
          (
            log,
          ) =>
            log.sessionId,
        )
        .sort()
        .join(
          "-",
        )}`,
    );

  const budget =
    getPlanningBudget(
      availableMinutes,
    );

  const injuryWarning =
    getActiveInjuryWarning(
      injuries,
    );

  if (
    preference ===
    "rest"
  ) {
    return buildRecoverySuggestion(
      date,
      availableMinutes,
      injuryWarning,
    );
  }

  if (
    budget <=
    0
  ) {
    return buildRecoverySuggestion(
      date,
      availableMinutes,
      injuryWarning,
    );
  }

  const recoveryScores =
    calculateRecoveryLoadScores(
      logs,
      injuries,
      options.recoveryExerciseData,
    );

  const fingersLoaded =
    (
      recoveryScores.doigts ??
      0
    ) >=
      55 ||
    (
      recoveryScores[
        "avant-bras"
      ] ??
      0
    ) >=
      60;

  const upperBodyLoaded =
    (
      recoveryScores.epaules ??
      0
    ) >=
      70 ||
    (
      recoveryScores.dorsaux ??
      0
    ) >=
      70;

  const legsLoaded =
    (
      recoveryScores.quadriceps ??
      0
    ) >=
      70 ||
    (
      recoveryScores.ischios ??
      0
    ) >=
      70;

  const globallyVeryTired =
    [
      "doigts",
      "avant-bras",
      "epaules",
      "dorsaux",
      "quadriceps",
      "ischios",
    ].filter(
      (
        muscleId,
      ) =>
        (
          recoveryScores[
            muscleId
          ] ??
          0
        ) >=
        75,
    ).length >=
    3;

  if (
    globallyVeryTired
  ) {
    return buildRecoverySuggestion(
      date,
      availableMinutes,
      injuryWarning,
    );
  }

  // ───────────────────────────────────────────────────────────────────────────
  // Grimpe
  // ───────────────────────────────────────────────────────────────────────────

  let wantsClimbing =
    climbingPreference ===
      "climbing" ||
    climbingPreference ===
      "climbing+kilter";

  let wantsKilter =
    climbingPreference ===
      "kilter" ||
    climbingPreference ===
      "climbing+kilter";

  const hasExplicitClimbingChoice =
    options.climbingPreference !==
    undefined;

  const hasExplicitSessionChoice =
    requestedSessionIds.length >
    0;

  /*
   * Compatibilité avec l'ancien système.
   */
  if (
    preference ===
      "unknown" &&
    !hasExplicitClimbingChoice &&
    !hasExplicitSessionChoice
  ) {
    const randomChoice =
      seed %
      100;

    if (
      !fingersLoaded &&
      !upperBodyLoaded &&
      randomChoice <
        22
    ) {
      wantsKilter =
        true;
    } else if (
      !fingersLoaded &&
      randomChoice >=
        22 &&
      randomChoice <
        42
    ) {
      wantsClimbing =
        true;
    }
  }

  if (
    fingersLoaded
  ) {
    wantsClimbing =
      false;

    wantsKilter =
      false;
  }

  if (
    upperBodyLoaded
  ) {
    wantsKilter =
      false;
  }

  // ───────────────────────────────────────────────────────────────────────────
  // Séance partielle
  // ───────────────────────────────────────────────────────────────────────────

  const partial =
    availableMinutes !==
      null
      ? findPartialSession(
          logs,
          date,
          requestedSessionIds,
          options.customSessionExercises,
        )
      : null;

  if (
    partial &&
    budget <
      getSessionDuration(
        partial.sessionId,
      )
  ) {
    const partialStep =
      buildPartialSessionStep(
        partial,
        options.customSessionExercises,
      );

    if (
      partialStep
    ) {
      const steps:
        SuggestedStep[] = [];

      const needsWarmup =
        partial.sessionId ===
          "s1-force-doigts" ||
        partial.sessionId ===
          "s2-resistance";

      if (
        needsWarmup
      ) {
        const maximumWarmup =
          budget -
          Math.min(
            partialStep.durationMinutes,
            budget,
          );

        if (
          maximumWarmup >=
          8
        ) {
          const warmup =
            getWarmupStep(
              Math.min(
                15,
                maximumWarmup,
              ),
            );

          if (
            injuryWarning
          ) {
            warmup.warning =
              injuryWarning;
          }

          steps.push(
            warmup,
          );
        }
      }

      const remainingForPartial =
        getRemainingMinutes(
          steps,
          budget,
        );

      if (
        remainingForPartial >
        0
      ) {
        steps.push({
          ...partialStep,

          durationMinutes:
            Math.min(
              partialStep.durationMinutes,
              remainingForPartial,
            ),
        });
      }

      const finisherType =
        legsLoaded ||
        upperBodyLoaded
          ? "flexibility"
          : chooseFinisher(
              logs,
              date,
            );

      addStepIfFits(
        steps,
        getFinisher(
          finisherType,
          seed,
        ),
        budget,
      );

      return {
        date,

        title:
          "Terminer la séance commencée",

        explanation:
          "Tu as choisi cette séance mais le temps disponible est trop court pour la refaire entièrement. Seuls les exercices qui restaient sont donc proposés.",

        availableMinutes,

        plannedMinutes:
          getPlannedMinutes(
            steps,
          ),

        steps,

        signature:
          buildSignature(
            steps,
          ),
      };
    }
  }

  // ───────────────────────────────────────────────────────────────────────────
  // Séances principales
  // ───────────────────────────────────────────────────────────────────────────

  const selectedSessionIds:
    string[] = [];

  /*
   * Choix manuels :
   * uniquement ce que l'utilisateur demande.
   */
  requestedSessionIds.forEach(
    (
      sessionId,
    ) => {
      const penalty =
        getRecoveryPenalty(
          sessionId,
          recoveryScores,
        );

      if (
        penalty <
        45
      ) {
        selectedSessionIds.push(
          sessionId,
        );
      }
    },
  );

  /*
   * Aucun choix explicite :
   *
   * on peut sélectionner PLUSIEURS séances
   * afin d'utiliser réellement le temps disponible.
   */
  if (
    selectedSessionIds.length ===
      0 &&
    !hasExplicitSessionChoice &&
    !wantsClimbing &&
    !wantsKilter
  ) {
    const automaticSessions =
      chooseAutomaticSessionsForBudget(
        logs,
        injuries,
        date,
        seed,
        budget,
        options.recoveryExerciseData,
      );

    selectedSessionIds.push(
      ...automaticSessions,
    );
  }

  const steps:
    SuggestedStep[] =
    [];

  // ───────────────────────────────────────────────────────────────────────────
  // Échauffement
  // ───────────────────────────────────────────────────────────────────────────

  const needsWarmup =
    wantsClimbing ||
    wantsKilter ||
    selectedSessionIds.some(
      (
        sessionId,
      ) =>
        sessionId ===
          "s1-force-doigts" ||
        sessionId ===
          "s2-resistance",
    );

  if (
    needsWarmup
  ) {
    const totalSelectedSessionMinutes =
      selectedSessionIds.reduce(
        (
          total,
          sessionId,
        ) =>
          total +
          getSessionDuration(
            sessionId,
          ),
        0,
      );

    let warmupDuration =
      15;

    /*
     * Lorsque les séances demandées remplissent presque
     * tout le budget, garder au minimum un échauffement
     * court plutôt que supprimer une séance demandée.
     */
    if (
      totalSelectedSessionMinutes +
        warmupDuration >
      budget
    ) {
      warmupDuration =
        Math.max(
          8,
          Math.min(
            10,
            budget -
              totalSelectedSessionMinutes,
          ),
        );
    }

    if (
      warmupDuration >
        0 &&
      warmupDuration <=
        budget
    ) {
      const warmup =
        getWarmupStep(
          warmupDuration,
        );

      if (
        injuryWarning
      ) {
        warmup.warning =
          injuryWarning;
      }

      addStepIfFits(
        steps,
        warmup,
        budget,
      );
    }
  }

  // ───────────────────────────────────────────────────────────────────────────
  // Séances demandées / automatiques
  // ───────────────────────────────────────────────────────────────────────────

  selectedSessionIds.forEach(
    (
      sessionId,
    ) => {
      addStepIfFits(
        steps,
        buildSessionStep(
          sessionId,
        ),
        budget,
      );
    },
  );

  // ───────────────────────────────────────────────────────────────────────────
  // Kilter
  // ───────────────────────────────────────────────────────────────────────────

  if (
    wantsKilter
  ) {
    const remaining =
      getRemainingMinutes(
        steps,
        budget,
      );

    const kilterStep =
      fitKilterStepToTime(
        getKilterStep(
          logs,
          seed +
            71,
        ),
        remaining,
      );

    if (
      kilterStep
    ) {
      steps.push(
        kilterStep,
      );
    }
  }

  // ───────────────────────────────────────────────────────────────────────────
  // Bloc libre
  // ───────────────────────────────────────────────────────────────────────────

  if (
    wantsClimbing &&
    !hasTodaySession(
      logs,
      date,
      "grimpe-libre",
    )
  ) {
    const guidance =
      getBoulderGuidance(
        logs,
      );

    const remainingBudget =
      getRemainingMinutes(
        steps,
        budget,
      );

    if (
      remainingBudget >=
      20
    ) {
      /*
       * Si l'utilisateur a demandé uniquement
       * de la grimpe et dispose de beaucoup de temps,
       * on peut aller jusqu'à 2 h.
       *
       * S'il a aussi demandé d'autres séances,
       * on limite la grimpe à 90 min.
       */
      const climbingMaximum =
        requestedSessionIds.length ===
          0 &&
        !wantsKilter
          ? 120
          : 90;

      const climbingMinutes =
        Math.min(
          climbingMaximum,
          remainingBudget,
        );

      steps.push({
        id:
          "climbing",

        type:
          "climbing",

        title:
          "Grimper librement",

        subtitle:
          guidance.title,

        description:
          `${guidance.description} Commencer par du volume facile et arrêter d’augmenter la difficulté si les doigts ou les épaules deviennent inconfortables.`,

        durationMinutes:
          climbingMinutes,

        isTemporarySuggestion:
          true,

        warning:
          injuryWarning,
      });
    }
  }

  // ───────────────────────────────────────────────────────────────────────────
  // Séance manuelle impossible à faire entrer
  // ───────────────────────────────────────────────────────────────────────────

  if (
    steps.length ===
      0 &&
    requestedSessionIds.length >
      0
  ) {
    const firstRequested =
      requestedSessionIds[0];

    const requestedStep =
      buildSessionStep(
        firstRequested,
      );

    if (
      requestedStep &&
      budget >
        0
    ) {
      return {
        date,

        title:
          "Temps disponible trop court",

        explanation:
          `La séance ${getSessionName(
            firstRequested,
          )} dure environ ${requestedStep.durationMinutes} min. Aucune séance partielle récente à terminer n’a été trouvée.`,

        availableMinutes,

        plannedMinutes:
          0,

        steps: [
          {
            id:
              `time-warning-${firstRequested}`,

            type:
              "rest",

            title:
              getSessionName(
                firstRequested,
              ),

            subtitle:
              `≈ ${requestedStep.durationMinutes} min nécessaires`,

            description:
              "Augmente le temps disponible ou choisis une séance plus courte.",

            durationMinutes:
              0,

            isTemporarySuggestion:
              true,

            warning:
              injuryWarning,
          },
        ],

        signature:
          `time-warning-${firstRequested}-${budget}`,
      };
    }
  }

  // ───────────────────────────────────────────────────────────────────────────
  // Pompes / activation
  // ───────────────────────────────────────────────────────────────────────────

  if (
    steps.length ===
      0 &&
    shouldSuggestPushups(
      recoveryScores,
      selectedSessionIds,
      wantsClimbing,
      wantsKilter,
    )
  ) {
    const pushups =
      buildSessionStep(
        "s8-pompes-activation",
      );

    if (
      pushups
    ) {
      addStepIfFits(
        steps,
        {
          ...pushups,

          subtitle:
            "S’activer légèrement avant la mobilité",
        },
        budget,
      );
    }

    addStepIfFits(
      steps,
      getFinisher(
        "flexibility",
        seed,
      ),
      budget,
    );
  }

  // ───────────────────────────────────────────────────────────────────────────
  // Prévention
  // ───────────────────────────────────────────────────────────────────────────

  if (
    steps.length ===
    0
  ) {
    const prevention =
      buildSessionStep(
        "s7-prevention",
      );

    if (
      prevention
    ) {
      addStepIfFits(
        steps,
        {
          ...prevention,

          title:
            "Réaliser une prévention légère",

          subtitle:
            "Contrôler chaque mouvement",

          warning:
            injuryWarning,
        },
        budget,
      );
    }
  }

  // ───────────────────────────────────────────────────────────────────────────
  // Finisher
  // ───────────────────────────────────────────────────────────────────────────

  const alreadyHasFinisher =
    steps.some(
      (
        step,
      ) =>
        step.type ===
          "abs" ||
        step.type ===
          "flexibility" ||
        step.sessionId ===
          "s4-gainage" ||
        step.sessionId ===
          "s5-souplesse",
    );

  if (
    !alreadyHasFinisher &&
    getRemainingMinutes(
      steps,
      budget,
    ) >=
      10
  ) {
    const finisherType =
      legsLoaded ||
      upperBodyLoaded
        ? "flexibility"
        : chooseFinisher(
            logs,
            date,
          );

    addStepIfFits(
      steps,
      getFinisher(
        finisherType,
        seed,
      ),
      budget,
    );
  }

  // ───────────────────────────────────────────────────────────────────────────
  // Compléter intelligemment le temps automatique
  // ───────────────────────────────────────────────────────────────────────────

  /*
   * Important :
   *
   * Cette partie ne s'active QUE si l'utilisateur
   * n'a demandé ni séance précise ni grimpe précise.
   *
   * Elle permet par exemple à 2 h 30 saisi de ne plus
   * produire seulement 1 h 10 de contenu.
   */
  const fullyAutomatic =
    !hasExplicitSessionChoice &&
    !wantsClimbing &&
    !wantsKilter;

  if (
    fullyAutomatic
  ) {
    const alreadySelected =
      steps
        .map(
          (
            step,
          ) =>
            step.sessionId,
        )
        .filter(
          (
            sessionId,
          ): sessionId is string =>
            Boolean(
              sessionId,
            ),
        );

    const ranked =
      rankAutomaticMainSessions(
        logs,
        injuries,
        date,
        seed +
          137,
        options.recoveryExerciseData,
      );

    for (
      const candidate of ranked
    ) {
      const remaining =
        getRemainingMinutes(
          steps,
          budget,
        );

      if (
        remaining <
        20
      ) {
        break;
      }

      if (
        alreadySelected.includes(
          candidate.sessionId,
        )
      ) {
        continue;
      }

      if (
        !automaticSessionsAreCompatible(
          alreadySelected,
          candidate.sessionId,
        )
      ) {
        continue;
      }

      const step =
        buildSessionStep(
          candidate.sessionId,
        );

      if (
        !step
      ) {
        continue;
      }

      if (
        step.durationMinutes >
        remaining
      ) {
        continue;
      }

      steps.push(
        step,
      );

      alreadySelected.push(
        candidate.sessionId,
      );

      if (
        alreadySelected.filter(
          (
            sessionId,
          ) =>
            AUTO_MAIN_SESSION_IDS.includes(
              sessionId,
            ),
        ).length >=
        3
      ) {
        break;
      }
    }

    /*
     * S'il reste encore 10 minutes ou plus,
     * terminer avec mobilité/gainage selon la récup.
     */
    const hasAnyFinisherNow =
      steps.some(
        (
          step,
        ) =>
          step.type ===
            "abs" ||
          step.type ===
            "flexibility" ||
          step.sessionId ===
            "s5-souplesse",
      );

    if (
      !hasAnyFinisherNow &&
      getRemainingMinutes(
        steps,
        budget,
      ) >=
        10
    ) {
      const finisherType =
        legsLoaded ||
        upperBodyLoaded
          ? "flexibility"
          : chooseFinisher(
              logs,
              date,
            );

      addStepIfFits(
        steps,
        getFinisher(
          finisherType,
          seed +
            211,
        ),
        budget,
      );
    }
  }

  if (
    steps.length ===
    0
  ) {
    return buildRecoverySuggestion(
      date,
      availableMinutes,
      injuryWarning,
    );
  }

  const explicitCount =
    requestedSessionIds.length +
    (
      wantsClimbing
        ? 1
        : 0
    ) +
    (
      wantsKilter
        ? 1
        : 0
    );

  const plannedMinutes =
    getPlannedMinutes(
      steps,
    );

  const remainingMinutes =
    Math.max(
      0,
      budget -
        plannedMinutes,
    );

  let explanation:
    string;

    if (
      availableMinutes ===
      null
    ) {
      explanation =
        explicitCount >
        0
          ? "Proposition basée sur tes envies, ta récupération et tes séances précédentes. Sans temps indiqué, 1 h 30 au total est prévu par défaut, dont 10 min de marge."
          : "Proposition basée sur 1 h 30 au total par défaut, avec 10 min de marge, ta récupération et tes séances précédentes.";
  } else if (
    injuryWarning
  ) {
    explanation =
      "Proposition adaptée au temps disponible, à la récupération, aux séances précédentes et à la blessure enregistrée. Une marge de 10 min est conservée.";
  } else {
    explanation =
      "Proposition adaptée au temps disponible, à la récupération et aux séances précédentes. Une marge de 10 min est conservée pour se changer, se doucher ou ranger.";
  }

  /*
   * Éviter un texte bizarre lorsque seuls quelques
   * minutes restent non utilisées.
   */
  if (
    availableMinutes !==
      null &&
    remainingMinutes >=
      20 &&
    explicitCount >
      0
  ) {
    explanation +=
      " Le temps restant n’est pas rempli avec une grosse séance non demandée.";
  }

  return {
    date,

    title:
      todayLogs.length >
      0
        ? "Continuer aujourd’hui"
        : "Proposition du jour",

    explanation,

    availableMinutes,

    plannedMinutes,

    steps,

    signature:
      buildSignature(
        steps,
      ),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Export
// ─────────────────────────────────────────────────────────────────────────────

export function generateDailySuggestion(
  options: GenerateSuggestionOptions,
): DailySuggestion {
  const recent =
    options.recentSuggestionSignatures ??
    [];

  for (
    let attempt = 0;
    attempt <
    8;
    attempt +=
      1
  ) {
    const suggestion =
      buildSuggestion(
        options,
        attempt,
      );

    if (
      !recent.includes(
        suggestion.signature,
      )
    ) {
      return suggestion;
    }
  }

  return buildSuggestion(
    options,
    8,
  );
}

export function getTodayLocalDate(): string {
  return localDateFromDate(
    new Date(),
  );
}