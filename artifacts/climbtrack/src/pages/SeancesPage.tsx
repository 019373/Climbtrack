import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Activity,
  Check,
  ChevronDown,
  ChevronUp,
  Clock3,
  Mountain,
  Plus,
  RefreshCw,
  Route,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";

import {
  useNavigate,
} from "react-router-dom";

import {
  KILTER_FONT_GRADES,
  ROUTE_GRADES,
  fontGradeToV,
  getDefaultFontGradeForV,
  useClimbTrack,
} from "@/context/ClimbTrackContext";

import type {
  ClimbingIntensity,
  KilterEntry,
  KilterFontGrade,
  KilterGradeSystem,
  KilterResult,
  RouteClimbingEntry,
  RouteClimbingMode,
  RouteClimbingResult,
  RouteGrade,
  SessionLog,
} from "@/context/ClimbTrackContext";

import type {
  ClimbingColor,
} from "@/data/badges";

import {
  SESSIONS,
} from "@/data/sessions";

import {
  SessionCard,
} from "@/components/SessionCard";

import {
  generateDailySuggestion,
  getTodayLocalDate,
  REQUESTABLE_SESSION_IDS,
  type ClimbingPreference,
  type SuggestedStep,
  type SuggestionExerciseReference,
} from "@/utils/dailySuggestion";

import {
  getExercisesForSession,
} from "@/utils/exercises";

import {
  cn,
} from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type ManualType =
  | "climbing"
  | "kilter"
  | "route";

type ManualLogSheetProps = {
  initialType?: ManualType;
  onClose: () => void;
};

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const DEFAULT_TOTAL_TIME_MINUTES =
  90;

const CLIMBING_COLORS: {
  id: ClimbingColor;
  label: string;
  className: string;
}[] = [
  {
    id: "rose",
    label: "Rose",
    className:
      "border-pink-500 bg-pink-500 text-black",
  },

  {
    id: "jaune",
    label: "Jaune",
    className:
      "border-yellow-400 bg-yellow-400 text-black",
  },

  {
    id: "vert",
    label: "Vert",
    className:
      "border-green-500 bg-green-500 text-black",
  },

  {
    id: "turquoise",
    label: "Turquoise",
    className:
      "border-teal-400 bg-teal-400 text-black",
  },

  {
    id: "bleu",
    label: "Bleu",
    className:
      "border-blue-500 bg-blue-500 text-white",
  },

  {
    id: "orange",
    label: "Orange",
    className:
      "border-orange-500 bg-orange-500 text-black",
  },

  {
    id: "rouge",
    label: "Rouge",
    className:
      "border-red-500 bg-red-500 text-white",
  },

  {
    id: "noir",
    label: "Noir",
    className:
      "border-white/30 bg-black text-white",
  },

  {
    id: "blanc",
    label: "Blanc",
    className:
      "border-white bg-white text-black",
  },
];

const KILTER_ANGLES = [
  20,
  25,
  30,
  35,
  40,
  45,
  50,
  55,
  60,
  65,
  70,
];

const CLIMBING_PREFERENCE_OPTIONS: {
  value: ClimbingPreference;
  label: string;
}[] = [
  {
    value: "none",
    label: "Aucune",
  },

  {
    value: "climbing",
    label: "Grimpe",
  },

  {
    value: "kilter",
    label: "Kilter",
  },

  {
    value: "climbing+kilter",
    label: "Grimpe + Kilter",
  },
];

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

function parsePositiveInteger(
  value: string,
): number {
  const parsed =
    Number.parseInt(
      value,
      10,
    );

  if (
    !Number.isFinite(
      parsed,
    )
  ) {
    return 0;
  }

  return Math.max(
    0,
    parsed,
  );
}

function parseHoursAndMinutes(
  hoursText: string,
  minutesText: string,
): number | null {
  if (
    hoursText.trim() ===
      "" &&
    minutesText.trim() ===
      ""
  ) {
    return null;
  }

  const hours =
    hoursText.trim() ===
    ""
      ? 0
      : parsePositiveInteger(
          hoursText,
        );

  const minutes =
    minutesText.trim() ===
    ""
      ? 0
      : Math.min(
          59,
          parsePositiveInteger(
            minutesText,
          ),
        );

  return (
    hours * 60 +
    minutes
  );
}

function formatDuration(
  totalMinutes: number,
): string {
  if (
    totalMinutes <= 0
  ) {
    return "0 min";
  }

  if (
    totalMinutes < 60
  ) {
    return `${totalMinutes} min`;
  }

  const hours =
    Math.floor(
      totalMinutes / 60,
    );

  const minutes =
    totalMinutes % 60;

  if (
    minutes === 0
  ) {
    return `${hours} h`;
  }

  return `${hours} h ${minutes}`;
}

function createDefaultKilterEntry(
  previous?: KilterEntry,
): KilterEntry {
  const grade =
    previous?.grade ??
    0;

  const gradeSystem:
    KilterGradeSystem =
      previous?.gradeSystem ??
      "v";

  return {
    id:
      generateId(),

    angle:
      previous?.angle ??
      30,

    grade,

    gradeSystem,

    displayGrade:
      gradeSystem ===
      "font"
        ? getDefaultFontGradeForV(
            grade,
          )
        : `V${grade}`,

    result:
      "travaille",

    attempts:
      1,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Shared UI
// ─────────────────────────────────────────────────────────────────────────────

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-w-0 space-y-1.5">
      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
        {label}
      </label>

      {children}
    </div>
  );
}

function NumberInput({
  value,
  onChange,
  min = 0,
  step = 1,
  placeholder,
}: {
  value: number | "";
  onChange: (
    value: string,
  ) => void;
  min?: number;
  step?: number;
  placeholder?: string;
}) {
  return (
    <input
      type="number"
      value={value}
      min={min}
      step={step}
      inputMode="decimal"
      placeholder={placeholder}
      onChange={(
        event,
      ) =>
        onChange(
          event.target.value,
        )
      }
      className="w-full min-w-0 rounded-xl border border-border bg-card px-3 py-3 font-mono text-white outline-none focus:border-white/40"
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Kilter grade switch
// ─────────────────────────────────────────────────────────────────────────────

function KilterGradeSwitch({
  value,
  onChange,
}: {
  value: KilterGradeSystem;

  onChange: (
    value: KilterGradeSystem,
  ) => void;
}) {
  const isFont =
    value ===
    "font";

  return (
    <button
      type="button"
      onClick={() =>
        onChange(
          isFont
            ? "v"
            : "font",
        )
      }
      className="relative flex h-9 w-[92px] flex-shrink-0 items-center rounded-full border border-border bg-background p-1"
      aria-label={
        isFont
          ? "Utiliser les cotations V"
          : "Utiliser les cotations françaises"
      }
    >
      <span
        className={cn(
          "absolute left-1 top-1 h-7 w-[40px] rounded-full bg-white transition-transform duration-200 ease-out",

          isFont &&
            "translate-x-[42px]",
        )}
      />

      <span
        className={cn(
          "relative z-10 flex w-[40px] items-center justify-center text-[10px] font-black transition-colors",

          !isFont
            ? "text-black"
            : "text-muted-foreground",
        )}
      >
        V
      </span>

      <span
        className={cn(
          "relative z-10 flex w-[40px] items-center justify-center text-[10px] font-black transition-colors",

          isFont
            ? "text-black"
            : "text-muted-foreground",
        )}
      >
        Font
      </span>
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Manual log sheet
// ─────────────────────────────────────────────────────────────────────────────

function ManualLogSheet({
  initialType = "climbing",
  onClose,
}: ManualLogSheetProps) {
  const {
    addSessionLog,
  } =
    useClimbTrack();

  const [
    closeIconActive,
    setCloseIconActive,
  ] =
    useState(false);

  const [
    closing,
    setClosing,
  ] =
    useState(false);

  useEffect(
    () => {
      const frame =
        window.requestAnimationFrame(
          () => {
            setCloseIconActive(
              true,
            );
          },
        );

      return () => {
        window.cancelAnimationFrame(
          frame,
        );
      };
    },
    [],
  );

  function requestClose() {
    if (
      closing
    ) {
      return;
    }

    setClosing(
      true,
    );

    setCloseIconActive(
      false,
    );

    window.setTimeout(
      () => {
        onClose();
      },
      200,
    );
  }

  const [
    choice,
    setChoice,
  ] =
    useState<ManualType>(
      initialType,
    );

  const [
    date,
    setDate,
  ] =
    useState(
      getLocalDateString(),
    );

  const [
    note,
    setNote,
  ] =
    useState("");

  const [
    climbingDuration,
    setClimbingDuration,
  ] =
    useState<number | "">(
      "",
    );

  const [
    climbingIntensity,
    setClimbingIntensity,
  ] =
    useState<ClimbingIntensity>(
      "moyen",
    );

  const [
    climbingColors,
    setClimbingColors,
  ] =
    useState<
      ClimbingColor[]
    >([]);

  const [
    kilterDuration,
    setKilterDuration,
  ] =
    useState<number | "">(
      "",
    );

  const [
    kilterEntries,
    setKilterEntries,
  ] =
    useState<KilterEntry[]>([
      createDefaultKilterEntry(),
    ]);

  const [
    routeDuration,
    setRouteDuration,
  ] =
    useState<number | "">(
      "",
    );

  const [
    routeEntries,
    setRouteEntries,
  ] =
    useState<
      RouteClimbingEntry[]
    >([
      {
        id:
          generateId(),

        grade:
          "5a",

        mode:
          "moulinette",

        result:
          "travaille",

        attempts:
          1,
      },
    ]);

  function toggleClimbingColor(
    color: ClimbingColor,
  ) {
    setClimbingColors(
      (previous) =>
        previous.includes(
          color,
        )
          ? previous.filter(
              (current) =>
                current !==
                color,
            )
          : [
              ...previous,
              color,
            ],
    );
  }

  function updateKilterEntry(
    id: string,
    update: Partial<KilterEntry>,
  ) {
    setKilterEntries(
      (previous) =>
        previous.map(
          (entry) =>
            entry.id ===
            id
              ? {
                  ...entry,
                  ...update,
                }
              : entry,
        ),
    );
  }

  function changeKilterGradeSystem(
    entry: KilterEntry,
    gradeSystem: KilterGradeSystem,
  ) {
    if (
      gradeSystem ===
      "font"
    ) {
      const displayGrade =
        getDefaultFontGradeForV(
          entry.grade,
        );

      updateKilterEntry(
        entry.id,
        {
          gradeSystem:
            "font",

          displayGrade,
        },
      );

      return;
    }

    updateKilterEntry(
      entry.id,
      {
        gradeSystem:
          "v",

        displayGrade:
          `V${entry.grade}`,
      },
    );
  }

  function changeKilterVGrade(
    entry: KilterEntry,
    grade: number,
  ) {
    const normalized =
      Math.max(
        0,
        Math.min(
          17,
          Math.round(
            grade,
          ),
        ),
      );

    updateKilterEntry(
      entry.id,
      {
        grade:
          normalized,

        gradeSystem:
          "v",

        displayGrade:
          `V${normalized}`,
      },
    );
  }

  function changeKilterFontGrade(
    entry: KilterEntry,
    grade: KilterFontGrade,
  ) {
    updateKilterEntry(
      entry.id,
      {
        grade:
          fontGradeToV(
            grade,
          ),

        gradeSystem:
          "font",

        displayGrade:
          grade,
      },
    );
  }

  function addKilterEntry() {
    setKilterEntries(
      (previous) => [
        ...previous,

        createDefaultKilterEntry(
          previous[
            previous.length -
              1
          ],
        ),
      ],
    );
  }

  function deleteKilterEntry(
    id: string,
  ) {
    setKilterEntries(
      (previous) =>
        previous.length <=
        1
          ? previous
          : previous.filter(
              (entry) =>
                entry.id !==
                id,
            ),
    );
  }

  function updateRouteEntry(
    id: string,
    update: Partial<RouteClimbingEntry>,
  ) {
    setRouteEntries(
      (previous) =>
        previous.map(
          (entry) =>
            entry.id ===
            id
              ? {
                  ...entry,
                  ...update,
                }
              : entry,
        ),
    );
  }

  function addRouteEntry() {
    setRouteEntries(
      (previous) => [
        ...previous,

        {
          id:
            generateId(),

          grade:
            previous[
              previous.length -
                1
            ]?.grade ??
            "5a",

          mode:
            previous[
              previous.length -
                1
            ]?.mode ??
            "moulinette",

          result:
            "travaille",

          attempts:
            1,
        },
      ],
    );
  }

  function deleteRouteEntry(
    id: string,
  ) {
    setRouteEntries(
      (previous) =>
        previous.length <=
        1
          ? previous
          : previous.filter(
              (entry) =>
                entry.id !==
                id,
            ),
    );
  }

  function saveManualLog() {
    const baseLog: SessionLog = {
      id:
        generateId(),

      date,

      completedAt:
        new Date().toISOString(),

      sessionId:
        choice ===
        "climbing"
          ? "grimpe-libre"
          : choice ===
              "kilter"
            ? "kilter"
            : "route",

      exerciseLogs:
        [],

      note:
        note.trim() ||
        undefined,
    };

    if (
      choice ===
      "climbing"
    ) {
      addSessionLog({
        ...baseLog,

        climbingDurationMinutes:
          typeof climbingDuration ===
          "number"
            ? climbingDuration
            : undefined,

        climbingIntensity,

        climbingColorsSucceeded:
          climbingColors,
      });
    }

    if (
      choice ===
      "kilter"
    ) {
      addSessionLog({
        ...baseLog,

        kilterEntries:
          kilterEntries.map(
            (entry) => ({
              ...entry,

              gradeSystem:
                entry.gradeSystem ??
                "v",

              displayGrade:
                entry.displayGrade ??
                `V${entry.grade}`,
            }),
          ),

        climbingDurationMinutes:
          typeof kilterDuration ===
          "number"
            ? kilterDuration
            : undefined,
      });
    }

    if (
      choice ===
      "route"
    ) {
      addSessionLog({
        ...baseLog,

        routeClimbingDurationMinutes:
          typeof routeDuration ===
          "number"
            ? routeDuration
            : undefined,

        routeClimbingEntries:
          routeEntries,
      });
    }

    requestClose();
  }

  return (
    <div
      className="fixed inset-0 z-[100000] overflow-x-hidden bg-black/80 backdrop-blur-sm"
      onClick={
        requestClose
      }
    >
      <div
        className={cn(
          "absolute inset-x-0 bottom-0 max-h-[94dvh] overflow-x-hidden overflow-y-auto rounded-t-3xl border border-border bg-background pb-[calc(env(safe-area-inset-bottom)+24px)] transition-transform duration-200",

          closing &&
            "translate-y-1",
        )}
        onClick={(
          event,
        ) =>
          event.stopPropagation()
        }
      >
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-border bg-background/95 px-5 py-4 backdrop-blur-md">
          <div className="min-w-0">
            <h2 className="text-xl font-black text-white">
              Ajouter une séance
            </h2>

            <p className="mt-1 text-xs text-muted-foreground">
              Choisir le type de grimpe à enregistrer.
            </p>
          </div>

          <button
            type="button"
            onClick={
              requestClose
            }
            disabled={
              closing
            }
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-white text-black active:scale-90 disabled:pointer-events-none"
            aria-label="Fermer"
          >
            <Plus
              size={20}
              strokeWidth={3}
              className={cn(
                "transition-transform duration-200 ease-out",

                closeIconActive &&
                  "rotate-45",
              )}
            />
          </button>
        </div>

        <div className="w-full space-y-6 overflow-x-hidden p-5">
          <div className="grid grid-cols-3 gap-2">
            {[
              {
                id:
                  "climbing" as const,

                label:
                  "Bloc libre",

                icon:
                  Mountain,
              },

              {
                id:
                  "kilter" as const,

                label:
                  "Kilter",

                icon:
                  Activity,
              },

              {
                id:
                  "route" as const,

                label:
                  "Voie",

                icon:
                  Route,
              },
            ].map(
              (option) => {
                const Icon =
                  option.icon;

                const selected =
                  choice ===
                  option.id;

                return (
                  <button
                    key={
                      option.id
                    }
                    type="button"
                    onClick={() =>
                      setChoice(
                        option.id,
                      )
                    }
                    className={cn(
                      "flex min-w-0 flex-col items-center justify-center gap-2 rounded-xl border px-2 py-4 text-center transition-all active:scale-[0.98]",

                      selected
                        ? "border-white bg-white text-black"
                        : "border-border bg-card text-white",
                    )}
                  >
                    <Icon
                      size={20}
                    />

                    <span className="text-xs font-black">
                      {
                        option.label
                      }
                    </span>
                  </button>
                );
              },
            )}
          </div>

          <Field label="Date">
            <input
              type="date"
              value={
                date
              }
              onChange={(
                event,
              ) =>
                setDate(
                  event.target
                    .value,
                )
              }
              className="w-full min-w-0 rounded-xl border border-border bg-card px-3 py-3 text-white outline-none focus:border-white/40"
            />
          </Field>

          {choice ===
            "climbing" && (
            <>
              <Field label="Durée totale en minutes">
                <NumberInput
                  value={
                    climbingDuration
                  }
                  placeholder="Laisser vide"
                  onChange={(
                    value,
                  ) =>
                    setClimbingDuration(
                      value ===
                      ""
                        ? ""
                        : parsePositiveInteger(
                            value,
                          ),
                    )
                  }
                />
              </Field>

              <Field label="Choisir l’intensité">
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
                          "rounded-xl border py-3 text-sm font-black capitalize transition-all active:scale-[0.98]",

                          climbingIntensity ===
                            intensity
                            ? "border-white bg-white text-black"
                            : "border-border bg-card text-muted-foreground",
                        )}
                      >
                        {
                          intensity
                        }
                      </button>
                    ),
                  )}
                </div>
              </Field>

              <Field label="Sélectionner les couleurs réussies">
                <div className="grid grid-cols-3 gap-2">
                  {CLIMBING_COLORS.map(
                    (color) => {
                      const selected =
                        climbingColors.includes(
                          color.id,
                        );

                      return (
                        <button
                          key={
                            color.id
                          }
                          type="button"
                          onClick={() =>
                            toggleClimbingColor(
                              color.id,
                            )
                          }
                          className={cn(
                            "relative min-w-0 rounded-xl border py-3 text-sm font-black transition-all active:scale-[0.98]",

                            selected
                              ? color.className
                              : "border-border bg-card text-muted-foreground",
                          )}
                        >
                          {selected && (
                            <Check
                              size={13}
                              className="absolute right-1.5 top-1.5"
                            />
                          )}

                          {
                            color.label
                          }
                        </button>
                      );
                    },
                  )}
                </div>
              </Field>
            </>
          )}

          {choice ===
            "kilter" && (
            <>
              <Field label="Durée totale en minutes">
                <NumberInput
                  value={
                    kilterDuration
                  }
                  placeholder="Laisser vide"
                  onChange={(
                    value,
                  ) =>
                    setKilterDuration(
                      value ===
                      ""
                        ? ""
                        : parsePositiveInteger(
                            value,
                          ),
                    )
                  }
                />
              </Field>

              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="min-w-0 text-xs font-black uppercase tracking-wider text-muted-foreground">
                    Enregistrer les blocs tentés
                  </h3>

                  <button
                    type="button"
                    onClick={
                      addKilterEntry
                    }
                    className="flex flex-shrink-0 items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-bold text-white active:scale-95"
                  >
                    <Plus
                      size={14}
                    />

                    Ajouter
                  </button>
                </div>

                {kilterEntries.map(
                  (
                    entry,
                    index,
                  ) => {
                    const gradeSystem =
                      entry.gradeSystem ??
                      "v";

                    const fontGrade =
                      gradeSystem ===
                        "font" &&
                      entry.displayGrade &&
                      KILTER_FONT_GRADES.includes(
                        entry.displayGrade as KilterFontGrade,
                      )
                        ? (
                            entry.displayGrade as KilterFontGrade
                          )
                        : getDefaultFontGradeForV(
                            entry.grade,
                          );

                    return (
                      <div
                        key={
                          entry.id
                        }
                        className="w-full space-y-4 overflow-x-hidden rounded-2xl border border-border bg-card p-4"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-sm font-black text-white">
                            Bloc{" "}
                            {index +
                              1}
                          </span>

                          <div className="flex items-center gap-2">
                            <KilterGradeSwitch
                              value={
                                gradeSystem
                              }
                              onChange={(
                                nextSystem,
                              ) =>
                                changeKilterGradeSystem(
                                  entry,
                                  nextSystem,
                                )
                              }
                            />

                            <button
                              type="button"
                              onClick={() =>
                                deleteKilterEntry(
                                  entry.id,
                                )
                              }
                              disabled={
                                kilterEntries.length <=
                                1
                              }
                              className="rounded-lg p-2 text-muted-foreground disabled:opacity-30"
                              aria-label="Supprimer le bloc"
                            >
                              <Trash2
                                size={16}
                              />
                            </button>
                          </div>
                        </div>

                        <div className="grid min-w-0 grid-cols-2 gap-3">
                          <Field label="Cotation">
                            {gradeSystem ===
                            "v" ? (
                              <select
                                value={
                                  entry.grade
                                }
                                onChange={(
                                  event,
                                ) =>
                                  changeKilterVGrade(
                                    entry,
                                    Number.parseInt(
                                      event.target
                                        .value,
                                      10,
                                    ),
                                  )
                                }
                                className="w-full min-w-0 rounded-xl border border-border bg-background px-3 py-3 text-white"
                              >
                                {Array.from(
                                  {
                                    length:
                                      18,
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
                            ) : (
                              <select
                                value={
                                  fontGrade
                                }
                                onChange={(
                                  event,
                                ) =>
                                  changeKilterFontGrade(
                                    entry,
                                    event.target
                                      .value as KilterFontGrade,
                                  )
                                }
                                className="w-full min-w-0 rounded-xl border border-border bg-background px-3 py-3 text-white"
                              >
                                {KILTER_FONT_GRADES.map(
                                  (
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
                                      {
                                        grade
                                      }
                                    </option>
                                  ),
                                )}
                              </select>
                            )}
                          </Field>

                          <Field label="Inclinaison">
                            <select
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
                                      Number.parseInt(
                                        event.target
                                          .value,
                                        10,
                                      ),
                                  },
                                )
                              }
                              className="w-full min-w-0 rounded-xl border border-border bg-background px-3 py-3 text-white"
                            >
                              {KILTER_ANGLES.map(
                                (
                                  angle,
                                ) => (
                                  <option
                                    key={
                                      angle
                                    }
                                    value={
                                      angle
                                    }
                                  >
                                    {
                                      angle
                                    }
                                    °
                                  </option>
                                ),
                              )}
                            </select>
                          </Field>

                          <Field label="Résultat">
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
                                      event.target
                                        .value as KilterResult,
                                  },
                                )
                              }
                              className="w-full min-w-0 rounded-xl border border-border bg-background px-3 py-3 text-white"
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
                          </Field>

                          <Field label="Essais">
                            <NumberInput
                              value={
                                entry.attempts ??
                                1
                              }
                              min={1}
                              onChange={(
                                value,
                              ) =>
                                updateKilterEntry(
                                  entry.id,
                                  {
                                    attempts:
                                      Math.max(
                                        1,
                                        parsePositiveInteger(
                                          value,
                                        ),
                                      ),
                                  },
                                )
                              }
                            />
                          </Field>
                        </div>
                      </div>
                    );
                  },
                )}
              </div>
            </>
          )}

          {choice ===
            "route" && (
            <>
              <Field label="Durée totale en minutes">
                <NumberInput
                  value={
                    routeDuration
                  }
                  placeholder="Laisser vide"
                  onChange={(
                    value,
                  ) =>
                    setRouteDuration(
                      value ===
                      ""
                        ? ""
                        : parsePositiveInteger(
                            value,
                          ),
                    )
                  }
                />
              </Field>

              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                      Enregistrer les voies
                    </h3>

                    <p className="mt-1 text-xs text-muted-foreground">
                      Enregistrer chaque cotation séparément.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={
                      addRouteEntry
                    }
                    className="flex flex-shrink-0 items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-bold text-white active:scale-95"
                  >
                    <Plus
                      size={14}
                    />

                    Ajouter
                  </button>
                </div>

                {routeEntries.map(
                  (
                    entry,
                    index,
                  ) => (
                    <div
                      key={
                        entry.id
                      }
                      className="w-full space-y-3 overflow-x-hidden rounded-2xl border border-border bg-card p-4"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-sm font-black text-white">
                          Voie{" "}
                          {index +
                            1}
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            deleteRouteEntry(
                              entry.id,
                            )
                          }
                          disabled={
                            routeEntries.length <=
                            1
                          }
                          className="rounded-lg p-2 text-muted-foreground disabled:opacity-30"
                          aria-label="Supprimer la voie"
                        >
                          <Trash2
                            size={16}
                          />
                        </button>
                      </div>

                      <div className="grid min-w-0 grid-cols-2 gap-3">
                        <Field label="Cotation">
                          <select
                            value={
                              entry.grade
                            }
                            onChange={(
                              event,
                            ) =>
                              updateRouteEntry(
                                entry.id,
                                {
                                  grade:
                                    event.target
                                      .value as RouteGrade,
                                },
                              )
                            }
                            className="w-full min-w-0 rounded-xl border border-border bg-background px-3 py-3 text-white"
                          >
                            {ROUTE_GRADES.map(
                              (
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
                                  {
                                    grade
                                  }
                                </option>
                              ),
                            )}
                          </select>
                        </Field>

                        <Field label="Mode">
                          <select
                            value={
                              entry.mode
                            }
                            onChange={(
                              event,
                            ) =>
                              updateRouteEntry(
                                entry.id,
                                {
                                  mode:
                                    event.target
                                      .value as RouteClimbingMode,
                                },
                              )
                            }
                            className="w-full min-w-0 rounded-xl border border-border bg-background px-3 py-3 text-white"
                          >
                            <option value="moulinette">
                              Moulinette
                            </option>

                            <option value="tete">
                              En tête
                            </option>
                          </select>
                        </Field>

                        <Field label="Résultat">
                          <select
                            value={
                              entry.result
                            }
                            onChange={(
                              event,
                            ) =>
                              updateRouteEntry(
                                entry.id,
                                {
                                  result:
                                    event.target
                                      .value as RouteClimbingResult,
                                },
                              )
                            }
                            className="w-full min-w-0 rounded-xl border border-border bg-background px-3 py-3 text-white"
                          >
                            <option value="reussi">
                              Réussie
                            </option>

                            <option value="travaille">
                              Travaillée
                            </option>

                            <option value="echoue">
                              Échouée
                            </option>
                          </select>
                        </Field>

                        <Field label="Essais">
                          <NumberInput
                            value={
                              entry.attempts ??
                              1
                            }
                            min={1}
                            onChange={(
                              value,
                            ) =>
                              updateRouteEntry(
                                entry.id,
                                {
                                  attempts:
                                    Math.max(
                                      1,
                                      parsePositiveInteger(
                                        value,
                                      ),
                                    ),
                                },
                              )
                            }
                          />
                        </Field>
                      </div>

                      {entry.mode ===
                        "tete" &&
                        entry.result ===
                          "reussi" && (
                          <div className="rounded-xl border border-success/30 bg-success/10 px-3 py-2 text-xs text-success">
                            Cette réussite compte aussi comme une réussite en moulinette pour cette cotation.
                          </div>
                        )}
                    </div>
                  ),
                )}
              </div>
            </>
          )}

          <Field label="Ajouter une note">
            <textarea
              value={
                note
              }
              onChange={(
                event,
              ) =>
                setNote(
                  event.target
                    .value,
                )
              }
              placeholder="Noter les sensations, difficultés, douleurs ou progrès…"
              className="min-h-24 w-full min-w-0 resize-none rounded-xl border border-border bg-card px-3 py-3 text-sm text-white outline-none focus:border-white/40"
            />
          </Field>

          <button
            type="button"
            onClick={
              saveManualLog
            }
            disabled={
              closing
            }
            className="w-full rounded-xl bg-white py-4 text-sm font-black text-black active:scale-[0.99] disabled:opacity-60"
          >
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Daily suggestion
// ─────────────────────────────────────────────────────────────────────────────

function DailySuggestionCard({
  onOpenManual,
}: {
  onOpenManual: (
    type: ManualType,
  ) => void;
}) {
  const {
    data,
  } =
    useClimbTrack();

  const navigate =
    useNavigate();

  const [
    expanded,
    setExpanded,
  ] =
    useState(false);

  const [
    climbingPreference,
    setClimbingPreference,
  ] =
    useState<ClimbingPreference>(
      "none",
    );

  const [
    requestedSessionIds,
    setRequestedSessionIds,
  ] =
    useState<string[]>([]);

  const [
    availableHoursText,
    setAvailableHoursText,
  ] =
    useState("");

  const [
    availableMinutesText,
    setAvailableMinutesText,
  ] =
    useState("");

  const [
    variation,
    setVariation,
  ] =
    useState(0);

  const [
    rotating,
    setRotating,
  ] =
    useState(false);

  const requestableSessions =
    useMemo(
      () =>
        REQUESTABLE_SESSION_IDS
          .map(
            (sessionId) =>
              SESSIONS.find(
                (session) =>
                  session.id ===
                  sessionId,
              ),
          )
          .filter(
            (
              session,
            ): session is NonNullable<
              typeof session
            > =>
              Boolean(
                session,
              ),
          ),
      [],
    );

  const availableMinutes =
    useMemo(
      () =>
        parseHoursAndMinutes(
          availableHoursText,
          availableMinutesText,
        ),
      [
        availableHoursText,
        availableMinutesText,
      ],
    );

  const displayedTotalMinutes =
    availableMinutes ??
    DEFAULT_TOTAL_TIME_MINUTES;

  const customSessionExercises =
    useMemo(() => {
      const result: Record<
        string,
        SuggestionExerciseReference[]
      > = {};

      SESSIONS.forEach(
        (session) => {
          result[
            session.id
          ] =
            getExercisesForSession(
              session.id,
              data,
            ).map(
              (
                exercise,
              ) => ({
                id:
                  exercise.id,

                name:
                  exercise.name,
              }),
            );
        },
      );

      return result;
    }, [
      data,
    ]);

  const suggestion =
    useMemo(
      () =>
        generateDailySuggestion({
          logs:
            data.sessionLogs,

          injuries:
            data.injuries,

          date:
            getTodayLocalDate(),

          availableMinutes,

          preference:
            "unknown",

          climbingPreference,

          requestedSessionIds,

          customSessionExercises,

          recoveryExerciseData: {
            customExercises:
              data.customExercises,

            exerciseOverrides:
              data.exerciseOverrides,
          },

          variation,
        }),
      [
        data.sessionLogs,
        data.injuries,
        data.customExercises,
        data.exerciseOverrides,
        availableMinutes,
        climbingPreference,
        requestedSessionIds,
        customSessionExercises,
        variation,
      ],
    );

  function refreshSuggestion() {
    if (
      rotating
    ) {
      return;
    }

    setRotating(
      true,
    );

    setVariation(
      (previous) =>
        previous + 1,
    );

    window.setTimeout(
      () => {
        setRotating(
          false,
        );
      },
      1000,
    );
  }

  function setPrimarySession(
    sessionId: string,
  ) {
    if (
      sessionId === ""
    ) {
      setRequestedSessionIds(
        [],
      );

      return;
    }

    setRequestedSessionIds([
      sessionId,
    ]);
  }

  function updateRequestedSession(
    index: number,
    sessionId: string,
  ) {
    if (
      index === 0
    ) {
      setPrimarySession(
        sessionId,
      );

      return;
    }

    if (
      sessionId === ""
    ) {
      setRequestedSessionIds(
        (previous) =>
          previous.filter(
            (
              _,
              currentIndex,
            ) =>
              currentIndex !==
              index,
          ),
      );

      return;
    }

    setRequestedSessionIds(
      (previous) => {
        if (
          previous.some(
            (
              current,
              currentIndex,
            ) =>
              currentIndex !==
                index &&
              current ===
                sessionId,
          )
        ) {
          return previous;
        }

        return previous.map(
          (
            current,
            currentIndex,
          ) =>
            currentIndex ===
            index
              ? sessionId
              : current,
        );
      },
    );
  }

  function addRequestedSession() {
    const next =
      requestableSessions.find(
        (session) =>
          !requestedSessionIds.includes(
            session.id,
          ),
      );

    if (
      !next
    ) {
      return;
    }

    setRequestedSessionIds(
      (previous) => [
        ...previous,
        next.id,
      ],
    );
  }

  function removeRequestedSession(
    index: number,
  ) {
    setRequestedSessionIds(
      (previous) =>
        previous.filter(
          (
            _,
            currentIndex,
          ) =>
            currentIndex !==
            index,
        ),
    );
  }

  function openStep(
    step: SuggestedStep,
  ) {
    if (
      step.type ===
        "full-session" &&
      step.sessionId
    ) {
      navigate(
        `/seance/${step.sessionId}`,
      );

      return;
    }

    if (
      step.type ===
      "kilter"
    ) {
      onOpenManual(
        "kilter",
      );

      return;
    }

    if (
      step.type ===
      "climbing"
    ) {
      onOpenManual(
        "climbing",
      );

      return;
    }

    if (
      step.sessionId
    ) {
      navigate(
        `/seance/${step.sessionId}`,
      );
    }
  }

  const canAddMoreSessions =
    requestedSessionIds.length >
      0 &&
    requestedSessionIds.length <
      requestableSessions.length;

  return (
    <section className="w-full overflow-hidden rounded-2xl border border-border bg-card">
      <div className="flex items-center gap-3 p-4">
        <button
          type="button"
          onClick={() =>
            setExpanded(
              (previous) =>
                !previous,
            )
          }
          className="flex min-w-0 flex-1 items-center gap-3 text-left"
        >
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-white text-black">
            <Sparkles
              size={19}
            />
          </div>

          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-black text-white">
              Entraînement du jour
            </h2>

            <p className="truncate text-xs text-muted-foreground">
              {formatDuration(
                displayedTotalMinutes,
              )}
            </p>
          </div>

          {expanded ? (
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
        </button>

        <button
          type="button"
          onClick={
            refreshSuggestion
          }
          disabled={
            rotating
          }
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-border bg-background text-white active:scale-95 disabled:opacity-70"
          aria-label="Régénérer la proposition"
        >
          <RefreshCw
            size={17}
            className={cn(
              "transition-transform",

              rotating &&
                "animate-spin",
            )}
          />
        </button>
      </div>

      {expanded && (
        <div className="w-full space-y-5 overflow-x-hidden border-t border-border p-4">
          <Field label="Temps disponible">
            <div className="grid grid-cols-2 gap-2">
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  inputMode="numeric"
                  value={
                    availableHoursText
                  }
                  onChange={(
                    event,
                  ) => {
                    const value =
                      event.target
                        .value;

                    setAvailableHoursText(
                      value ===
                        ""
                        ? ""
                        : String(
                            Math.max(
                              0,
                              parsePositiveInteger(
                                value,
                              ),
                            ),
                          ),
                    );
                  }}
                  placeholder="0"
                  className="w-full rounded-xl border border-border bg-background px-3 py-3 pr-10 font-mono text-white outline-none focus:border-white/40"
                />

                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">
                  h
                </span>
              </div>

              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="59"
                  inputMode="numeric"
                  value={
                    availableMinutesText
                  }
                  onChange={(
                    event,
                  ) => {
                    const value =
                      event.target
                        .value;

                    setAvailableMinutesText(
                      value ===
                        ""
                        ? ""
                        : String(
                            Math.min(
                              59,
                              Math.max(
                                0,
                                parsePositiveInteger(
                                  value,
                                ),
                              ),
                            ),
                          ),
                    );
                  }}
                  placeholder="00"
                  className="w-full rounded-xl border border-border bg-background px-3 py-3 pr-12 font-mono text-white outline-none focus:border-white/40"
                />

                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">
                  min
                </span>
              </div>
            </div>

            <p className="text-[11px] leading-relaxed text-muted-foreground/70">
              10 min sont automatiquement gardées pour la transition après l’entraînement.
            </p>
          </Field>

          <Field label="Envie de grimper">
            <select
              value={
                climbingPreference
              }
              onChange={(
                event,
              ) =>
                setClimbingPreference(
                  event.target
                    .value as ClimbingPreference,
                )
              }
              className="w-full min-w-0 rounded-xl border border-border bg-background px-3 py-3 text-white"
            >
              {CLIMBING_PREFERENCE_OPTIONS.map(
                (option) => (
                  <option
                    key={
                      option.value
                    }
                    value={
                      option.value
                    }
                  >
                    {
                      option.label
                    }
                  </option>
                ),
              )}
            </select>
          </Field>

          <Field label="Envie de faire une séance">
            <div className="space-y-2">
              <select
                value={
                  requestedSessionIds[
                    0
                  ] ?? ""
                }
                onChange={(
                  event,
                ) =>
                  setPrimarySession(
                    event.target
                      .value,
                  )
                }
                className="w-full min-w-0 rounded-xl border border-border bg-background px-3 py-3 text-white"
              >
                <option value="">
                  Aucune
                </option>

                {requestableSessions.map(
                  (
                    session,
                  ) => (
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

              {requestedSessionIds
                .slice(1)
                .map(
                  (
                    sessionId,
                    offset,
                  ) => {
                    const index =
                      offset + 1;

                    return (
                      <div
                        key={`${index}-${sessionId}`}
                        className="flex min-w-0 gap-2"
                      >
                        <select
                          value={
                            sessionId
                          }
                          onChange={(
                            event,
                          ) =>
                            updateRequestedSession(
                              index,
                              event.target
                                .value,
                            )
                          }
                          className="min-w-0 flex-1 rounded-xl border border-border bg-background px-3 py-3 text-white"
                        >
                          {requestableSessions.map(
                            (
                              session,
                            ) => (
                              <option
                                key={
                                  session.id
                                }
                                value={
                                  session.id
                                }
                                disabled={
                                  requestedSessionIds.some(
                                    (
                                      current,
                                      currentIndex,
                                    ) =>
                                      currentIndex !==
                                        index &&
                                      current ===
                                        session.id,
                                  )
                                }
                              >
                                {
                                  session.name
                                }
                              </option>
                            ),
                          )}
                        </select>

                        <button
                          type="button"
                          onClick={() =>
                            removeRequestedSession(
                              index,
                            )
                          }
                          className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl border border-border bg-background text-muted-foreground active:scale-95"
                          aria-label="Retirer cette séance"
                        >
                          <X
                            size={17}
                          />
                        </button>
                      </div>
                    );
                  },
                )}

              {canAddMoreSessions && (
                <button
                  type="button"
                  onClick={
                    addRequestedSession
                  }
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-background px-3 py-3 text-sm font-bold text-white active:scale-[0.99]"
                >
                  <Plus
                    size={16}
                  />

                  Ajouter une séance
                </button>
              )}
            </div>
          </Field>

          <div className="min-w-0">
            <h3 className="text-base font-black text-white">
              {
                suggestion.title
              }
            </h3>

            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              {
                suggestion.explanation
              }
            </p>
          </div>

          <div className="space-y-2">
            {suggestion.steps.map(
              (step) => {
                const clickable =
                  step.type ===
                    "full-session" ||
                  step.type ===
                    "climbing" ||
                  step.type ===
                    "kilter" ||
                  Boolean(
                    step.sessionId,
                  );

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
                      openStep(
                        step,
                      )
                    }
                    className={cn(
                      "w-full min-w-0 overflow-hidden rounded-xl border border-border bg-background p-3 text-left",

                      clickable &&
                        "transition-transform active:scale-[0.99]",

                      !clickable &&
                        "cursor-default",
                    )}
                  >
                    <div className="flex min-w-0 items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="break-words text-sm font-black text-white">
                          {
                            step.title
                          }
                        </p>

                        {step.subtitle && (
                          <p className="mt-0.5 break-words text-xs text-muted-foreground">
                            {
                              step.subtitle
                            }
                          </p>
                        )}
                      </div>

                      {step.durationMinutes >
                        0 && (
                        <span className="flex-shrink-0 rounded-full bg-white/10 px-2.5 py-1 font-mono text-xs text-white">
                          {formatDuration(
                            step.durationMinutes,
                          )}
                        </span>
                      )}
                    </div>

                    {step.description && (
                      <p className="mt-2 break-words text-xs leading-relaxed text-muted-foreground">
                        {
                          step.description
                        }
                      </p>
                    )}

                    {step.exercises &&
                      step.exercises.length >
                        0 && (
                        <div className="mt-2 space-y-1">
                          {step.exercises.map(
                            (
                              exercise,
                              index,
                            ) => (
                              <p
                                key={`${exercise}-${index}`}
                                className="break-words text-xs text-white/75"
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

                    {step.warning && (
                      <p className="mt-2 break-words text-xs font-bold leading-relaxed text-orange-300">
                        {
                          step.warning
                        }
                      </p>
                    )}
                  </button>
                );
              },
            )}
          </div>
        </div>
      )}
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

export function SeancesPage() {
  const navigate =
    useNavigate();

  const [
    manualSheetType,
    setManualSheetType,
  ] =
    useState<
      ManualType | null
    >(
      null,
    );

  const programmedSessions =
    useMemo(
      () =>
        SESSIONS.filter(
          (session) =>
            session.exercises.length >
            0,
        ),
      [],
    );

  function openManualSheet(
    type: ManualType,
  ) {
    setManualSheetType(
      type,
    );
  }

  function toggleAddSheet() {
    if (
      manualSheetType
    ) {
      setManualSheetType(
        null,
      );

      return;
    }

    setManualSheetType(
      "climbing",
    );
  }

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-background pb-28 pt-safe">
      <header className="border-b border-border px-5 py-6">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            Séances
          </h1>

          <button
            type="button"
            onClick={
              toggleAddSheet
            }
            className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-white text-black shadow-lg active:scale-90"
            aria-label={
              manualSheetType
                ? "Fermer"
                : "Ajouter une séance"
            }
          >
            <Plus
              size={22}
              strokeWidth={3}
              className={cn(
                "transition-transform duration-200 ease-out",

                manualSheetType &&
                  "rotate-45",
              )}
            />
          </button>
        </div>
      </header>

      <main className="w-full space-y-6 overflow-x-hidden p-5">
        <DailySuggestionCard
          onOpenManual={
            openManualSheet
          }
        />

        <section className="w-full space-y-3">
          <div className="flex items-center gap-2">
            <Clock3
              size={17}
              className="text-muted-foreground"
            />

            <h2 className="text-xs font-black uppercase tracking-[0.16em] text-muted-foreground">
              Programmes
            </h2>
          </div>

          {programmedSessions.map(
            (session) => (
              <SessionCard
                key={
                  session.id
                }
                session={
                  session
                }
                onClick={() =>
                  navigate(
                    `/seance/${session.id}`,
                  )
                }
              />
            ),
          )}
        </section>
      </main>

      {manualSheetType && (
        <ManualLogSheet
          initialType={
            manualSheetType
          }
          onClose={() =>
            setManualSheetType(
              null,
            )
          }
        />
      )}
    </div>
  );
}