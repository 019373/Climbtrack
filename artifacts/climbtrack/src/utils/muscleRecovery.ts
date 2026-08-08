import type {
  Injury,
  SessionLog,
} from "@/context/ClimbTrackContext";

// ── Types ─────────────────────────────────────────────────────────────────────

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

// ── Muscle groups ─────────────────────────────────────────────────────────────

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
    id: "fessiers",
    name: "Fessiers",
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
] as const;

// ── Time helpers ──────────────────────────────────────────────────────────────

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

// ── Exercise loading ──────────────────────────────────────────────────────────

const EXERCISE_LOADS: Record<
  string,
  MuscleLoadMap
> = {
  "suspension-20mm": {
    doigts: 10,
    "avant-bras": 8,
    epaules: 3,
    dorsaux: 2,
  },

  "suspension-slopers": {
    doigts: 9,
    "avant-bras": 8,
    epaules: 4,
    dorsaux: 3,
  },

  "sauts-prise": {
    doigts: 7,
    "avant-bras": 6,
    biceps: 4,
    epaules: 6,
    dorsaux: 5,
    abdominaux: 3,
  },

  "croise-dynamique-19-30": {
    doigts: 9,
    "avant-bras": 8,
    biceps: 5,
    epaules: 7,
    dorsaux: 6,
    abdominaux: 4,
  },

  "lourd-leger": {
    doigts: 4,
    "avant-bras": 5,
    biceps: 9,
    epaules: 5,
    dorsaux: 10,
    abdominaux: 4,
  },

  "pince-disque": {
    doigts: 10,
    "avant-bras": 8,
  },

  "pince-large": {
    doigts: 9,
    "avant-bras": 8,
  },

  "repeaters-7-3": {
    doigts: 10,
    "avant-bras": 9,
    epaules: 3,
  },

  "repeaters-6-4": {
    doigts: 8,
    "avant-bras": 8,
    epaules: 3,
  },

  "dead-hang": {
    doigts: 5,
    "avant-bras": 5,
    epaules: 5,
    dorsaux: 4,
  },

  "suspension-facile": {
    doigts: 5,
    "avant-bras": 5,
    epaules: 3,
  },

  "blocs-devers": {
    doigts: 8,
    "avant-bras": 8,
    biceps: 6,
    epaules: 7,
    dorsaux: 8,
    abdominaux: 6,
    fessiers: 3,
    quadriceps: 3,
  },

  "traversees-longues": {
    doigts: 7,
    "avant-bras": 8,
    biceps: 5,
    epaules: 5,
    dorsaux: 7,
    abdominaux: 5,
    fessiers: 3,
    quadriceps: 3,
    mollets: 2,
  },

  "tractions-endurance": {
    doigts: 3,
    "avant-bras": 4,
    biceps: 8,
    epaules: 4,
    dorsaux: 9,
    abdominaux: 3,
  },

  "tractions-lestees": {
    doigts: 4,
    "avant-bras": 5,
    biceps: 10,
    epaules: 5,
    dorsaux: 10,
    abdominaux: 5,
  },

  blocages: {
    doigts: 5,
    "avant-bras": 6,
    biceps: 9,
    epaules: 6,
    dorsaux: 9,
    abdominaux: 4,
  },

  "rowing-haltere": {
    "avant-bras": 4,
    biceps: 7,
    epaules: 4,
    dorsaux: 9,
    lombaires: 4,
  },

  "lat-pulldown": {
    "avant-bras": 3,
    biceps: 7,
    epaules: 7,
    dorsaux: 10,
  },

  facepull: {
    biceps: 2,
    epaules: 8,
    dorsaux: 6,
  },

  "triceps-elastique": {
    triceps: 8,
    epaules: 2,
  },

  "developpe-militaire": {
    triceps: 7,
    epaules: 10,
    pectoraux: 4,
    abdominaux: 4,
    lombaires: 3,
  },

  "developpe-couche": {
    triceps: 8,
    epaules: 6,
    pectoraux: 10,
  },

  dips: {
    triceps: 9,
    epaules: 7,
    pectoraux: 9,
    abdominaux: 3,
  },

  "dead-bug": {
    abdominaux: 8,
  },

  planche: {
    abdominaux: 9,
    epaules: 4,
    fessiers: 3,
  },

  "planche-laterale": {
    abdominaux: 9,
    epaules: 4,
    fessiers: 4,
    adducteurs: 3,
  },

  "pallof-press": {
    abdominaux: 9,
    epaules: 3,
    fessiers: 2,
  },

  "releves-jambes": {
    abdominaux: 10,
    dorsaux: 2,
    epaules: 4,
    "avant-bras": 3,
    quadriceps: 3,
  },

  "genoux-suspendus-twist": {
    abdominaux: 10,
    dorsaux: 3,
    epaules: 4,
    "avant-bras": 3,
    adducteurs: 3,
  },

  "rotations-russes": {
    abdominaux: 9,
    lombaires: 3,
  },

  "superman-hold": {
    lombaires: 9,
    dorsaux: 4,
    fessiers: 4,
    ischios: 3,
  },

  "copenhagen-plank": {
    adducteurs: 10,
    abdominaux: 7,
    epaules: 3,
  },

  squat: {
    quadriceps: 9,
    fessiers: 8,
    adducteurs: 5,
    ischios: 4,
    lombaires: 4,
    abdominaux: 4,
  },

  "fentes-bulgares": {
    quadriceps: 9,
    fessiers: 9,
    adducteurs: 5,
    ischios: 5,
    mollets: 3,
    abdominaux: 3,
  },

  "sdle-roumain": {
    ischios: 10,
    fessiers: 9,
    lombaires: 7,
    "avant-bras": 4,
    dorsaux: 3,
  },

  "step-up": {
    quadriceps: 8,
    fessiers: 8,
    ischios: 4,
    mollets: 4,
    abdominaux: 3,
  },

  "mollets-debout": {
    mollets: 10,
    "avant-bras": 2,
  },

  "tibialis-raise": {
    tibial: 8,
  },

  "tibialis-charge": {
    tibial: 10,
  },

  "mobilite-genou-mur": {
    quadriceps: 2,
    fessiers: 2,
    adducteurs: 2,
  },

  "pont-talon-sureleve": {
    ischios: 7,
    fessiers: 7,
    mollets: 2,
  },

  "rot-ext-epaule": {
    epaules: 5,
  },

  "scapular-pullups": {
    epaules: 6,
    dorsaux: 6,
    "avant-bras": 3,
  },

  "facepull-leger": {
    epaules: 5,
    dorsaux: 4,
  },

  "ext-doigts": {
    doigts: 3,
    "avant-bras": 3,
  },

  "flex-poignet": {
    "avant-bras": 6,
  },

  "ext-poignet": {
    "avant-bras": 6,
  },

  "pronation-supination": {
    "avant-bras": 7,
  },

  "equilibre-jambe": {
    mollets: 3,
    tibial: 3,
    fessiers: 2,
  },

  "pompes-normales": {
    pectoraux: 5,
    triceps: 4,
    epaules: 3,
    abdominaux: 2,
  },

  "pompes-pieds-sureleves": {
    pectoraux: 6,
    triceps: 4,
    epaules: 5,
    abdominaux: 3,
  },

  "pompes-diamant": {
    pectoraux: 4,
    triceps: 7,
    epaules: 3,
    abdominaux: 2,
  },

  "pompes-larges": {
    pectoraux: 6,
    triceps: 3,
    epaules: 3,
    abdominaux: 2,
  },

  "pompes-pike": {
    pectoraux: 3,
    triceps: 5,
    epaules: 7,
    abdominaux: 3,
  },

  "pompes-coudes-serres": {
    pectoraux: 4,
    triceps: 7,
    epaules: 3,
    abdominaux: 2,
  },
};

// ── Climbing loading ──────────────────────────────────────────────────────────

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
        duration / 90,
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
    doigts: 8 * factor,
    "avant-bras": 8 * factor,
    biceps: 5 * factor,
    epaules: 6 * factor,
    dorsaux: 7 * factor,
    abdominaux: 5 * factor,
    fessiers: 3 * factor,
    quadriceps: 3 * factor,
    mollets: 2 * factor,
  };
}

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

  const difficultyFactor =
    1 +
    maximumGrade * 0.035 +
    Math.max(
      0,
      maximumAngle - 30,
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

  const factor =
    Math.min(
      1.6,
      difficultyFactor *
        durationFactor,
    );

  return {
    doigts: 9 * factor,
    "avant-bras": 9 * factor,
    biceps: 6 * factor,
    epaules: 8 * factor,
    dorsaux: 8 * factor,
    abdominaux: 7 * factor,
    fessiers: 4 * factor,
    quadriceps: 4 * factor,
    mollets: 3 * factor,
  };
}

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
    doigts: 8 * factor,
    "avant-bras": 9 * factor,
    biceps: 6 * factor,
    epaules: 6 * factor,
    dorsaux: 8 * factor,
    abdominaux: 6 * factor,
    fessiers: 5 * factor,
    adducteurs: 4 * factor,
    ischios: 4 * factor,
    quadriceps: 6 * factor,
    mollets: 5 * factor,
    tibial: 2 * factor,
  };
}

// ── Recovery calculation ──────────────────────────────────────────────────────

function getRecoveryHours(
  muscleId: string,
): number {
  switch (
    muscleId
  ) {
    case "doigts":
    case "avant-bras":
      return 48;

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

    case "mollets":
    case "tibial":
      return 36;

    case "lombaires":
      return 48;

    case "abdominaux":
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

function getSessionMuscleLoad(
  log: SessionLog,
): MuscleLoadMap {
  const totalLoad:
    MuscleLoadMap = {};

  /*
   * Compatibilité :
   *
   * - completed === false :
   *   exercice explicitement non réalisé ;
   *
   * - completed === true :
   *   exercice réalisé ;
   *
   * - completed absent dans une ancienne sauvegarde :
   *   considérer l'exercice comme réalisé.
   */
  log.exerciseLogs
    .filter(
      (exerciseLog) =>
        exerciseLog.completed !==
        false,
    )
    .forEach(
      (exerciseLog) => {
        const exerciseLoad =
          EXERCISE_LOADS[
            exerciseLog.exerciseId
          ];

        if (
          exerciseLoad
        ) {
          addLoad(
            totalLoad,
            exerciseLoad,
          );
        }
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

// ── Injury matching ───────────────────────────────────────────────────────────

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
    ],

    triceps: [
      "triceps",
      "coude",
    ],

    epaules: [
      "epaule",
      "coiffe",
    ],

    pectoraux: [
      "pectoral",
      "pectoraux",
      "pec",
    ],

    dorsaux: [
      "dorsal",
      "haut du dos",
      "grand dorsal",
    ],

    lombaires: [
      "lombaire",
      "bas du dos",
      "rachis",
      "erecteur",
    ],

    abdominaux: [
      "abdominal",
      "abdo",
      "oblique",
    ],

    fessiers: [
      "fessier",
      "hanche",
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
    ],

    quadriceps: [
      "quadriceps",
      "genou",
      "cuisse",
    ],

    mollets: [
      "mollet",
      "achille",
      "cheville",
    ],

    tibial: [
      "tibial",
      "tibia",
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

// ── Public API ────────────────────────────────────────────────────────────────

export function calculateMuscleRecovery(
  logs: SessionLog[],
  injuries: Injury[] = [],
  now = new Date(),
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

      const injuryPenalty =
        activeInjury
          ? activeInjury.painLevel *
            5
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
): Record<
  string,
  number
> {
  const recovery =
    calculateMuscleRecovery(
      logs,
      injuries,
      now,
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
              ] ?? 0
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