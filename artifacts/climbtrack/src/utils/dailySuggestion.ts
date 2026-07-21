import { SESSIONS } from "@/data/sessions";

import type {
  FinisherType,
  SessionLog,
} from "@/context/ClimbTrackContext";

import {
  calculateRecoveryScores,
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

  /**
   * Permet d’ouvrir le formulaire Kilter
   * avec l’angle et les niveaux déjà remplis.
   */
  kilterPreset?: KilterPreset;
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
  date: string;
  availableMinutes: number | null;
  preference: DailyPreference;
  variation: number;

  /**
   * Signatures des propositions récentes.
   * Elles servent à éviter de ressortir
   * presque exactement le même programme.
   */
  recentSuggestionSignatures?: string[];
};

const DEFAULT_UNKNOWN_TIME_MINUTES =
  105;

const SESSION_DURATION: Record<
  string,
  number
> = {
  "s1-force-doigts": 35,
  "s2-resistance": 40,
  "s3-dos-epaules": 35,
  "s4-gainage": 30,
  "s5-souplesse": 35,
  "s6-jambes": 35,
  "s7-prevention": 25,
};

const MAIN_SESSION_IDS = [
  "s1-force-doigts",
  "s2-resistance",
  "s3-dos-epaules",
  "s6-jambes",
  "s7-prevention",
];

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
    date.getTime() - offset,
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
      10,
      Math.round(
        availableMinutes *
          0.08,
      ),
    );

  return Math.max(
    20,
    availableMinutes -
      margin,
  );
}

function getSessionName(
  sessionId: string,
): string {
  return (
    SESSIONS.find(
      (session) =>
        session.id ===
        sessionId,
    )?.name ??
    "Séance"
  );
}

function getRecoveryPenalty(
  sessionId: string,
  recoveryScores: Record<
    string,
    number
  >,
): number {
  const fingers =
    recoveryScores.doigts ??
    0;

  const forearms =
    recoveryScores[
      "avant-bras"
    ] ?? 0;

  const back =
    recoveryScores.dos ??
    0;

  const shoulders =
    recoveryScores.épaules ??
    0;

  const legs =
    (
      recoveryScores.quadriceps ??
      0
    ) +
    (
      recoveryScores[
        "ischio-jambiers"
      ] ?? 0
    ) +
    (
      recoveryScores.fessiers ??
      0
    );

  if (
    sessionId ===
    "s1-force-doigts"
  ) {
    return (
      fingers * 5 +
      forearms * 4
    );
  }

  if (
    sessionId ===
    "s2-resistance"
  ) {
    return (
      fingers * 3 +
      forearms * 5 +
      back * 2
    );
  }

  if (
    sessionId ===
    "s3-dos-epaules"
  ) {
    return (
      back * 4 +
      shoulders * 4
    );
  }

  if (
    sessionId ===
    "s6-jambes"
  ) {
    return legs * 3;
  }

  if (
    sessionId ===
    "s7-prevention"
  ) {
    return (
      shoulders +
      forearms
    ) * 0.5;
  }

  return 0;
}

function chooseMainSession(
  logs: SessionLog[],
  date: string,
  seed: number,
  preference: DailyPreference,
): string | null {
  if (
    MAIN_SESSION_IDS.includes(
      preference,
    )
  ) {
    return preference;
  }

  const recoveryScores =
    calculateRecoveryScores(
      logs,
    );

  const candidates =
    MAIN_SESSION_IDS.filter(
      (sessionId) =>
        !hasTodaySession(
          logs,
          date,
          sessionId,
        ),
    );

  const scored =
    candidates.map(
      (
        sessionId,
        index,
      ) => {
        const last =
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
                second.date.localeCompare(
                  first.date,
                ),
            )[0];

        const daysSince =
          last
            ? differenceInDays(
                date,
                last.date,
              )
            : 30;

        const countLast14 =
          getLogsDuringLastDays(
            logs,
            date,
            14,
          ).filter(
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
            daysSince,
          ) *
            4 -
          countLast14 *
            10 -
          recoveryPenalty +
          (
            (
              seed +
              index * 7
            ) %
            13
          );

        if (
          daysSince <= 1
        ) {
          score -= 100;
        } else if (
          daysSince === 2
        ) {
          score -= 35;
        }

        return {
          sessionId,
          score,
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

  return (
    scored[0]
      ?.sessionId ??
    null
  );
}

function chooseFinisher(
  logs: SessionLog[],
  date: string,
  seed: number,
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

  const total =
    absCount +
    flexibilityCount;

  if (total === 0) {
    return seed % 10 < 7
      ? "abs"
      : "flexibility";
  }

  return (
    absCount / total <
    0.7
      ? "abs"
      : "flexibility"
  );
}

function getBestKilterProfile(
  logs: SessionLog[],
): Record<number, number> {
  const profile: Record<
    number,
    number
  > = {
    30: 1,
  };

  logs.forEach(
    (log) => {
      (
        log.kilterEntries ??
        []
      ).forEach(
        (entry) => {
          if (
            entry.result !==
            "reussi"
          ) {
            return;
          }

          profile[
            entry.angle
          ] =
            Math.max(
              profile[
                entry.angle
              ] ?? -1,
              entry.grade,
            );
        },
      );
    },
  );

  return profile;
}

function getKilterStep(
  logs: SessionLog[],
  seed: number,
): SuggestedStep {
  const profile =
    getBestKilterProfile(
      logs,
    );

  const angles =
    Object.keys(
      profile,
    ).map(Number);

  const baseAngle =
    angles.includes(30)
      ? 30
      : angles[0] ??
        30;

  const bestGrade =
    profile[
      baseAngle
    ] ?? 1;

  const roll =
    seed % 100;

  if (roll < 65) {
    const minGrade =
      Math.max(
        0,
        bestGrade - 1,
      );

    return {
      id:
        "kilter-base",
      type: "kilter",
      title:
        "Kilterboard",
      subtitle: `${baseAngle}° · V${minGrade} à V${bestGrade}`,
      description:
        "Fais du volume propre, puis quelques essais légèrement plus durs.",
      durationMinutes:
        20,
      kilterPreset: {
        angle:
          baseAngle,
        minGrade,
        maxGrade:
          bestGrade,
        durationMinutes:
          20,
      },
    };
  }

  if (roll < 90) {
    return {
      id:
        "kilter-progress",
      type: "kilter",
      title:
        "Kilterboard — progression",
      subtitle: `${baseAngle}° · V${bestGrade} à V${
        bestGrade + 1
      }`,
      description:
        "Travaille ton niveau actuel puis un ou deux projets légèrement plus durs.",
      durationMinutes:
        22,
      kilterPreset: {
        angle:
          baseAngle,
        minGrade:
          bestGrade,
        maxGrade:
          bestGrade + 1,
        durationMinutes:
          22,
      },
    };
  }

  const steeperAngle =
    Math.min(
      45,
      baseAngle + 5,
    );

  const lowerGrade =
    Math.max(
      0,
      bestGrade - 1,
    );

  return {
    id:
      "kilter-angle",
    type: "kilter",
    title:
      "Kilterboard — inclinaison",
    subtitle: `${steeperAngle}° · V${lowerGrade}`,
    description:
      "Teste une inclinaison plus forte avec une cotation légèrement plus basse.",
    durationMinutes:
      20,
    kilterPreset: {
      angle:
        steeperAngle,
      minGrade:
        lowerGrade,
      maxGrade:
        lowerGrade,
      durationMinutes:
        20,
    },
  };
}

function getWarmupStep(): SuggestedStep {
  return {
    id:
      "warmup-climbing",
    type: "warmup",
    title:
      "Échauffement escalade",
    subtitle:
      "Articulations · épaules · doigts",
    description:
      "Commence très facilement et augmente progressivement.",
    durationMinutes:
      15,
    exercises: [
      "Rotations poignets, coudes et épaules",
      "Mouvements doux du cou",
      "10 squats contrôlés",
      "Rotations d’épaules avec élastique",
      "Quelques pompes faciles",
      "Tractions faciles sur gros bacs",
      "Suspensions faciles sur 25 mm",
      "Quelques blocs très faciles",
    ],
  };
}

function getFinisher(
  type: FinisherType,
  seed: number,
): SuggestedStep {
  if (
    type === "abs"
  ) {
    const variants = [
      [
        "Planche avant-bras",
        "Planche latérale",
        "Superman hold",
      ],
      [
        "Dead bug",
        "Pallof press",
        "Superman hold",
      ],
      [
        "Relevés de jambes",
        "Planche latérale",
        "Dead bug",
      ],
    ];

    return {
      id: `abs-${
        seed %
        variants.length
      }`,
      type: "abs",
      title:
        "Fin de séance — tronc",
      subtitle:
        "Abdominaux · obliques · lombaires",
      durationMinutes:
        10,
      sessionId:
        "s4-gainage",
      finisherType:
        "abs",
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
      "Fin de séance — souplesse",
    subtitle:
      "Poignets · épaules · hanches",
    durationMinutes:
      10,
    sessionId:
      "s5-souplesse",
    finisherType:
      "flexibility",
    exercises: [
      "Étirement poignets au sol",
      "Épaules sur chaise ou banc",
      "Open book",
      "Fente profonde",
    ],
  };
}

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
        ].join(":");
      },
    )
    .join("|");
}

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
  } = options;

  const todayLogs =
    logs.filter(
      (log) =>
        log.date === date,
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

  if (
    preference ===
    "rest"
  ) {
    const steps: SuggestedStep[] =
      [
        {
          id: "rest",
          type: "rest",
          title: "Repos",
          description:
            "Pas d’entraînement intense aujourd’hui.",
          durationMinutes:
            0,
        },
        {
          id:
            "mobility",
          type:
            "flexibility",
          title:
            "Mobilité douce facultative",
          durationMinutes:
            8,
          sessionId:
            "s5-souplesse",
          finisherType:
            "flexibility",
          exercises: [
            "Dos rond / dos creux",
            "Open book",
            "Papillon",
          ],
        },
      ];

    return {
      date,
      title:
        "Proposition de récupération",
      explanation:
        "Journée légère.",
      availableMinutes,
      plannedMinutes:
        8,
      steps,
      signature:
        buildSignature(
          steps,
        ),
    };
  }

  const forcedMain =
    MAIN_SESSION_IDS.includes(
      preference,
    );

  const selectedMain =
    budget >= 70 ||
    forcedMain
      ? chooseMainSession(
          logs,
          date,
          seed,
          preference,
        )
      : null;

  const recoveryScores =
    calculateRecoveryScores(
      logs,
    );

  const fingersLoaded =
    (
      recoveryScores.doigts ??
      0
    ) >= 35 ||
    (
      recoveryScores[
        "avant-bras"
      ] ?? 0
    ) >= 40;

  const hasClimbing =
    preference !==
      "kilter" &&
    preference !==
      "rest" &&
    !hasTodaySession(
      logs,
      date,
      "grimpe-libre",
    );

  const hasKilter =
    !fingersLoaded &&
    (
      preference ===
        "kilter" ||
      preference ===
        "climbing+kilter" ||
      (
        preference ===
          "unknown" &&
        selectedMain !==
          "s1-force-doigts" &&
        seed % 100 <
          35
      )
    );

  const finisher =
    getFinisher(
      chooseFinisher(
        logs,
        date,
        seed + 31,
      ),
      seed,
    );

  const fixedMinutes =
    15 +
    (
      hasKilter
        ? 20
        : 0
    ) +
    (
      selectedMain
        ? SESSION_DURATION[
            selectedMain
          ]
        : 0
    ) +
    finisher.durationMinutes;

  let climbingMinutes =
    hasClimbing
      ? Math.max(
          30,
          budget -
            fixedMinutes,
        )
      : 0;

  if (
    availableMinutes ===
      null &&
    hasClimbing
  ) {
    climbingMinutes =
      Math.max(
        45,
        climbingMinutes,
      );
  }

  if (
    availableMinutes !==
      null &&
    availableMinutes >=
      120 &&
    hasClimbing
  ) {
    climbingMinutes =
      Math.max(
        climbingMinutes,
        Math.round(
          45 +
            (
              availableMinutes -
              DEFAULT_UNKNOWN_TIME_MINUTES
            ) *
              0.65,
        ),
      );
  }

  const steps: SuggestedStep[] =
    [
      getWarmupStep(),
    ];

  if (
    selectedMain ===
    "s1-force-doigts"
  ) {
    steps.push({
      id: `main-${selectedMain}`,
      type:
        "full-session",
      title:
        getSessionName(
          selectedMain,
        ),
      subtitle:
        "Séance complète",
      durationMinutes:
        SESSION_DURATION[
          selectedMain
        ],
      sessionId:
        selectedMain,
    });
  }

  if (hasKilter) {
    steps.push(
      getKilterStep(
        logs,
        seed + 71,
      ),
    );
  }

  if (hasClimbing) {
    steps.push({
      id:
        "climbing",
      type:
        "climbing",
      title:
        "Grimpe libre",
      subtitle:
        "Partie principale",
      description:
        "Beaucoup de bleu foncé/turquoise et quelques essais orange selon les sensations.",
      durationMinutes:
        climbingMinutes,
    });
  }

  if (
    selectedMain &&
    selectedMain !==
      "s1-force-doigts"
  ) {
    steps.push({
      id: `main-${selectedMain}`,
      type:
        "full-session",
      title:
        getSessionName(
          selectedMain,
        ),
      subtitle:
        "Séance complète",
      durationMinutes:
        SESSION_DURATION[
          selectedMain
        ],
      sessionId:
        selectedMain,
    });
  }

  steps.push(
    finisher,
  );

  const plannedMinutes =
    steps.reduce(
      (
        total,
        step,
      ) =>
        total +
        step.durationMinutes,
      0,
    );

  return {
    date,
    title:
      todayLogs.length >
      0
        ? "Suite proposée aujourd’hui"
        : "Proposition du jour",
    explanation:
      availableMinutes ===
      null
        ? "Programme complet basé sur 1 h 45."
        : "Programme adapté à ton temps disponible.",
    availableMinutes,
    plannedMinutes,
    steps,
    signature:
      buildSignature(
        steps,
      ),
  };
}

export function generateDailySuggestion(
  options: GenerateSuggestionOptions,
): DailySuggestion {
  const recent =
    options.recentSuggestionSignatures ??
    [];

  /*
   * Essaie plusieurs variantes afin d’éviter
   * de ressortir une des trois dernières
   * propositions.
   */
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