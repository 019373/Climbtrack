import {
  useMemo,
  useState,
} from "react";

import {
  useClimbTrack,
} from "@/context/ClimbTrackContext";

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
} from "@/utils/muscleRecovery";

type TimeFilter =
  | "recovery"
  | "7"
  | "30"
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

  const leastWorked =
    Object.entries(
      muscleAccumulation,
    )
      .sort(
        (
          first,
          second,
        ) =>
          first[1] -
          second[1],
      )
      .filter(
        (
          [
            ,
            score,
          ],
        ) =>
          score <
          maxScore *
            0.3,
      )
      .slice(
        0,
        3,
      )
      .map(
        (
          [
            muscleId,
          ],
        ) =>
          getMuscleName(
            muscleId,
          ),
      );

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
          leastWorked.length >
            0 &&
          maxScore >
            5 && (
            <div className="rounded-xl border border-border bg-[#151515] p-4">
              <h3 className="mb-2 text-sm font-bold text-white">
                Recommandation
              </h3>

              <p className="text-sm text-muted-foreground">
                Pour mieux équilibrer cette période, tu pourrais privilégier :{" "}
                <strong className="text-white">
                  {
                    leastWorked.join(
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