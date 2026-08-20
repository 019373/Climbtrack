import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Activity,
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Clock3,
  Dumbbell,
  Mountain,
  Route,
  Trash2,
} from "lucide-react";

import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  formatDistanceToNow,
  isSameDay,
  isSameMonth,
  parseISO,
  startOfMonth,
  startOfWeek,
} from "date-fns";

import {
  fr,
} from "date-fns/locale";

import {
  useClimbTrack,
} from "@/context/ClimbTrackContext";

import type {
  AppData,
  ExerciseLog,
  KilterEntry,
  SessionLog,
} from "@/context/ClimbTrackContext";

import {
  SESSIONS,
} from "@/data/sessions";

import {
  getExerciseById,
} from "@/utils/exercises";

import {
  cn,
} from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────────────────
// Compatibilité avec les anciens exercices
// ─────────────────────────────────────────────────────────────────────────────

const LEGACY_EXERCISE_NAMES: Record<
  string,
  string
> = {
  "repeaters-6-4":
    "Repeaters faciles 6/4",

  "facepull-leger":
    "Face pull léger",

  "stretch-poignets-sol":
    "Étirement poignets au sol",

  "bras-au-dessus-tete":
    "Bras au-dessus de la tête",

  "stretch-trapezes":
    "Épaules / trapèzes",

  "open-book":
    "Open book",

  "rotation-assise":
    "Rotation assise",

  "rotation-thoracique-sol":
    "Rotation thoracique au sol",

  "squat-profond-tenu":
    "Squat profond tenu",

  "genou-vers-poitrine":
    "Genou vers la poitrine",

  "stretch-quadriceps-couche":
    "Étirement quadriceps couché",

  "jambe-tendue-sol":
    "Jambe tendue au sol",
};

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function getSessionTimestamp(
  log: SessionLog,
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

  return new Date(
    `${log.date}T12:00:00`,
  ).getTime();
}

function formatNumber(
  value?: number,
): string {
  if (
    typeof value !==
      "number" ||
    !Number.isFinite(
      value,
    )
  ) {
    return "—";
  }

  return Number.isInteger(
    value,
  )
    ? String(
        value,
      )
    : String(
        Math.round(
          value * 100,
        ) / 100,
      ).replace(
        ".",
        ",",
      );
}

function getSessionName(
  log: SessionLog,
): string {
  if (
    log.sessionId ===
    "kilter"
  ) {
    return "Kilterboard";
  }

  if (
    log.sessionId ===
    "route"
  ) {
    return "Escalade en voie";
  }

  if (
    log.sessionId ===
    "grimpe-libre"
  ) {
    return "Bloc libre";
  }

  return (
    SESSIONS.find(
      (session) =>
        session.id ===
        log.sessionId,
    )?.name ??
    "Séance"
  );
}

function getExerciseName(
  exerciseId: string,
  data: AppData,
): string {
  const exercise =
    getExerciseById(
      exerciseId,
      data,
    );

  if (
    exercise
  ) {
    return exercise.name;
  }

  if (
    LEGACY_EXERCISE_NAMES[
      exerciseId
    ]
  ) {
    return LEGACY_EXERCISE_NAMES[
      exerciseId
    ];
  }

  return exerciseId;
}

function getExerciseSummary(
  log: ExerciseLog,
  data: AppData,
): string {
  const definition =
    getExerciseById(
      log.exerciseId,
      data,
    );

  const values:
    string[] = [];

  if (
    log.sets >
    0
  ) {
    values.push(
      `${log.sets} série${
        log.sets >
        1
          ? "s"
          : ""
      }`,
    );
  }

  if (
    typeof log.reps ===
    "number"
  ) {
    if (
      typeof log.secondaryReps ===
      "number"
    ) {
      values.push(
        `${log.reps} + ${log.secondaryReps} reps`,
      );
    } else {
      values.push(
        `${log.reps} reps`,
      );
    }
  }

  if (
    typeof log.duration ===
    "number"
  ) {
    values.push(
      `${formatNumber(
        log.duration,
      )} s`,
    );
  }

  if (
    typeof log.weight ===
    "number"
  ) {
    if (
      typeof log.secondaryWeight ===
      "number"
    ) {
      values.push(
        `${formatNumber(
          log.weight,
        )} + ${formatNumber(
          log.secondaryWeight,
        )} kg`,
      );
    } else {
      values.push(
        `${formatNumber(
          log.weight,
        )} kg`,
      );
    }
  }

  if (
    log.assistance
  ) {
    values.push(
      log.assistance,
    );
  }

  if (
    typeof log.progressionValue ===
    "number"
  ) {
    if (
      log.exerciseId ===
      "suspension-slopers"
    ) {
      values.push(
        `${formatNumber(
          log.progressionValue,
        )}°`,
      );
    } else if (
      log.exerciseId ===
      "croise-dynamique-19-30"
    ) {
      values.push(
        `prise cible ${formatNumber(
          log.progressionValue,
        )}`,
      );
    } else {
      values.push(
        `progression ${formatNumber(
          log.progressionValue,
        )}`,
      );
    }
  }

  if (
    typeof log.leftHandJumps ===
      "number" ||
    typeof log.rightHandJumps ===
      "number"
  ) {
    values.push(
      `G ${formatNumber(
        log.leftHandJumps,
      )} · D ${formatNumber(
        log.rightHandJumps,
      )}`,
    );
  }

  if (
    log.variant
  ) {
    values.push(
      log.variant,
    );
  }

  if (
    log.bandColor
  ) {
    values.push(
      `élastique ${log.bandColor}`,
    );
  }

  if (
    typeof log.bandStretch ===
      "number" &&
    log.bandStretch >
      0
  ) {
    values.push(
      `repère ${formatNumber(
        log.bandStretch,
      )}`,
    );
  }

  if (
    definition?.perSide
  ) {
    values.push(
      "par côté",
    );
  }

  return values.join(
    " • ",
  );
}

function getKilterDisplayGrade(
  entry: KilterEntry,
): string {
  if (
    typeof entry.displayGrade ===
      "string" &&
    entry.displayGrade.trim()
  ) {
    return entry.displayGrade;
  }

  return `V${entry.grade}`;
}

function getSessionIcon(
  log: SessionLog,
) {
  if (
    log.sessionId ===
    "route"
  ) {
    return Route;
  }

  if (
    log.sessionId ===
    "kilter"
  ) {
    return Activity;
  }

  if (
    log.sessionId ===
    "grimpe-libre"
  ) {
    return Mountain;
  }

  return Dumbbell;
}

function getLogDate(
  log: SessionLog,
): Date {
  const parsed =
    parseISO(
      log.date,
    );

  if (
    Number.isNaN(
      parsed.getTime(),
    )
  ) {
    return new Date(
      getSessionTimestamp(
        log,
      ),
    );
  }

  return parsed;
}

function getLogsForDay(
  logs: SessionLog[],
  date: Date,
): SessionLog[] {
  return logs.filter(
    (log) =>
      isSameDay(
        getLogDate(
          log,
        ),
        date,
      ),
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Calendrier
// ─────────────────────────────────────────────────────────────────────────────

function MonthlyCalendar({
  logs,
  month,
  selectedDate,
  onPreviousMonth,
  onNextMonth,
  onSelectDate,
}: {
  logs: SessionLog[];

  month: Date;

  selectedDate: Date | null;

  onPreviousMonth: () => void;

  onNextMonth: () => void;

  onSelectDate: (
    date: Date,
  ) => void;
}) {
  const monthStart =
    startOfMonth(
      month,
    );

  const monthEnd =
    endOfMonth(
      month,
    );

  const calendarStart =
    startOfWeek(
      monthStart,
      {
        weekStartsOn:
          1,
      },
    );

  const calendarEnd =
    endOfWeek(
      monthEnd,
      {
        weekStartsOn:
          1,
      },
    );

  const days =
    eachDayOfInterval({
      start:
        calendarStart,

      end:
        calendarEnd,
    });

  const weekLabels = [
    "L",
    "M",
    "M",
    "J",
    "V",
    "S",
    "D",
  ];

  return (
    <section className="w-full overflow-hidden rounded-[22px] border border-border bg-card">
      <div className="flex items-center justify-between px-5 pb-3 pt-5">
        <button
          type="button"
          onClick={
            onPreviousMonth
          }
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-border bg-background text-white transition-transform active:scale-90"
          aria-label="Afficher le mois précédent"
        >
          <ChevronLeft
            size={19}
          />
        </button>

        <h2 className="min-w-0 px-3 text-center text-lg font-black capitalize text-white">
          {format(
            month,
            "MMMM yyyy",
            {
              locale:
                fr,
            },
          )}
        </h2>

        <button
          type="button"
          onClick={
            onNextMonth
          }
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-border bg-background text-white transition-transform active:scale-90"
          aria-label="Afficher le mois suivant"
        >
          <ChevronRight
            size={19}
          />
        </button>
      </div>

      <div className="px-3 pb-4">
        <div className="mb-2 grid grid-cols-7">
          {weekLabels.map(
            (
              label,
              index,
            ) => (
              <div
                key={`${label}-${index}`}
                className="py-2 text-center text-[10px] font-black uppercase tracking-wider text-muted-foreground"
              >
                {
                  label
                }
              </div>
            ),
          )}
        </div>

        <div className="grid grid-cols-7 gap-y-1.5">
          {days.map(
            (day) => {
              const inMonth =
                isSameMonth(
                  day,
                  month,
                );

              const dayLogs =
                getLogsForDay(
                  logs,
                  day,
                );

              const hasLogs =
                dayLogs.length >
                0;

              const selected =
                selectedDate
                  ? isSameDay(
                      day,
                      selectedDate,
                    )
                  : false;

              const today =
                isSameDay(
                  day,
                  new Date(),
                );

              return (
                <button
                  key={
                    day.toISOString()
                  }
                  type="button"
                  onClick={() =>
                    onSelectDate(
                      day,
                    )
                  }
                  className={cn(
                    "relative mx-auto flex h-11 w-11 max-w-full flex-col items-center justify-center rounded-xl transition-all active:scale-90",

                    !inMonth &&
                      "opacity-25",

                    selected &&
                      "bg-white text-black",

                    !selected &&
                      hasLogs &&
                      "text-white",

                    !selected &&
                      !hasLogs &&
                      "text-muted-foreground",

                    today &&
                      !selected &&
                      "border border-white/35",
                  )}
                >
                  <span className="text-sm font-bold">
                    {format(
                      day,
                      "d",
                    )}
                  </span>

                  {hasLogs && (
                    <span
                      className={cn(
                        "absolute bottom-[4px] h-1 w-1 rounded-full",

                        selected
                          ? "bg-black"
                          : "bg-white",
                      )}
                    />
                  )}
                </button>
              );
            },
          )}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Exercices historiques
// ─────────────────────────────────────────────────────────────────────────────

function CompletedExerciseRow({
  exercise,
  data,
}: {
  exercise: ExerciseLog;

  data: AppData;
}) {
  return (
    <div className="w-full overflow-hidden rounded-xl border border-border bg-background p-3">
      <div className="flex min-w-0 items-start gap-2">
        <div className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-success" />

        <div className="min-w-0">
          <p className="break-words text-sm font-bold text-white">
            {getExerciseName(
              exercise.exerciseId,
              data,
            )}
          </p>

          <p className="mt-1 break-words text-xs leading-relaxed text-muted-foreground">
            {getExerciseSummary(
              exercise,
              data,
            ) ||
              "Exercice réalisé"}
          </p>
        </div>
      </div>
    </div>
  );
}

function IncompleteExerciseRow({
  exercise,
  data,
}: {
  exercise: ExerciseLog;

  data: AppData;
}) {
  return (
    <div className="w-full overflow-hidden rounded-xl border border-border bg-background/60 p-3">
      <div className="flex min-w-0 items-center gap-2">
        <div className="h-2 w-2 flex-shrink-0 rounded-full border border-muted-foreground" />

        <p className="min-w-0 break-words text-sm font-bold text-muted-foreground">
          {getExerciseName(
            exercise.exerciseId,
            data,
          )}
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Carte de séance
// ─────────────────────────────────────────────────────────────────────────────

function HistorySessionCard({
  log,
  data,
  onDelete,
}: {
  log: SessionLog;

  data: AppData;

  onDelete: () => void;
}) {
  const [
    isExpanded,
    setIsExpanded,
  ] =
    useState(false);

  const Icon =
    getSessionIcon(
      log,
    );

  const timestamp =
    getSessionTimestamp(
      log,
    );

  const dateObject =
    new Date(
      timestamp,
    );

  const relativeDate =
    formatDistanceToNow(
      dateObject,
      {
        addSuffix:
          true,

        locale:
          fr,
      },
    );

  const completedExercises =
    log.exerciseLogs.filter(
      (exercise) =>
        exercise.completed,
    );

  const incompleteExercises =
    log.exerciseLogs.filter(
      (exercise) =>
        !exercise.completed,
    );

  const successfulKilterEntries =
    (
      log.kilterEntries ??
      []
    ).filter(
      (entry) =>
        entry.result ===
        "reussi",
    );

  const successfulRouteEntries =
    (
      log.routeClimbingEntries ??
      []
    ).filter(
      (entry) =>
        entry.result ===
        "reussi",
    );

  return (
    <article className="w-full overflow-hidden rounded-2xl border border-border bg-card">
      <button
        type="button"
        onClick={() =>
          setIsExpanded(
            (previous) =>
              !previous,
          )
        }
        className="flex w-full min-w-0 items-start gap-4 p-4 text-left"
      >
        <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl border border-border bg-background">
          <Icon
            size={20}
            className="text-white"
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-start justify-between gap-3">
            <h2 className="min-w-0 break-words font-black leading-tight text-white">
              {getSessionName(
                log,
              )}
            </h2>

            {isExpanded ? (
              <ChevronUp
                size={18}
                className="flex-shrink-0 text-muted-foreground"
              />
            ) : (
              <ChevronDown
                size={18}
                className="flex-shrink-0 text-muted-foreground"
              />
            )}
          </div>

          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <CalendarDays
                size={12}
              />

              {format(
                dateObject,
                "d MMMM yyyy",
                {
                  locale:
                    fr,
                },
              )}
            </span>

            {log.completedAt && (
              <span className="flex items-center gap-1">
                <Clock3
                  size={12}
                />

                {format(
                  dateObject,
                  "HH:mm",
                  {
                    locale:
                      fr,
                  },
                )}
              </span>
            )}
          </div>

          {(completedExercises.length >
            0 ||
            incompleteExercises.length >
              0) && (
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {completedExercises.length >
                0 && (
                <span className="rounded-full bg-success/10 px-2 py-1 text-[10px] font-bold text-success">
                  {
                    completedExercises.length
                  }{" "}
                  réalisé
                  {completedExercises.length >
                  1
                    ? "s"
                    : ""}
                </span>
              )}

              {incompleteExercises.length >
                0 && (
                <span className="rounded-full bg-white/5 px-2 py-1 text-[10px] font-bold text-muted-foreground">
                  {
                    incompleteExercises.length
                  }{" "}
                  non réalisé
                  {incompleteExercises.length >
                  1
                    ? "s"
                    : ""}
                </span>
              )}
            </div>
          )}

          <p className="mt-2 text-xs font-medium text-muted-foreground">
            {
              relativeDate
            }
          </p>
        </div>
      </button>

      {isExpanded && (
        <div className="w-full space-y-5 overflow-x-hidden border-t border-border bg-[#151515] p-4">
          {completedExercises.length >
            0 && (
            <section className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-wider text-white">
                  Exercices réalisés
                </h3>

                <span className="text-xs font-bold text-success">
                  {
                    completedExercises.length
                  }
                </span>
              </div>

              {completedExercises.map(
                (
                  exercise,
                  index,
                ) => (
                  <CompletedExerciseRow
                    key={`${exercise.exerciseId}-${index}`}
                    exercise={
                      exercise
                    }
                    data={
                      data
                    }
                  />
                ),
              )}
            </section>
          )}

          {incompleteExercises.length >
            0 && (
            <section className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                  Exercices non réalisés
                </h3>

                <span className="text-xs font-bold text-muted-foreground">
                  {
                    incompleteExercises.length
                  }
                </span>
              </div>

              {incompleteExercises.map(
                (
                  exercise,
                  index,
                ) => (
                  <IncompleteExerciseRow
                    key={`${exercise.exerciseId}-${index}`}
                    exercise={
                      exercise
                    }
                    data={
                      data
                    }
                  />
                ),
              )}
            </section>
          )}

          {log.sessionId ===
            "grimpe-libre" && (
            <section className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="min-w-0 rounded-xl border border-border bg-background p-3">
                  <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                    Durée
                  </p>

                  <p className="mt-1 font-mono text-lg font-black text-white">
                    {typeof log.climbingDurationMinutes ===
                    "number"
                      ? `${formatNumber(
                          log.climbingDurationMinutes,
                        )} min`
                      : "—"}
                  </p>
                </div>

                <div className="min-w-0 rounded-xl border border-border bg-background p-3">
                  <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                    Intensité
                  </p>

                  <p className="mt-1 break-words text-lg font-black capitalize text-white">
                    {log.climbingIntensity ??
                      "—"}
                  </p>
                </div>
              </div>

              {(
                log.climbingColorsSucceeded ??
                []
              ).length >
                0 && (
                <div>
                  <p className="mb-2 text-xs font-black uppercase tracking-wider text-muted-foreground">
                    Couleurs réussies
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {log.climbingColorsSucceeded?.map(
                      (color) => (
                        <span
                          key={
                            color
                          }
                          className="rounded-full border border-border bg-background px-3 py-1.5 text-xs font-bold capitalize text-white"
                        >
                          {
                            color
                          }
                        </span>
                      ),
                    )}
                  </div>
                </div>
              )}
            </section>
          )}

          {log.sessionId ===
            "kilter" && (
            <section className="space-y-3">
              <div className="rounded-xl border border-border bg-background p-3">
                <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                  Durée totale
                </p>

                <p className="mt-1 font-mono text-lg font-black text-white">
                  {typeof log.climbingDurationMinutes ===
                  "number"
                    ? `${formatNumber(
                        log.climbingDurationMinutes,
                      )} min`
                    : "—"}
                </p>
              </div>

              <div className="space-y-2">
                {(
                  log.kilterEntries ??
                  []
                ).map(
                  (entry) => (
                    <div
                      key={
                        entry.id
                      }
                      className="flex min-w-0 items-center justify-between gap-3 rounded-xl border border-border bg-background p-3"
                    >
                      <div className="min-w-0">
                        <p className="break-words text-sm font-black text-white">
                          {getKilterDisplayGrade(
                            entry,
                          )}{" "}
                          à{" "}
                          {
                            entry.angle
                          }
                          °
                        </p>

                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {entry.attempts ??
                            1}{" "}
                          essai
                          {(entry.attempts ??
                            1) >
                          1
                            ? "s"
                            : ""}
                        </p>
                      </div>

                      <span
                        className={cn(
                          "flex-shrink-0 rounded-full px-2.5 py-1 text-[10px] font-black uppercase",

                          entry.result ===
                            "reussi" &&
                            "bg-success/15 text-success",

                          entry.result ===
                            "travaille" &&
                            "bg-white/10 text-white",

                          entry.result ===
                            "echoue" &&
                            "bg-destructive/15 text-destructive",
                        )}
                      >
                        {entry.result ===
                        "reussi"
                          ? "Réussi"
                          : entry.result ===
                              "travaille"
                            ? "Travaillé"
                            : "Échoué"}
                      </span>
                    </div>
                  ),
                )}
              </div>

              {successfulKilterEntries.length >
                0 && (
                <p className="text-xs text-success">
                  {
                    successfulKilterEntries.length
                  }{" "}
                  bloc
                  {successfulKilterEntries.length >
                  1
                    ? "s"
                    : ""}{" "}
                  réussi
                  {successfulKilterEntries.length >
                  1
                    ? "s"
                    : ""}
                  .
                </p>
              )}
            </section>
          )}

          {log.sessionId ===
            "route" && (
            <section className="space-y-3">
              <div className="rounded-xl border border-border bg-background p-3">
                <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                  Durée totale
                </p>

                <p className="mt-1 font-mono text-lg font-black text-white">
                  {typeof log.routeClimbingDurationMinutes ===
                  "number"
                    ? `${formatNumber(
                        log.routeClimbingDurationMinutes,
                      )} min`
                    : "—"}
                </p>
              </div>

              <div className="space-y-2">
                {(
                  log.routeClimbingEntries ??
                  []
                ).map(
                  (entry) => (
                    <div
                      key={
                        entry.id
                      }
                      className="flex min-w-0 items-center justify-between gap-3 rounded-xl border border-border bg-background p-3"
                    >
                      <div className="min-w-0">
                        <p className="break-words text-sm font-black text-white">
                          Voie{" "}
                          {
                            entry.grade
                          }
                        </p>

                        <p className="mt-0.5 break-words text-xs text-muted-foreground">
                          {entry.mode ===
                          "tete"
                            ? "En tête"
                            : "Moulinette"}{" "}
                          •{" "}
                          {entry.attempts ??
                            1}{" "}
                          essai
                          {(entry.attempts ??
                            1) >
                          1
                            ? "s"
                            : ""}
                        </p>
                      </div>

                      <span
                        className={cn(
                          "flex-shrink-0 rounded-full px-2.5 py-1 text-[10px] font-black uppercase",

                          entry.result ===
                            "reussi" &&
                            "bg-success/15 text-success",

                          entry.result ===
                            "travaille" &&
                            "bg-white/10 text-white",

                          entry.result ===
                            "echoue" &&
                            "bg-destructive/15 text-destructive",
                        )}
                      >
                        {entry.result ===
                        "reussi"
                          ? "Réussie"
                          : entry.result ===
                              "travaille"
                            ? "Travaillée"
                            : "Échouée"}
                      </span>
                    </div>
                  ),
                )}
              </div>

              {successfulRouteEntries.length >
                0 && (
                <p className="text-xs text-success">
                  {
                    successfulRouteEntries.length
                  }{" "}
                  voie
                  {successfulRouteEntries.length >
                  1
                    ? "s"
                    : ""}{" "}
                  réussie
                  {successfulRouteEntries.length >
                  1
                    ? "s"
                    : ""}
                  .
                </p>
              )}
            </section>
          )}

          {log.pain &&
            Object.keys(
              log.pain,
            ).length >
              0 && (
              <section>
                <h3 className="mb-2 text-xs font-black uppercase tracking-wider text-muted-foreground">
                  Douleur pendant la séance
                </h3>

                <div className="flex flex-wrap gap-2">
                  {Object.entries(
                    log.pain,
                  )
                    .filter(
                      (
                        [
                          ,
                          level,
                        ],
                      ) =>
                        level >
                        0,
                    )
                    .map(
                      (
                        [
                          area,
                          level,
                        ],
                      ) => (
                        <span
                          key={
                            area
                          }
                          className={cn(
                            "max-w-full rounded-full border px-3 py-1.5 text-xs font-bold",

                            level >=
                              7
                              ? "border-destructive/40 bg-destructive/10 text-destructive"
                              : level >=
                                  4
                                ? "border-orange-500/40 bg-orange-500/10 text-orange-400"
                                : "border-border bg-background text-muted-foreground",
                          )}
                        >
                          {
                            area
                          }{" "}
                          :{" "}
                          {
                            level
                          }
                          /10
                        </span>
                      ),
                    )}
                </div>
              </section>
            )}

          {log.note && (
            <section className="w-full overflow-hidden rounded-xl border border-border bg-background p-3">
              <p className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                Note
              </p>

              <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-relaxed text-white">
                {
                  log.note
                }
              </p>
            </section>
          )}

          <button
            type="button"
            onClick={
              onDelete
            }
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-destructive/30 py-3 text-sm font-bold text-destructive active:scale-[0.99]"
          >
            <Trash2
              size={16}
            />

            Supprimer la séance
          </button>
        </div>
      )}
    </article>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

export function HistoriquePage() {
  const {
    data,
    deleteSessionLog,
  } =
    useClimbTrack();

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

  const [
    displayedMonth,
    setDisplayedMonth,
  ] =
    useState(
      startOfMonth(
        new Date(),
      ),
    );

  const [
    selectedDate,
    setSelectedDate,
  ] =
    useState<Date | null>(
      null,
    );

  const sortedLogs =
    useMemo(
      () =>
        [
          ...data.sessionLogs,
        ].sort(
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
        ),
      [
        data.sessionLogs,
      ],
    );

  const visibleLogs =
    useMemo(
      () => {
        if (
          !selectedDate
        ) {
          return sortedLogs;
        }

        return sortedLogs.filter(
          (log) =>
            isSameDay(
              getLogDate(
                log,
              ),
              selectedDate,
            ),
        );
      },
      [
        sortedLogs,
        selectedDate,
      ],
    );

  function selectCalendarDate(
    date: Date,
  ) {
    if (
      selectedDate &&
      isSameDay(
        selectedDate,
        date,
      )
    ) {
      setSelectedDate(
        null,
      );

      return;
    }

    if (
      !isSameMonth(
        date,
        displayedMonth,
      )
    ) {
      setDisplayedMonth(
        startOfMonth(
          date,
        ),
      );
    }

    setSelectedDate(
      date,
    );
  }

  function handleDelete(
    log: SessionLog,
  ) {
    const confirmed =
      window.confirm(
        `Supprimer la séance « ${getSessionName(
          log,
        )} » ?`,
      );

    if (
      confirmed
    ) {
      deleteSessionLog(
        log.id,
      );
    }
  }

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-background pb-24 pt-safe">
      <header className="border-b border-border px-5 py-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-white">
          Historique
        </h1>
      </header>

      <main className="w-full space-y-5 overflow-x-hidden p-5">
        <MonthlyCalendar
          logs={
            sortedLogs
          }
          month={
            displayedMonth
          }
          selectedDate={
            selectedDate
          }
          onPreviousMonth={() => {
            setDisplayedMonth(
              (
                previous,
              ) =>
                addMonths(
                  previous,
                  -1,
                ),
            );

            setSelectedDate(
              null,
            );
          }}
          onNextMonth={() => {
            setDisplayedMonth(
              (
                previous,
              ) =>
                addMonths(
                  previous,
                  1,
                ),
            );

            setSelectedDate(
              null,
            );
          }}
          onSelectDate={
            selectCalendarDate
          }
        />

        {selectedDate && (
          <div className="flex min-w-0 items-center justify-between gap-3 px-1">
            <div className="min-w-0">
              <p className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                Séances du jour
              </p>

              <p className="mt-1 break-words text-sm font-bold capitalize text-white">
                {format(
                  selectedDate,
                  "EEEE d MMMM",
                  {
                    locale:
                      fr,
                  },
                )}
              </p>
            </div>

            <div className="flex flex-shrink-0 items-center gap-2">
              <span className="rounded-full border border-border bg-card px-3 py-1.5 font-mono text-xs text-white">
                {
                  visibleLogs.length
                }
              </span>

              <button
                type="button"
                onClick={() =>
                  setSelectedDate(
                    null,
                  )
                }
                className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-bold text-white"
              >
                Tout afficher
              </button>
            </div>
          </div>
        )}

        {visibleLogs.length >
        0 ? (
          <div className="w-full space-y-4">
            {visibleLogs.map(
              (log) => (
                <HistorySessionCard
                  key={
                    log.id
                  }
                  log={
                    log
                  }
                  data={
                    data
                  }
                  onDelete={() =>
                    handleDelete(
                      log,
                    )
                  }
                />
              ),
            )}
          </div>
        ) : (
          <div className="w-full rounded-2xl border border-border bg-card py-16 text-center">
            <Activity
              size={42}
              className="mx-auto mb-4 text-muted-foreground/30"
            />

            <p className="font-bold text-muted-foreground">
              {selectedDate
                ? "Aucune séance ce jour-là."
                : "Aucune séance enregistrée."}
            </p>

            <p className="mt-1 px-4 text-sm text-muted-foreground/70">
              {selectedDate
                ? "Choisir une autre date ou afficher tout l’historique."
                : "Les prochaines séances apparaîtront ici."}
            </p>

            {selectedDate && (
              <button
                type="button"
                onClick={() =>
                  setSelectedDate(
                    null,
                  )
                }
                className="mt-4 rounded-xl border border-border px-4 py-2 text-sm font-bold text-white"
              >
                Tout afficher
              </button>
            )}
          </div>
        )}
      </main>
    </div>
  );
}