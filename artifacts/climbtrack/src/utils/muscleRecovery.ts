import type {
  AppData,
  Injury,
  SessionLog,
} from "@/context/ClimbTrackContext";

import {
  MUSCLE_CATALOG,
  SESSIONS,
} from "@/data/sessions";

import type {
  ExerciseDef,
  ExerciseMuscleLoad,
  MuscleIntensity,
  RecoveryMuscleGroup,
} from "@/data/sessions";

import {
  resolveExerciseMuscleLoads,
} from "@/data/exerciseMuscleLibrary";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type MuscleRecoveryStatus =
  | "ready"
  | "moderate"
  | "tired"
  | "unknown";

export type MuscleRecovery = {
  id: string;
  name: string;
  load: number;
  recoveryPercent: number;
  hoursSinceLastLoad: number | null;
  status: MuscleRecoveryStatus;
  activeInjury?: Injury;
};

type MuscleLoadMap = Record<
  string,
  number
>;

export type RecoveryExerciseData =
  Pick<
    AppData,
    | "customExercises"
    | "exerciseOverrides"
  >;

// ─────────────────────────────────────────────────────────────────────────────
// Groupes musculaires de récupération
// ─────────────────────────────────────────────────────────────────────────────

/*
 * On conserve les groupes principaux utilisés actuellement
 * par la page Corps et par les suggestions.
 *
 * On ajoute également :
 * - obliques ;
 * - hanches ;
 * - pieds.
 *
 * Les muscles anatomiques précis de MUSCLE_CATALOG sont
 * regroupés ici uniquement pour calculer la récupération.
 */
export const MUSCLE_GROUPS = [
  {
    id: "doigts",
    name: "Doigts",
  },

  {
    id: "avant-bras",
    name: "Avant-bras",
  },

  {
    id: "biceps",
    name: "Biceps",
  },

  {
    id: "triceps",
    name: "Triceps",
  },

  {
    id: "epaules",
    name: "Épaules",
  },

  {
    id: "pectoraux",
    name: "Pectoraux",
  },

  {
    id: "dorsaux",
    name: "Dorsaux",
  },

  {
    id: "lombaires",
    name: "Lombaires",
  },

  {
    id: "abdominaux",
    name: "Abdominaux",
  },

  {
    id: "obliques",
    name: "Obliques",
  },

  {
    id: "fessiers",
    name: "Fessiers",
  },

  {
    id: "hanches",
    name: "Hanches",
  },

  {
    id: "adducteurs",
    name: "Adducteurs",
  },

  {
    id: "ischios",
    name: "Ischio-jambiers",
  },

  {
    id: "quadriceps",
    name: "Quadriceps",
  },

  {
    id: "mollets",
    name: "Mollets",
  },

  {
    id: "tibial",
    name: "Tibial antérieur",
  },

  {
    id: "pieds",
    name: "Pieds",
  },
] as const;

// ─────────────────────────────────────────────────────────────────────────────
// Temps
// ─────────────────────────────────────────────────────────────────────────────

export function getSessionTimestamp(
  log: Pick<
    SessionLog,
    "date" | "completedAt"
  >,
): number {
  if (
    log.completedAt
  ) {
    const exactTimestamp =
      new Date(
        log.completedAt,
      ).getTime();

    if (
      !Number.isNaN(
        exactTimestamp,
      )
    ) {
      return exactTimestamp;
    }
  }

  const fallbackTimestamp =
    new Date(
      `${log.date}T12:00:00`,
    ).getTime();

  return Number.isNaN(
    fallbackTimestamp,
  )
    ? Date.now()
    : fallbackTimestamp;
}

export function getHoursSinceSession(
  date: string,
  completedAt?: string,
  now = new Date(),
): number {
  const sessionTimestamp =
    getSessionTimestamp({
      date,
      completedAt,
    });

  return Math.max(
    0,
    (
      now.getTime() -
      sessionTimestamp
    ) /
      3_600_000,
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers exercices
// ─────────────────────────────────────────────────────────────────────────────

function getBuiltInExercise(
  exerciseId: string,
): ExerciseDef | null {
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
      return exercise;
    }
  }

  return null;
}

function getCustomExercise(
  exerciseId: string,
  data?: RecoveryExerciseData,
): ExerciseDef | null {
  if (
    !data
  ) {
    return null;
  }

  return (
    data.customExercises.find(
      (exercise) =>
        exercise.id ===
        exerciseId,
    ) ??
    null
  );
}

function getExerciseDefinition(
  exerciseId: string,
  data?: RecoveryExerciseData,
): ExerciseDef | null {
  return (
    getCustomExercise(
      exerciseId,
      data,
    ) ??
    getBuiltInExercise(
      exerciseId,
    )
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Conversion intensité → charge
// ─────────────────────────────────────────────────────────────────────────────

const INTENSITY_LOAD: Record<
  MuscleIntensity,
  number
> = {
  /*
   * Faible :
   * stabilisation, mobilité, étirement,
   * participation secondaire.
   */
  low: 2,

  /*
   * Moyen :
   * muscle secondaire important ou travail
   * réellement sensible.
   */
  medium: 6,

  /*
   * Fort :
   * groupe moteur principal / fatigue élevée.
   */
  high: 10,
};

function convertDetailedLoadsToRecoveryGroups(
  loads: ExerciseMuscleLoad[],
): MuscleLoadMap {
  const result:
    MuscleLoadMap = {};

  loads.forEach(
    (muscleLoad) => {
      const definition =
        MUSCLE_CATALOG.find(
          (muscle) =>
            muscle.id ===
            muscleLoad.muscleId,
        );

      if (
        !definition
      ) {
        return;
      }

      const recoveryGroup =
        definition.recoveryGroup;

      const value =
        INTENSITY_LOAD[
          muscleLoad.intensity
        ];

      /*
       * Plusieurs muscles précis peuvent appartenir
       * au même groupe général.
       *
       * Exemple :
       * - vaste médial
       * - vaste latéral
       * - droit fémoral
       *
       * Tous appartiennent aux quadriceps.
       *
       * On ne les additionne pas simplement jusqu'à
       * obtenir 30/40 de charge pour un seul exercice.
       *
       * On utilise le muscle principal + une petite
       * contribution des autres muscles du même groupe.
       */
      const previous =
        result[
          recoveryGroup
        ] ??
        0;

      if (
        previous === 0
      ) {
        result[
          recoveryGroup
        ] =
          value;
      } else {
        result[
          recoveryGroup
        ] =
          Math.min(
            12,
            Math.max(
              previous,
              value,
            ) +
              Math.min(
                previous,
                value,
              ) *
                0.12,
          );
      }
    },
  );

  return result;
}

function resolveExerciseLoad(
  exerciseId: string,
  data?: RecoveryExerciseData,
): MuscleLoadMap {
  const exercise =
    getExerciseDefinition(
      exerciseId,
      data,
    );

  /*
   * Compatibilité avec un ancien exercice supprimé
   * du catalogue mais pouvant toujours exister dans
   * l'historique.
   */
  if (
    !exercise
  ) {
    if (
      exerciseId ===
      "facepull-leger"
    ) {
      return {
        epaules: 5,
        dorsaux: 4,
      };
    }

    if (
      exerciseId ===
      "repeaters-6-4"
    ) {
      return {
        doigts: 8,
        "avant-bras": 8,
        epaules: 3,
      };
    }

    return {};
  }

  const overrideMuscleLoads =
    data?.exerciseOverrides[
      exerciseId
    ]?.muscleLoads;

  const detailedLoads =
    resolveExerciseMuscleLoads({
      exerciseId,

      name:
        data?.exerciseOverrides[
          exerciseId
        ]?.name ??
        exercise.name,

      description:
        data?.exerciseOverrides[
          exerciseId
        ]?.description ??
        exercise.description,

      savedMuscleLoads:
        overrideMuscleLoads ??
        exercise.muscleLoads,
    });

  return convertDetailedLoadsToRecoveryGroups(
    detailedLoads,
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Volume réalisé
// ─────────────────────────────────────────────────────────────────────────────

function getExerciseVolumeFactor(
  log: SessionLog["exerciseLogs"][number],
): number {
  /*
   * Le profil musculaire décrit le mouvement.
   * Ce facteur ajuste légèrement la fatigue selon
   * le travail réellement enregistré.
   *
   * Il reste volontairement modéré pour éviter
   * qu'une énorme valeur saisie rende un muscle
   * inutilisable pendant plusieurs jours.
   */

  const sets =
    Math.max(
      1,
      log.sets ||
        1,
    );

  let factor =
    Math.min(
      1.35,
      Math.max(
        0.65,
        sets / 3,
      ),
    );

  if (
    typeof log.reps ===
      "number" &&
    log.reps > 0
  ) {
    factor *=
      Math.min(
        1.2,
        Math.max(
          0.8,
          log.reps / 8,
        ),
      );
  }

  if (
    typeof log.duration ===
      "number" &&
    log.duration > 0
  ) {
    factor *=
      Math.min(
        1.2,
        Math.max(
          0.8,
          log.duration / 20,
        ),
      );
  }

  return Math.min(
    1.55,
    Math.max(
      0.55,
      factor,
    ),
  );
}

function applyExerciseVolumeFactor(
  loadMap: MuscleLoadMap,
  factor: number,
): MuscleLoadMap {
  return Object.fromEntries(
    Object.entries(
      loadMap,
    ).map(
      ([
        muscleId,
        load,
      ]) => [
        muscleId,
        load * factor,
      ],
    ),
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Grimpe libre
// ─────────────────────────────────────────────────────────────────────────────

function getFreeClimbingLoad(
  log: SessionLog,
): MuscleLoadMap {
  const duration =
    log.climbingDurationMinutes ??
    0;

  const durationFactor =
    Math.min(
      1.4,
      Math.max(
        0.5,
        duration > 0
          ? duration / 90
          : 0.75,
      ),
    );

  const intensityFactor =
    log.climbingIntensity ===
    "dur"
      ? 1.25
      : log.climbingIntensity ===
          "facile"
        ? 0.75
        : 1;

  const factor =
    durationFactor *
    intensityFactor;

  return {
    doigts:
      8 *
      factor,

    "avant-bras":
      8 *
      factor,

    biceps:
      5 *
      factor,

    epaules:
      6 *
      factor,

    dorsaux:
      7 *
      factor,

    abdominaux:
      5 *
      factor,

    obliques:
      4 *
      factor,

    fessiers:
      3 *
      factor,

    hanches:
      3 *
      factor,

    adducteurs:
      2 *
      factor,

    ischios:
      2 *
      factor,

    quadriceps:
      3 *
      factor,

    mollets:
      2 *
      factor,

    pieds:
      2 *
      factor,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Kilter
// ─────────────────────────────────────────────────────────────────────────────

function getKilterLoad(
  log: SessionLog,
): MuscleLoadMap {
  const entries =
    log.kilterEntries ??
    [];

  const duration =
    log.climbingDurationMinutes ??
    60;

  const maximumGrade =
    entries.reduce(
      (
        maximum,
        entry,
      ) =>
        Math.max(
          maximum,
          entry.grade,
        ),
      0,
    );

  const maximumAngle =
    entries.reduce(
      (
        maximum,
        entry,
      ) =>
        Math.max(
          maximum,
          entry.angle,
        ),
      30,
    );

  const totalAttempts =
    entries.reduce(
      (
        total,
        entry,
      ) =>
        total +
        Math.max(
          1,
          entry.attempts ??
            1,
        ),
      0,
    );

  const difficultyFactor =
    1 +
    maximumGrade *
      0.035 +
    Math.max(
      0,
      maximumAngle -
        30,
    ) *
      0.006;

  const durationFactor =
    Math.min(
      1.35,
      Math.max(
        0.6,
        duration / 60,
      ),
    );

  const attemptFactor =
    entries.length ===
    0
      ? 1
      : Math.min(
          1.2,
          Math.max(
            0.85,
            totalAttempts /
              Math.max(
                1,
                entries.length *
                  3,
              ),
          ),
        );

  const factor =
    Math.min(
      1.65,
      difficultyFactor *
        durationFactor *
        attemptFactor,
    );

  return {
    doigts:
      9 *
      factor,

    "avant-bras":
      9 *
      factor,

    biceps:
      6 *
      factor,

    epaules:
      8 *
      factor,

    dorsaux:
      8 *
      factor,

    abdominaux:
      7 *
      factor,

    obliques:
      6 *
      factor,

    fessiers:
      4 *
      factor,

    hanches:
      4 *
      factor,

    adducteurs:
      3 *
      factor,

    ischios:
      3 *
      factor,

    quadriceps:
      4 *
      factor,

    mollets:
      3 *
      factor,

    pieds:
      2 *
      factor,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Voie
// ─────────────────────────────────────────────────────────────────────────────

function getRouteLoad(
  log: SessionLog,
): MuscleLoadMap {
  const entries =
    log.routeClimbingEntries ??
    [];

  const duration =
    log.routeClimbingDurationMinutes ??
    90;

  const leadCount =
    entries.filter(
      (entry) =>
        entry.mode ===
        "tete",
    ).length;

  const attempts =
    entries.reduce(
      (
        total,
        entry,
      ) =>
        total +
        Math.max(
          1,
          entry.attempts ??
            1,
        ),
      0,
    );

  const durationFactor =
    Math.min(
      1.4,
      Math.max(
        0.55,
        duration / 90,
      ),
    );

  const volumeFactor =
    Math.min(
      1.35,
      Math.max(
        0.7,
        attempts / 6,
      ),
    );

  const leadFactor =
    leadCount > 0
      ? 1.12
      : 1;

  const factor =
    Math.min(
      1.55,
      durationFactor *
        volumeFactor *
        leadFactor,
    );

  return {
    doigts:
      8 *
      factor,

    "avant-bras":
      9 *
      factor,

    biceps:
      6 *
      factor,

    epaules:
      6 *
      factor,

    dorsaux:
      8 *
      factor,

    abdominaux:
      6 *
      factor,

    obliques:
      5 *
      factor,

    fessiers:
      5 *
      factor,

    hanches:
      4 *
      factor,

    adducteurs:
      4 *
      factor,

    ischios:
      4 *
      factor,

    quadriceps:
      6 *
      factor,

    mollets:
      5 *
      factor,

    tibial:
      2 *
      factor,

    pieds:
      3 *
      factor,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Récupération
// ─────────────────────────────────────────────────────────────────────────────

function getRecoveryHours(
  muscleId: string,
): number {
  switch (
    muscleId
  ) {
    case "doigts":
      return 48;

    case "avant-bras":
      return 44;

    case "epaules":
    case "pectoraux":
    case "dorsaux":
    case "biceps":
    case "triceps":
      return 42;

    case "quadriceps":
    case "ischios":
    case "fessiers":
    case "adducteurs":
      return 48;

    case "hanches":
      return 42;

    case "mollets":
    case "tibial":
    case "pieds":
      return 36;

    case "lombaires":
      return 48;

    case "abdominaux":
    case "obliques":
      return 30;

    default:
      return 36;
  }
}

function getLoadDecay(
  load: number,
  hoursSinceSession: number,
  recoveryHours: number,
): number {
  if (
    hoursSinceSession >=
    recoveryHours
  ) {
    return 0;
  }

  const remainingRatio =
    1 -
    hoursSinceSession /
      recoveryHours;

  return (
    load *
    remainingRatio
  );
}

function addLoad(
  target: MuscleLoadMap,
  source: MuscleLoadMap,
) {
  Object.entries(
    source,
  ).forEach(
    ([
      muscleId,
      load,
    ]) => {
      target[
        muscleId
      ] =
        (
          target[
            muscleId
          ] ??
          0
        ) +
        load;
    },
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Charge totale d'une séance
// ─────────────────────────────────────────────────────────────────────────────

export function getSessionMuscleLoad(
  log: SessionLog,
  data?: RecoveryExerciseData,
): MuscleLoadMap {
  const totalLoad:
    MuscleLoadMap = {};

  /*
   * Anciennes sauvegardes :
   * completed absent = réalisé.
   *
   * Nouvelles sauvegardes :
   * completed === false = explicitement non réalisé.
   */
  log.exerciseLogs
    .filter(
      (exerciseLog) =>
        exerciseLog.completed !==
        false,
    )
    .forEach(
      (exerciseLog) => {
        const baseLoad =
          resolveExerciseLoad(
            exerciseLog.exerciseId,
            data,
          );

        if (
          Object.keys(
            baseLoad,
          ).length ===
          0
        ) {
          return;
        }

        const volumeFactor =
          getExerciseVolumeFactor(
            exerciseLog,
          );

        addLoad(
          totalLoad,
          applyExerciseVolumeFactor(
            baseLoad,
            volumeFactor,
          ),
        );
      },
    );

  if (
    log.sessionId ===
    "grimpe-libre"
  ) {
    addLoad(
      totalLoad,
      getFreeClimbingLoad(
        log,
      ),
    );
  }

  if (
    log.sessionId ===
    "kilter"
  ) {
    addLoad(
      totalLoad,
      getKilterLoad(
        log,
      ),
    );
  }

  if (
    log.sessionId ===
    "route"
  ) {
    addLoad(
      totalLoad,
      getRouteLoad(
        log,
      ),
    );
  }

  return totalLoad;
}

// ─────────────────────────────────────────────────────────────────────────────
// Blessures
// ─────────────────────────────────────────────────────────────────────────────

function normalizeText(
  value: string,
): string {
  return value
    .toLowerCase()
    .normalize(
      "NFD",
    )
    .replace(
      /[\u0300-\u036f]/g,
      "",
    );
}

function injuryMatchesMuscle(
  injury: Injury,
  muscleId: string,
): boolean {
  const area =
    normalizeText(
      injury.area,
    );

  const matchingTerms: Record<
    string,
    string[]
  > = {
    doigts: [
      "doigt",
      "main",
      "poulie",
      "phalange",
    ],

    "avant-bras": [
      "avant bras",
      "avant-bras",
      "poignet",
      "coude",
    ],

    biceps: [
      "biceps",
      "coude",
      "bras",
    ],

    triceps: [
      "triceps",
      "coude",
      "bras",
    ],

    epaules: [
      "epaule",
      "coiffe",
      "deltoide",
      "supra epineux",
      "infra epineux",
      "petit rond",
      "sous scapulaire",
    ],

    pectoraux: [
      "pectoral",
      "pectoraux",
      "pec",
      "poitrine",
    ],

    dorsaux: [
      "dorsal",
      "haut du dos",
      "grand dorsal",
      "rhomboide",
      "trapeze",
      "omoplate",
    ],

    lombaires: [
      "lombaire",
      "bas du dos",
      "rachis",
      "erecteur",
      "carre des lombes",
      "carre lombes",
    ],

    abdominaux: [
      "abdominal",
      "abdo",
      "ventre",
    ],

    obliques: [
      "oblique",
      "cote abdomen",
      "flanc",
    ],

    fessiers: [
      "fessier",
      "fesse",
    ],

    hanches: [
      "hanche",
      "psoas",
      "ilio psoas",
      "bassin",
    ],

    adducteurs: [
      "adducteur",
      "aine",
      "gracile",
    ],

    ischios: [
      "ischio",
      "biceps femoral",
      "semi tendineux",
      "semi membraneux",
      "arriere cuisse",
    ],

    quadriceps: [
      "quadriceps",
      "genou",
      "cuisse",
      "droit femoral",
      "vaste medial",
      "vaste lateral",
    ],

    mollets: [
      "mollet",
      "achille",
      "cheville",
      "gastrocnemien",
      "soleaire",
    ],

    tibial: [
      "tibial",
      "tibia",
      "cheville",
    ],

    pieds: [
      "pied",
      "orteil",
      "plante",
      "voute plantaire",
      "cheville",
    ],
  };

  return (
    matchingTerms[
      muscleId
    ] ?? []
  ).some(
    (term) =>
      area.includes(
        normalizeText(
          term,
        ),
      ),
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// API publique
// ─────────────────────────────────────────────────────────────────────────────

export function calculateMuscleRecovery(
  logs: SessionLog[],
  injuries: Injury[] = [],
  now = new Date(),
  data?: RecoveryExerciseData,
): MuscleRecovery[] {
  return MUSCLE_GROUPS.map(
    (muscle) => {
      const recoveryHours =
        getRecoveryHours(
          muscle.id,
        );

      let accumulatedLoad =
        0;

      let mostRecentHours:
        number | null =
        null;

      logs.forEach(
        (log) => {
          const sessionLoad =
            getSessionMuscleLoad(
              log,
              data,
            )[
              muscle.id
            ] ?? 0;

          if (
            sessionLoad <=
            0
          ) {
            return;
          }

          const hoursSinceSession =
            getHoursSinceSession(
              log.date,
              log.completedAt,
              now,
            );

          if (
            mostRecentHours ===
              null ||
            hoursSinceSession <
              mostRecentHours
          ) {
            mostRecentHours =
              hoursSinceSession;
          }

          accumulatedLoad +=
            getLoadDecay(
              sessionLoad,
              hoursSinceSession,
              recoveryHours,
            );
        },
      );

      /*
       * Le facteur 5 garde approximativement
       * la même échelle que l'ancien système :
       *
       * ~20 points de charge récents
       * ≈ muscle fortement fatigué.
       */
      const normalizedLoad =
        Math.min(
          100,
          accumulatedLoad *
            5,
        );

      const activeInjury =
        injuries
          .filter(
            (injury) =>
              injury.status !==
              "guerie",
          )
          .filter(
            (injury) =>
              injuryMatchesMuscle(
                injury,
                muscle.id,
              ),
          )
          .sort(
            (
              first,
              second,
            ) =>
              second.painLevel -
              first.painLevel,
          )[0];

      const injuryPenalty = activeInjury
        ? (() => {
            const pain = activeInjury.painLevel;

            const cautionDays =
              pain >= 7 ? 42 :
              pain >= 4 ? 21 : 7;

            const start = new Date(
              activeInjury.startDate + 'T12:00:00'
            ).getTime();

            const days = Number.isFinite(start)
              ? Math.max(
                  0,
                  (now.getTime() - start) / 86400000
                )
              : 0;

            const factor =
              activeInjury.status === 'active'
                ? 1
                : Math.max(
                    0,
                    1 - days / cautionDays
                  );

            return pain * 5 * factor;
          })()
        : 0;

      const recoveryPercent =
        Math.max(
          0,
          Math.min(
            100,
            100 -
              normalizedLoad -
              injuryPenalty,
          ),
        );

      let status:
        MuscleRecoveryStatus =
        "ready";

      if (
        recoveryPercent <
        35
      ) {
        status =
          "tired";
      } else if (
        recoveryPercent <
        70
      ) {
        status =
          "moderate";
      }

      if (
        mostRecentHours ===
          null &&
        !activeInjury
      ) {
        status =
          "unknown";
      }

      return {
        id:
          muscle.id,

        name:
          muscle.name,

        load:
          Math.round(
            normalizedLoad,
          ),

        recoveryPercent:
          Math.round(
            recoveryPercent,
          ),

        hoursSinceLastLoad:
          mostRecentHours ===
          null
            ? null
            : Math.round(
                mostRecentHours *
                  10,
              ) /
              10,

        status,

        activeInjury,
      };
    },
  );
}

export function getOverallRecovery(
  recovery: MuscleRecovery[],
): number {
  if (
    recovery.length ===
    0
  ) {
    return 100;
  }

  const knownRecovery =
    recovery.filter(
      (muscle) =>
        muscle.status !==
        "unknown",
    );

  if (
    knownRecovery.length ===
    0
  ) {
    return 100;
  }

  const total =
    knownRecovery.reduce(
      (
        sum,
        muscle,
      ) =>
        sum +
        muscle.recoveryPercent,
      0,
    );

  return Math.round(
    total /
      knownRecovery.length,
  );
}

export function calculateRecoveryScores(
  logs: SessionLog[],
  injuries: Injury[] = [],
  now = new Date(),
  data?: RecoveryExerciseData,
): Record<
  string,
  number
> {
  const recovery =
    calculateMuscleRecovery(
      logs,
      injuries,
      now,
      data,
    );

  return Object.fromEntries(
    recovery.map(
      (muscle) => [
        muscle.id,
        muscle.load,
      ],
    ),
  );
}

export function calculateAccumulatedScores(
  logs: SessionLog[],
  days: number | null,
  now = new Date(),
  data?: RecoveryExerciseData,
): Record<
  string,
  number
> {
  const scores: Record<
    string,
    number
  > =
    Object.fromEntries(
      MUSCLE_GROUPS.map(
        (muscle) => [
          muscle.id,
          0,
        ],
      ),
    );

  const maximumAgeHours =
    days === null
      ? null
      : days * 24;

  logs.forEach(
    (log) => {
      if (
        maximumAgeHours !==
        null
      ) {
        const hoursSinceSession =
          getHoursSinceSession(
            log.date,
            log.completedAt,
            now,
          );

        if (
          hoursSinceSession >
          maximumAgeHours
        ) {
          return;
        }
      }

      const sessionLoad =
        getSessionMuscleLoad(
          log,
          data,
        );

      Object.entries(
        sessionLoad,
      ).forEach(
        ([
          muscleId,
          load,
        ]) => {
          scores[
            muscleId
          ] =
            (
              scores[
                muscleId
              ] ??
              0
            ) +
            load;
        },
      );
    },
  );

  Object.keys(
    scores,
  ).forEach(
    (muscleId) => {
      scores[
        muscleId
      ] =
        Math.round(
          scores[
            muscleId
          ] *
            10,
        ) /
        10;
    },
  );

  return scores;
}