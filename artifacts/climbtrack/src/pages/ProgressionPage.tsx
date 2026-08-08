import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Activity,
  ArrowUpRight,
  ChevronDown,
  Info,
  TrendingUp,
} from "lucide-react";

import {
  format,
  parseISO,
} from "date-fns";

import {
  fr,
} from "date-fns/locale";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  SESSIONS,
  type ExerciseDef,
} from "@/data/sessions";

import {
  useClimbTrack,
  type ExerciseLog,
} from "@/context/ClimbTrackContext";

// ─────────────────────────────────────────────────────────────────────────────
// Exercices à afficher
// ─────────────────────────────────────────────────────────────────────────────

const EXCLUDED_SESSION_IDS =
  new Set([
    "s5-souplesse",
    "s8-pompes-activation",
    "grimpe-libre",
  ]);

const EXCLUDED_EXERCISE_IDS =
  new Set([
    "sauts-prise",
    "croise-dynamique-19-30",
    "blocs-devers",
    "traversees-longues",

    "rot-ext-epaule",
    "scapular-pullups",
    "ext-doigts",
    "equilibre-jambe",
  ]);

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type ChartPoint = {
  date: string;
  dateFormatted: string;
  value: number;
  assistance?: string;
  sets: number;
  log: ExerciseLog;
};

type MetricInfo = {
  value: number;
  unit: string;
  label: string;
};

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function formatNumber(
  value: number,
): string {
  if (
    !Number.isFinite(
      value,
    )
  ) {
    return "—";
  }

  if (
    Number.isInteger(
      value,
    )
  ) {
    return String(
      value,
    );
  }

  return String(
    Math.round(
      value * 100,
    ) / 100,
  ).replace(
    ".",
    ",",
  );
}

function getMetricInfo(
  exercise: ExerciseDef,
  log: ExerciseLog,
): MetricInfo {
  if (
    exercise.tracking.includes(
      "weight",
    )
  ) {
    return {
      value:
        log.weight ??
        0,

      unit:
        "kg",

      label:
        "Charge",
    };
  }

  if (
    exercise.tracking.includes(
      "duration",
    )
  ) {
    return {
      value:
        log.duration ??
        0,

      unit:
        "s",

      label:
        "Durée",
    };
  }

  return {
    value:
      log.reps ??
      0,

    unit:
      "reps",

    label:
      "Répétitions",
  };
}

function getMetricUnit(
  exercise?: ExerciseDef,
): string {
  if (
    !exercise
  ) {
    return "";
  }

  if (
    exercise.tracking.includes(
      "weight",
    )
  ) {
    return "kg";
  }

  if (
    exercise.tracking.includes(
      "duration",
    )
  ) {
    return "s";
  }

  return "reps";
}

function getMetricLabel(
  exercise?: ExerciseDef,
): string {
  if (
    !exercise
  ) {
    return "Performance";
  }

  if (
    exercise.tracking.includes(
      "weight",
    )
  ) {
    return "Charge";
  }

  if (
    exercise.tracking.includes(
      "duration",
    )
  ) {
    return "Durée";
  }

  return "Répétitions";
}

function isProgressionExercise(
  exercise: ExerciseDef,
  sessionId: string,
): boolean {
  if (
    EXCLUDED_SESSION_IDS.has(
      sessionId,
    )
  ) {
    return false;
  }

  if (
    EXCLUDED_EXERCISE_IDS.has(
      exercise.id,
    )
  ) {
    return false;
  }

  if (
    exercise.tracking ===
    "none"
  ) {
    return false;
  }

  return true;
}

function getSuggestedProgressionText(
  exercise: ExerciseDef,
  latestLog: ExerciseLog,
): string {
  if (
    exercise.id ===
    "suspension-20mm"
  ) {
    if (
      latestLog.assistance &&
      latestLog.assistance !==
        "Sans assistance" &&
      latestLog.assistance !==
        "Lesté"
    ) {
      return "Réduire légèrement l’assistance avant d’augmenter la durée.";
    }

    return "Augmenter légèrement la difficulté seulement si les suspensions restent propres et contrôlées.";
  }

  if (
    exercise.id ===
    "suspension-slopers"
  ) {
    return "Conserver le même angle et augmenter légèrement la durée. Passer à un angle plus difficile seulement lorsque cette inclinaison est régulièrement maîtrisée.";
  }

  if (
    exercise.tracking.includes(
      "weight",
    )
  ) {
    return "Augmenter légèrement la charge lors de la prochaine séance tout en conservant la même qualité d’exécution.";
  }

  if (
    exercise.tracking.includes(
      "duration",
    )
  ) {
    return "Augmenter légèrement la durée lors de la prochaine séance sans dégrader la position.";
  }

  return "Augmenter légèrement les répétitions ou la difficulté lors de la prochaine séance.";
}

function getProgressionState(
  chartData: ChartPoint[],
):
  | "ready"
  | "plateau"
  | null {
  if (
    chartData.length <
    2
  ) {
    return null;
  }

  /*
   * Plateau en priorité.
   *
   * Si les quatre dernières valeurs sont identiques,
   * on ne doit pas retourner "ready" seulement parce
   * que les deux dernières sont identiques.
   */
  if (
    chartData.length >=
    4
  ) {
    const lastFour =
      chartData.slice(
        -4,
      );

    const reference =
      lastFour[0].value;

    const stable =
      reference >
        0 &&
      lastFour.every(
        (point) =>
          point.value ===
          reference,
      );

    if (
      stable
    ) {
      return "plateau";
    }
  }

  const last =
    chartData[
      chartData.length -
        1
    ];

  const previous =
    chartData[
      chartData.length -
        2
    ];

  if (
    last.value >
      0 &&
    last.value ===
      previous.value
  ) {
    return "ready";
  }

  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

export function ProgressionPage() {
  const {
    data,
  } =
    useClimbTrack();

  /*
   * Toujours ouvrir l'onglet depuis le haut.
   */
  useEffect(
    () => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "auto",
      });
    },
    [],
  );

  const progressionGroups =
    useMemo(
      () =>
        SESSIONS.map(
          (session) => ({
            id:
              session.id,

            name:
              session.name,

            exercises:
              session.exercises.filter(
                (exercise) =>
                  isProgressionExercise(
                    exercise,
                    session.id,
                  ),
              ),
          }),
        ).filter(
          (group) =>
            group.exercises
              .length >
            0,
        ),
      [],
    );

  const allExercises =
    useMemo(
      () => {
        const exercises:
          ExerciseDef[] = [];

        progressionGroups.forEach(
          (group) => {
            group.exercises.forEach(
              (exercise) => {
                if (
                  !exercises.some(
                    (existing) =>
                      existing.id ===
                      exercise.id,
                  )
                ) {
                  exercises.push(
                    exercise,
                  );
                }
              },
            );
          },
        );

        return exercises;
      },
      [
        progressionGroups,
      ],
    );

  const defaultExerciseId =
    allExercises.some(
      (exercise) =>
        exercise.id ===
        "suspension-20mm",
    )
      ? "suspension-20mm"
      : allExercises[0]?.id ??
        "";

  const [
    selectedExId,
    setSelectedExId,
  ] =
    useState<string>(
      defaultExerciseId,
    );

  const selectedEx =
    allExercises.find(
      (exercise) =>
        exercise.id ===
        selectedExId,
    );

  /*
   * Données brutes de progression.
   */
  const rawChartData =
    useMemo(
      () => {
        if (
          !selectedEx
        ) {
          return [];
        }

        const points:
          ChartPoint[] = [];

        const sortedSessions =
          [
            ...data.sessionLogs,
          ].sort(
            (
              first,
              second,
            ) => {
              const firstTime =
                first.completedAt
                  ? new Date(
                      first.completedAt,
                    ).getTime()
                  : new Date(
                      `${first.date}T12:00:00`,
                    ).getTime();

              const secondTime =
                second.completedAt
                  ? new Date(
                      second.completedAt,
                    ).getTime()
                  : new Date(
                      `${second.date}T12:00:00`,
                    ).getTime();

              return (
                firstTime -
                secondTime
              );
            },
          );

        sortedSessions.forEach(
          (session) => {
            const exerciseLogs =
              session.exerciseLogs.filter(
                (
                  exerciseLog,
                ) =>
                  exerciseLog.exerciseId ===
                    selectedExId &&
                  exerciseLog.completed ===
                    true,
              );

            exerciseLogs.forEach(
              (
                exerciseLog,
              ) => {
                const metric =
                  getMetricInfo(
                    selectedEx,
                    exerciseLog,
                  );

                points.push({
                  date:
                    session.date,

                  dateFormatted:
                    format(
                      parseISO(
                        session.date,
                      ),
                      "dd MMM",
                      {
                        locale:
                          fr,
                      },
                    ),

                  value:
                    metric.value,

                  assistance:
                    exerciseLog.assistance,

                  sets:
                    exerciseLog.sets,

                  log:
                    exerciseLog,
                });
              },
            );
          },
        );

        return points;
      },
      [
        data.sessionLogs,
        selectedExId,
        selectedEx,
      ],
    );

  /*
   * Les suspensions sur slopers doivent être comparées
   * uniquement avec le même angle.
   *
   * On utilise automatiquement le dernier angle enregistré.
   */
  const activeSloperAngle =
    useMemo(
      () => {
        if (
          selectedExId !==
          "suspension-slopers"
        ) {
          return null;
        }

        for (
          let index =
            rawChartData.length -
            1;
          index >= 0;
          index -= 1
        ) {
          const angle =
            rawChartData[
              index
            ].log
              .progressionValue;

          if (
            typeof angle ===
            "number"
          ) {
            return angle;
          }
        }

        return null;
      },
      [
        selectedExId,
        rawChartData,
      ],
    );

  const chartData =
    useMemo(
      () => {
        if (
          selectedExId !==
            "suspension-slopers" ||
          activeSloperAngle ===
            null
        ) {
          return rawChartData;
        }

        return rawChartData.filter(
          (point) =>
            point.log
              .progressionValue ===
            activeSloperAngle,
        );
      },
      [
        rawChartData,
        selectedExId,
        activeSloperAngle,
      ],
    );

  const latestPoint =
    chartData.length >
    0
      ? chartData[
          chartData.length -
            1
        ]
      : null;

  const latestValue =
    latestPoint?.value ??
    0;

  const maxValue =
    chartData.length >
    0
      ? Math.max(
          ...chartData.map(
            (point) =>
              point.value,
          ),
        )
      : 0;

  const progressionState =
    getProgressionState(
      chartData,
    );

  const unit =
    getMetricUnit(
      selectedEx,
    );

  const metricLabel =
    getMetricLabel(
      selectedEx,
    );

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-background pb-24 pt-safe">
      <header className="border-b border-border px-5 py-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-white">
          Progression
        </h1>
      </header>

      <main className="w-full space-y-6 overflow-x-hidden p-5">
        {/* Sélection */}

        <div className="relative w-full min-w-0">
          <select
            value={
              selectedExId
            }
            onChange={(
              event,
            ) =>
              setSelectedExId(
                event.target
                  .value,
              )
            }
            className="w-full min-w-0 appearance-none rounded-xl border border-border bg-card p-4 pr-10 font-bold text-white outline-none focus:border-white/40"
          >
            {progressionGroups.map(
              (group) => (
                <optgroup
                  key={
                    group.id
                  }
                  label={
                    group.name
                  }
                >
                  {group.exercises.map(
                    (
                      exercise,
                    ) => (
                      <option
                        key={
                          exercise.id
                        }
                        value={
                          exercise.id
                        }
                      >
                        {
                          exercise.name
                        }
                      </option>
                    ),
                  )}
                </optgroup>
              ),
            )}
          </select>

          <ChevronDown
            size={20}
            className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
        </div>

        {selectedEx &&
        chartData.length >
          0 ? (
          <>
            {/* Angle des slopers */}

            {selectedEx.id ===
              "suspension-slopers" &&
              activeSloperAngle !==
                null && (
                <div className="w-full overflow-hidden rounded-xl border border-border bg-card p-4">
                  <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                    Angle actuellement comparé
                  </p>

                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="font-mono text-2xl font-black text-white">
                      {formatNumber(
                        activeSloperAngle,
                      )}
                    </span>

                    <span className="text-sm font-bold text-muted-foreground">
                      °
                    </span>
                  </div>

                  <p className="mt-2 break-words text-xs leading-relaxed text-muted-foreground">
                    Le graphique affiche uniquement les performances réalisées à cet angle afin de ne pas mélanger des difficultés différentes.
                  </p>
                </div>
              )}

            {/* Résumé */}

            <div className="grid w-full min-w-0 grid-cols-2 gap-3">
              <div className="min-w-0 overflow-hidden rounded-xl border border-border bg-card p-4">
                <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Dernière performance
                </p>

                <div className="flex min-w-0 items-baseline gap-1">
                  <span className="font-mono text-2xl font-black text-white">
                    {formatNumber(
                      latestValue,
                    )}
                  </span>

                  <span className="text-sm font-bold text-muted-foreground">
                    {
                      unit
                    }
                  </span>
                </div>

                <p className="mt-1 text-xs text-muted-foreground">
                  {
                    metricLabel
                  }
                </p>
              </div>

              <div className="min-w-0 overflow-hidden rounded-xl border border-border bg-card p-4">
                <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Meilleure performance
                </p>

                <div className="flex min-w-0 items-baseline gap-1">
                  <span className="font-mono text-2xl font-black text-white">
                    {formatNumber(
                      maxValue,
                    )}
                  </span>

                  <span className="text-sm font-bold text-muted-foreground">
                    {
                      unit
                    }
                  </span>
                </div>

                <p className="mt-1 text-xs text-muted-foreground">
                  {
                    metricLabel
                  }
                </p>
              </div>
            </div>

            {/* Plateau */}

            {progressionState ===
              "plateau" && (
              <div className="flex w-full min-w-0 items-start gap-3 overflow-hidden rounded-xl border border-border bg-[#151515] p-4">
                <Activity
                  className="mt-0.5 flex-shrink-0 text-muted-foreground"
                  size={20}
                />

                <div className="min-w-0">
                  <p className="mb-1 text-sm font-bold text-white">
                    Observer un plateau
                  </p>

                  <p className="break-words text-xs leading-relaxed text-muted-foreground">
                    La performance principale est identique sur les quatre dernières séances comparables.
                  </p>

                  <p className="mt-2 break-words text-xs leading-relaxed text-white/80">
                    Conserver encore la valeur actuelle, améliorer la qualité d’exécution ou augmenter légèrement la récupération avant de forcer une progression.
                  </p>
                </div>
              </div>
            )}

            {/* Prêt à progresser */}

            {progressionState ===
              "ready" &&
              latestPoint && (
                <div className="flex w-full min-w-0 items-start gap-3 overflow-hidden rounded-xl border border-border bg-[#151515] p-4">
                  <ArrowUpRight
                    className="mt-0.5 flex-shrink-0 text-white"
                    size={20}
                  />

                  <div className="min-w-0">
                    <p className="mb-1 text-sm font-bold text-white">
                      Tester une progression
                    </p>

                    <p className="break-words text-xs leading-relaxed text-muted-foreground">
                      Deux séances consécutives ont été réalisées avec la même performance.
                    </p>

                    <p className="mt-2 break-words text-xs font-medium leading-relaxed text-white/80">
                      {getSuggestedProgressionText(
                        selectedEx,
                        latestPoint.log,
                      )}
                    </p>

                    <p className="mt-3 break-words text-[10px] leading-relaxed text-muted-foreground">
                      Cette suggestion reste temporaire et ne modifie pas automatiquement les valeurs de base de l’exercice.
                    </p>
                  </div>
                </div>
              )}

            {/* Graphique */}

            <section className="w-full min-w-0 space-y-3 overflow-hidden">
              <div className="flex items-center gap-2">
                <TrendingUp
                  size={17}
                  className="text-muted-foreground"
                />

                <h2 className="text-xs font-black uppercase tracking-[0.14em] text-muted-foreground">
                  Évolution
                </h2>
              </div>

              <div className="h-64 w-full min-w-0 overflow-hidden rounded-xl border border-border bg-card p-4">
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >
                  <LineChart
                    data={
                      chartData
                    }
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#2a2a2a"
                      vertical={
                        false
                      }
                    />

                    <XAxis
                      dataKey="dateFormatted"
                      stroke="#888"
                      fontSize={
                        10
                      }
                      tickLine={
                        false
                      }
                      axisLine={
                        false
                      }
                      dy={10}
                    />

                    <YAxis
                      stroke="#888"
                      fontSize={
                        10
                      }
                      tickLine={
                        false
                      }
                      axisLine={
                        false
                      }
                      dx={-8}
                      width={34}
                    />

                    <Tooltip
                      formatter={(
                        value,
                      ) => [
                        `${formatNumber(
                          Number(
                            value,
                          ),
                        )} ${unit}`,
                        metricLabel,
                      ]}
                      contentStyle={{
                        backgroundColor:
                          "#1a1a1a",

                        border:
                          "1px solid #2a2a2a",

                        borderRadius:
                          "8px",
                      }}
                      labelStyle={{
                        color:
                          "#aaa",
                      }}
                      itemStyle={{
                        color:
                          "#fff",

                        fontWeight:
                          "bold",
                      }}
                    />

                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#fff"
                      strokeWidth={
                        3
                      }
                      dot={{
                        r:
                          4,

                        fill:
                          "#000",

                        stroke:
                          "#fff",

                        strokeWidth:
                          2,
                      }}
                      activeDot={{
                        r:
                          6,

                        fill:
                          "#fff",
                      }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </section>

            {/* Assistance */}

            {(
              selectedEx.tracking ===
                "assistance" ||
              selectedEx.tracking ===
                "duration+assistance"
            ) &&
              latestPoint && (
                <div className="flex w-full min-w-0 items-start gap-3 overflow-hidden rounded-xl border border-border bg-[#151515] p-4">
                  <Info
                    className="mt-0.5 flex-shrink-0 text-muted-foreground"
                    size={20}
                  />

                  <div className="min-w-0">
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      Assistance actuelle
                    </p>

                    <p className="mt-1 break-words text-sm font-bold text-white">
                      {latestPoint.assistance ||
                        "Non renseignée"}
                    </p>

                    {latestPoint.assistance &&
                      latestPoint.assistance !==
                        "Sans assistance" &&
                      latestPoint.assistance !==
                        "Lesté" && (
                        <p className="mt-2 break-words text-xs leading-relaxed text-muted-foreground">
                          Réduire progressivement l’assistance avant de chercher à augmenter fortement le temps.
                        </p>
                      )}
                  </div>
                </div>
              )}
          </>
        ) : (
          <div className="w-full overflow-hidden rounded-xl border border-border bg-card py-20 text-center">
            <Activity
              size={40}
              className="mx-auto mb-4 text-muted-foreground/30"
            />

            <p className="font-medium text-muted-foreground">
              Aucune donnée pour cet exercice.
            </p>

            <p className="mt-1 px-4 text-sm text-muted-foreground/70">
              Réaliser l’exercice pour afficher sa progression.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}