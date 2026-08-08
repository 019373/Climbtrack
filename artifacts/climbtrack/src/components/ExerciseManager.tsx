import {
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  createPortal,
} from "react-dom";

import {
  ArrowDown,
  ArrowUp,
  Check,
  ChevronDown,
  ChevronRight,
  FolderPlus,
  Pencil,
  Plus,
  RotateCcw,
  Trash2,
  X,
} from "lucide-react";

import {
  useClimbTrack,
} from "@/context/ClimbTrackContext";

import type {
  ExerciseDefaults,
  ResistanceBandColor,
} from "@/context/ClimbTrackContext";

import {
  ASSISTANCE_OPTIONS,
  RESISTANCE_BAND_OPTIONS,
  SESSIONS,
} from "@/data/sessions";

import type {
  ExerciseDef,
  TrackingType,
} from "@/data/sessions";

import {
  BUILTIN_CATEGORIES,
  TRACKING_LABELS,
  TRACKING_TYPES,
  getAllCategories,
  getAllManagedExercises,
  getExerciseSessionIds,
  isExerciseHidden,
} from "@/utils/exercises";

import {
  useToast,
} from "@/hooks/use-toast";

import {
  cn,
} from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────────────────
// Exercices de base
// ─────────────────────────────────────────────────────────────────────────────

const BUILTIN_IDS =
  new Set(
    SESSIONS.flatMap(
      (session) =>
        session.exercises.map(
          (exercise) =>
            exercise.id,
        ),
    ),
  );

function isBuiltin(
  exerciseId: string,
): boolean {
  return BUILTIN_IDS.has(
    exerciseId,
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Assistance
// ─────────────────────────────────────────────────────────────────────────────

const DEFAULT_ASSISTANCE =
  ASSISTANCE_OPTIONS[5] ??
  ASSISTANCE_OPTIONS[0] ??
  "Sans assistance";

// ─────────────────────────────────────────────────────────────────────────────
// Champs selon le type de suivi
// ─────────────────────────────────────────────────────────────────────────────

type TrackingFields = {
  reps: boolean;
  secondaryReps: boolean;
  duration: boolean;
  weight: boolean;
  secondaryWeight: boolean;
  assistance: boolean;
  band: boolean;
  variant: boolean;
};

const TRACKING_HAS: Record<
  TrackingType,
  TrackingFields
> = {
  "duration+assistance": {
    reps: false,
    secondaryReps: false,
    duration: true,
    weight: false,
    secondaryWeight: false,
    assistance: true,
    band: false,
    variant: false,
  },

  reps: {
    reps: true,
    secondaryReps: false,
    duration: false,
    weight: false,
    secondaryWeight: false,
    assistance: false,
    band: false,
    variant: false,
  },

  weight: {
    reps: false,
    secondaryReps: false,
    duration: false,
    weight: true,
    secondaryWeight: false,
    assistance: false,
    band: false,
    variant: false,
  },

  "weight+duration": {
    reps: false,
    secondaryReps: false,
    duration: true,
    weight: true,
    secondaryWeight: false,
    assistance: false,
    band: false,
    variant: false,
  },

  assistance: {
    reps: true,
    secondaryReps: false,
    duration: true,
    weight: false,
    secondaryWeight: false,
    assistance: true,
    band: false,
    variant: false,
  },

  "weight+reps": {
    reps: true,
    secondaryReps: false,
    duration: false,
    weight: true,
    secondaryWeight: false,
    assistance: false,
    band: false,
    variant: false,
  },

  duration: {
    reps: false,
    secondaryReps: false,
    duration: true,
    weight: false,
    secondaryWeight: false,
    assistance: false,
    band: false,
    variant: false,
  },

  none: {
    reps: false,
    secondaryReps: false,
    duration: false,
    weight: false,
    secondaryWeight: false,
    assistance: false,
    band: false,
    variant: false,
  },

  "dual-reps+dual-weight": {
    reps: true,
    secondaryReps: true,
    duration: false,
    weight: true,
    secondaryWeight: true,
    assistance: false,
    band: false,
    variant: false,
  },

  "dual-reps+weight": {
    reps: true,
    secondaryReps: true,
    duration: false,
    weight: true,
    secondaryWeight: false,
    assistance: false,
    band: false,
    variant: false,
  },

  "duration+band": {
    reps: false,
    secondaryReps: false,
    duration: true,
    weight: false,
    secondaryWeight: false,
    assistance: false,
    band: true,
    variant: false,
  },

  "reps+duration": {
    reps: true,
    secondaryReps: false,
    duration: true,
    weight: false,
    secondaryWeight: false,
    assistance: false,
    band: false,
    variant: false,
  },

  "weight+reps+duration": {
    reps: true,
    secondaryReps: false,
    duration: true,
    weight: true,
    secondaryWeight: false,
    assistance: false,
    band: false,
    variant: false,
  },

  "variant+weight+duration": {
    reps: false,
    secondaryReps: false,
    duration: true,
    weight: true,
    secondaryWeight: false,
    assistance: false,
    band: false,
    variant: true,
  },

  "variant+reps": {
    reps: true,
    secondaryReps: false,
    duration: false,
    weight: false,
    secondaryWeight: false,
    assistance: false,
    band: false,
    variant: true,
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// État d'édition
// ─────────────────────────────────────────────────────────────────────────────

type EditState = {
  id: string | null;

  name: string;
  description: string;
  category: string;
  tracking: TrackingType;
  sessionIds: string[];

  sets: number;
  reps: number;
  secondaryReps: number;
  duration: number;
  weight: number;
  secondaryWeight: number;
  restSeconds: number;

  assistance: string;

  progressionValue: number;

  bandColor: ResistanceBandColor;
  bandStretch: number;

  variantOptionsText: string;

  isHangboard: boolean;
  totalWeight: boolean;
  perSide: boolean;

  primaryRepsLabel: string;
  secondaryRepsLabel: string;
  primaryWeightLabel: string;
  secondaryWeightLabel: string;
};

function createEmptyEdit(
  category = "",
): EditState {
  return {
    id: null,

    name: "",
    description: "",
    category,
    tracking: "reps",
    sessionIds: [],

    sets: 3,
    reps: 8,
    secondaryReps: 8,
    duration: 30,
    weight: 0,
    secondaryWeight: 0,
    restSeconds: 90,

    assistance:
      DEFAULT_ASSISTANCE,

    progressionValue: 0,

    bandColor: "orange",
    bandStretch: 0,

    variantOptionsText: "",

    isHangboard: false,
    totalWeight: false,
    perSide: false,

    primaryRepsLabel: "",
    secondaryRepsLabel: "",
    primaryWeightLabel: "",
    secondaryWeightLabel: "",
  };
}

function exerciseToEditState(
  exercise: ExerciseDef,
  data: ReturnType<
    typeof useClimbTrack
  >["data"],
): EditState {
  const defaults =
    data.exerciseDefaults[
      exercise.id
    ] ??
    exercise.defaultValues;

  return {
    id:
      exercise.id,

    name:
      exercise.name,

    description:
      exercise.description,

    category:
      exercise.category,

    tracking:
      exercise.tracking,

    sessionIds:
      getExerciseSessionIds(
        exercise.id,
        data,
      ),

    sets:
      defaults.sets ??
      3,

    reps:
      defaults.reps ??
      8,

    secondaryReps:
      defaults.secondaryReps ??
      8,

    duration:
      defaults.duration ??
      30,

    weight:
      defaults.weight ??
      0,

    secondaryWeight:
      defaults.secondaryWeight ??
      0,

    restSeconds:
      defaults.restSeconds ??
      90,

    assistance:
      defaults.assistance ??
      DEFAULT_ASSISTANCE,

    progressionValue:
      defaults.progressionValue ??
      0,

    bandColor:
      defaults.bandColor ??
      "orange",

    bandStretch:
      defaults.bandStretch ??
      0,

    variantOptionsText:
      (
        exercise.variantOptions ??
        []
      ).join("\n"),

    isHangboard:
      exercise.isHangboard ??
      false,

    totalWeight:
      exercise.totalWeight ??
      false,

    perSide:
      exercise.perSide ??
      false,

    primaryRepsLabel:
      exercise.primaryRepsLabel ??
      "",

    secondaryRepsLabel:
      exercise.secondaryRepsLabel ??
      "",

    primaryWeightLabel:
      exercise.primaryWeightLabel ??
      "",

    secondaryWeightLabel:
      exercise.secondaryWeightLabel ??
      "",
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function parseNumber(
  value: string,
): number {
  if (
    value.trim() ===
    ""
  ) {
    return 0;
  }

  const parsed =
    Number.parseFloat(
      value.replace(
        ",",
        ".",
      ),
    );

  return Number.isFinite(
    parsed,
  )
    ? Math.max(
        0,
        parsed,
      )
    : 0;
}

function formatNumber(
  value: number,
): string {
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

function getDefaultsSummary(
  exercise: ExerciseDef,
  data: ReturnType<
    typeof useClimbTrack
  >["data"],
): string {
  const defaults =
    data.exerciseDefaults[
      exercise.id
    ] ??
    exercise.defaultValues;

  const parts:
    string[] = [];

  parts.push(
    `${defaults.sets} série${
      defaults.sets >
      1
        ? "s"
        : ""
    }`,
  );

  if (
    typeof defaults.reps ===
    "number"
  ) {
    if (
      typeof defaults.secondaryReps ===
      "number"
    ) {
      parts.push(
        `${defaults.reps} + ${defaults.secondaryReps} reps`,
      );
    } else {
      parts.push(
        `${defaults.reps} reps`,
      );
    }
  }

  if (
    typeof defaults.duration ===
    "number"
  ) {
    parts.push(
      `${formatNumber(
        defaults.duration,
      )} s`,
    );
  }

  if (
    typeof defaults.weight ===
    "number"
  ) {
    if (
      typeof defaults.secondaryWeight ===
      "number"
    ) {
      parts.push(
        `${formatNumber(
          defaults.weight,
        )} + ${formatNumber(
          defaults.secondaryWeight,
        )} kg`,
      );
    } else {
      parts.push(
        `${formatNumber(
          defaults.weight,
        )} kg`,
      );
    }
  }

  if (
    typeof defaults.progressionValue ===
    "number"
  ) {
    if (
      exercise.id ===
      "suspension-slopers"
    ) {
      parts.push(
        `${formatNumber(
          defaults.progressionValue,
        )}°`,
      );
    } else {
      parts.push(
        `progression ${formatNumber(
          defaults.progressionValue,
        )}`,
      );
    }
  }

  if (
    defaults.assistance
  ) {
    parts.push(
      defaults.assistance,
    );
  }

  if (
    defaults.bandColor
  ) {
    parts.push(
      `élastique ${defaults.bandColor}`,
    );
  }

  if (
    defaults.restSeconds >
    0
  ) {
    parts.push(
      `repos ${defaults.restSeconds} s`,
    );
  }

  return parts.join(
    " · ",
  );
}

function shouldShowProgressionValue(
  state: EditState,
): boolean {
  return (
    state.progressionValue >
      0 ||
    state.id ===
      "suspension-slopers" ||
    state.id ===
      "croise-dynamique-19-30"
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Shared fields
// ─────────────────────────────────────────────────────────────────────────────

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
        {label}
      </label>

      {children}
    </div>
  );
}

function TextInput({
  value,
  onChange,
  type = "text",
  min,
  step,
  placeholder,
}: {
  value: string | number;

  onChange: (
    value: string,
  ) => void;

  type?: string;
  min?: number;
  step?: number;
  placeholder?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      min={min}
      step={step}
      placeholder={placeholder}
      onChange={(
        event,
      ) =>
        onChange(
          event.target.value,
        )
      }
      className="w-full rounded-xl border border-border bg-card px-3 py-3 text-sm text-white outline-none placeholder:text-muted-foreground/50 focus:border-white/40"
    />
  );
}

function ToggleRow({
  selected,
  label,
  onClick,
}: {
  selected: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={
        onClick
      }
      className={cn(
        "flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-left",

        selected
          ? "border-white bg-white text-black"
          : "border-border bg-card text-white",
      )}
    >
      <span
        className={cn(
          "flex h-5 w-5 flex-shrink-0 items-center justify-center rounded border",

          selected
            ? "border-black bg-black"
            : "border-border",
        )}
      >
        {selected && (
          <Check
            size={12}
            className="text-white"
          />
        )}
      </span>

      <span className="text-sm font-bold">
        {label}
      </span>
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Modal
// ─────────────────────────────────────────────────────────────────────────────

function ExerciseEditModal({
  state,
  categories,
  onChange,
  onSave,
  onClose,
}: {
  state: EditState;
  categories: string[];

  onChange: (
    state: EditState,
  ) => void;

  onSave: () => void;
  onClose: () => void;
}) {
  const fields =
    TRACKING_HAS[
      state.tracking
    ];

  function update<
    K extends keyof EditState,
  >(
    key: K,
    value: EditState[K],
  ) {
    onChange({
      ...state,
      [key]:
        value,
    });
  }

  function toggleSession(
    sessionId: string,
  ) {
    update(
      "sessionIds",

      state.sessionIds.includes(
        sessionId,
      )
        ? state.sessionIds.filter(
            (id) =>
              id !==
              sessionId,
          )
        : [
            ...state.sessionIds,
            sessionId,
          ],
    );
  }

  return createPortal(
    <div className="fixed inset-0 z-[100000] bg-black/80 backdrop-blur-sm">
      <div className="flex h-[100dvh] flex-col bg-background pt-safe">
        <header className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
          <div>
            <h2 className="text-xl font-black text-white">
              {state.id
                ? "Modifier l’exercice"
                : "Ajouter un exercice"}
            </h2>

            <p className="mt-1 text-xs text-muted-foreground">
              Modifier les propriétés et les valeurs proposées par défaut.
            </p>
          </div>

          <button
            type="button"
            onClick={
              onClose
            }
            className="rounded-full border border-border p-2 text-muted-foreground"
            aria-label="Fermer"
          >
            <X
              size={18}
            />
          </button>
        </header>

        <div className="flex-1 space-y-5 overflow-y-auto p-5 pb-32">
          {state.id && (
            <div className="rounded-xl border border-border bg-card/50 px-3 py-2">
              <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                Identifiant conservé
              </p>

              <p className="mt-1 break-all font-mono text-xs text-white">
                {state.id}
              </p>

              <p className="mt-1 text-[10px] leading-relaxed text-muted-foreground">
                Modifier l’exercice ne change jamais cet identifiant afin de conserver tout l’historique.
              </p>
            </div>
          )}

          <Field label="Nom">
            <TextInput
              value={
                state.name
              }
              onChange={(
                value,
              ) =>
                update(
                  "name",
                  value,
                )
              }
            />
          </Field>

          <Field label="Description">
            <textarea
              value={
                state.description
              }
              onChange={(
                event,
              ) =>
                update(
                  "description",
                  event.target.value,
                )
              }
              className="min-h-24 w-full resize-none rounded-xl border border-border bg-card px-3 py-3 text-sm text-white outline-none focus:border-white/40"
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Catégorie">
              <select
                value={
                  state.category
                }
                onChange={(
                  event,
                ) =>
                  update(
                    "category",
                    event.target.value,
                  )
                }
                className="w-full rounded-xl border border-border bg-card px-3 py-3 text-sm text-white"
              >
                {categories.map(
                  (
                    category,
                  ) => (
                    <option
                      key={
                        category
                      }
                      value={
                        category
                      }
                    >
                      {
                        category
                      }
                    </option>
                  ),
                )}
              </select>
            </Field>

            <Field label="Type de suivi">
              <select
                value={
                  state.tracking
                }
                onChange={(
                  event,
                ) =>
                  update(
                    "tracking",
                    event.target
                      .value as TrackingType,
                  )
                }
                className="w-full rounded-xl border border-border bg-card px-3 py-3 text-sm text-white"
              >
                {TRACKING_TYPES.map(
                  (
                    tracking,
                  ) => (
                    <option
                      key={
                        tracking
                      }
                      value={
                        tracking
                      }
                    >
                      {
                        TRACKING_LABELS[
                          tracking
                        ]
                      }
                    </option>
                  ),
                )}
              </select>
            </Field>
          </div>

          <section className="space-y-4 rounded-2xl border border-border bg-card/40 p-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground">
              Valeurs par défaut
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Séries">
                <TextInput
                  type="number"
                  min={0}
                  step={1}
                  value={
                    state.sets
                  }
                  onChange={(
                    value,
                  ) =>
                    update(
                      "sets",
                      parseNumber(
                        value,
                      ),
                    )
                  }
                />
              </Field>

              <Field label="Repos (s)">
                <TextInput
                  type="number"
                  min={0}
                  step={1}
                  value={
                    state.restSeconds
                  }
                  onChange={(
                    value,
                  ) =>
                    update(
                      "restSeconds",
                      parseNumber(
                        value,
                      ),
                    )
                  }
                />
              </Field>

              {fields.reps && (
                <Field label="Répétitions">
                  <TextInput
                    type="number"
                    min={0}
                    step={1}
                    value={
                      state.reps
                    }
                    onChange={(
                      value,
                    ) =>
                      update(
                        "reps",
                        parseNumber(
                          value,
                        ),
                      )
                    }
                  />
                </Field>
              )}

              {fields.secondaryReps && (
                <Field label="Deuxièmes répétitions">
                  <TextInput
                    type="number"
                    min={0}
                    step={1}
                    value={
                      state.secondaryReps
                    }
                    onChange={(
                      value,
                    ) =>
                      update(
                        "secondaryReps",
                        parseNumber(
                          value,
                        ),
                      )
                    }
                  />
                </Field>
              )}

              {fields.duration && (
                <Field label="Durée (s)">
                  <TextInput
                    type="number"
                    min={0}
                    step={1}
                    value={
                      state.duration
                    }
                    onChange={(
                      value,
                    ) =>
                      update(
                        "duration",
                        parseNumber(
                          value,
                        ),
                      )
                    }
                  />
                </Field>
              )}

              {fields.weight && (
                <Field label="Charge (kg)">
                  <TextInput
                    type="number"
                    min={0}
                    step={0.25}
                    value={
                      state.weight
                    }
                    onChange={(
                      value,
                    ) =>
                      update(
                        "weight",
                        parseNumber(
                          value,
                        ),
                      )
                    }
                  />
                </Field>
              )}

              {fields.secondaryWeight && (
                <Field label="Deuxième charge (kg)">
                  <TextInput
                    type="number"
                    min={0}
                    step={0.25}
                    value={
                      state.secondaryWeight
                    }
                    onChange={(
                      value,
                    ) =>
                      update(
                        "secondaryWeight",
                        parseNumber(
                          value,
                        ),
                      )
                    }
                  />
                </Field>
              )}

              {shouldShowProgressionValue(
                state,
              ) && (
                <Field
                  label={
                    state.id ===
                    "suspension-slopers"
                      ? "Angle par défaut (°)"
                      : "Valeur de progression"
                  }
                >
                  <TextInput
                    type="number"
                    min={0}
                    step={1}
                    value={
                      state.progressionValue
                    }
                    onChange={(
                      value,
                    ) =>
                      update(
                        "progressionValue",
                        parseNumber(
                          value,
                        ),
                      )
                    }
                  />
                </Field>
              )}
            </div>

            {fields.assistance && (
              <Field label="Assistance">
                <select
                  value={
                    state.assistance
                  }
                  onChange={(
                    event,
                  ) =>
                    update(
                      "assistance",
                      event.target.value,
                    )
                  }
                  className="w-full rounded-xl border border-border bg-card px-3 py-3 text-sm text-white"
                >
                  {ASSISTANCE_OPTIONS.map(
                    (
                      option,
                    ) => (
                      <option
                        key={
                          option
                        }
                        value={
                          option
                        }
                      >
                        {
                          option
                        }
                      </option>
                    ),
                  )}
                </select>
              </Field>
            )}

            {fields.band && (
              <div className="grid grid-cols-2 gap-3">
                <Field label="Élastique">
                  <select
                    value={
                      state.bandColor
                    }
                    onChange={(
                      event,
                    ) =>
                      update(
                        "bandColor",
                        event.target
                          .value as ResistanceBandColor,
                      )
                    }
                    className="w-full rounded-xl border border-border bg-card px-3 py-3 text-sm text-white"
                  >
                    {RESISTANCE_BAND_OPTIONS.map(
                      (
                        band,
                      ) => (
                        <option
                          key={
                            band.id
                          }
                          value={
                            band.id
                          }
                        >
                          {
                            band.label
                          }
                        </option>
                      ),
                    )}
                  </select>
                </Field>

                <Field label="Étirement">
                  <TextInput
                    type="number"
                    min={0}
                    step={0.25}
                    value={
                      state.bandStretch
                    }
                    onChange={(
                      value,
                    ) =>
                      update(
                        "bandStretch",
                        parseNumber(
                          value,
                        ),
                      )
                    }
                  />
                </Field>
              </div>
            )}
          </section>

          {fields.variant && (
            <Field label="Variantes — une par ligne">
              <textarea
                value={
                  state.variantOptionsText
                }
                onChange={(
                  event,
                ) =>
                  update(
                    "variantOptionsText",
                    event.target.value,
                  )
                }
                className="min-h-28 w-full resize-none rounded-xl border border-border bg-card px-3 py-3 text-sm text-white"
              />
            </Field>
          )}

          {fields.secondaryReps && (
            <div className="grid grid-cols-2 gap-3">
              <Field label="Nom reps 1">
                <TextInput
                  value={
                    state.primaryRepsLabel
                  }
                  onChange={(
                    value,
                  ) =>
                    update(
                      "primaryRepsLabel",
                      value,
                    )
                  }
                />
              </Field>

              <Field label="Nom reps 2">
                <TextInput
                  value={
                    state.secondaryRepsLabel
                  }
                  onChange={(
                    value,
                  ) =>
                    update(
                      "secondaryRepsLabel",
                      value,
                    )
                  }
                />
              </Field>
            </div>
          )}

          {fields.weight && (
            <Field label="Nom du champ de charge">
              <TextInput
                value={
                  state.primaryWeightLabel
                }
                onChange={(
                  value,
                ) =>
                  update(
                    "primaryWeightLabel",
                    value,
                  )
                }
              />
            </Field>
          )}

          {fields.secondaryWeight && (
            <Field label="Nom de la deuxième charge">
              <TextInput
                value={
                  state.secondaryWeightLabel
                }
                onChange={(
                  value,
                ) =>
                  update(
                    "secondaryWeightLabel",
                    value,
                  )
                }
              />
            </Field>
          )}

          <section className="space-y-2">
            <ToggleRow
              selected={
                state.totalWeight
              }
              label="Utiliser une charge totale"
              onClick={() =>
                update(
                  "totalWeight",
                  !state.totalWeight,
                )
              }
            />

            <ToggleRow
              selected={
                state.perSide
              }
              label="Réaliser de chaque côté"
              onClick={() =>
                update(
                  "perSide",
                  !state.perSide,
                )
              }
            />

            <ToggleRow
              selected={
                state.isHangboard
              }
              label="Utiliser le hangboard"
              onClick={() =>
                update(
                  "isHangboard",
                  !state.isHangboard,
                )
              }
            />
          </section>

          <Field label="Afficher dans les séances">
            <div className="space-y-2">
              {SESSIONS.filter(
                (session) =>
                  session.id !==
                  "grimpe-libre",
              ).map(
                (
                  session,
                ) => {
                  const selected =
                    state.sessionIds.includes(
                      session.id,
                    );

                  return (
                    <button
                      key={
                        session.id
                      }
                      type="button"
                      onClick={() =>
                        toggleSession(
                          session.id,
                        )
                      }
                      className="flex w-full items-center gap-3 rounded-xl border border-border bg-card px-3 py-3 text-left"
                    >
                      <span
                        className={cn(
                          "flex h-5 w-5 items-center justify-center rounded border",

                          selected
                            ? "border-white bg-white"
                            : "border-border",
                        )}
                      >
                        {selected && (
                          <Check
                            size={12}
                            className="text-black"
                          />
                        )}
                      </span>

                      <span className="text-sm text-white">
                        {
                          session.name
                        }
                      </span>
                    </button>
                  );
                },
              )}
            </div>
          </Field>
        </div>

        <footer className="flex gap-3 border-t border-border bg-background px-5 py-4 pb-[calc(env(safe-area-inset-bottom)+16px)]">
          <button
            type="button"
            onClick={
              onClose
            }
            className="flex-1 rounded-xl border border-border py-3 text-sm font-bold text-muted-foreground"
          >
            Annuler
          </button>

          <button
            type="button"
            onClick={
              onSave
            }
            disabled={
              !state.name.trim() ||
              !state.category.trim()
            }
            className="flex-1 rounded-xl bg-white py-3 text-sm font-black text-black disabled:opacity-40"
          >
            Enregistrer
          </button>
        </footer>
      </div>
    </div>,
    document.body,
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────

export function ExerciseManager() {
  const {
    data,

    addExercise,
    deleteExercise,
    restoreExercise,

    updateExerciseOverride,
    updateExerciseDefault,

    setExerciseCategoryOrder,

    addCategory,
    renameCategory,
    deleteCategory,
  } =
    useClimbTrack();

  const {
    toast,
  } =
    useToast();

  const categories =
    useMemo(
      () =>
        getAllCategories(
          data,
        ),
      [
        data,
      ],
    );

  const allExercises =
    useMemo(
      () =>
        getAllManagedExercises(
          data,
        ),
      [
        data,
      ],
    );

  const [
    collapsedCategories,
    setCollapsedCategories,
  ] =
    useState<
      Record<
        string,
        boolean
      >
    >({});

  const [
    editState,
    setEditState,
  ] =
    useState<EditState | null>(
      null,
    );

  const [
    addingCategory,
    setAddingCategory,
  ] =
    useState(
      false,
    );

  const [
    newCategoryName,
    setNewCategoryName,
  ] =
    useState("");

  function getExercisesByCategory(
    category: string,
  ): ExerciseDef[] {
    const exercises =
      allExercises.filter(
        (exercise) =>
          exercise.category ===
          category,
      );

    const savedOrder =
      data.exerciseCategoryOrder[
        category
      ];

    if (
      !savedOrder ||
      savedOrder.length ===
        0
    ) {
      return exercises;
    }

    const ordered =
      savedOrder
        .map(
          (
            exerciseId,
          ) =>
            exercises.find(
              (
                exercise,
              ) =>
                exercise.id ===
                exerciseId,
            ),
        )
        .filter(
          (
            exercise,
          ): exercise is ExerciseDef =>
            Boolean(
              exercise,
            ),
        );

    const remaining =
      exercises.filter(
        (exercise) =>
          !savedOrder.includes(
            exercise.id,
          ),
      );

    return [
      ...ordered,
      ...remaining,
    ];
  }

  function moveExercise(
    category: string,
    exerciseId: string,
    direction: -1 | 1,
  ) {
    const exercises =
      getExercisesByCategory(
        category,
      ).filter(
        (exercise) =>
          !isExerciseHidden(
            exercise.id,
            data,
          ),
      );

    const currentIndex =
      exercises.findIndex(
        (exercise) =>
          exercise.id ===
          exerciseId,
      );

    const nextIndex =
      currentIndex +
      direction;

    if (
      currentIndex < 0 ||
      nextIndex < 0 ||
      nextIndex >=
        exercises.length
    ) {
      return;
    }

    const orderedIds =
      exercises.map(
        (exercise) =>
          exercise.id,
      );

    [
      orderedIds[
        currentIndex
      ],
      orderedIds[
        nextIndex
      ],
    ] = [
      orderedIds[
        nextIndex
      ],
      orderedIds[
        currentIndex
      ],
    ];

    setExerciseCategoryOrder(
      category,
      orderedIds,
    );
  }

  function saveExercise() {
    if (
      !editState
    ) {
      return;
    }

    const fields =
      TRACKING_HAS[
        editState.tracking
      ];

    const defaults: ExerciseDefaults =
      {
        sets:
          editState.sets,

        restSeconds:
          editState.restSeconds,

        ...(fields.reps
          ? {
              reps:
                editState.reps,
            }
          : {}),

        ...(fields.secondaryReps
          ? {
              secondaryReps:
                editState.secondaryReps,
            }
          : {}),

        ...(fields.duration
          ? {
              duration:
                editState.duration,
            }
          : {}),

        ...(fields.weight
          ? {
              weight:
                editState.weight,
            }
          : {}),

        ...(fields.secondaryWeight
          ? {
              secondaryWeight:
                editState.secondaryWeight,
            }
          : {}),

        ...(fields.assistance
          ? {
              assistance:
                editState.assistance,
            }
          : {}),

        ...(fields.band
          ? {
              bandColor:
                editState.bandColor,

              bandStretch:
                editState.bandStretch,
            }
          : {}),

        ...(shouldShowProgressionValue(
          editState,
        )
          ? {
              progressionValue:
                editState.progressionValue,
            }
          : {}),
      };

    const variantOptions =
      editState.variantOptionsText
        .split("\n")
        .map(
          (variant) =>
            variant.trim(),
        )
        .filter(
          Boolean,
        );

    /*
     * Un exercice de hangboard doit conserver ses options
     * d'assistance même si le type de tracking lui-même
     * n'est pas "assistance".
     */
    const shouldKeepAssistanceOptions =
      fields.assistance ||
      editState.isHangboard;

    const commonDefinition = {
      name:
        editState.name.trim(),

      description:
        editState.description.trim(),

      category:
        editState.category,

      tracking:
        editState.tracking,

      sessionIds:
        editState.sessionIds,

      isHangboard:
        editState.isHangboard,

      totalWeight:
        editState.totalWeight,

      perSide:
        editState.perSide,

      variantOptions:
        fields.variant
          ? variantOptions
          : undefined,

      bandOptions:
        fields.band
          ? RESISTANCE_BAND_OPTIONS.map(
              (band) =>
                band.id,
            )
          : undefined,

      primaryRepsLabel:
        editState.primaryRepsLabel.trim() ||
        undefined,

      secondaryRepsLabel:
        editState.secondaryRepsLabel.trim() ||
        undefined,

      primaryWeightLabel:
        editState.primaryWeightLabel.trim() ||
        undefined,

      secondaryWeightLabel:
        editState.secondaryWeightLabel.trim() ||
        undefined,

      assistanceOptions:
        shouldKeepAssistanceOptions
          ? ASSISTANCE_OPTIONS
          : undefined,
    };

    if (
      editState.id ===
      null
    ) {
      addExercise({
        ...commonDefinition,

        defaultValues:
          defaults,
      });

      toast({
        title:
          "Exercice ajouté",
      });
    } else {
      /*
       * Modifier directement l'exercice existant.
       *
       * L'ID ne change jamais :
       * l'historique associé reste donc intact.
       */
      updateExerciseOverride(
        editState.id,
        {
          name:
            commonDefinition.name,

          description:
            commonDefinition.description,

          category:
            commonDefinition.category,

          tracking:
            commonDefinition.tracking,

          sessionIds:
            commonDefinition.sessionIds,

          isHangboard:
            commonDefinition.isHangboard,

          totalWeight:
            commonDefinition.totalWeight,

          perSide:
            commonDefinition.perSide,

          variantOptions:
            commonDefinition.variantOptions,

          bandOptions:
            commonDefinition.bandOptions,

          primaryRepsLabel:
            commonDefinition.primaryRepsLabel,

          secondaryRepsLabel:
            commonDefinition.secondaryRepsLabel,

          primaryWeightLabel:
            commonDefinition.primaryWeightLabel,

          secondaryWeightLabel:
            commonDefinition.secondaryWeightLabel,

          assistanceOptions:
            commonDefinition.assistanceOptions,
        },
      );

      updateExerciseDefault(
        editState.id,
        defaults,
      );

      toast({
        title:
          "Exercice modifié",
      });
    }

    setEditState(
      null,
    );
  }

  function hideExercise(
    exercise: ExerciseDef,
  ) {
    const confirmed =
      window.confirm(
        isBuiltin(
          exercise.id,
        )
          ? `Masquer « ${exercise.name} » ?`
          : `Masquer « ${exercise.name} » ? L’historique sera conservé.`,
      );

    if (
      !confirmed
    ) {
      return;
    }

    deleteExercise(
      exercise.id,
    );
  }

  function createCategory() {
    const name =
      newCategoryName.trim();

    if (
      !name ||
      categories.includes(
        name,
      )
    ) {
      return;
    }

    addCategory(
      name,
    );

    setNewCategoryName(
      "",
    );

    setAddingCategory(
      false,
    );
  }

  return (
    <>
      <div className="space-y-4">
        {addingCategory ? (
          <div className="flex gap-2">
            <input
              autoFocus
              value={
                newCategoryName
              }
              onChange={(
                event,
              ) =>
                setNewCategoryName(
                  event.target.value,
                )
              }
              placeholder="Nom de la catégorie"
              className="min-w-0 flex-1 rounded-xl border border-border bg-card px-3 py-3 text-sm text-white"
            />

            <button
              type="button"
              onClick={
                createCategory
              }
              className="rounded-xl bg-white p-3 text-black"
              aria-label="Ajouter la catégorie"
            >
              <Check
                size={18}
              />
            </button>

            <button
              type="button"
              onClick={() => {
                setAddingCategory(
                  false,
                );

                setNewCategoryName(
                  "",
                );
              }}
              className="rounded-xl border border-border p-3 text-muted-foreground"
              aria-label="Annuler"
            >
              <X
                size={18}
              />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() =>
              setAddingCategory(
                true,
              )
            }
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border py-3 text-sm text-muted-foreground"
          >
            <FolderPlus
              size={16}
            />

            Ajouter une catégorie
          </button>
        )}

        {categories.map(
          (
            category,
          ) => {
            const exercises =
              getExercisesByCategory(
                category,
              );

            const visibleExercises =
              exercises.filter(
                (exercise) =>
                  !isExerciseHidden(
                    exercise.id,
                    data,
                  ),
              );

            const hiddenExercises =
              exercises.filter(
                (exercise) =>
                  isExerciseHidden(
                    exercise.id,
                    data,
                  ),
              );

            const isCollapsed =
              collapsedCategories[
                category
              ] ??
              false;

            const isCustomCategory =
              !BUILTIN_CATEGORIES.includes(
                category,
              );

            return (
              <section
                key={
                  category
                }
                className="overflow-hidden rounded-xl border border-border bg-card"
              >
                <div className="flex items-center gap-2 px-4 py-3">
                  <button
                    type="button"
                    onClick={() =>
                      setCollapsedCategories(
                        (
                          previous,
                        ) => ({
                          ...previous,

                          [category]:
                            !isCollapsed,
                        }),
                      )
                    }
                    className="flex min-w-0 flex-1 items-center gap-2 text-left"
                  >
                    {isCollapsed ? (
                      <ChevronRight
                        size={16}
                      />
                    ) : (
                      <ChevronDown
                        size={16}
                      />
                    )}

                    <span className="truncate text-sm font-black uppercase text-white">
                      {
                        category
                      }
                    </span>

                    <span className="text-xs text-muted-foreground">
                      (
                      {
                        visibleExercises.length
                      }
                      )
                    </span>
                  </button>

                  {isCustomCategory && (
                    <button
                      type="button"
                      onClick={() => {
                        const newName =
                          window.prompt(
                            "Nouveau nom de la catégorie",
                            category,
                          )?.trim();

                        if (
                          newName &&
                          newName !==
                            category
                        ) {
                          renameCategory(
                            category,
                            newName,
                          );
                        }
                      }}
                      className="rounded-lg p-2 text-muted-foreground"
                      aria-label="Modifier la catégorie"
                    >
                      <Pencil
                        size={14}
                      />
                    </button>
                  )}

                  {isCustomCategory && (
                    <button
                      type="button"
                      onClick={() => {
                        const fallback =
                          categories.find(
                            (
                              current,
                            ) =>
                              current !==
                              category,
                          ) ??
                          "Musculation";

                        const confirmed =
                          window.confirm(
                            `Supprimer « ${category} » ? Ses exercices iront dans « ${fallback} ».`,
                          );

                        if (
                          confirmed
                        ) {
                          deleteCategory(
                            category,
                            fallback,
                          );
                        }
                      }}
                      className="rounded-lg p-2 text-muted-foreground"
                      aria-label="Supprimer la catégorie"
                    >
                      <Trash2
                        size={14}
                      />
                    </button>
                  )}
                </div>

                {!isCollapsed && (
                  <div className="divide-y divide-border/50 border-t border-border">
                    {visibleExercises.map(
                      (
                        exercise,
                        index,
                      ) => (
                        <div
                          key={
                            exercise.id
                          }
                          className="flex items-center gap-2 px-3 py-3"
                        >
                          <div className="flex flex-col">
                            <button
                              type="button"
                              disabled={
                                index ===
                                0
                              }
                              onClick={() =>
                                moveExercise(
                                  category,
                                  exercise.id,
                                  -1,
                                )
                              }
                              className="p-0.5 text-muted-foreground disabled:opacity-20"
                              aria-label="Monter"
                            >
                              <ArrowUp
                                size={14}
                              />
                            </button>

                            <button
                              type="button"
                              disabled={
                                index ===
                                visibleExercises.length -
                                  1
                              }
                              onClick={() =>
                                moveExercise(
                                  category,
                                  exercise.id,
                                  1,
                                )
                              }
                              className="p-0.5 text-muted-foreground disabled:opacity-20"
                              aria-label="Descendre"
                            >
                              <ArrowDown
                                size={14}
                              />
                            </button>
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <p className="truncate text-sm font-bold text-white">
                                {
                                  exercise.name
                                }
                              </p>

                              <span
                                className={cn(
                                  "rounded-full border px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wide",

                                  isBuiltin(
                                    exercise.id,
                                  )
                                    ? "border-white/15 bg-white/5 text-muted-foreground"
                                    : "border-blue-400/30 bg-blue-400/10 text-blue-300",
                                )}
                              >
                                {isBuiltin(
                                  exercise.id,
                                )
                                  ? "De base"
                                  : "Personnalisé"}
                              </span>
                            </div>

                            <p className="mt-1 line-clamp-2 text-[10px] leading-relaxed text-muted-foreground">
                              {getDefaultsSummary(
                                exercise,
                                data,
                              )}
                            </p>
                          </div>

                          {data.exerciseOverrides[
                            exercise.id
                          ] && (
                            <RotateCcw
                              size={13}
                              className="flex-shrink-0 text-muted-foreground"
                              aria-label="Modifié"
                            />
                          )}

                          <button
                            type="button"
                            onClick={() =>
                              setEditState(
                                exerciseToEditState(
                                  exercise,
                                  data,
                                ),
                              )
                            }
                            className="rounded-lg p-2 text-muted-foreground"
                            aria-label="Modifier"
                          >
                            <Pencil
                              size={15}
                            />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              hideExercise(
                                exercise,
                              )
                            }
                            className="rounded-lg p-2 text-muted-foreground"
                            aria-label="Masquer"
                          >
                            <Trash2
                              size={15}
                            />
                          </button>
                        </div>
                      ),
                    )}

                    {hiddenExercises.length >
                      0 && (
                      <div className="space-y-2 px-4 py-3">
                        <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                          Masqués
                        </p>

                        {hiddenExercises.map(
                          (
                            exercise,
                          ) => (
                            <div
                              key={
                                exercise.id
                              }
                              className="flex items-center gap-2"
                            >
                              <div className="min-w-0 flex-1">
                                <span className="block truncate text-xs text-muted-foreground line-through">
                                  {
                                    exercise.name
                                  }
                                </span>

                                <span className="text-[9px] font-bold uppercase tracking-wide text-muted-foreground/60">
                                  {isBuiltin(
                                    exercise.id,
                                  )
                                    ? "De base"
                                    : "Personnalisé"}
                                </span>
                              </div>

                              <button
                                type="button"
                                onClick={() =>
                                  restoreExercise(
                                    exercise.id,
                                  )
                                }
                                className="rounded-lg border border-border px-2 py-1 text-xs text-white"
                              >
                                Restaurer
                              </button>
                            </div>
                          ),
                        )}
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() =>
                        setEditState(
                          createEmptyEdit(
                            category,
                          ),
                        )
                      }
                      className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-muted-foreground"
                    >
                      <Plus
                        size={15}
                      />

                      Ajouter un exercice
                    </button>
                  </div>
                )}
              </section>
            );
          },
        )}
      </div>

      {editState && (
        <ExerciseEditModal
          state={
            editState
          }
          categories={
            categories
          }
          onChange={
            setEditState
          }
          onSave={
            saveExercise
          }
          onClose={() =>
            setEditState(
              null,
            )
          }
        />
      )}
    </>
  );
}