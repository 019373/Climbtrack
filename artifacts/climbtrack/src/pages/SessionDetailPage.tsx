import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  AlertTriangle,
  ArrowLeft,
  ClipboardList,
  Save,
} from "lucide-react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  useClimbTrack,
  type ExerciseDefaults,
  type ExerciseLog,
  type SessionLog,
} from "@/context/ClimbTrackContext";

import {
  SESSIONS,
  type ExerciseDef,
} from "@/data/sessions";

import {
  ExerciseRow,
} from "@/components/ExerciseRow";

import {
  getExercisesForSession,
} from "@/utils/exercises";

import {
  cn,
} from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function generateId(): string {
  if (
    typeof crypto !==
      "undefined" &&
    typeof crypto.randomUUID ===
      "function"
  ) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 9)}`;
}

function getLocalDateString(): string {
  const now =
    new Date();

  const offset =
    now.getTimezoneOffset() *
    60_000;

  return new Date(
    now.getTime() -
      offset,
  )
    .toISOString()
    .split("T")[0];
}

function createInitialExerciseLog(
  exercise: ExerciseDef,
  defaults:
    | ExerciseDefaults
    | undefined,
): ExerciseLog {
  const source =
    defaults ??
    exercise.defaultValues;

  const tracksJumps =
    exercise.id ===
      "sauts-prise" ||
    exercise.id ===
      "croise-dynamique-19-30";

  return {
    exerciseId:
      exercise.id,

    completed:
      false,

    sets:
      source.sets ?? 0,

    reps:
      source.reps,

    secondaryReps:
      source.secondaryReps,

    duration:
      source.duration,

    weight:
      source.weight,

    secondaryWeight:
      source.secondaryWeight,

    assistance:
      source.assistance,

    progressionValue:
      source.progressionValue,

    bandColor:
      source.bandColor,

    bandStretch:
      source.bandStretch,

    variant:
      exercise.variantOptions?.[0],

    leftHandJumps:
      tracksJumps
        ? source.reps
        : undefined,

    rightHandJumps:
      tracksJumps
        ? source.reps
        : undefined,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Blessures
// ─────────────────────────────────────────────────────────────────────────────

function normalizePainArea(
  value: string,
): string {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(
      /[\u0300-\u036f]/g,
      "",
    );
}

function exerciseMatchesInjury(
  exercise: ExerciseDef,
  injuryArea: string,
): boolean {
  const searchableText =
    normalizePainArea(
      `${exercise.name} ${exercise.description} ${exercise.category}`,
    );

  const area =
    normalizePainArea(
      injuryArea,
    );

  const mappings: {
    terms: string[];
    exerciseTerms: string[];
  }[] = [
    {
      terms: [
        "doigt",
        "doigts",
        "main",
        "poulie",
      ],

      exerciseTerms: [
        "suspension",
        "repeaters",
        "pince",
        "prise",
        "croise",
        "doigt",
      ],
    },

    {
      terms: [
        "poignet",
        "avant bras",
        "avant-bras",
      ],

      exerciseTerms: [
        "suspension",
        "pince",
        "poignet",
        "pronation",
        "supination",
        "traction",
      ],
    },

    {
      terms: [
        "coude",
        "biceps",
        "triceps",
      ],

      exerciseTerms: [
        "traction",
        "rowing",
        "lat pulldown",
        "triceps",
        "dips",
        "developpe",
      ],
    },

    {
      terms: [
        "epaule",
        "épaule",
        "coiffe",
      ],

      exerciseTerms: [
        "traction",
        "developpe",
        "face pull",
        "rotation",
        "scapular",
        "lat pulldown",
        "dips",
        "suspension",
      ],
    },

    {
      terms: [
        "pectoraux",
        "pectoral",
        "pec",
      ],

      exerciseTerms: [
        "developpe couche",
        "dips",
        "pompe",
      ],
    },

    {
      terms: [
        "dos",
        "lombaire",
        "rachis",
      ],

      exerciseTerms: [
        "rowing",
        "souleve",
        "superman",
        "gainage",
        "squat",
        "rotation",
      ],
    },

    {
      terms: [
        "hanche",
        "aine",
        "adducteur",
        "gracile",
      ],

      exerciseTerms: [
        "fente",
        "squat",
        "copenhagen",
        "papillon",
        "grenouille",
        "hanche",
      ],
    },

    {
      terms: [
        "ischio",
        "biceps femoral",
        "semi tendineux",
        "semi membraneux",
      ],

      exerciseTerms: [
        "souleve de terre",
        "pont",
        "ischios",
        "fente",
        "step-up",
      ],
    },

    {
      terms: [
        "genou",
      ],

      exerciseTerms: [
        "squat",
        "fente",
        "step-up",
        "quadriceps",
        "genou",
      ],
    },

    {
      terms: [
        "mollet",
        "cheville",
        "tibia",
        "tibial",
      ],

      exerciseTerms: [
        "mollet",
        "cheville",
        "tibialis",
        "equilibre",
        "step-up",
      ],
    },
  ];

  return mappings.some(
    (mapping) =>
      mapping.terms.some(
        (term) =>
          area.includes(
            normalizePainArea(
              term,
            ),
          ),
      ) &&
      mapping.exerciseTerms.some(
        (term) =>
          searchableText.includes(
            normalizePainArea(
              term,
            ),
          ),
      ),
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Zones de douleur
// ─────────────────────────────────────────────────────────────────────────────

const PAIN_AREAS = [
  "Doigts",

  "Poignet gauche",
  "Poignet droit",

  "Coude gauche",
  "Coude droit",

  "Épaule gauche",
  "Épaule droite",

  "Pectoral gauche",
  "Pectoral droit",

  "Haut du dos",
  "Bas du dos",

  "Hanche gauche",
  "Hanche droite",

  "Aine gauche",
  "Aine droite",

  "Ischio gauche",
  "Ischio droit",

  "Genou gauche",
  "Genou droit",

  "Mollet gauche",
  "Mollet droit",

  "Cheville gauche",
  "Cheville droite",
];

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

export function SessionDetailPage() {
  const {
    sessionId,
  } = useParams<{
    sessionId: string;
  }>();

  const navigate =
    useNavigate();

  const {
    data,
    addSessionLog,
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
    [
      sessionId,
    ],
  );

  const session =
    SESSIONS.find(
      (currentSession) =>
        currentSession.id ===
        sessionId,
    );

  const visibleExercises =
    useMemo(
      () => {
        if (
          !sessionId
        ) {
          return [];
        }

        return getExercisesForSession(
          sessionId,
          data,
        );
      },
      [
        sessionId,
        data,
      ],
    );

  const [
    exerciseLogs,
    setExerciseLogs,
  ] =
    useState<
      ExerciseLog[]
    >(() => {
      if (
        !sessionId
      ) {
        return [];
      }

      return getExercisesForSession(
        sessionId,
        data,
      ).map(
        (exercise) =>
          createInitialExerciseLog(
            exercise,
            data.exerciseDefaults[
              exercise.id
            ],
          ),
      );
    });

  useEffect(
    () => {
      setExerciseLogs(
        (previous) => {
          const previousById =
            new Map(
              previous.map(
                (log) => [
                  log.exerciseId,
                  log,
                ],
              ),
            );

          return visibleExercises.map(
            (exercise) =>
              previousById.get(
                exercise.id,
              ) ??
              createInitialExerciseLog(
                exercise,
                data.exerciseDefaults[
                  exercise.id
                ],
              ),
          );
        },
      );
    },
    [
      sessionId,
      visibleExercises,
      data.exerciseDefaults,
    ],
  );

  const [
    note,
    setNote,
  ] =
    useState("");

  const [
    pain,
    setPain,
  ] =
    useState<
      Record<string, number>
    >({});

  const [
    showPainSection,
    setShowPainSection,
  ] =
    useState(false);

  const activeInjuries =
    useMemo(
      () =>
        data.injuries.filter(
          (injury) =>
            injury.status !==
            "guerie",
        ),
      [
        data.injuries,
      ],
    );

  const painfulExerciseIds =
    useMemo(
      () => {
        const result =
          new Set<string>();

        visibleExercises.forEach(
          (exercise) => {
            const matches =
              activeInjuries.some(
                (injury) =>
                  exerciseMatchesInjury(
                    exercise,
                    injury.area,
                  ),
              );

            if (
              matches
            ) {
              result.add(
                exercise.id,
              );
            }
          },
        );

        return result;
      },
      [
        visibleExercises,
        activeInjuries,
      ],
    );

  if (
    !session
  ) {
    return (
      <div className="min-h-screen overflow-x-hidden bg-background p-5 pt-safe">
        <button
          type="button"
          onClick={() =>
            navigate(
              "/seances",
            )
          }
          className="mb-6 flex items-center gap-2 text-sm font-bold text-muted-foreground"
        >
          <ArrowLeft
            size={18}
          />

          Retour
        </button>

        <div className="rounded-2xl border border-border bg-card py-20 text-center">
          <ClipboardList
            size={42}
            className="mx-auto mb-4 text-muted-foreground/30"
          />

          <p className="font-bold text-muted-foreground">
            Séance introuvable.
          </p>
        </div>
      </div>
    );
  }

  const currentSession =
    session;

  function updateExerciseLog(
    exerciseId: string,
    updatedLog: ExerciseLog,
  ) {
    setExerciseLogs(
      (previous) =>
        previous.map(
          (log) =>
            log.exerciseId ===
            exerciseId
              ? updatedLog
              : log,
        ),
    );
  }

  function updatePain(
    area: string,
    value: number,
  ) {
    setPain(
      (previous) => ({
        ...previous,

        [area]:
          value,
      }),
    );
  }

  function saveSession() {
    const completedCount =
      exerciseLogs.filter(
        (log) =>
          log.completed,
      ).length;

    if (
      completedCount ===
      0
    ) {
      return;
    }

    const painEntries =
      Object.fromEntries(
        Object.entries(
          pain,
        ).filter(
          (
            [
              ,
              value,
            ],
          ) =>
            value >
            0,
        ),
      );

    const sessionLog:
      SessionLog = {
        id:
          generateId(),

        date:
          getLocalDateString(),

        completedAt:
          new Date().toISOString(),

        sessionId:
          currentSession.id,

        exerciseLogs:
          exerciseLogs.map(
            (log) => ({
              ...log,
            }),
          ),

        note:
          note.trim() ||
          undefined,

        pain:
          Object.keys(
            painEntries,
          ).length >
          0
            ? painEntries
            : undefined,
      };

    /*
     * Toute la logique suivante est maintenant
     * centralisée dans ClimbTrackContext :
     *
     * - apprentissage silencieux du poids ;
     * - détection de deux réussites consécutives ;
     * - augmentation automatique ;
     * - création de la flèche ↗ ;
     * - suppression de la flèche après réussite ;
     * - exclusion de Prévention.
     *
     * La page n'a donc plus à modifier elle-même
     * les valeurs par défaut.
     */
    addSessionLog(
      sessionLog,
    );

    navigate(
      "/historique",
    );
  }

  const completedCount =
    exerciseLogs.filter(
      (log) =>
        log.completed,
    ).length;

  const completionPercentage =
    exerciseLogs.length >
    0
      ? Math.round(
          (
            completedCount /
            exerciseLogs.length
          ) *
            100,
        )
      : 0;

  const painCount =
    Object.values(
      pain,
    ).filter(
      (value) =>
        value >
        0,
    ).length;

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-background pb-36 pt-safe">
      <header className="border-b border-border bg-background px-5 py-4">
        <div className="flex items-start gap-4">
          <button
            type="button"
            onClick={() =>
              navigate(
                "/seances",
              )
            }
            className="mt-0.5 flex-shrink-0 rounded-full border border-border p-2 text-muted-foreground active:scale-95"
            aria-label="Retour"
          >
            <ArrowLeft
              size={19}
            />
          </button>

          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-black leading-tight text-white">
              {
                currentSession.name
              }
            </h1>

            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              {
                currentSession.moment
              }
            </p>
          </div>
        </div>

        <div className="mt-4">
          <div className="mb-1.5 flex items-center justify-between text-xs font-bold">
            <span className="text-muted-foreground">
              {
                completedCount
              }{" "}
              sur{" "}
              {
                exerciseLogs.length
              }{" "}
              exercices
            </span>

            <span className="font-mono text-white">
              {
                completionPercentage
              }
              %
            </span>
          </div>

          <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-white transition-all duration-300"
              style={{
                width:
                  `${completionPercentage}%`,
              }}
            />
          </div>
        </div>
      </header>

      <main className="w-full space-y-6 overflow-x-hidden p-5">
        {activeInjuries.length >
          0 && (
          <section className="rounded-2xl border border-orange-500/30 bg-orange-500/10 p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle
                size={20}
                className="mt-0.5 flex-shrink-0 text-orange-400"
              />

              <div className="min-w-0">
                <h2 className="text-sm font-black text-orange-300">
                  Blessure active ou en amélioration
                </h2>

                <p className="mt-1 text-xs leading-relaxed text-orange-200/80">
                  Certains exercices sont signalés selon les zones enregistrées. Adapter ou arrêter l’exercice si la douleur augmente ou modifie le mouvement.
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                  {activeInjuries.map(
                    (injury) => (
                      <span
                        key={
                          injury.id
                        }
                        className="max-w-full rounded-full border border-orange-500/30 bg-background/40 px-3 py-1.5 text-xs font-bold text-orange-200"
                      >
                        {
                          injury.area
                        }{" "}
                        ·{" "}
                        {
                          injury.painLevel
                        }
                        /10
                      </span>
                    ),
                  )}
                </div>
              </div>
            </div>
          </section>
        )}

        {visibleExercises.length >
        0 ? (
          <section className="w-full space-y-3">
            {visibleExercises.map(
              (exercise) => {
                const log =
                  exerciseLogs.find(
                    (
                      currentLog,
                    ) =>
                      currentLog.exerciseId ===
                      exercise.id,
                  );

                if (
                  !log
                ) {
                  return null;
                }

                const hasPendingProgression =
                  Boolean(
                    data.pendingAutomaticProgressions[
                      exercise.id
                    ],
                  );

                return (
                  <ExerciseRow
                    key={
                      exercise.id
                    }
                    exercise={
                      exercise
                    }
                    defaults={
                      data.exerciseDefaults[
                        exercise.id
                      ] ??
                      exercise.defaultValues
                    }
                    log={
                      log
                    }
                    onChange={(
                      updatedLog,
                    ) =>
                      updateExerciseLog(
                        exercise.id,
                        updatedLog,
                      )
                    }
                    onUpdateDefault={() => {
                      /*
                       * Les changements effectués
                       * pendant la séance restent
                       * temporaires.
                       */
                    }}
                    isPainful={
                      painfulExerciseIds.has(
                        exercise.id,
                      )
                    }
                    showProgressionIncrease={
                      currentSession.id !==
                        "s7-prevention" &&
                      hasPendingProgression
                    }
                  />
                );
              },
            )}
          </section>
        ) : (
          <section className="rounded-2xl border border-border bg-card py-16 text-center">
            <ClipboardList
              size={38}
              className="mx-auto mb-3 text-muted-foreground/30"
            />

            <p className="font-bold text-muted-foreground">
              Aucun exercice visible.
            </p>

            <p className="mt-1 text-xs text-muted-foreground/70">
              Vérifier les exercices associés à cette séance dans les réglages.
            </p>
          </section>
        )}

        <section className="overflow-hidden rounded-2xl border border-border bg-card">
          <button
            type="button"
            onClick={() =>
              setShowPainSection(
                (previous) =>
                  !previous,
              )
            }
            className="flex w-full items-center justify-between gap-4 p-4 text-left active:bg-white/[0.03]"
          >
            <div className="min-w-0">
              <h2 className="text-sm font-black text-white">
                Douleur pendant la séance
              </h2>

              <p className="mt-1 text-xs text-muted-foreground">
                Ajouter une douleur ressentie pendant cet entraînement.
              </p>
            </div>

            <span className="flex-shrink-0 rounded-full border border-border bg-background px-3 py-1.5 font-mono text-xs text-muted-foreground">
              {
                painCount
              }{" "}
              zone
              {painCount >
              1
                ? "s"
                : ""}
            </span>
          </button>

          {showPainSection && (
            <div className="space-y-4 border-t border-border bg-[#151515] p-4">
              {PAIN_AREAS.map(
                (area) => {
                  const value =
                    pain[
                      area
                    ] ??
                    0;

                  return (
                    <div
                      key={
                        area
                      }
                      className="space-y-2"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <label className="text-sm font-bold text-white">
                          {
                            area
                          }
                        </label>

                        <span
                          className={cn(
                            "min-w-12 rounded-full px-2.5 py-1 text-center font-mono text-xs font-black",

                            value >=
                              7 &&
                              "bg-destructive/15 text-destructive",

                            value >=
                              4 &&
                              value <
                                7 &&
                              "bg-orange-500/15 text-orange-400",

                            value >
                              0 &&
                              value <
                                4 &&
                              "bg-white/10 text-white",

                            value ===
                              0 &&
                              "bg-background text-muted-foreground",
                          )}
                        >
                          {
                            value
                          }
                          /10
                        </span>
                      </div>

                      <input
                        type="range"
                        min="0"
                        max="10"
                        step="1"
                        value={
                          value
                        }
                        onChange={(
                          event,
                        ) =>
                          updatePain(
                            area,
                            Number.parseInt(
                              event.target.value,
                              10,
                            ),
                          )
                        }
                        className="w-full accent-white"
                      />
                    </div>
                  );
                },
              )}
            </div>
          )}
        </section>

        <section className="space-y-2">
          <label className="text-xs font-black uppercase tracking-wider text-muted-foreground">
            Ajouter une note
          </label>

          <textarea
            value={
              note
            }
            onChange={(
              event,
            ) =>
              setNote(
                event.target.value,
              )
            }
            placeholder="Noter les sensations, la forme, une douleur, un progrès ou une difficulté…"
            className="min-h-28 w-full resize-none rounded-2xl border border-border bg-card p-4 text-sm leading-relaxed text-white outline-none focus:border-white/40"
          />
        </section>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 px-5 pb-[calc(env(safe-area-inset-bottom)+16px)] pt-4 backdrop-blur-md">
        <button
          type="button"
          onClick={
            saveSession
          }
          disabled={
            completedCount ===
            0
          }
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-white py-4 text-sm font-black text-black transition-transform active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Save
            size={18}
          />

          Enregistrer la séance
        </button>
      </div>
    </div>
  );
}