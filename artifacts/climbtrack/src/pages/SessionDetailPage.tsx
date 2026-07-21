import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  useLocation,
  useRoute,
} from "wouter";

import {
  ChevronLeft,
} from "lucide-react";

import {
  SESSIONS,
} from "@/data/sessions";

import type {
  ExerciseDef,
  SessionDef,
} from "@/data/sessions";

import {
  useClimbTrack,
} from "@/context/ClimbTrackContext";

import type {
  ExerciseLog,
  FinisherType,
  SessionLog,
} from "@/context/ClimbTrackContext";

import {
  ExerciseRow,
} from "@/components/ExerciseRow";

import {
  MUSCLE_SCORES,
} from "@/data/muscleScores";

import {
  getSessionExercises,
} from "@/utils/exercises";

import {
  getTodayLocalDate,
} from "@/utils/dailySuggestion";

export function SessionDetailPage() {
  const [
    match,
    params,
  ] = useRoute(
    "/seance/:id",
  );

  const [
    ,
    setLocation,
  ] = useLocation();

  const {
    data,
    addSessionLog,
    updateExerciseDefault,
  } = useClimbTrack();

  const [
    sessionDef,
    setSessionDef,
  ] =
    useState<SessionDef | null>(
      null,
    );

  const [
    sessionExercises,
    setSessionExercises,
  ] = useState<ExerciseDef[]>(
    [],
  );

  const [
    logs,
    setLogs,
  ] = useState<
    Record<
      string,
      ExerciseLog
    >
  >({});

  const [
    painAreas,
    setPainAreas,
  ] = useState<
    Record<
      string,
      number
    >
  >({});

  const [
    note,
    setNote,
  ] = useState("");

  const search =
    new URLSearchParams(
      window.location.search,
    );

  const manualDate =
    search.get("date");

  const finisherType =
    search.get(
      "finisherType",
    ) as FinisherType | null;

  const requestedExercises =
    search
      .get("exerciseIds")
      ?.split(",")
      .filter(Boolean);

  const dataRef =
    useRef(data);

  dataRef.current =
    data;

  useEffect(() => {
    if (
      !match ||
      !params?.id
    ) {
      return;
    }

    const definition =
      SESSIONS.find(
        (session) =>
          session.id ===
          params.id,
      );

    if (!definition) {
      setLocation("/");
      return;
    }

    setSessionDef(
      definition,
    );

    let exercises =
      getSessionExercises(
        params.id,
        dataRef.current,
      );

    if (
      requestedExercises?.length
    ) {
      const requested =
        new Set(
          requestedExercises,
        );

      exercises =
        exercises.filter(
          (exercise) =>
            requested.has(
              exercise.id,
            ),
        );
    }

    setSessionExercises(
      exercises,
    );

    const initialLogs: Record<
      string,
      ExerciseLog
    > = {};

    exercises.forEach(
      (exercise) => {
        const defaults =
          dataRef.current
            .exerciseDefaults[
              exercise.id
            ] ??
          exercise.defaultValues;

        initialLogs[
          exercise.id
        ] = {
          exerciseId:
            exercise.id,

          completed:
            false,

          sets:
            defaults.sets,

          reps:
            defaults.reps,

          duration:
            defaults.duration,

          weight:
            defaults.weight,

          assistance:
            defaults.assistance,

          progressionValue:
            exercise.id ===
            "suspension-slopers"
              ? 30
              : undefined,

          leftHandJumps:
            exercise.id ===
            "sauts-prise"
              ? 3
              : undefined,

          rightHandJumps:
            exercise.id ===
            "sauts-prise"
              ? 3
              : undefined,
        };
      },
    );

    setLogs(
      initialLogs,
    );
  }, [
    match,
    params?.id,
    setLocation,
  ]);

  if (!sessionDef) {
    return null;
  }

  function handleFinish() {
    const date =
      manualDate ??
      getTodayLocalDate();

    const newSessionLog: SessionLog =
      {
        id:
          crypto.randomUUID(),

        date,

        sessionId:
          sessionDef.id,

        exerciseLogs:
          Object.values(
            logs,
          ),

        note:
          note.trim() ||
          undefined,

        pain:
          Object.keys(
            painAreas,
          ).length > 0
            ? painAreas
            : undefined,

        finisherType:
          finisherType ??
          undefined,
      };

    addSessionLog(
      newSessionLog,
    );

    setLocation("/");
  }

  function getPainWarning(
    exerciseId: string,
  ) {
    const scores =
      MUSCLE_SCORES[
        exerciseId
      ];

    if (!scores) {
      return false;
    }

    const fingersPain =
      (
        painAreas[
          "Doigts"
        ] ?? 0
      ) > 3 &&
      (
        scores.doigts ??
        0
      ) >= 3;

    const shoulderPain =
      (
        (
          painAreas[
            "Épaule droite"
          ] ?? 0
        ) > 3 ||
        (
          painAreas[
            "Épaule gauche"
          ] ?? 0
        ) > 3
      ) &&
      (
        scores.épaules ??
        0
      ) >= 3;

    return (
      fingersPain ||
      shoulderPain
    );
  }

  const painSliders = [
    "Doigts",
    "Poignet droit",
    "Poignet gauche",
    "Coude droit",
    "Coude gauche",
    "Épaule droite",
    "Épaule gauche",
  ];

  return (
    <div className="min-h-screen bg-background pb-32">
      <header className="sticky top-0 z-10 border-b border-border bg-background/95 pt-safe backdrop-blur-md">
        <div className="flex items-center gap-3 px-4 py-4">
          <button
            type="button"
            onClick={() =>
              setLocation("/")
            }
            className="-ml-2 rounded-full p-2 hover:bg-white/10"
          >
            <ChevronLeft
              size={24}
              className="text-white"
            />
          </button>

          <div>
            <h1 className="text-lg font-bold text-white">
              {
                sessionDef.name
              }
            </h1>

            {manualDate && (
              <p className="mt-0.5 text-xs text-muted-foreground">
                Séance du{" "}
                {new Date(
                  `${manualDate}T12:00:00`,
                ).toLocaleDateString(
                  "fr-CH",
                  {
                    day:
                      "2-digit",
                    month:
                      "long",
                    year:
                      "numeric",
                  },
                )}
              </p>
            )}
          </div>
        </div>
      </header>

      <main className="space-y-4 p-4">
        {sessionExercises.map(
          (exercise) => {
            const exerciseLog =
              logs[
                exercise.id
              ];

            if (!exerciseLog) {
              return null;
            }

            return (
              <ExerciseRow
                key={
                  exercise.id
                }

                exercise={
                  exercise
                }

                defaults={
                  data
                    .exerciseDefaults[
                      exercise.id
                    ] ??
                  exercise.defaultValues
                }

                log={
                  exerciseLog
                }

                onChange={(
                  updatedLog,
                ) =>
                  setLogs(
                    (
                      previous,
                    ) => ({
                      ...previous,

                      [exercise.id]:
                        updatedLog,
                    }),
                  )
                }

                onUpdateDefault={(
                  defaults,
                ) =>
                  updateExerciseDefault(
                    exercise.id,
                    defaults,
                  )
                }

                isPainful={getPainWarning(
                  exercise.id,
                )}
              />
            );
          },
        )}

        <div className="mt-8 border-t border-border pt-6">
          <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-white">
            Douleurs & gênes
          </h3>

          <div className="space-y-4 rounded-xl border border-border bg-card p-4">
            {painSliders.map(
              (area) => (
                <div
                  key={area}
                  className="flex items-center gap-4"
                >
                  <span className="w-1/3 text-sm text-muted-foreground">
                    {area}
                  </span>

                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={
                      painAreas[
                        area
                      ] ?? 0
                    }
                    onChange={(
                      event,
                    ) =>
                      setPainAreas(
                        (
                          previous,
                        ) => ({
                          ...previous,

                          [area]:
                            Number(
                              event
                                .target
                                .value,
                            ),
                        }),
                      )
                    }
                    className="flex-1 accent-white"
                  />

                  <span className="w-4 text-right font-mono text-xs">
                    {
                      painAreas[
                        area
                      ] ?? 0
                    }
                  </span>
                </div>
              ),
            )}
          </div>
        </div>

        <textarea
          className="min-h-[100px] w-full resize-none rounded-xl border border-border bg-card p-4 text-white"
          placeholder="Comment s’est passée la séance ?"
          value={note}
          onChange={(
            event,
          ) =>
            setNote(
              event.target.value,
            )
          }
        />
      </main>

      <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-background/90 p-4 pb-safe backdrop-blur-md">
        <button
          type="button"
          onClick={
            handleFinish
          }
          className="w-full rounded-xl bg-white py-4 text-lg font-bold text-black"
        >
          Terminer la séance
        </button>
      </div>
    </div>
  );
}