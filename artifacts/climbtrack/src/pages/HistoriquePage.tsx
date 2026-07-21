import { useMemo, useState } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Dumbbell,
  Mountain,
  X,
} from "lucide-react";

import { useClimbTrack } from "@/context/ClimbTrackContext";
import type { SessionLog } from "@/context/ClimbTrackContext";
import { SESSIONS } from "@/data/sessions";
import { cn } from "@/lib/utils";
import { getTodayLocalDate } from "@/utils/dailySuggestion";

const WEEK_DAYS = [
  "Lun",
  "Mar",
  "Mer",
  "Jeu",
  "Ven",
  "Sam",
  "Dim",
];

function padNumber(value: number): string {
  return String(value).padStart(2, "0");
}

function createLocalDateString(
  year: number,
  month: number,
  day: number,
): string {
  return `${year}-${padNumber(month + 1)}-${padNumber(day)}`;
}

function formatLongDate(date: string): string {
  return new Date(`${date}T12:00:00`).toLocaleDateString("fr-CH", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatMonth(year: number, month: number): string {
  const value = new Date(year, month, 1).toLocaleDateString("fr-CH", {
    month: "long",
    year: "numeric",
  });

  return value.charAt(0).toUpperCase() + value.slice(1);
}

function getSessionName(sessionId: string): string {
  if (sessionId === "grimpe-libre") {
    return "Grimpe libre";
  }

  if (sessionId === "kilter") {
    return "Kilterboard";
  }

  return (
    SESSIONS.find((session) => session.id === sessionId)?.name ??
    "Séance"
  );
}

function getExerciseName(
  sessionId: string,
  exerciseId: string,
): string {
  const exercise = SESSIONS.flatMap(
    (session) => session.exercises,
  ).find((item) => item.id === exerciseId);

  return exercise?.name ?? exerciseId;
}

function getKilterTotalDuration(log: SessionLog): number {
  return (log.kilterEntries ?? []).reduce(
    (total, entry) => total + (entry.durationMinutes ?? 0),
    0,
  );
}

function getActivityDuration(log: SessionLog): number | null {
  if (log.sessionId === "grimpe-libre") {
    return log.climbingDurationMinutes ?? null;
  }

  if (log.sessionId === "kilter") {
    const duration = getKilterTotalDuration(log);

    return duration > 0 ? duration : null;
  }

  return null;
}

function getActivityIcon(log: SessionLog) {
  if (
    log.sessionId === "grimpe-libre" ||
    log.sessionId === "kilter"
  ) {
    return Mountain;
  }

  return Dumbbell;
}

function formatKilterResult(result: string): string {
  if (result === "reussi") {
    return "Réussi";
  }

  if (result === "echoue") {
    return "Échoué";
  }

  return "Travaillé";
}

function formatIntensity(intensity?: string): string {
  if (!intensity) {
    return "Non renseignée";
  }

  return intensity.charAt(0).toUpperCase() + intensity.slice(1);
}

export function HistoriquePage() {
  const { data } = useClimbTrack();

  const today = getTodayLocalDate();
  const todayDate = new Date(`${today}T12:00:00`);

  const [displayedYear, setDisplayedYear] = useState(
    todayDate.getFullYear(),
  );

  const [displayedMonth, setDisplayedMonth] = useState(
    todayDate.getMonth(),
  );

  const [selectedDate, setSelectedDate] = useState(today);

  const [selectedLog, setSelectedLog] = useState<SessionLog | null>(
    null,
  );

  const calendarDays = useMemo(() => {
    const firstDay = new Date(
      displayedYear,
      displayedMonth,
      1,
    );

    const daysInMonth = new Date(
      displayedYear,
      displayedMonth + 1,
      0,
    ).getDate();

    /*
     * JavaScript : dimanche = 0.
     * Ici, lundi doit être la première colonne.
     */
    const emptyDaysBeforeMonth =
      (firstDay.getDay() + 6) % 7;

    const days: Array<number | null> = [];

    for (
      let index = 0;
      index < emptyDaysBeforeMonth;
      index += 1
    ) {
      days.push(null);
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      days.push(day);
    }

    while (days.length % 7 !== 0) {
      days.push(null);
    }

    return days;
  }, [displayedYear, displayedMonth]);

  const logsByDate = useMemo(() => {
    const result: Record<string, SessionLog[]> = {};

    data.sessionLogs.forEach((log) => {
      if (!result[log.date]) {
        result[log.date] = [];
      }

      result[log.date].push(log);
    });

    return result;
  }, [data.sessionLogs]);

  const selectedDayLogs = useMemo(() => {
    return [...(logsByDate[selectedDate] ?? [])].reverse();
  }, [logsByDate, selectedDate]);

  function previousMonth() {
    if (displayedMonth === 0) {
      setDisplayedMonth(11);
      setDisplayedYear((year) => year - 1);
      return;
    }

    setDisplayedMonth((month) => month - 1);
  }

  function nextMonth() {
    if (displayedMonth === 11) {
      setDisplayedMonth(0);
      setDisplayedYear((year) => year + 1);
      return;
    }

    setDisplayedMonth((month) => month + 1);
  }

  return (
    <div className="min-h-screen bg-background pb-24 pt-safe">
      <header className="sticky top-0 z-10 border-b border-border bg-background/95 px-5 py-6 backdrop-blur-md">
        <h1 className="text-3xl font-extrabold text-white">
          Historique
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Calendrier de tes entraînements
        </p>
      </header>

      <main className="space-y-5 p-5">
        <section className="rounded-2xl border border-border bg-card p-4">
          <div className="mb-5 flex items-center justify-between">
            <button
              type="button"
              onClick={previousMonth}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border"
            >
              <ChevronLeft size={20} />
            </button>

            <h2 className="font-extrabold text-white">
              {formatMonth(displayedYear, displayedMonth)}
            </h2>

            <button
              type="button"
              onClick={nextMonth}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1">
            {WEEK_DAYS.map((day) => (
              <div
                key={day}
                className="pb-2 text-center text-[10px] font-bold uppercase text-muted-foreground"
              >
                {day}
              </div>
            ))}

            {calendarDays.map((day, index) => {
              if (day === null) {
                return (
                  <div
                    key={`empty-${index}`}
                    className="aspect-square"
                  />
                );
              }

              const date = createLocalDateString(
                displayedYear,
                displayedMonth,
                day,
              );

              const dayLogs = logsByDate[date] ?? [];
              const hasActivity = dayLogs.length > 0;
              const isSelected = selectedDate === date;
              const isToday = today === date;

              return (
                <button
                  key={date}
                  type="button"
                  onClick={() => setSelectedDate(date)}
                  className={cn(
                    "relative flex aspect-square items-center justify-center rounded-xl border text-sm font-bold",
                    isSelected
                      ? "border-white bg-white text-black"
                      : "border-transparent bg-white/[0.03] text-white",
                    isToday &&
                      !isSelected &&
                      "border-white/40",
                  )}
                >
                  {day}

                  {hasActivity && (
                    <span
                      className={cn(
                        "absolute bottom-1 h-1.5 w-1.5 rounded-full",
                        isSelected ? "bg-black" : "bg-white",
                      )}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </section>

        <section>
          <div className="mb-3 flex items-center gap-2">
            <CalendarDays size={18} />

            <h2 className="font-extrabold capitalize text-white">
              {formatLongDate(selectedDate)}
            </h2>
          </div>

          {selectedDayLogs.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border p-6 text-center">
              <p className="font-bold text-white">
                Aucune séance enregistrée
              </p>

              <p className="mt-1 text-sm text-muted-foreground">
                Cette date reste vide tant qu’aucune activité n’a
                réellement été terminée.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {selectedDayLogs.map((log) => {
                const Icon = getActivityIcon(log);
                const duration = getActivityDuration(log);

                return (
                  <button
                    key={log.id}
                    type="button"
                    onClick={() => setSelectedLog(log)}
                    className="flex w-full items-center gap-3 rounded-2xl border border-border bg-card p-4 text-left"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10">
                      <Icon size={21} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-white">
                        {getSessionName(log.sessionId)}
                      </h3>

                      <p className="mt-1 text-xs text-muted-foreground">
                        Toucher pour voir les détails
                      </p>
                    </div>

                    {duration !== null && (
                      <div className="flex items-center gap-1 text-xs font-bold text-muted-foreground">
                        <Clock3 size={14} />
                        {duration} min
                      </div>
                    )}

                    <ChevronRight size={18} />
                  </button>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {selectedLog && (
        <div className="fixed inset-0 z-[9999] flex items-end bg-black/75">
          <button
            type="button"
            className="absolute inset-0"
            onClick={() => setSelectedLog(null)}
          />

          <div className="relative z-10 max-h-[92dvh] w-full overflow-y-auto rounded-t-3xl border-t border-border bg-background p-5 pb-10">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  {formatLongDate(selectedLog.date)}
                </p>

                <h2 className="mt-1 text-2xl font-extrabold text-white">
                  {getSessionName(selectedLog.sessionId)}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-border"
              >
                <X size={20} />
              </button>
            </div>

            {selectedLog.sessionId === "grimpe-libre" && (
              <div className="space-y-3">
                <div className="rounded-xl border border-border bg-card p-4">
                  <p className="text-xs font-bold uppercase text-muted-foreground">
                    Durée
                  </p>

                  <p className="mt-1 text-lg font-bold text-white">
                    {selectedLog.climbingDurationMinutes ?? "—"} min
                  </p>
                </div>

                <div className="rounded-xl border border-border bg-card p-4">
                  <p className="text-xs font-bold uppercase text-muted-foreground">
                    Intensité
                  </p>

                  <p className="mt-1 text-lg font-bold text-white">
                    {formatIntensity(selectedLog.climbingIntensity)}
                  </p>
                </div>
              </div>
            )}

            {selectedLog.sessionId === "kilter" && (
              <div className="space-y-3">
                {(selectedLog.kilterEntries ?? []).map(
                  (entry, index) => (
                    <div
                      key={entry.id ?? `${entry.angle}-${index}`}
                      className="rounded-xl border border-border bg-card p-4"
                    >
                      <div className="mb-3 flex items-center justify-between">
                        <h3 className="font-bold text-white">
                          Partie {index + 1}
                        </h3>

                        <span className="rounded-full border border-border px-3 py-1 text-xs font-bold">
                          {entry.angle}° · V{entry.grade}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="rounded-lg bg-black/20 p-2">
                          <p className="text-[10px] uppercase text-muted-foreground">
                            Résultat
                          </p>

                          <p className="mt-1 text-xs font-bold text-white">
                            {formatKilterResult(entry.result)}
                          </p>
                        </div>

                        <div className="rounded-lg bg-black/20 p-2">
                          <p className="text-[10px] uppercase text-muted-foreground">
                            Essais
                          </p>

                          <p className="mt-1 text-xs font-bold text-white">
                            {entry.attempts ?? "—"}
                          </p>
                        </div>

                        <div className="rounded-lg bg-black/20 p-2">
                          <p className="text-[10px] uppercase text-muted-foreground">
                            Durée
                          </p>

                          <p className="mt-1 text-xs font-bold text-white">
                            {entry.durationMinutes ?? "—"} min
                          </p>
                        </div>
                      </div>
                    </div>
                  ),
                )}

                <div className="rounded-xl border border-border bg-card p-4">
                  <p className="text-xs font-bold uppercase text-muted-foreground">
                    Durée totale
                  </p>

                  <p className="mt-1 text-lg font-bold text-white">
                    {getKilterTotalDuration(selectedLog)} min
                  </p>
                </div>
              </div>
            )}

            {selectedLog.sessionId !== "grimpe-libre" &&
              selectedLog.sessionId !== "kilter" && (
                <div className="space-y-3">
                  {selectedLog.exerciseLogs.length === 0 ? (
                    <p className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
                      Aucun exercice renseigné.
                    </p>
                  ) : (
                    selectedLog.exerciseLogs.map((exerciseLog) => (
                      <div
                        key={exerciseLog.exerciseId}
                        className="rounded-xl border border-border bg-card p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="font-bold text-white">
                              {getExerciseName(
                                selectedLog.sessionId,
                                exerciseLog.exerciseId,
                              )}
                            </h3>

                            <p className="mt-1 text-xs text-muted-foreground">
                              {exerciseLog.completed
                                ? "Exercice effectué"
                                : "Non terminé"}
                            </p>
                          </div>

                          <span
                            className={cn(
                              "rounded-full px-3 py-1 text-xs font-bold",
                              exerciseLog.completed
                                ? "bg-white text-black"
                                : "border border-border text-muted-foreground",
                            )}
                          >
                            {exerciseLog.completed ? "Fait" : "Non fait"}
                          </span>
                        </div>

                        <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                          {exerciseLog.sets !== undefined && (
                            <div className="rounded-lg bg-black/20 p-3">
                              <p className="text-[10px] uppercase text-muted-foreground">
                                Séries
                              </p>

                              <p className="mt-1 font-bold text-white">
                                {exerciseLog.sets}
                              </p>
                            </div>
                          )}

                          {exerciseLog.reps !== undefined && (
                            <div className="rounded-lg bg-black/20 p-3">
                              <p className="text-[10px] uppercase text-muted-foreground">
                                Répétitions
                              </p>

                              <p className="mt-1 font-bold text-white">
                                {exerciseLog.reps}
                              </p>
                            </div>
                          )}

                          {exerciseLog.duration !== undefined && (
                            <div className="rounded-lg bg-black/20 p-3">
                              <p className="text-[10px] uppercase text-muted-foreground">
                                Durée
                              </p>

                              <p className="mt-1 font-bold text-white">
                                {exerciseLog.duration}
                              </p>
                            </div>
                          )}

                          {exerciseLog.weight !== undefined && (
                            <div className="rounded-lg bg-black/20 p-3">
                              <p className="text-[10px] uppercase text-muted-foreground">
                                Poids
                              </p>

                              <p className="mt-1 font-bold text-white">
                                {exerciseLog.weight} kg
                              </p>
                            </div>
                          )}

                          {exerciseLog.assistance !== undefined && (
                            <div className="rounded-lg bg-black/20 p-3">
                              <p className="text-[10px] uppercase text-muted-foreground">
                                Assistance
                              </p>

                              <p className="mt-1 font-bold text-white">
                                {exerciseLog.assistance}
                              </p>
                            </div>
                          )}

                          {exerciseLog.progressionValue !== undefined && (
                            <div className="rounded-lg bg-black/20 p-3">
                              <p className="text-[10px] uppercase text-muted-foreground">
                                Progression
                              </p>

                              <p className="mt-1 font-bold text-white">
                                {exerciseLog.progressionValue}
                              </p>
                            </div>
                          )}

                          {exerciseLog.leftHandJumps !== undefined && (
                            <div className="rounded-lg bg-black/20 p-3">
                              <p className="text-[10px] uppercase text-muted-foreground">
                                Main gauche
                              </p>

                              <p className="mt-1 font-bold text-white">
                                {exerciseLog.leftHandJumps}
                              </p>
                            </div>
                          )}

                          {exerciseLog.rightHandJumps !== undefined && (
                            <div className="rounded-lg bg-black/20 p-3">
                              <p className="text-[10px] uppercase text-muted-foreground">
                                Main droite
                              </p>

                              <p className="mt-1 font-bold text-white">
                                {exerciseLog.rightHandJumps}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

            {selectedLog.pain &&
              Object.keys(selectedLog.pain).length > 0 && (
                <div className="mt-5 rounded-xl border border-border bg-card p-4">
                  <h3 className="font-bold text-white">
                    Douleurs et gênes
                  </h3>

                  <div className="mt-3 space-y-2">
                    {Object.entries(selectedLog.pain)
                      .filter(([, value]) => value > 0)
                      .map(([area, value]) => (
                        <div
                          key={area}
                          className="flex items-center justify-between text-sm"
                        >
                          <span className="text-muted-foreground">
                            {area}
                          </span>

                          <span className="font-bold text-white">
                            {value}/10
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              )}

            {selectedLog.note && (
              <div className="mt-5 rounded-xl border border-border bg-card p-4">
                <p className="text-xs font-bold uppercase text-muted-foreground">
                  Note
                </p>

                <p className="mt-2 whitespace-pre-wrap text-sm text-white">
                  {selectedLog.note}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}