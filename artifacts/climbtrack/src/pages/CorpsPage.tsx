import {
  useMemo,
  useState,
} from "react";

import {
  useClimbTrack,
} from "@/context/ClimbTrackContext";

import type { SessionLog } from "@/context/ClimbTrackContext";
import { getExerciseById } from "@/utils/exercises";

import {
  cn,
} from "@/lib/utils";

import {
  BodyMapSVG,
} from "@/components/BodyMapSVG";

import {
  MUSCLE_GROUPS,
  calculateAccumulatedScores,
  calculateRecoveryScores,
  getSessionMuscleLoad,
} from "@/utils/muscleRecovery";

import type { RecoveryExerciseData } from "@/utils/muscleRecovery";

type TimeFilter =
  | "recovery"
  | "7"
  | "30"
  | "365"
  | "all";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function getMuscleName(
  muscleId: string,
): string {
  return (
    MUSCLE_GROUPS.find(
      (muscle) =>
        muscle.id ===
        muscleId,
    )?.name ??
    muscleId
  );
}


// Conseils adaptés aux besoins de l'escalade.
function getClimbingRecommendations(
  logs: SessionLog[],
  days: 30 | 365,
  exerciseData: RecoveryExerciseData,
  injuries: { area: string; status: string }[],
): string[] {
  const now = Date.now();
  const durationMs = days * 24 * 60 * 60 * 1000;

  const sessions = logs.flatMap((log) => {
    const timestamp = log.completedAt
      ? Date.parse(log.completedAt)
      : Date.parse(`${log.date}T12:00:00`);

    if (
      !Number.isFinite(timestamp) ||
      timestamp > now ||
      now - timestamp > durationMs ||
      log.isRestDay
    ) {
      return [];
    }

    const done = (log.exerciseLogs ?? []).filter(
      ex => ex.completed !== false
    );

    const hasClimb =
      (log.climbingDurationMinutes ?? 0) > 0 ||
      (log.kilterEntries?.length ?? 0) > 0 ||
      (log.routeClimbingEntries?.length ?? 0) > 0 ||
      (log.routeClimbingDurationMinutes ?? 0) > 0;

    if (
      done.length === 0 &&
      !hasClimb &&
      log.finisherType !== "flexibility"
    ) {
      return [];
    }

    // La souplesse ne se mesure pas par la fatigue musculaire.
    // On détecte les séances et exercices réellement pratiqués.
    const isMobility =
      log.finisherType === "flexibility" ||
      (log.sessionId === "s5-souplesse" && done.length > 0) ||
      done.some(ex => {
        const definition = getExerciseById(
          ex.exerciseId,
          exerciseData
        );
        const category =
          exerciseData.exerciseOverrides[ex.exerciseId]?.category
          ?? definition?.category
          ?? "";

        return /souplesse|mobilit|etirement|étirement|stretch/i.test(
          category
        );
      });

    const preventionIds = new Set([
      "rot-ext-epaule",
      "scapular-pullups",
      "ext-doigts",
      "flex-poignet",
      "ext-poignet",
      "pronation-supination",
      "facepull",
      "equilibre-jambe",
    ]);

    const isPrevention =
      (log.sessionId === "s7-prevention" && done.length > 0) ||
      done.some(ex => preventionIds.has(ex.exerciseId));

    return [{
      load: getSessionMuscleLoad(log, exerciseData),
      isMobility,
      isPrevention,
    }];
  });

  // Pas de recommandation à partir de trop peu de séances.
  if (sessions.length < (days === 30 ? 6 : 24)) {
    return [];
  }

  const domains = [
    {
      label: "mobilité et souplesse des hanches, chevilles et épaules",
      target: 0.2,
      weight: 1.45,
      special: "mobility",
    },
    {
      label: "prévention et stabilité des épaules",
      target: 0.17,
      weight: 1.3,
      special: "prevention",
    },
    {
      label: "gainage et tension corporelle",
      groups: ["abdominaux", "obliques", "lombaires"],
      target: 0.35,
      weight: 1.15,
    },
    {
      label: "poussée et muscles antagonistes",
      groups: ["pectoraux", "triceps"],
      target: 0.25,
      weight: 1.1,
    },
    {
      label: "appuis de pieds et force des jambes",
      groups: ["quadriceps", "fessiers", "hanches", "adducteurs"],
      target: 0.3,
      weight: 1.05,
    },
    {
      label: "tirage et verrouillages",
      groups: ["dorsaux", "biceps"],
      target: 0.4,
      weight: 0.95,
    },
    {
      label: "force des doigts et des avant-bras",
      groups: ["doigts", "avant-bras"],
      target: 0.45,
      weight: 0.8,
    },
  ];

  // Ne pas encourager un travail supplémentaire des doigts
  // lorsqu'une blessure active concerne la main ou l'avant-bras.
  const fingerInjury = injuries.some(injury =>
    injury.status !== "guerie" &&
    /doigt|main|poignet|avant.bras|coude/i.test(injury.area)
  );

  return domains.flatMap(domain => {
    if (
      fingerInjury &&
      domain.label.includes("force des doigts")
    ) {
      return [];
    }

    const worked = sessions.filter(session => {
      if (domain.special === "mobility") {
        return session.isMobility;
      }

      if (domain.special === "prevention") {
        return session.isPrevention;
      }

      const loads = Object.values(session.load).filter(
        Number.isFinite
      );

      const maxLoad = Math.max(0, ...loads);
      const local = Math.max(
        0,
        ...(domain.groups ?? []).map(
          id => session.load[id] ?? 0
        )
      );

      return (
        maxLoad > 0 &&
        local >= Math.max(3, maxLoad * 0.6)
      );
    }).length;

    const wanted = Math.ceil(sessions.length * domain.target);

    if (worked >= wanted) {
      return [];
    }

    return [{
      label: domain.label,
      gap: ((wanted - worked) / wanted) * domain.weight,
    }];
  })
  .sort((a, b) => b.gap - a.gap)
  .slice(0, 3)
  .map(item => item.label);
}

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

export function CorpsPage() {
  const {
    data,
  } =
    useClimbTrack();

  const [
    timeFilter,
    setTimeFilter,
  ] =
    useState<TimeFilter>(
      "recovery",
    );

  /*
   * Données nécessaires au moteur musculaire.
   *
   * Cela permet maintenant de prendre en compte :
   *
   * - les exercices personnalisés ;
   * - leurs muscles enregistrés ;
   * - les modifications musculaires des exercices de base.
   */
  const recoveryExerciseData =
    useMemo(
      () => ({
        customExercises:
          data.customExercises,

        exerciseOverrides:
          data.exerciseOverrides,
      }),
      [
        data.customExercises,
        data.exerciseOverrides,
      ],
    );

  const muscleAccumulation =
    useMemo(
      () => {
        if (
          timeFilter ===
          "recovery"
        ) {
          return calculateRecoveryScores(
            data.sessionLogs,
            data.injuries,
            new Date(),
            recoveryExerciseData,
          );
        }

        return calculateAccumulatedScores(
          data.sessionLogs,

          timeFilter ===
          "7"
            ? 7
            : timeFilter ===
                "30"
              ? 30
              : timeFilter === "365"
                ? 365
                : null,

          new Date(),

          recoveryExerciseData,
        );
      },
      [
        data.sessionLogs,
        data.injuries,
        recoveryExerciseData,
        timeFilter,
      ],
    );

  const maxScore =
    Math.max(
      1,
      ...Object.values(
        muscleAccumulation,
      ),
    );

  const recommendations =
    timeFilter === "30" || timeFilter === "365"
      ? getClimbingRecommendations(
          data.sessionLogs,
          timeFilter === "30" ? 30 : 365,
          recoveryExerciseData,
          data.injuries,
        )
      : [];

  const filters: {
    id: TimeFilter;
    label: string;
  }[] = [
    {
      id: "recovery",
      label:
        "Récupération actuelle",
    },

    {
      id: "7",
      label:
        "7 derniers jours",
    },

    {
      id: "30",
      label:
        "30 derniers jours",
    },

    {
      id: "365",
      label: "365 derniers jours",
    },

    {
      id: "all",
      label:
        "Depuis le début",
    },
  ];

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-background pb-24 pt-safe">
      <header className="sticky top-0 z-10 border-b border-border bg-background/95 px-5 py-6 backdrop-blur-md">
        <h1 className="text-3xl font-extrabold tracking-tight text-white">
          Corps
        </h1>
      </header>

      <main className="w-full space-y-6 overflow-x-hidden p-5">
        <div className="flex max-w-full gap-2 overflow-x-auto pb-1">
          {filters.map(
            (
              filter,
            ) => (
              <button
                key={
                  filter.id
                }
                type="button"
                onClick={() =>
                  setTimeFilter(
                    filter.id,
                  )
                }
                className={cn(
                  "whitespace-nowrap rounded-full border px-4 py-2 text-xs font-bold transition-colors",

                  timeFilter ===
                    filter.id
                    ? "border-white bg-white text-black"
                    : "border-border bg-transparent text-muted-foreground",
                )}
              >
                {
                  filter.label
                }
              </button>
            ),
          )}
        </div>

        {timeFilter ===
          "recovery" && (
          <div className="rounded-xl border border-border bg-card p-4">
            <h2 className="text-sm font-bold text-white">
              Récupération musculaire
            </h2>

            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              Les couleurs représentent la charge encore présente après les séances enregistrées. La récupération varie selon le groupe musculaire, la charge récente et les blessures enregistrées.
            </p>
          </div>
        )}

        <div className="flex w-full justify-center overflow-hidden rounded-xl border border-border bg-card px-3 py-5">
          <BodyMapSVG
            scores={
              muscleAccumulation
            }
            maxScore={
              maxScore
            }
          />
        </div>

        {timeFilter !==
          "recovery" &&
          recommendations.length > 0 && (
            <div className="rounded-xl border border-border bg-[#151515] p-4">
              <h3 className="mb-2 text-sm font-bold text-white">
                Recommandation
              </h3>

              <p className="text-sm text-muted-foreground">
                Pour compléter ton entraînement d’escalade sur cette période, tu pourrais privilégier :{" "}
                <strong className="text-white">
                  {
                    recommendations.join(
                      ", ",
                    )
                  }
                </strong>
                .
              </p>
            </div>
          )}

        <div className="space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
            {timeFilter ===
            "recovery"
              ? "Charge résiduelle"
              : "Répartition de l’effort"}
          </h3>

          <div className="space-y-2">
            {Object.entries(
              muscleAccumulation,
            )
              .sort(
                (
                  first,
                  second,
                ) =>
                  second[1] -
                  first[1],
              )
              .filter(
                (
                  [
                    ,
                    score,
                  ],
                ) =>
                  score >
                  0,
              )
              .map(
                (
                  [
                    muscleId,
                    score,
                  ],
                ) => (
                  <div
                    key={
                      muscleId
                    }
                    className="flex min-w-0 items-center gap-3"
                  >
                    <div className="w-28 flex-shrink-0 text-right text-xs font-medium text-muted-foreground">
                      {getMuscleName(
                        muscleId,
                      )}
                    </div>

                    <div className="h-3 min-w-0 flex-1 overflow-hidden rounded-full bg-card">
                      <div
                        className="h-full rounded-full bg-white"
                        style={{
                          width: `${Math.min(
                            100,
                            (
                              score /
                              maxScore
                            ) *
                              100,
                          )}%`,
                        }}
                      />
                    </div>

                    <div className="w-10 flex-shrink-0 text-right font-mono text-xs text-white">
                      {Math.round(
                        score *
                          10,
                      ) /
                        10}
                    </div>
                  </div>
                ),
              )}

            {Object.values(
              muscleAccumulation,
            ).every(
              (
                score,
              ) =>
                score ===
                0,
            ) && (
              <div className="py-4 text-center text-sm text-muted-foreground">
                Aucune charge musculaire active.
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}