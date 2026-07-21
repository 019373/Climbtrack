import { useState } from "react";
import {
  Check,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
} from "lucide-react";

import { cn } from "@/lib/utils";
import {
  ASSISTANCE_OPTIONS,
} from "@/data/sessions";

import type {
  ExerciseDef,
} from "@/data/sessions";

import type {
  ExerciseDefaults,
  ExerciseLog,
} from "@/context/ClimbTrackContext";

import { RestTimer } from "./RestTimer";

interface ExerciseRowProps {
  exercise: ExerciseDef;
  defaults: ExerciseDefaults;
  log: ExerciseLog;
  onChange: (log: ExerciseLog) => void;
  onUpdateDefault: (
    defs: Partial<ExerciseDefaults>,
  ) => void;
  isPainful?: boolean;
}

export function ExerciseRow({
  exercise,
  defaults,
  log,
  onChange,
  onUpdateDefault,
  isPainful,
}: ExerciseRowProps) {
  const [isExpanded, setIsExpanded] =
    useState(false);

  const toggleCheck = (
    event: React.MouseEvent,
  ) => {
    event.stopPropagation();

    onChange({
      ...log,
      completed: !log.completed,
    });
  };

  const updateLog = (
    field: keyof ExerciseLog,
    value: unknown,
  ) => {
    onChange({
      ...log,
      [field]: value,
    });

    const sessionOnlyFields: Array<
      keyof ExerciseLog
    > = [
      "progressionValue",
      "leftHandJumps",
      "rightHandJumps",
    ];

    if (!sessionOnlyFields.includes(field)) {
      onUpdateDefault({
        [field]: value,
      } as Partial<ExerciseDefaults>);
    }
  };

  const getSummary = () => {
    const parts: string[] = [];

    if (log.sets) {
      parts.push(`${log.sets} séries`);
    }

    if (log.reps) {
      parts.push(`${log.reps} reps`);
    }

    if (log.duration) {
      parts.push(`${log.duration}s`);
    }

    if (log.weight) {
      parts.push(`${log.weight}kg`);
    }

    if (log.assistance) {
      parts.push(
        log.assistance.split(",")[0],
      );
    }

    if (
      exercise.id === "suspension-slopers" &&
      log.progressionValue
    ) {
      parts.push(`${log.progressionValue}°`);
    }

    if (exercise.id === "sauts-prise") {
      const left = log.leftHandJumps ?? 3;
      const right = log.rightHandJumps ?? 3;

      parts.push(`G ${left}`);
      parts.push(`D ${right}`);
    }

    return parts.join(" • ");
  };

  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-border bg-card transition-all",
        log.completed
          ? "border-success/50 bg-success/5"
          : "",
      )}
    >
      <div
        className="flex cursor-pointer items-start gap-4 p-4"
        onClick={() =>
          setIsExpanded((previous) => !previous)
        }
      >
        <button
          type="button"
          onClick={toggleCheck}
          className={cn(
            "mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border-2 transition-colors",
            log.completed
              ? "border-success bg-success text-black"
              : "border-muted-foreground/40 text-transparent",
          )}
        >
          <Check
            size={16}
            strokeWidth={3}
          />
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h4
              className={cn(
                "text-[15px] font-bold leading-snug",
                log.completed &&
                  "text-white/80",
              )}
            >
              {exercise.name}
            </h4>

            {isPainful && (
              <AlertTriangle
                size={16}
                className="mt-0.5 flex-shrink-0 text-destructive"
              />
            )}
          </div>

          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            {exercise.description}
          </p>

          <div className="mt-2 font-mono text-xs text-muted-foreground">
            {getSummary()}
          </div>
        </div>

        <div className="text-muted-foreground">
          {isExpanded ? (
            <ChevronUp size={20} />
          ) : (
            <ChevronDown size={20} />
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="border-t border-border bg-[#151515] p-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Séries réalisées
              </label>

              <input
                type="number"
                min="0"
                className="w-full rounded border border-border bg-background p-2 font-mono text-white"
                value={log.sets ?? 0}
                onChange={(event) =>
                  updateLog(
                    "sets",
                    Number.parseInt(
                      event.target.value,
                      10,
                    ) || 0,
                  )
                }
              />
            </div>

            {(exercise.tracking === "reps" ||
              exercise.tracking ===
                "weight+reps") && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Répétitions
                </label>

                <input
                  type="number"
                  min="0"
                  className="w-full rounded border border-border bg-background p-2 font-mono text-white"
                  value={log.reps ?? ""}
                  onChange={(event) =>
                    updateLog(
                      "reps",
                      Number.parseInt(
                        event.target.value,
                        10,
                      ) || 0,
                    )
                  }
                  placeholder={
                    defaults.reps?.toString()
                  }
                />
              </div>
            )}

            {(exercise.tracking === "duration" ||
              exercise.tracking ===
                "duration+assistance" ||
              exercise.tracking ===
                "weight+duration") && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Durée (s)
                </label>

                <input
                  type="number"
                  min="0"
                  className="w-full rounded border border-border bg-background p-2 font-mono text-white"
                  value={log.duration ?? ""}
                  onChange={(event) =>
                    updateLog(
                      "duration",
                      Number.parseInt(
                        event.target.value,
                        10,
                      ) || 0,
                    )
                  }
                  placeholder={
                    defaults.duration?.toString()
                  }
                />
              </div>
            )}

            {(exercise.tracking === "weight" ||
              exercise.tracking ===
                "weight+reps" ||
              exercise.tracking ===
                "weight+duration") && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Charge (kg)
                </label>

                <input
                  type="number"
                  step="0.5"
                  className="w-full rounded border border-border bg-background p-2 font-mono text-white"
                  value={log.weight ?? ""}
                  onChange={(event) =>
                    updateLog(
                      "weight",
                      Number.parseFloat(
                        event.target.value,
                      ) || 0,
                    )
                  }
                  placeholder={
                    defaults.weight?.toString()
                  }
                />
              </div>
            )}
          </div>

          {exercise.id ===
            "suspension-slopers" && (
            <div className="mt-4 space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Inclinaison du sloper
              </label>

              <div className="grid grid-cols-2 gap-3">
                {[30, 45].map((angle) => {
                  const selected =
                    log.progressionValue === angle;

                  return (
                    <button
                      key={angle}
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
                          : "border-border bg-background text-muted-foreground hover:border-white/30 hover:text-white",
                      )}
                    >
                      <span className="text-lg font-black">
                        {angle}°
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {exercise.id === "sauts-prise" && (
            <div className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Prises sautées
                </label>

                <p className="mt-1 text-xs text-muted-foreground">
                  Indique le meilleur nombre atteint
                  séparément avec chaque main.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">
                    Main gauche
                  </label>

                  <input
                    type="number"
                    min="0"
                    step="1"
                    className="w-full rounded border border-border bg-background p-2 font-mono text-white"
                    value={
                      log.leftHandJumps ?? 3
                    }
                    onChange={(event) =>
                      updateLog(
                        "leftHandJumps",
                        Number.parseInt(
                          event.target.value,
                          10,
                        ) || 0,
                      )
                    }
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
                    className="w-full rounded border border-border bg-background p-2 font-mono text-white"
                    value={
                      log.rightHandJumps ?? 3
                    }
                    onChange={(event) =>
                      updateLog(
                        "rightHandJumps",
                        Number.parseInt(
                          event.target.value,
                          10,
                        ) || 0,
                      )
                    }
                  />
                </div>
              </div>
            </div>
          )}

          {(exercise.tracking === "assistance" ||
            exercise.tracking ===
              "duration+assistance") && (
            <div className="mt-4 space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Assistance
              </label>

              <select
                className="w-full rounded border border-border bg-background p-2 text-sm text-white"
                value={log.assistance || ""}
                onChange={(event) =>
                  updateLog(
                    "assistance",
                    event.target.value,
                  )
                }
              >
                {ASSISTANCE_OPTIONS.map(
                  (option) => (
                    <option
                      key={option}
                      value={option}
                    >
                      {option}
                    </option>
                  ),
                )}
              </select>
            </div>
          )}

          {defaults.restSeconds > 0 && (
            <div className="mt-4">
              <RestTimer
                recommendedSeconds={
                  defaults.restSeconds
                }
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}