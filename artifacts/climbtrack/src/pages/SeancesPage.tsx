import { useMemo, useState } from "react";
import {
  Check,
  ChevronDown,
  ChevronRight,
  Clock3,
  Dumbbell,
  Flame,
  Mountain,
  Plus,
  RefreshCw,
  Sparkles,
  Timer,
  Trash2,
  X,
} from "lucide-react";
import { useLocation } from "wouter";

import { SESSIONS } from "@/data/sessions";
import { SessionCard } from "@/components/SessionCard";
import { useClimbTrack } from "@/context/ClimbTrackContext";
import type {
  ClimbingIntensity,
  KilterEntry,
  KilterResult,
  SessionLog,
} from "@/context/ClimbTrackContext";

import type {
  ClimbingColor,
} from "@/data/badges";
import { cn } from "@/lib/utils";
import {
  generateDailySuggestion,
  getTodayLocalDate,
} from "@/utils/dailySuggestion";
import type {
  DailyPreference,
  KilterPreset,
  SuggestedStep,
} from "@/utils/dailySuggestion";

type ManualType =
  | "session"
  | "climbing"
  | "kilter";
const CLIMBING_COLORS: {
  id: ClimbingColor;
  label: string;
  color: string;
  textColor?: string;
}[] = [
  {
    id: "rose",
    label: "Rose",
    color: "#EC4899",
  },
  {
    id: "jaune",
    label: "Jaune",
    color: "#FACC15",
    textColor: "#111111",
  },
  {
    id: "vert",
    label: "Vert",
    color: "#22C55E",
  },
  {
    id: "turquoise",
    label: "Turquoise",
    color: "#2DD4BF",
    textColor: "#111111",
  },
  {
    id: "bleu",
    label: "Bleu",
    color: "#3B82F6",
  },
  {
    id: "orange",
    label: "Orange",
    color: "#F97316",
  },
  {
    id: "rouge",
    label: "Rouge",
    color: "#EF4444",
  },
  {
    id: "noir",
    label: "Noir",
    color: "#171717",
  },
  {
    id: "blanc",
    label: "Blanc",
    color: "#F5F5F5",
    textColor: "#111111",
  },
];
type TodaySettings = {
  date: string;
  availableMinutes: number | null;
  preference: DailyPreference;
  variation: number;
};

const TODAY_SETTINGS_KEY =
  "climbtrack_today_settings";

const SUGGESTION_HISTORY_KEY =
  "climbtrack_suggestion_history";

function getLocalDate(): string {
  return getTodayLocalDate();
}

function getInitialTodaySettings(): TodaySettings {
  const today = getLocalDate();

  try {
    const saved =
      localStorage.getItem(
        TODAY_SETTINGS_KEY,
      );

    if (saved) {
      const parsed =
        JSON.parse(
          saved,
        ) as Partial<TodaySettings>;

      if (parsed.date === today) {
        return {
          date: today,

          availableMinutes:
            typeof parsed.availableMinutes ===
            "number"
              ? parsed.availableMinutes
              : null,

          preference:
            parsed.preference ??
            "unknown",

          variation:
            parsed.variation ??
            0,
        };
      }
    }
  } catch {
    // Valeurs par défaut.
  }

  return {
    date: today,
    availableMinutes: null,
    preference: "unknown",
    variation: 0,
  };
}

function getInitialSuggestionHistory(): string[] {
  try {
    const saved =
      localStorage.getItem(
        SUGGESTION_HISTORY_KEY,
      );

    if (!saved) {
      return [];
    }

    const parsed =
      JSON.parse(saved);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .filter(
        (value) =>
          typeof value ===
          "string",
      )
      .slice(-3);
  } catch {
    return [];
  }
}

function formatDuration(
  minutes: number,
): string {
  if (minutes <= 0) {
    return "Repos";
  }

  if (minutes < 60) {
    return `${minutes} min`;
  }

  const hours =
    Math.floor(
      minutes / 60,
    );

  const remaining =
    minutes % 60;

  return remaining === 0
    ? `${hours} h`
    : `${hours} h ${remaining}`;
}

function createKilterEntry(
  values?: Partial<KilterEntry>,
): KilterEntry {
  return {
    id:
      crypto.randomUUID(),

    angle:
      values?.angle ??
      30,

    grade:
      values?.grade ??
      1,

    result:
      values?.result ??
      "travaille",

    attempts:
      values?.attempts,

    durationMinutes:
      values?.durationMinutes ??
      10,
  };
}

function createEntriesFromPreset(
  preset?: KilterPreset,
): KilterEntry[] {
  if (!preset) {
    return [
      createKilterEntry(),
    ];
  }

  if (
    preset.minGrade ===
    preset.maxGrade
  ) {
    return [
      createKilterEntry({
        angle:
          preset.angle,

        grade:
          preset.minGrade,

        result:
          "travaille",

        durationMinutes:
          preset.durationMinutes,
      }),
    ];
  }

  const firstDuration =
    Math.max(
      5,
      Math.floor(
        preset.durationMinutes *
          0.6,
      ),
    );

  const secondDuration =
    Math.max(
      5,
      preset.durationMinutes -
        firstDuration,
    );

  return [
    createKilterEntry({
      angle:
        preset.angle,

      grade:
        preset.minGrade,

      result:
        "travaille",

      durationMinutes:
        firstDuration,
    }),

    createKilterEntry({
      angle:
        preset.angle,

      grade:
        preset.maxGrade,

      result:
        "travaille",

      durationMinutes:
        secondDuration,
    }),
  ];
}

function getStepIcon(
  step: SuggestedStep,
) {
  if (
    step.type ===
    "warmup"
  ) {
    return Flame;
  }

  if (
    step.type ===
      "kilter" ||
    step.type ===
      "climbing"
  ) {
    return Mountain;
  }

  if (
    step.type ===
    "full-session"
  ) {
    return Dumbbell;
  }

  if (
    step.type ===
    "abs"
  ) {
    return Timer;
  }

  if (
    step.type ===
    "flexibility"
  ) {
    return Sparkles;
  }

  return Check;
}

export function SeancesPage() {
  const [, setLocation] =
    useLocation();

  const {
    data,
    addSessionLog,
  } = useClimbTrack();

  const visibleSessions =
    SESSIONS.filter(
      (session) =>
        session.id !==
        "grimpe-libre",
    );

  const [
    todaySettings,
    setTodaySettings,
  ] = useState<TodaySettings>(
    getInitialTodaySettings,
  );

  const [
    recentSuggestionSignatures,
    setRecentSuggestionSignatures,
  ] = useState<string[]>(
    getInitialSuggestionHistory,
  );

  const [
    showTodayOptions,
    setShowTodayOptions,
  ] = useState(false);

  const [
    showAddSheet,
    setShowAddSheet,
  ] = useState(false);

  const [
    manualType,
    setManualType,
  ] =
    useState<ManualType>(
      "session",
    );

  const [
    selectedSessionId,
    setSelectedSessionId,
  ] = useState(
    visibleSessions[0]?.id ??
      "",
  );

  const [
    selectedDate,
    setSelectedDate,
  ] = useState(
    getLocalDate(),
  );

  const [
    note,
    setNote,
  ] = useState("");

  const [
    formError,
    setFormError,
  ] = useState("");

  const [
    climbingDuration,
    setClimbingDuration,
  ] = useState(90);

  const [
    climbingIntensity,
    setClimbingIntensity,
  ] =
    useState<ClimbingIntensity>(
      "moyen",
    );

  const [
    climbingColorsSucceeded,
    setClimbingColorsSucceeded,
  ] = useState<ClimbingColor[]>([]);

  const [
    kilterEntries,
    setKilterEntries,
  ] = useState<KilterEntry[]>([
    createKilterEntry(),
  ]);

  const suggestion =
    useMemo(
      () =>
        generateDailySuggestion({
          logs:
            data.sessionLogs,

          date:
            getLocalDate(),

          availableMinutes:
            todaySettings.availableMinutes,

          preference:
            todaySettings.preference,

          variation:
            todaySettings.variation,

          recentSuggestionSignatures,
        }),
      [
        data.sessionLogs,
        todaySettings,
        recentSuggestionSignatures,
      ],
    );

  function updateTodaySettings(
    update: Partial<TodaySettings>,
  ) {
    setTodaySettings(
      (previous) => {
        const next = {
          ...previous,
          ...update,
          date:
            getLocalDate(),
        };

        localStorage.setItem(
          TODAY_SETTINGS_KEY,
          JSON.stringify(next),
        );

        return next;
      },
    );
  }

  function rememberSuggestion(
    signature: string,
  ) {
    setRecentSuggestionSignatures(
      (previous) => {
        const next = [
          ...previous.filter(
            (item) =>
              item !== signature,
          ),
          signature,
        ].slice(-3);

        localStorage.setItem(
          SUGGESTION_HISTORY_KEY,
          JSON.stringify(next),
        );

        return next;
      },
    );
  }

  function refreshSuggestion() {
    rememberSuggestion(
      suggestion.signature,
    );

    updateTodaySettings({
      variation:
        todaySettings.variation +
        1,
    });
  }

  function closeSheet() {
    setShowAddSheet(false);
    setManualType("session");
    setSelectedDate(
      getLocalDate(),
    );
    setNote("");
    setFormError("");
    setClimbingDuration(90);
    setClimbingIntensity(
      "moyen",
    );
    setClimbingColorsSucceeded([]);
    setKilterEntries([
      createKilterEntry(),
    ]);
  }

  function openManual(
    type: ManualType,
  ) {
    setManualType(type);
    setSelectedDate(
      getLocalDate(),
    );
    setFormError("");
    setShowAddSheet(true);
  }

  function openKilterPreset(
    preset?: KilterPreset,
  ) {
    setManualType(
      "kilter",
    );

    setSelectedDate(
      getLocalDate(),
    );

    setFormError("");

    setKilterEntries(
      createEntriesFromPreset(
        preset,
      ),
    );

    setShowAddSheet(true);
  }

  function updateKilterEntry(
    id: string,
    update: Partial<KilterEntry>,
  ) {
    setFormError("");

    setKilterEntries(
      (previous) =>
        previous.map(
          (entry) =>
            entry.id === id
              ? {
                  ...entry,
                  ...update,
                }
              : entry,
        ),
    );
  }

  function handleManualAdd() {
    setFormError("");

    if (
      manualType ===
      "session"
    ) {
      const params =
        new URLSearchParams({
          date:
            selectedDate,

          manual:
            "true",
        });

      setShowAddSheet(
        false,
      );

      setLocation(
        `/seance/${selectedSessionId}?${params.toString()}`,
      );

      return;
    }

    if (
      manualType ===
      "climbing"
    ) {
      if (
        !Number.isFinite(
          climbingDuration,
        ) ||
        climbingDuration <
          15
      ) {
        setFormError(
          "Entre une durée d’au moins 15 minutes.",
        );

        return;
      }
    }

    if (
      manualType ===
      "kilter"
    ) {
      const validEntries =
        kilterEntries.filter(
          (entry) =>
            Number.isFinite(
              entry.angle,
            ) &&
            entry.angle >= 0 &&
            entry.angle <= 70 &&
            Number.isFinite(
              entry.grade,
            ) &&
            entry.grade >= 0 &&
            entry.grade <= 10 &&
            typeof entry.durationMinutes ===
              "number" &&
            entry.durationMinutes >
              0,
        );

      const totalDuration =
        validEntries.reduce(
          (
            total,
            entry,
          ) =>
            total +
            (
              entry.durationMinutes ??
              0
            ),
          0,
        );

      if (
        validEntries.length ===
          0 ||
        totalDuration <= 0
      ) {
        setFormError(
          "Aucune Kilter n’a été enregistrée. Ajoute au moins une partie avec une durée supérieure à 0 minute.",
        );

        return;
      }

      const log: SessionLog = {
        id:
          crypto.randomUUID(),

        date:
          selectedDate,

        sessionId:
          "kilter",

        exerciseLogs:
          [],

        note:
          note.trim() ||
          undefined,

        kilterEntries:
          validEntries,
      };

      addSessionLog(log);
      closeSheet();

      return;
    }

    const log: SessionLog = {
      id:
        crypto.randomUUID(),

      date:
        selectedDate,

      sessionId:
        "grimpe-libre",

      exerciseLogs:
        [],

      note:
        note.trim() ||
        undefined,

      climbingDurationMinutes:
        climbingDuration,

      climbingIntensity:
        climbingIntensity,
      climbingColorsSucceeded:
      climbingColorsSucceeded.length > 0
        ? climbingColorsSucceeded
        : undefined,
    };

    addSessionLog(log);
    closeSheet();
  }

  function openSuggestedStep(
    step: SuggestedStep,
  ) {
    if (
      step.type ===
      "climbing"
    ) {
      openManual(
        "climbing",
      );

      setClimbingDuration(
        step.durationMinutes,
      );

      return;
    }

    if (
      step.type ===
      "kilter"
    ) {
      openKilterPreset(
        step.kilterPreset,
      );

      return;
    }

    if (
      !step.sessionId
    ) {
      return;
    }

    const exerciseIds =
      step.exercises
        ?.map(
          (name) =>
            SESSIONS.flatMap(
              (session) =>
                session.exercises,
            ).find(
              (exercise) =>
                exercise.name ===
                name,
            ),
        )
        .filter(Boolean)
        .map(
          (exercise) =>
            exercise!.id,
        );

    const params =
      new URLSearchParams({
        date:
          getLocalDate(),

        suggested:
          "true",
      });

    if (
      step.finisherType
    ) {
      params.set(
        "finisherType",
        step.finisherType,
      );
    }

    if (
      exerciseIds?.length
    ) {
      params.set(
        "exerciseIds",
        exerciseIds.join(
          ",",
        ),
      );
    }

    setLocation(
      `/seance/${step.sessionId}?${params.toString()}`,
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24 pt-safe">
      <header className="sticky top-0 z-10 border-b border-border bg-background/95 px-5 py-6 backdrop-blur-md">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-white">
              Accueil
            </h1>

            <p className="mt-1 text-sm text-muted-foreground">
              Programme d’entraînement
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              setShowAddSheet(
                true,
              )
            }
            className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card text-white"
          >
            <Plus size={24} />
          </button>
        </div>
      </header>

      <main className="space-y-5 p-5">
        <section className="overflow-hidden rounded-2xl border border-white/15 bg-white/[0.04]">
          <div className="border-b border-white/10 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-muted-foreground">
                  Aujourd’hui
                </p>

                <h2 className="mt-1 text-xl font-extrabold text-white">
                  {
                    suggestion.title
                  }
                </h2>

                <p className="mt-1 text-xs text-muted-foreground">
                  {
                    suggestion.explanation
                  }
                </p>
              </div>

              <button
                type="button"
                onClick={
                  refreshSuggestion
                }
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10"
              >
                <RefreshCw
                  size={18}
                />
              </button>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <div className="flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-1.5">
                <Clock3
                  size={13}
                />

                <span className="text-xs font-bold">
                  Prévu :{" "}
                  {formatDuration(
                    suggestion.plannedMinutes,
                  )}
                </span>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowTodayOptions(
                    (
                      current,
                    ) =>
                      !current,
                  )
                }
                className="flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-1.5 text-xs font-bold"
              >
                {todaySettings.availableMinutes
                  ? `${todaySettings.availableMinutes} min disponibles`
                  : "Temps inconnu · 1 h 45"}

                <ChevronDown
                  size={14}
                />
              </button>
            </div>
          </div>

          {showTodayOptions && (
            <div className="space-y-4 border-b border-white/10 bg-black/20 p-4">
              <div>
                <label className="mb-2 block text-xs font-bold uppercase text-muted-foreground">
                  Temps disponible
                </label>

                <div className="grid grid-cols-[1fr_auto] gap-2">
                  <input
                    type="number"
                    min="20"
                    max="360"
                    step="5"
                    value={
                      todaySettings.availableMinutes ??
                      ""
                    }
                    onChange={(
                      event,
                    ) =>
                      updateTodaySettings(
                        {
                          availableMinutes:
                            event
                              .target
                              .value ===
                            ""
                              ? null
                              : Math.max(
                                  20,
                                  Number(
                                    event
                                      .target
                                      .value,
                                  ),
                                ),
                        },
                      )
                    }
                    placeholder="1 h 45 par défaut"
                    className="rounded-xl border border-border bg-card px-4 py-3 text-white"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      updateTodaySettings(
                        {
                          availableMinutes:
                            null,
                        },
                      )
                    }
                    className="rounded-xl border border-border px-3 text-xs font-bold"
                  >
                    Inconnu
                  </button>
                </div>
              </div>

              <select
                value={
                  todaySettings.preference
                }
                onChange={(
                  event,
                ) =>
                  updateTodaySettings(
                    {
                      preference:
                        event
                          .target
                          .value as DailyPreference,
                    },
                  )
                }
                className="w-full rounded-xl border border-border bg-card px-4 py-3 text-white"
              >
                <option value="unknown">
                  Je ne sais pas
                </option>

                <option value="climbing">
                  Grimpe
                </option>

                <option value="kilter">
                  Kilterboard
                </option>

                <option value="climbing+kilter">
                  Grimpe + Kilter
                </option>

                <option value="s1-force-doigts">
                  Force doigts
                </option>

                <option value="s2-resistance">
                  Résistance
                </option>

                <option value="s3-dos-epaules">
                  Dos / épaules
                </option>

                <option value="s6-jambes">
                  Jambes
                </option>

                <option value="s7-prevention">
                  Prévention
                </option>

                <option value="rest">
                  Repos
                </option>
              </select>
            </div>
          )}

          <div className="divide-y divide-white/10">
            {suggestion.steps.map(
              (
                step,
                index,
              ) => {
                const Icon =
                  getStepIcon(
                    step,
                  );

                const clickable =
                  Boolean(
                    step.sessionId,
                  ) ||
                  step.type ===
                    "climbing" ||
                  step.type ===
                    "kilter";

                return (
                  <button
                    key={
                      step.id
                    }
                    type="button"
                    disabled={
                      !clickable
                    }
                    onClick={() =>
                      openSuggestedStep(
                        step,
                      )
                    }
                    className={cn(
                      "flex w-full gap-3 p-4 text-left",
                      clickable &&
                        "hover:bg-white/[0.05]",
                    )}
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/15 text-xs font-bold">
                      {index +
                        1}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex gap-2">
                        <Icon
                          size={16}
                        />

                        <div>
                          <h3 className="font-bold text-white">
                            {
                              step.title
                            }
                          </h3>

                          {step.subtitle && (
                            <p className="text-xs text-white/65">
                              {
                                step.subtitle
                              }
                            </p>
                          )}
                        </div>
                      </div>

                      {step.description && (
                        <p className="mt-2 text-xs text-muted-foreground">
                          {
                            step.description
                          }
                        </p>
                      )}

                      {step.exercises && (
                        <div className="mt-2 space-y-1">
                          {step.exercises.map(
                            (
                              exercise,
                            ) => (
                              <p
                                key={
                                  exercise
                                }
                                className="text-xs text-white/75"
                              >
                                •{" "}
                                {
                                  exercise
                                }
                              </p>
                            ),
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-1 text-xs font-bold text-muted-foreground">
                      {formatDuration(
                        step.durationMinutes,
                      )}

                      {clickable && (
                        <ChevronRight
                          size={16}
                        />
                      )}
                    </div>
                  </button>
                );
              },
            )}
          </div>
        </section>

        <h2 className="text-lg font-extrabold text-white">
          Toutes les séances
        </h2>

        {visibleSessions.map(
          (session) => (
            <SessionCard
              key={
                session.id
              }
              session={
                session
              }
              onClick={() =>
                setLocation(
                  `/seance/${session.id}`,
                )
              }
            />
          ),
        )}
      </main>

      {showAddSheet && (
        <div className="fixed inset-0 z-[9999] flex items-end bg-black/75">
          <button
            type="button"
            className="absolute inset-0"
            onClick={
              closeSheet
            }
          />

          <div className="relative z-10 max-h-[95dvh] w-full overflow-y-auto rounded-t-3xl border-t border-border bg-background p-5 pb-10">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-extrabold">
                Ajouter une activité
              </h2>

              <button
                type="button"
                onClick={
                  closeSheet
                }
              >
                <X
                  size={22}
                />
              </button>
            </div>

            <div className="mb-5 grid grid-cols-3 gap-2">
              {[
                [
                  "session",
                  "Programme",
                ],
                [
                  "climbing",
                  "Grimpe",
                ],
                [
                  "kilter",
                  "Kilter",
                ],
              ].map(
                ([
                  id,
                  label,
                ]) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => {
                      setManualType(
                        id as ManualType,
                      );

                      setFormError(
                        "",
                      );
                    }}
                    className={cn(
                      "rounded-xl border p-3 text-sm font-bold",
                      manualType ===
                        id
                        ? "border-white bg-white text-black"
                        : "border-border bg-card",
                    )}
                  >
                    {label}
                  </button>
                ),
              )}
            </div>

            <label className="mb-5 block">
              <span className="mb-2 block text-xs font-bold uppercase text-muted-foreground">
                Date
              </span>

              <input
                type="date"
                value={
                  selectedDate
                }
                max={
                  getLocalDate()
                }
                onChange={(
                  event,
                ) =>
                  setSelectedDate(
                    event
                      .target
                      .value,
                  )
                }
                className="w-full rounded-xl border border-border bg-card px-4 py-3"
              />
            </label>

            {manualType ===
              "session" && (
              <select
                value={
                  selectedSessionId
                }
                onChange={(
                  event,
                ) =>
                  setSelectedSessionId(
                    event
                      .target
                      .value,
                  )
                }
                className="mb-5 w-full rounded-xl border border-border bg-card px-4 py-3"
              >
                {visibleSessions.map(
                  (session) => (
                    <option
                      key={
                        session.id
                      }
                      value={
                        session.id
                      }
                    >
                      {
                        session.name
                      }
                    </option>
                  ),
                )}
              </select>
            )}

            {manualType ===
              "climbing" && (
              <div className="mb-5 space-y-4">
                <label className="block">
                  <span className="mb-2 block text-xs font-bold uppercase text-muted-foreground">
                    Intensité
                  </span>

                  <div className="grid grid-cols-3 gap-2">
                    {(
                      [
                        "facile",
                        "moyen",
                        "dur",
                      ] as ClimbingIntensity[]
                    ).map(
                      (
                        intensity,
                      ) => (
                        <button
                          key={
                            intensity
                          }
                          type="button"
                          onClick={() =>
                            setClimbingIntensity(
                              intensity,
                            )
                          }
                          className={cn(
                            "rounded-xl border p-3 capitalize",
                            climbingIntensity ===
                              intensity
                              ? "border-white bg-white text-black"
                              : "border-border bg-card",
                          )}
                        >
                          {
                            intensity
                          }
                        </button>
                      ),
                    )}
                  </div>
                </label>

                <label className="block">
                  <span className="mb-2 block text-xs font-bold uppercase text-muted-foreground">
                    Durée en minutes
                  </span>

                  <input
                    type="number"
                    min="15"
                    step="5"
                    value={
                      climbingDuration
                    }
                    onChange={(
                      event,
                    ) =>
                      setClimbingDuration(
                        Number(
                          event
                            .target
                            .value,
                        ),
                      )
                    }
                    className="w-full rounded-xl border border-border bg-card px-4 py-3"
                  />
                </label>
                <div>
                  <span className="mb-2 block text-xs font-bold uppercase text-muted-foreground">
                    Couleurs réussies
                  </span>

                  <p className="mb-3 text-xs text-muted-foreground">
                    Sélectionne uniquement les couleurs où tu as réussi au moins un bloc.
                  </p>

                  <div className="grid grid-cols-3 gap-2">
                    {CLIMBING_COLORS.map(
                      (color) => {
                        const selected =
                          climbingColorsSucceeded.includes(
                            color.id,
                          );

                        return (
                          <button
                            key={color.id}
                            type="button"
                            onClick={() =>
                              setClimbingColorsSucceeded(
                                (previous) =>
                                  selected
                                    ? previous.filter(
                                        (item) =>
                                          item !== color.id,
                                      )
                                    : [
                                        ...previous,
                                        color.id,
                                      ],
                              )
                            }
                            className="rounded-xl border px-3 py-3 text-sm font-bold"
                            style={{
                              backgroundColor:
                                selected
                                  ? color.color
                                  : "transparent",

                              borderColor:
                                selected
                                  ? color.color
                                  : "rgba(255,255,255,0.15)",

                              color:
                                selected
                                  ? color.textColor ??
                                    "#FFFFFF"
                                  : "#FFFFFF",

                              boxShadow:
                                selected
                                  ? `0 0 16px ${color.color}66`
                                  : "none",
                            }}
                          >
                            {color.label}
                          </button>
                        );
                      },
                    )}
                  </div>
                </div>
              </div>
            )}

            {manualType ===
              "kilter" && (
              <div className="mb-5 space-y-3">
                {kilterEntries.map(
                  (
                    entry,
                    index,
                  ) => (
                    <div
                      key={
                        entry.id
                      }
                      className="space-y-4 rounded-xl border border-border bg-card p-4"
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold">
                          Partie{" "}
                          {index +
                            1}
                        </h3>

                        {kilterEntries.length >
                          1 && (
                          <button
                            type="button"
                            onClick={() =>
                              setKilterEntries(
                                (
                                  previous,
                                ) =>
                                  previous.filter(
                                    (
                                      item,
                                    ) =>
                                      item.id !==
                                      entry.id,
                                  ),
                              )
                            }
                          >
                            <Trash2
                              size={
                                17
                              }
                            />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <label className="block">
                          <span className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                            Angle (°)
                          </span>

                          <input
                            type="number"
                            min="0"
                            max="70"
                            step="5"
                            value={
                              entry.angle
                            }
                            onChange={(
                              event,
                            ) =>
                              updateKilterEntry(
                                entry.id,
                                {
                                  angle:
                                    Number(
                                      event
                                        .target
                                        .value,
                                    ),
                                },
                              )
                            }
                            className="w-full rounded-xl border border-border bg-background px-3 py-3"
                          />
                        </label>

                        <label className="block">
                          <span className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                            Niveau
                          </span>

                          <select
                            value={
                              entry.grade
                            }
                            onChange={(
                              event,
                            ) =>
                              updateKilterEntry(
                                entry.id,
                                {
                                  grade:
                                    Number(
                                      event
                                        .target
                                        .value,
                                    ),
                                },
                              )
                            }
                            className="w-full rounded-xl border border-border bg-background px-3 py-3"
                          >
                            {Array.from(
                              {
                                length:
                                  11,
                              },
                              (
                                _,
                                grade,
                              ) => (
                                <option
                                  key={
                                    grade
                                  }
                                  value={
                                    grade
                                  }
                                >
                                  V
                                  {
                                    grade
                                  }
                                </option>
                              ),
                            )}
                          </select>
                        </label>
                      </div>

                      <label className="block">
                        <span className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                          Résultat
                        </span>

                        <select
                          value={
                            entry.result
                          }
                          onChange={(
                            event,
                          ) =>
                            updateKilterEntry(
                              entry.id,
                              {
                                result:
                                  event
                                    .target
                                    .value as KilterResult,
                              },
                            )
                          }
                          className="w-full rounded-xl border border-border bg-background px-3 py-3"
                        >
                          <option value="reussi">
                            Réussi
                          </option>

                          <option value="travaille">
                            Travaillé
                          </option>

                          <option value="echoue">
                            Échoué
                          </option>
                        </select>
                      </label>

                      <div className="grid grid-cols-2 gap-3">
                        <label className="block">
                          <span className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                            Nombre d’essais
                          </span>

                          <input
                            type="number"
                            min="0"
                            value={
                              entry.attempts ??
                              ""
                            }
                            onChange={(
                              event,
                            ) =>
                              updateKilterEntry(
                                entry.id,
                                {
                                  attempts:
                                    event
                                      .target
                                      .value ===
                                    ""
                                      ? undefined
                                      : Number(
                                          event
                                            .target
                                            .value,
                                        ),
                                },
                              )
                            }
                            className="w-full rounded-xl border border-border bg-background px-3 py-3"
                          />
                        </label>

                        <label className="block">
                          <span className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                            Durée (min)
                          </span>

                          <input
                            type="number"
                            min="0"
                            value={
                              entry.durationMinutes ??
                              ""
                            }
                            onChange={(
                              event,
                            ) =>
                              updateKilterEntry(
                                entry.id,
                                {
                                  durationMinutes:
                                    event
                                      .target
                                      .value ===
                                    ""
                                      ? undefined
                                      : Number(
                                          event
                                            .target
                                            .value,
                                        ),
                                },
                              )
                            }
                            className="w-full rounded-xl border border-border bg-background px-3 py-3"
                          />
                        </label>
                      </div>
                    </div>
                  ),
                )}

                <button
                  type="button"
                  onClick={() =>
                    setKilterEntries(
                      (
                        previous,
                      ) => [
                        ...previous,
                        createKilterEntry(),
                      ],
                    )
                  }
                  className="w-full rounded-xl border border-dashed border-border py-3 text-sm font-bold"
                >
                  + Ajouter une partie
                </button>
              </div>
            )}

            {formError && (
              <div className="mb-4 rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-200">
                {formError}
              </div>
            )}

            <textarea
              value={
                note
              }
              onChange={(
                event,
              ) =>
                setNote(
                  event
                    .target
                    .value,
                )
              }
              placeholder="Note facultative"
              className="mb-5 min-h-24 w-full rounded-xl border border-border bg-card p-4"
            />

            <button
              type="button"
              onClick={
                handleManualAdd
              }
              className="w-full rounded-xl bg-white py-4 text-lg font-bold text-black"
            >
              {manualType ===
              "session"
                ? "Renseigner la séance"
                : "Enregistrer"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}