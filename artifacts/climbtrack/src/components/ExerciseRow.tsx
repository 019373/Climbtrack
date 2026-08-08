import {
  useState,
} from "react";

import {
  AlertTriangle,
  Check,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

import {
  cn,
} from "@/lib/utils";

import {
  ASSISTANCE_OPTIONS,
  RESISTANCE_BAND_OPTIONS,
  SLOPER_ANGLES,
} from "@/data/sessions";

import type {
  ExerciseDef,
} from "@/data/sessions";

import type {
  ExerciseDefaults,
  ExerciseLog,
  ResistanceBandColor,
} from "@/context/ClimbTrackContext";

import {
  RestTimer,
} from "./RestTimer";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface ExerciseRowProps {
  exercise: ExerciseDef;

  defaults: ExerciseDefaults;

  log: ExerciseLog;

  onChange: (
    log: ExerciseLog,
  ) => void;

  onUpdateDefault: (
    defaults: Partial<ExerciseDefaults>,
  ) => void;

  isPainful?: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function formatNumber(
  value: number,
): string {
  return Number.isInteger(
    value,
  )
    ? String(value)
    : String(
        Math.round(
          value * 100,
        ) / 100,
      ).replace(
        ".",
        ",",
      );
}

function parseInteger(
  value: string,
): number {
  if (
    value.trim() ===
    ""
  ) {
    return 0;
  }

  const parsed =
    Number.parseInt(
      value,
      10,
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

function parseDecimal(
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

function getBandLabel(
  color?: ResistanceBandColor,
): string {
  const option =
    RESISTANCE_BAND_OPTIONS.find(
      (band) =>
        band.id ===
        color,
    );

  return (
    option?.label ??
    color ??
    ""
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function ExerciseRow({
  exercise,
  defaults,
  log,
  onChange,
  onUpdateDefault: _onUpdateDefault,
  isPainful,
}: ExerciseRowProps) {
  const [
    isExpanded,
    setIsExpanded,
  ] =
    useState(false);

  const updateLog = <
    K extends keyof ExerciseLog,
  >(
    field: K,
    value: ExerciseLog[K],
  ) => {
    onChange({
      ...log,

      [field]:
        value,
    });
  };

  function toggleCheck(
    event: React.MouseEvent,
  ) {
    event.stopPropagation();

    onChange({
      ...log,

      completed:
        !log.completed,
    });
  }

  // ───────────────────────────────────────────────────────────────────────────
  // Champs selon le type de suivi
  // ───────────────────────────────────────────────────────────────────────────

  const hasReps =
    exercise.tracking ===
      "reps" ||
    exercise.tracking ===
      "weight+reps" ||
    exercise.tracking ===
      "assistance" ||
    exercise.tracking ===
      "dual-reps+dual-weight" ||
    exercise.tracking ===
      "dual-reps+weight" ||
    exercise.tracking ===
      "reps+duration" ||
    exercise.tracking ===
      "weight+reps+duration" ||
    exercise.tracking ===
      "variant+reps";

  const hasSecondaryReps =
    exercise.tracking ===
      "dual-reps+dual-weight" ||
    exercise.tracking ===
      "dual-reps+weight";

  const hasDuration =
    exercise.tracking ===
      "duration" ||
    exercise.tracking ===
      "duration+assistance" ||
    exercise.tracking ===
      "weight+duration" ||
    exercise.tracking ===
      "duration+band" ||
    exercise.tracking ===
      "reps+duration" ||
    exercise.tracking ===
      "weight+reps+duration" ||
    exercise.tracking ===
      "variant+weight+duration" ||
    exercise.tracking ===
      "assistance";

  const hasWeight =
    exercise.tracking ===
      "weight" ||
    exercise.tracking ===
      "weight+reps" ||
    exercise.tracking ===
      "weight+duration" ||
    exercise.tracking ===
      "dual-reps+dual-weight" ||
    exercise.tracking ===
      "dual-reps+weight" ||
    exercise.tracking ===
      "weight+reps+duration" ||
    exercise.tracking ===
      "variant+weight+duration";

  const hasSecondaryWeight =
    exercise.tracking ===
    "dual-reps+dual-weight";

  const hasAssistance =
    exercise.tracking ===
      "assistance" ||
    exercise.tracking ===
      "duration+assistance";

  const hasBand =
    exercise.tracking ===
    "duration+band";

  const hasVariant =
    exercise.tracking ===
      "variant+weight+duration" ||
    exercise.tracking ===
      "variant+reps";

  const isDynamicJump =
    exercise.id ===
      "sauts-prise" ||
    exercise.id ===
      "croise-dynamique-19-30";

  const hasProgressionValue =
    exercise.id ===
      "suspension-slopers" ||
    exercise.id ===
      "croise-dynamique-19-30" ||
    typeof defaults.progressionValue ===
      "number" ||
    typeof log.progressionValue ===
      "number";

  // ───────────────────────────────────────────────────────────────────────────
  // Labels
  // ───────────────────────────────────────────────────────────────────────────

  const weightLabel =
    exercise.primaryWeightLabel ??
    (
      exercise.totalWeight
        ? "Charge totale (kg)"
        : exercise.perSide
          ? "Charge par côté (kg)"
          : "Charge (kg)"
    );

  const secondaryWeightLabel =
    exercise.secondaryWeightLabel ??
    "Deuxième charge (kg)";

  const repsLabel =
    exercise.primaryRepsLabel ??
    (
      exercise.perSide
        ? "Répétitions par côté"
        : "Répétitions"
    );

  const secondaryRepsLabel =
    exercise.secondaryRepsLabel ??
    "Deuxièmes répétitions";

  // ───────────────────────────────────────────────────────────────────────────
  // Résumé
  // ───────────────────────────────────────────────────────────────────────────

  function getSummary(): string {
    const parts:
      string[] = [];

    if (
      typeof log.sets ===
        "number" &&
      log.sets >
        0
    ) {
      parts.push(
        `${log.sets} série${
          log.sets >
          1
            ? "s"
            : ""
        }`,
      );
    }

    if (
      hasReps &&
      typeof log.reps ===
        "number"
    ) {
      if (
        hasSecondaryReps &&
        typeof log.secondaryReps ===
          "number"
      ) {
        parts.push(
          `${log.reps} + ${log.secondaryReps} reps`,
        );
      } else {
        parts.push(
          `${log.reps} reps`,
        );
      }
    }

    if (
      hasDuration &&
      typeof log.duration ===
        "number"
    ) {
      parts.push(
        `${formatNumber(
          log.duration,
        )} s`,
      );
    }

    if (
      hasWeight &&
      typeof log.weight ===
        "number"
    ) {
      if (
        hasSecondaryWeight &&
        typeof log.secondaryWeight ===
          "number"
      ) {
        parts.push(
          `${formatNumber(
            log.weight,
          )} + ${formatNumber(
            log.secondaryWeight,
          )} kg`,
        );
      } else {
        parts.push(
          `${formatNumber(
            log.weight,
          )} kg`,
        );
      }
    }

    if (
      hasAssistance &&
      log.assistance
    ) {
      parts.push(
        log.assistance.split(
          ",",
        )[0],
      );
    }

    if (
      exercise.id ===
        "suspension-slopers" &&
      typeof log.progressionValue ===
        "number"
    ) {
      parts.push(
        `${formatNumber(
          log.progressionValue,
        )}°`,
      );
    }

    if (
      exercise.id !==
        "suspension-slopers" &&
      exercise.id !==
        "croise-dynamique-19-30" &&
      hasProgressionValue &&
      typeof log.progressionValue ===
        "number"
    ) {
      parts.push(
        `progression ${formatNumber(
          log.progressionValue,
        )}`,
      );
    }

    if (
      isDynamicJump
    ) {
      if (
        typeof log.leftHandJumps ===
        "number"
      ) {
        parts.push(
          `G ${log.leftHandJumps}`,
        );
      }

      if (
        typeof log.rightHandJumps ===
        "number"
      ) {
        parts.push(
          `D ${log.rightHandJumps}`,
        );
      }
    }

    if (
      hasVariant &&
      log.variant
    ) {
      parts.push(
        log.variant,
      );
    }

    if (
      hasBand &&
      log.bandColor
    ) {
      parts.push(
        `Élastique ${getBandLabel(
          log.bandColor,
        )}`,
      );
    }

    if (
      hasBand &&
      typeof log.bandStretch ===
        "number" &&
      log.bandStretch >
        0
    ) {
      parts.push(
        `Repère ${formatNumber(
          log.bandStretch,
        )}`,
      );
    }

    if (
      exercise.perSide
    ) {
      parts.push(
        "par côté",
      );
    }

    return parts.join(
      " • ",
    );
  }

  // ───────────────────────────────────────────────────────────────────────────
  // Options disponibles
  // ───────────────────────────────────────────────────────────────────────────

  const assistanceOptions =
    exercise.assistanceOptions &&
    exercise.assistanceOptions.length >
      0
      ? exercise.assistanceOptions
      : ASSISTANCE_OPTIONS;

  const allowedBandOptions =
    RESISTANCE_BAND_OPTIONS.filter(
      (option) =>
        !exercise.bandOptions ||
        exercise.bandOptions.length ===
          0 ||
        exercise.bandOptions.includes(
          option.id,
        ),
    );

  // ───────────────────────────────────────────────────────────────────────────
  // UI
  // ───────────────────────────────────────────────────────────────────────────

  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-border bg-card transition-all",

        log.completed &&
          "border-success/50 bg-success/5",

        isPainful &&
          "border-orange-500/30",
      )}
    >
      <div
        className="flex cursor-pointer items-start gap-4 p-4"
        onClick={() =>
          setIsExpanded(
            (previous) =>
              !previous,
          )
        }
      >
        <button
          type="button"
          onClick={
            toggleCheck
          }
          className={cn(
            "mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border-2 transition-colors",

            log.completed
              ? "border-success bg-success text-black"
              : "border-muted-foreground/40 text-transparent",
          )}
          aria-label={
            log.completed
              ? "Marquer comme non réalisé"
              : "Marquer comme réalisé"
          }
        >
          <Check
            size={16}
            strokeWidth={3}
          />
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h4 className="text-[15px] font-bold leading-snug text-white">
              {
                exercise.name
              }
            </h4>

            {isPainful && (
              <AlertTriangle
                size={16}
                className="mt-0.5 flex-shrink-0 text-orange-400"
              />
            )}
          </div>

          {exercise.description && (
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              {
                exercise.description
              }
            </p>
          )}

          <div className="mt-2 font-mono text-xs text-muted-foreground">
            {getSummary()}
          </div>

          {isPainful && (
            <p className="mt-2 text-xs font-bold text-orange-300">
              Adapter ou arrêter si cet exercice augmente la douleur.
            </p>
          )}
        </div>

        <div className="text-muted-foreground">
          {isExpanded ? (
            <ChevronUp
              size={20}
            />
          ) : (
            <ChevronDown
              size={20}
            />
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="border-t border-border bg-[#151515] p-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Séries
              </label>

              <input
                type="number"
                min="0"
                step="1"
                value={
                  log.sets
                }
                onChange={(
                  event,
                ) =>
                  updateLog(
                    "sets",
                    parseInteger(
                      event.target.value,
                    ),
                  )
                }
                className="w-full rounded border border-border bg-background p-2 font-mono text-white"
              />
            </div>

            {hasReps && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {
                    repsLabel
                  }
                </label>

                <input
                  type="number"
                  min="0"
                  step="1"
                  value={
                    log.reps ??
                    ""
                  }
                  onChange={(
                    event,
                  ) =>
                    updateLog(
                      "reps",
                      parseInteger(
                        event.target.value,
                      ),
                    )
                  }
                  placeholder={
                    defaults.reps?.toString()
                  }
                  className="w-full rounded border border-border bg-background p-2 font-mono text-white"
                />
              </div>
            )}

            {hasSecondaryReps && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {
                    secondaryRepsLabel
                  }
                </label>

                <input
                  type="number"
                  min="0"
                  step="1"
                  value={
                    log.secondaryReps ??
                    ""
                  }
                  onChange={(
                    event,
                  ) =>
                    updateLog(
                      "secondaryReps",
                      parseInteger(
                        event.target.value,
                      ),
                    )
                  }
                  placeholder={
                    defaults.secondaryReps?.toString()
                  }
                  className="w-full rounded border border-border bg-background p-2 font-mono text-white"
                />
              </div>
            )}

            {hasDuration && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {exercise.perSide
                    ? "Durée par côté (s)"
                    : "Durée (s)"}
                </label>

                <input
                  type="number"
                  min="0"
                  step="1"
                  value={
                    log.duration ??
                    ""
                  }
                  onChange={(
                    event,
                  ) =>
                    updateLog(
                      "duration",
                      parseDecimal(
                        event.target.value,
                      ),
                    )
                  }
                  placeholder={
                    defaults.duration?.toString()
                  }
                  className="w-full rounded border border-border bg-background p-2 font-mono text-white"
                />
              </div>
            )}

            {hasWeight && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {
                    weightLabel
                  }
                </label>

                <input
                  type="number"
                  min="0"
                  step="0.25"
                  inputMode="decimal"
                  value={
                    log.weight ??
                    ""
                  }
                  onChange={(
                    event,
                  ) =>
                    updateLog(
                      "weight",
                      parseDecimal(
                        event.target.value,
                      ),
                    )
                  }
                  placeholder={
                    defaults.weight?.toString()
                  }
                  className="w-full rounded border border-border bg-background p-2 font-mono text-white"
                />
              </div>
            )}

            {hasSecondaryWeight && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {
                    secondaryWeightLabel
                  }
                </label>

                <input
                  type="number"
                  min="0"
                  step="0.25"
                  inputMode="decimal"
                  value={
                    log.secondaryWeight ??
                    ""
                  }
                  onChange={(
                    event,
                  ) =>
                    updateLog(
                      "secondaryWeight",
                      parseDecimal(
                        event.target.value,
                      ),
                    )
                  }
                  placeholder={
                    defaults.secondaryWeight?.toString()
                  }
                  className="w-full rounded border border-border bg-background p-2 font-mono text-white"
                />
              </div>
            )}
          </div>

          {exercise.totalWeight &&
            hasWeight && (
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              Entrer le poids total utilisé, et non le poids d’un seul haltère ou d’un seul côté.
            </p>
          )}

          {exercise.id ===
            "developpe-couche" && (
            <div className="mt-4 rounded-xl border border-border bg-background/70 p-3 text-xs leading-relaxed text-muted-foreground">
              Exemple : 30 kg au total = barre de 20 kg + 5 kg de chaque côté.
            </div>
          )}

          {exercise.id ===
            "suspension-slopers" && (
            <div className="mt-4 space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Choisir l’inclinaison du plat
              </label>

              <div className="grid grid-cols-3 gap-3">
                {SLOPER_ANGLES.map(
                  (angle) => {
                    const selected =
                      log.progressionValue ===
                      angle;

                    return (
                      <button
                        key={
                          angle
                        }
                        type="button"
                        onClick={() =>
                          updateLog(
                            "progressionValue",
                            angle,
                          )
                        }
                        className={cn(
                          "rounded-xl border py-3 text-center transition-all active:scale-[0.98]",

                          selected
                            ? "border-white bg-white text-black"
                            : "border-border bg-background text-muted-foreground",
                        )}
                      >
                        <span className="text-lg font-black">
                          {
                            angle
                          }
                          °
                        </span>
                      </button>
                    );
                  },
                )}
              </div>
            </div>
          )}

          {hasProgressionValue &&
            exercise.id !==
              "suspension-slopers" &&
            exercise.id !==
              "croise-dynamique-19-30" && (
              <div className="mt-4 space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Valeur de progression
                </label>

                <input
                  type="number"
                  min="0"
                  step="1"
                  value={
                    log.progressionValue ??
                    ""
                  }
                  onChange={(
                    event,
                  ) =>
                    updateLog(
                      "progressionValue",
                      parseDecimal(
                        event.target.value,
                      ),
                    )
                  }
                  className="w-full rounded border border-border bg-background p-2 font-mono text-white"
                />
              </div>
            )}

          {hasVariant &&
            exercise.variantOptions &&
            exercise.variantOptions.length >
              0 && (
              <div className="mt-4 space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Choisir une variante
                </label>

                <div
                  className={cn(
                    "grid gap-2",

                    exercise.variantOptions.length ===
                      1
                      ? "grid-cols-1"
                      : "grid-cols-2",
                  )}
                >
                  {exercise.variantOptions.map(
                    (
                      variant,
                    ) => {
                      const selected =
                        log.variant ===
                        variant;

                      return (
                        <button
                          key={
                            variant
                          }
                          type="button"
                          onClick={() =>
                            updateLog(
                              "variant",
                              variant,
                            )
                          }
                          className={cn(
                            "rounded-xl border px-3 py-3 text-sm font-bold transition-all",

                            selected
                              ? "border-white bg-white text-black"
                              : "border-border bg-background text-muted-foreground",
                          )}
                        >
                          {
                            variant
                          }
                        </button>
                      );
                    },
                  )}
                </div>
              </div>
            )}

          {isDynamicJump && (
            <div className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Meilleur mouvement réussi
                </label>

                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  Indiquer séparément le meilleur résultat atteint avec chaque main.
                </p>
              </div>

              {exercise.id ===
                "croise-dynamique-19-30" && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">
                    Position de la prise cible
                  </label>

                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={
                      log.progressionValue ??
                      defaults.progressionValue ??
                      5
                    }
                    onChange={(
                      event,
                    ) =>
                      updateLog(
                        "progressionValue",
                        parseInteger(
                          event.target.value,
                        ),
                      )
                    }
                    className="w-full rounded border border-border bg-background p-2 font-mono text-white"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">
                    Main gauche
                  </label>

                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={
                      log.leftHandJumps ??
                      log.reps ??
                      0
                    }
                    onChange={(
                      event,
                    ) =>
                      updateLog(
                        "leftHandJumps",
                        parseInteger(
                          event.target.value,
                        ),
                      )
                    }
                    className="w-full rounded border border-border bg-background p-2 font-mono text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">
                    Main droite
                  </label>

                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={
                      log.rightHandJumps ??
                      log.reps ??
                      0
                    }
                    onChange={(
                      event,
                    ) =>
                      updateLog(
                        "rightHandJumps",
                        parseInteger(
                          event.target.value,
                        ),
                      )
                    }
                    className="w-full rounded border border-border bg-background p-2 font-mono text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {hasAssistance && (
            <div className="mt-4 space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Choisir l’assistance
              </label>

              <select
                value={
                  log.assistance ??
                  defaults.assistance ??
                  assistanceOptions[0] ??
                  ""
                }
                onChange={(
                  event,
                ) =>
                  updateLog(
                    "assistance",
                    event.target.value,
                  )
                }
                className="w-full rounded border border-border bg-background p-2 text-sm text-white"
              >
                {assistanceOptions.map(
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
            </div>
          )}

          {hasBand && (
            <div className="mt-4 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Choisir l’élastique
                </label>

                <select
                  value={
                    log.bandColor ??
                    defaults.bandColor ??
                    allowedBandOptions[0]?.id ??
                    "orange"
                  }
                  onChange={(
                    event,
                  ) =>
                    updateLog(
                      "bandColor",
                      event.target
                        .value as ResistanceBandColor,
                    )
                  }
                  className="w-full rounded border border-border bg-background p-2 text-sm text-white"
                >
                  {allowedBandOptions.map(
                    (
                      option,
                    ) => (
                      <option
                        key={
                          option.id
                        }
                        value={
                          option.id
                        }
                      >
                        {
                          option.label
                        }
                      </option>
                    ),
                  )}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Distance ou repère d’étirement
                </label>

                <input
                  type="number"
                  min="0"
                  step="0.25"
                  inputMode="decimal"
                  value={
                    log.bandStretch ??
                    ""
                  }
                  onChange={(
                    event,
                  ) =>
                    updateLog(
                      "bandStretch",
                      parseDecimal(
                        event.target.value,
                      ),
                    )
                  }
                  placeholder="Ex. 1,5 ou repère 2"
                  className="w-full rounded border border-border bg-background p-2 font-mono text-white"
                />

                <p className="text-xs leading-relaxed text-muted-foreground">
                  Utiliser le même repère d’une séance à l’autre pour comparer correctement la tension.
                </p>
              </div>
            </div>
          )}

          {defaults.restSeconds >
            0 && (
            <div className="mt-4">
              <RestTimer
                recommendedSeconds={
                  defaults.restSeconds
                }
                timerId={
                  exercise.id
                }
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}