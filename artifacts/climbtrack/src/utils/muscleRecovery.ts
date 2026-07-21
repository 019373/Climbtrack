import type {
  ClimbingIntensity,
  SessionLog,
} from "@/context/ClimbTrackContext";

import {
  ALL_MUSCLES,
  MUSCLE_SCORES,
} from "@/data/muscleScores";

const CLIMBING_LOAD: Record<
  string,
  number
> = {
  doigts: 4.5,
  "avant-bras": 5,
  dos: 3.5,
  biceps: 2.5,
  épaules: 2.5,
  abdominaux: 1.5,
  obliques: 1,
};

const KILTER_LOAD: Record<
  string,
  number
> = {
  doigts: 5,
  "avant-bras": 5,
  dos: 4,
  biceps: 3,
  épaules: 3,
  abdominaux: 2,
  obliques: 1.5,
};

const INTENSITY_MULTIPLIER: Record<
  ClimbingIntensity,
  number
> = {
  facile: 0.6,
  moyen: 1,
  dur: 1.5,
};

function createEmptyScores(): Record<
  string,
  number
> {
  const scores: Record<
    string,
    number
  > = {};

  ALL_MUSCLES.forEach(
    (muscle) => {
      scores[muscle] = 0;
    },
  );

  return scores;
}

function addScores(
  target: Record<
    string,
    number
  >,
  source: Record<
    string,
    number
  >,
  multiplier = 1,
) {
  Object.entries(source).forEach(
    ([muscle, score]) => {
      target[muscle] =
        (target[muscle] ?? 0) +
        score * multiplier;
    },
  );
}

function getHoursSinceSession(
  sessionDate: string,
  now: Date,
): number {
  /*
   * Midi est utilisé afin d’éviter les différences
   * liées aux changements d’heure.
   */
  const date =
    new Date(
      `${sessionDate}T12:00:00`,
    );

  return Math.max(
    0,
    (
      now.getTime() -
      date.getTime()
    ) /
      3_600_000,
  );
}

function getRecoveryDuration(
  initialLoad: number,
): number {
  /*
   * Charge légère :
   * environ 48 heures.

   * Charge moyenne :
   * environ 72 heures.

   * Charge élevée :
   * jusqu’à environ 96 heures.
   */
  if (initialLoad < 15) {
    return 48;
  }

  if (initialLoad < 35) {
    return 72;
  }

  return 96;
}

function getResidualFactor(
  ageHours: number,
  recoveryHours: number,
): number {
  if (
    ageHours >= recoveryHours
  ) {
    return 0;
  }

  const progress =
    ageHours /
    recoveryHours;

  /*
   * La charge diminue progressivement,
   * sans tomber brutalement à zéro.
   */
  return Math.pow(
    1 - progress,
    1.35,
  );
}

function getClimbingMultiplier(
  durationMinutes: number,
  intensity: ClimbingIntensity,
): number {
  /*
   * La durée augmente la charge, mais avec
   * un plafond afin qu’une très longue séance
   * ne produise pas un score absurde.
   */
  const durationMultiplier =
    Math.min(
      2.25,
      0.55 +
        Math.sqrt(
          Math.max(
            15,
            durationMinutes,
          ) / 90,
        ) *
          0.75,
    );

  return (
    durationMultiplier *
    INTENSITY_MULTIPLIER[
      intensity
    ]
  );
}

function getKilterMultiplier(
  log: SessionLog,
): number {
  const entries =
    log.kilterEntries ?? [];

  if (
    entries.length === 0
  ) {
    return 0;
  }

  let total = 0;

  entries.forEach(
    (entry) => {
      const angleMultiplier =
        1 +
        Math.max(
          0,
          entry.angle - 20,
        ) /
          50;

      const gradeMultiplier =
        0.85 +
        Math.max(
          0,
          entry.grade,
        ) *
          0.12;

      const resultMultiplier =
        entry.result ===
        "reussi"
          ? 1
          : entry.result ===
              "travaille"
            ? 0.9
            : 0.72;

      const durationMultiplier =
        typeof entry.durationMinutes ===
          "number" &&
        entry.durationMinutes > 0
          ? Math.min(
              1.4,
              0.55 +
                entry.durationMinutes /
                  35,
            )
          : 0.8;

      const attemptsMultiplier =
        typeof entry.attempts ===
          "number" &&
        entry.attempts > 0
          ? Math.min(
              1.35,
              0.75 +
                entry.attempts *
                  0.08,
            )
          : 1;

      total +=
        angleMultiplier *
        gradeMultiplier *
        resultMultiplier *
        durationMultiplier *
        attemptsMultiplier;
    },
  );

  return Math.min(
    3.2,
    total /
      entries.length +
      entries.length *
        0.12,
  );
}

function getInitialSessionLoad(
  log: SessionLog,
): Record<string, number> {
  const load: Record<
    string,
    number
  > = {};

  log.exerciseLogs.forEach(
    (exerciseLog) => {
      if (
        !exerciseLog.completed
      ) {
        return;
      }

      const scores =
        MUSCLE_SCORES[
          exerciseLog.exerciseId
        ];

      if (!scores) {
        return;
      }

      const setsMultiplier =
        Math.max(
          0.65,
          Math.min(
            1.5,
            exerciseLog.sets /
              3,
          ),
        );

      addScores(
        load,
        scores,
        setsMultiplier,
      );
    },
  );

  if (
    log.sessionId ===
    "grimpe-libre"
  ) {
    const duration =
      log.climbingDurationMinutes ??
      90;

    const intensity =
      log.climbingIntensity ??
      "moyen";

    addScores(
      load,
      CLIMBING_LOAD,
      getClimbingMultiplier(
        duration,
        intensity,
      ),
    );
  }

  if (
    log.sessionId ===
    "kilter"
  ) {
    addScores(
      load,
      KILTER_LOAD,
      getKilterMultiplier(log),
    );
  }

  return load;
}

export function calculateRecoveryScores(
  logs: SessionLog[],
  now = new Date(),
): Record<string, number> {
  const result =
    createEmptyScores();

  logs.forEach((log) => {
    const initialLoad =
      getInitialSessionLoad(
        log,
      );

    const ageHours =
      getHoursSinceSession(
        log.date,
        now,
      );

    Object.entries(
      initialLoad,
    ).forEach(
      ([muscle, load]) => {
        const recoveryHours =
          getRecoveryDuration(
            load,
          );

        const residual =
          getResidualFactor(
            ageHours,
            recoveryHours,
          );

        result[muscle] =
          (result[muscle] ??
            0) +
          load * residual;
      },
    );
  });

  Object.keys(
    result,
  ).forEach((muscle) => {
    result[muscle] =
      Math.round(
        result[muscle] *
          10,
      ) / 10;
  });

  return result;
}

export function calculateAccumulatedScores(
  logs: SessionLog[],
  numberOfDays: number | null,
  now = new Date(),
): Record<string, number> {
  const result =
    createEmptyScores();

  const threshold =
    numberOfDays === null
      ? null
      : new Date(
          now.getTime() -
            numberOfDays *
              86_400_000,
        );

  logs.forEach((log) => {
    const sessionDate =
      new Date(
        `${log.date}T12:00:00`,
      );

    if (
      threshold &&
      sessionDate <
        threshold
    ) {
      return;
    }

    const load =
      getInitialSessionLoad(
        log,
      );

    addScores(
      result,
      load,
    );
  });

  Object.keys(
    result,
  ).forEach((muscle) => {
    result[muscle] =
      Math.round(
        result[muscle] *
          10,
      ) / 10;
  });

  return result;
}