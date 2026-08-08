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

export type DailyPreference =
  | "unknown"
  | "climbing"
  | "kilter"
  | "climbing+kilter"
  | "rest"
  | string;

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

type GenerateSuggestionOptions = {
  logs: SessionLog[];
  injuries?: Injury[];
  date: string;
  availableMinutes: number | null;
  preference: DailyPreference;
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

const DEFAULT_UNKNOWN_TIME_MINUTES =
  105;

const SESSION_DURATION: Record<
  string,
  number
> = {
  "s1-force-doigts": 35,
  "s2-resistance": 40,
  "s3-dos-epaules": 45,
  "s4-gainage": 30,
  "s5-souplesse": 30,
  "s6-jambes": 40,
  "s7-prevention": 25,
  "s8-pompes-activation": 10,
};

const MAIN_SESSION_IDS = [
  "s1-force-doigts",
  "s2-resistance",
  "s3-dos-epaules",
  "s6-jambes",
  "s7-prevention",
];

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
  let hash = 0;

  for (
    let index = 0;
    index < value.length;
    index += 1
  ) {
    hash =
      (
        hash * 31 +
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
    .split("T")[0];
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
    (log) => {
      const difference =
        differenceInDays(
          date,
          log.date,
        );

      return (
        difference >= 0 &&
        difference < days
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
    (log) =>
      log.date === date &&
      log.sessionId ===
        sessionId,
  );
}

function getPlanningBudget(
  availableMinutes:
    | number
    | null,
): number {
  if (
    availableMinutes ===
    null
  ) {
    return DEFAULT_UNKNOWN_TIME_MINUTES;
  }

  const margin =
    Math.max(
      5,
      Math.round(
        availableMinutes *
          0.06,
      ),
    );

  return Math.max(
    15,
    availableMinutes -
      margin,
  );
}

function getSession(
  sessionId: string,
) {
  return SESSIONS.find(
    (session) =>
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

function getExerciseName(
  exerciseId: string,
): string {
  for (
    const session of SESSIONS
  ) {
    const exercise =
      session.exercises.find(
        (item) =>
          item.id ===
          exerciseId,
      );

    if (
      exercise
    ) {
      return exercise.name;
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
    const parsed =
      Number(
        value,
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

// ─────────────────────────────────────────────────────────────────────────────
// Séances partielles
// ─────────────────────────────────────────────────────────────────────────────

function findPartialSession(
  logs: SessionLog[],
  date: string,
): PartialSession | null {
  /*
   * Une vraie séance partielle doit maintenant contenir
   * explicitement :
   *
   * completed: true
   * ET
   * completed: false
   *
   * Cela évite de prendre les anciennes séances pour
   * des séances incomplètes.
   */

  const recentLogs =
    getLogsDuringLastDays(
      logs,
      date,
      4,
    )
      .filter(
        (log) =>
          Boolean(
            getSession(
              log.sessionId,
            ),
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
        session.exercises.map(
          (exercise) =>
            exercise.id,
        ),
      );

    const completedExerciseIds =
      log.exerciseLogs
        .filter(
          (exercise) =>
            exercise.completed ===
            true,
        )
        .map(
          (exercise) =>
            exercise.exerciseId,
        )
        .filter(
          (exerciseId) =>
            currentExerciseIds.has(
              exerciseId,
            ),
        );

    const remainingExerciseIds =
      log.exerciseLogs
        .filter(
          (exercise) =>
            exercise.completed ===
            false,
        )
        .map(
          (exercise) =>
            exercise.exerciseId,
        )
        .filter(
          (exerciseId) =>
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
        total > 0
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
): RecoveryLoadScores {
  const recovery =
    calculateMuscleRecovery(
      logs,
      injuries,
    );

  return Object.fromEntries(
    recovery.map(
      (muscle) => [
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
    ] ?? 0;

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
      fingers * 0.2 +
      forearms * 0.16 +
      shoulders * 0.05
    );
  }

  if (
    sessionId ===
    "s2-resistance"
  ) {
    return (
      fingers * 0.13 +
      forearms * 0.16 +
      back * 0.07 +
      biceps * 0.06
    );
  }

  if (
    sessionId ===
    "s3-dos-epaules"
  ) {
    return (
      back * 0.12 +
      shoulders * 0.13 +
      chest * 0.08 +
      biceps * 0.07 +
      triceps * 0.07
    );
  }

  if (
    sessionId ===
    "s4-gainage"
  ) {
    return (
      lowerBack * 0.05 +
      shoulders * 0.025
    );
  }

  if (
    sessionId ===
    "s6-jambes"
  ) {
    return (
      legs * 0.07 +
      lowerBack * 0.09
    );
  }

  if (
    sessionId ===
    "s7-prevention"
  ) {
    return (
      shoulders +
      forearms
    ) * 0.012;
  }

  if (
    sessionId ===
    "s8-pompes-activation"
  ) {
    return (
      shoulders * 0.08 +
      chest * 0.11 +
      triceps * 0.1
    );
  }

  return 0;
}

// ─────────────────────────────────────────────────────────────────────────────
// Choix de séance
// ─────────────────────────────────────────────────────────────────────────────

function chooseMainSession(
  logs: SessionLog[],
  injuries: Injury[],
  date: string,
  seed: number,
  preference: DailyPreference,
): string | null {
  const recoveryScores =
    calculateRecoveryLoadScores(
      logs,
      injuries,
    );

  /*
   * Si une séance spécifique est demandée,
   * essayer de la respecter tant que la récupération
   * reste suffisamment correcte.
   */
  if (
    MAIN_SESSION_IDS.includes(
      preference,
    )
  ) {
    const forcedPenalty =
      getRecoveryPenalty(
        preference,
        recoveryScores,
      );

    if (
      forcedPenalty < 42
    ) {
      return preference;
    }

    return null;
  }

  const candidates =
    MAIN_SESSION_IDS.filter(
      (sessionId) =>
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

  const scored =
    candidates.map(
      (
        sessionId,
        index,
      ) => {
        const lastLog =
          logs
            .filter(
              (log) =>
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
            (log) =>
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
              index * 7
            ) %
            11
          );

        if (
          daysSince <= 1
        ) {
          score -= 110;
        } else if (
          daysSince === 2
        ) {
          score -= 40;
        }

        return {
          sessionId,
          score,
          recoveryPenalty,
        };
      },
    );

  scored.sort(
    (
      first,
      second,
    ) =>
      second.score -
      first.score,
  );

  const best =
    scored[0];

  if (
    !best ||
    best.recoveryPenalty >=
      45
  ) {
    return null;
  }

  return best.sessionId;
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
      (log) =>
        log.finisherType ===
          "abs" ||
        log.sessionId ===
          "s4-gainage",
    ).length;

  const flexibilityCount =
    last30.filter(
      (log) =>
        log.finisherType ===
          "flexibility" ||
        log.sessionId ===
          "s5-souplesse",
    ).length;

  if (
    absCount === 0 &&
    flexibilityCount === 0
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
// Kilterboard
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
    KilterResult[] = [];

  logs.forEach(
    (log) => {
      const raw =
        log as unknown as Record<
          string,
          unknown
        >;

      getArrayValue(
        raw.kilterEntries,
      ).forEach(
        (value) => {
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
      (entry) =>
        entry.angle ===
        angle,
    );

  const successful =
    atAngle.filter(
      (entry) =>
        isSuccessfulResult(
          entry.result,
        ),
    );

  const highestSuccessfulGrade =
    successful.length > 0
      ? Math.max(
          ...successful.map(
            (entry) =>
              entry.grade,
          ),
        )
      : 0;

  let confirmedGrade =
    0;

  /*
   * Chaque inclinaison est indépendante.
   *
   * Il faut au moins 2 réussites au même grade
   * et à la même inclinaison pour considérer
   * le niveau comme consolidé.
   */
  for (
    let grade = 0;
    grade <= 17;
    grade += 1
  ) {
    const sendsAtGrade =
      successful.filter(
        (entry) =>
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
      (entry) =>
        entry.grade ===
        confirmedGrade,
    );

  const nextGrade =
    clampKilterGrade(
      confirmedGrade + 1,
    );

  /*
   * Pour débloquer le niveau suivant :
   *
   * - deux réussites au grade actuel ;
   * - au moins une réussite en 4 essais ou moins.
   *
   * Un niveau arraché deux fois après énormément
   * d'essais n'est donc pas traité comme parfaitement maîtrisé.
   */
  const nextGradeUnlocked =
    confirmedGrade < 17 &&
    sendsAtConfirmedGrade.length >=
      2 &&
    sendsAtConfirmedGrade.some(
      (entry) =>
        entry.attempts <= 4,
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
      (angle) =>
        buildKilterAngleProfile(
          entries,
          angle,
        ),
    );

  const practised =
    profiles.filter(
      (profile) =>
        entries.some(
          (entry) =>
            entry.angle ===
            profile.angle,
        ),
    );

  /*
   * Première utilisation du Kilter :
   * partir à 30°.
   */
  if (
    practised.length ===
    0
  ) {
    return buildKilterAngleProfile(
      [],
      30,
    );
  }

  /*
   * Favoriser une inclinaison déjà utilisée
   * mais encore relativement peu consolidée.
   */
  const ordered =
    [...practised].sort(
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
    seed % 100 <
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
          currentGrade - 1,
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
            currentGrade - 1,
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
        currentGrade - 1,
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
          currentGrade - 1,
        ),

      maxGrade:
        currentGrade,

      durationMinutes:
        22,
    },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Bloc libre
// ─────────────────────────────────────────────────────────────────────────────

function extractBoulderResults(
  logs: SessionLog[],
): BoulderResult[] {
  const results:
    BoulderResult[] = [];

  logs.forEach(
    (log) => {
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
        (possibleArray) => {
          getArrayValue(
            possibleArray,
          ).forEach(
            (value) => {
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
                grade < 0
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
      (entry) =>
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
        (entry) =>
          entry.grade,
      ),
    );

  const sendsAtHighest =
    successful.filter(
      (entry) =>
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
        (entry) =>
          entry.attempts,
      ),
    );

  if (
    bestAttempts > 4
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

function getWarmupStep(): SuggestedStep {
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
      "Commencer très facilement puis augmenter progressivement l’intensité. Arrêter tout mouvement qui augmente une douleur.",

    durationMinutes:
      15,

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
      SESSION_DURATION[
        sessionId
      ] ??
      30,

    sessionId,

    isTemporarySuggestion:
      true,
  };
}

function buildPartialSessionStep(
  partial: PartialSession,
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
        (
          SESSION_DURATION[
            partial.sessionId
          ] ??
          30
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
      "Reprendre uniquement les exercices explicitement non réalisés. Ne pas refaire les exercices déjà terminés dans cette séance.",

    durationMinutes:
      estimatedDuration,

    sessionId:
      partial.sessionId,

    /*
     * C'est le seul endroit où une séance est volontairement
     * proposée sous forme de sous-liste d'exercices.
     */
    exercises:
      partial.remainingExerciseIds.map(
        getExerciseName,
      ),

    isTemporarySuggestion:
      true,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Pompes / activation
// ─────────────────────────────────────────────────────────────────────────────

function shouldSuggestPushups(
  recoveryScores: RecoveryLoadScores,
  selectedMain: string | null,
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
    selectedMain ===
      "s3-dos-epaules" ||
    selectedMain ===
      "s1-force-doigts" ||
    selectedMain ===
      "s2-resistance"
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
    chest < 40 &&
    shoulders < 40 &&
    triceps < 40
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
        (injury) =>
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
      (step) => {
        const preset =
          step.kilterPreset;

        return [
          step.type,

          step.sessionId ??
            "",

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

      {
        id:
          "mobility",

        type:
          "flexibility",

        title:
          "Effectuer une mobilité douce",

        durationMinutes:
          10,

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
      },
    ];

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
      10,

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

  const todayLogs =
    logs.filter(
      (log) =>
        log.date ===
        date,
    );

  const seed =
    stringHash(
      `${date}-${variation}-${seedOffset}-${todayLogs
        .map(
          (log) =>
            log.sessionId,
        )
        .sort()
        .join("-")}`,
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

  const recoveryScores =
    calculateRecoveryLoadScores(
      logs,
      injuries,
    );

  const fingersLoaded =
    (
      recoveryScores.doigts ??
      0
    ) >= 55 ||
    (
      recoveryScores[
        "avant-bras"
      ] ?? 0
    ) >= 60;

  const upperBodyLoaded =
    (
      recoveryScores.epaules ??
      0
    ) >= 70 ||
    (
      recoveryScores.dorsaux ??
      0
    ) >= 70;

  const legsLoaded =
    (
      recoveryScores.quadriceps ??
      0
    ) >= 70 ||
    (
      recoveryScores.ischios ??
      0
    ) >= 70;

  const globallyVeryTired =
    [
      "doigts",
      "avant-bras",
      "epaules",
      "dorsaux",
      "quadriceps",
      "ischios",
    ].filter(
      (muscleId) =>
        (
          recoveryScores[
            muscleId
          ] ?? 0
        ) >= 75,
    ).length >= 3;

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
  // Priorité aux séances réellement partielles
  // ───────────────────────────────────────────────────────────────────────────

  const partial =
    findPartialSession(
      logs,
      date,
    );

  if (
    partial
  ) {
    const partialStep =
      buildPartialSessionStep(
        partial,
      );

    if (
      partialStep
    ) {
      const steps:
        SuggestedStep[] = [];

      /*
       * Échauffement uniquement pour les séances
       * qui le nécessitent vraiment.
       */
      if (
        partial.sessionId ===
          "s1-force-doigts" ||
        partial.sessionId ===
          "s2-resistance"
      ) {
        const warmup =
          getWarmupStep();

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

      /*
       * Même si le temps annoncé est légèrement inférieur
       * à l'estimation, la séance partielle reste l'objectif
       * principal plutôt que d'être remplacée par une autre séance.
       */
      steps.push(
        partialStep,
      );

      const finisherType =
        legsLoaded ||
        upperBodyLoaded
          ? "flexibility"
          : chooseFinisher(
              logs,
              date,
            );

      const finisher =
        getFinisher(
          finisherType,
          seed,
        );

      addStepIfFits(
        steps,
        finisher,
        budget,
      );

      return {
        date,

        title:
          "Terminer la séance commencée",

        explanation:
          "La priorité est donnée uniquement aux exercices explicitement non réalisés de la séance commencée. Les exercices déjà réalisés ne sont pas proposés une deuxième fois.",

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
  // Préférence de la journée
  // ───────────────────────────────────────────────────────────────────────────

  const forcedMain =
    MAIN_SESSION_IDS.includes(
      preference,
    );

  let wantsClimbing =
    preference ===
      "climbing" ||
    preference ===
      "climbing+kilter";

  let wantsKilter =
    preference ===
      "kilter" ||
    preference ===
      "climbing+kilter";

  /*
   * "unknown" ne veut pas dire automatiquement
   * grimpe libre.
   *
   * On varie entre :
   * - séance structurée ;
   * - bloc libre ;
   * - Kilter.
   */
  if (
    preference ===
    "unknown"
  ) {
    const randomChoice =
      seed % 100;

    if (
      !fingersLoaded &&
      !upperBodyLoaded &&
      randomChoice < 22
    ) {
      wantsKilter =
        true;
    } else if (
      !fingersLoaded &&
      randomChoice >= 22 &&
      randomChoice < 42
    ) {
      wantsClimbing =
        true;
    }
  }

  /*
   * La récupération garde priorité sur la préférence.
   */
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

  const shouldChooseMain =
    forcedMain ||
    (
      preference ===
        "unknown" &&
      !wantsClimbing &&
      !wantsKilter
    );

  const selectedMain =
    shouldChooseMain &&
    (
      budget >= 35 ||
      forcedMain
    )
      ? chooseMainSession(
          logs,
          injuries,
          date,
          seed,
          preference,
        )
      : null;

  const steps:
    SuggestedStep[] = [];

  // ───────────────────────────────────────────────────────────────────────────
  // Échauffement
  // ───────────────────────────────────────────────────────────────────────────

  const needsWarmup =
    wantsClimbing ||
    wantsKilter ||
    selectedMain ===
      "s1-force-doigts" ||
    selectedMain ===
      "s2-resistance";

  if (
    needsWarmup
  ) {
    const warmup =
      getWarmupStep();

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

  // ───────────────────────────────────────────────────────────────────────────
  // Force doigts
  // ───────────────────────────────────────────────────────────────────────────

  if (
    selectedMain ===
    "s1-force-doigts"
  ) {
    addStepIfFits(
      steps,
      buildSessionStep(
        selectedMain,
      ),
      budget,
    );
  }

  // ───────────────────────────────────────────────────────────────────────────
  // Kilter
  // ───────────────────────────────────────────────────────────────────────────

  if (
    wantsKilter
  ) {
    addStepIfFits(
      steps,
      getKilterStep(
        logs,
        seed + 71,
      ),
      budget,
    );
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
      budget -
      getPlannedMinutes(
        steps,
      );

    if (
      remainingBudget >= 25
    ) {
      const climbingMinutes =
        Math.min(
          90,
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
  // Autres séances principales
  // ───────────────────────────────────────────────────────────────────────────

  if (
    selectedMain &&
    selectedMain !==
      "s1-force-doigts"
  ) {
    addStepIfFits(
      steps,
      buildSessionStep(
        selectedMain,
      ),
      budget,
    );
  }

  // ───────────────────────────────────────────────────────────────────────────
  // Pompes / activation + mobilité
  // ───────────────────────────────────────────────────────────────────────────

  if (
    steps.length === 0 &&
    shouldSuggestPushups(
      recoveryScores,
      selectedMain,
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

    /*
     * Association volontaire :
     * Pompes / activation puis Souplesse.
     */
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
  // Prévention légère
  // ───────────────────────────────────────────────────────────────────────────

  if (
    steps.length === 0
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
      (step) =>
        step.type ===
          "abs" ||
        step.type ===
          "flexibility",
    );

  if (
    !alreadyHasFinisher
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

  if (
    steps.length === 0
  ) {
    return buildRecoverySuggestion(
      date,
      availableMinutes,
      injuryWarning,
    );
  }

  return {
    date,

    title:
      todayLogs.length > 0
        ? "Continuer aujourd’hui"
        : "Proposition du jour",

    explanation:
      availableMinutes ===
      null
        ? injuryWarning
          ? "Proposition temporaire adaptée à la récupération, aux séances précédentes et à la blessure enregistrée."
          : "Proposition temporaire basée sur environ 1 h 45, la récupération et les séances précédentes."
        : injuryWarning
          ? "Proposition temporaire adaptée au temps disponible, à la récupération, aux séances précédentes et à la blessure enregistrée."
          : "Proposition temporaire adaptée au temps disponible, à la récupération et aux séances précédentes.",

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
    attempt < 8;
    attempt += 1
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