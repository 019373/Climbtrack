import {
  useMemo,
  useState,
} from "react";

import {
  Activity,
  AlertTriangle,
  Check,
  ChevronDown,
  HeartPulse,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";

import {
  useClimbTrack,
  type Injury,
  type InjurySide,
  type InjuryStatus,
} from "@/context/ClimbTrackContext";

import {
  cn,
} from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────────────────────

type InjuryFormState = {
  id: string | null;
  area: string;
  side: InjurySide;
  injuryType: string;
  painLevel: number;
  startDate: string;
  note: string;
  status: InjuryStatus;
};

// ── Constants ─────────────────────────────────────────────────────────────────

const BODY_AREAS = [
  "Doigt",
  "Main",
  "Poignet",
  "Avant-bras",
  "Coude",
  "Biceps",
  "Triceps",
  "Épaule",
  "Pectoral",
  "Haut du dos",
  "Bas du dos",
  "Hanche",
  "Aine / adducteur",
  "Fessier",
  "Ischio-jambier",
  "Quadriceps",
  "Genou",
  "Mollet",
  "Tibia",
  "Cheville",
  "Pied",
  "Autre",
];

const INJURY_TYPES = [
  "Douleur musculaire",
  "Tendinite / irritation tendineuse",
  "Entorse",
  "Contracture",
  "Élongation",
  "Déchirure",
  "Contusion",
  "Douleur articulaire",
  "Douleur nerveuse",
  "Poulie du doigt",
  "Inflammation",
  "Autre",
];

const SIDE_OPTIONS: {
  value: InjurySide;
  label: string;
}[] = [
  {
    value: "gauche",
    label: "Gauche",
  },
  {
    value: "droite",
    label: "Droite",
  },
  {
    value: "deux",
    label: "Les deux",
  },
  {
    value: "non-applicable",
    label: "Non applicable",
  },
];

const STATUS_OPTIONS: {
  value: InjuryStatus;
  label: string;
  description: string;
}[] = [
  {
    value: "active",
    label: "Active",
    description:
      "Douleur ou limitation encore présente.",
  },
  {
    value: "amelioration",
    label: "En amélioration",
    description:
      "La zone va mieux mais reste à surveiller.",
  },
  {
    value: "guerie",
    label: "Guérie",
    description:
      "La blessure ne limite plus l’entraînement.",
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

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

function createEmptyForm(): InjuryFormState {
  return {
    id: null,
    area: BODY_AREAS[0],
    side: "non-applicable",
    injuryType:
      INJURY_TYPES[0],
    painLevel: 0,
    startDate:
      getLocalDateString(),
    note: "",
    status: "active",
  };
}

function injuryToForm(
  injury: Injury,
): InjuryFormState {
  return {
    id: injury.id,
    area: injury.area,
    side: injury.side,
    injuryType:
      injury.injuryType,
    painLevel:
      injury.painLevel,
    startDate:
      injury.startDate,
    note:
      injury.note ?? "",
    status:
      injury.status,
  };
}

function getStatusLabel(
  status: InjuryStatus,
): string {
  return (
    STATUS_OPTIONS.find(
      (option) =>
        option.value ===
        status,
    )?.label ?? status
  );
}

function getSideLabel(
  side: InjurySide,
): string {
  return (
    SIDE_OPTIONS.find(
      (option) =>
        option.value ===
        side,
    )?.label ?? side
  );
}

function formatDate(
  date: string,
): string {
  const parsed =
    new Date(
      `${date}T12:00:00`,
    );

  if (
    Number.isNaN(
      parsed.getTime(),
    )
  ) {
    return date;
  }

  return parsed.toLocaleDateString(
    "fr-FR",
    {
      day: "2-digit",
      month: "long",
      year: "numeric",
    },
  );
}

function getPainClass(
  painLevel: number,
): string {
  if (
    painLevel >= 7
  ) {
    return "border-destructive/40 bg-destructive/10 text-destructive";
  }

  if (
    painLevel >= 4
  ) {
    return "border-orange-500/40 bg-orange-500/10 text-orange-400";
  }

  if (
    painLevel > 0
  ) {
    return "border-yellow-500/40 bg-yellow-500/10 text-yellow-300";
  }

  return "border-border bg-background text-muted-foreground";
}

// ── Shared fields ─────────────────────────────────────────────────────────────

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-black uppercase tracking-wider text-muted-foreground">
        {label}
      </label>

      {children}
    </div>
  );
}

// ── Edit sheet ────────────────────────────────────────────────────────────────

function InjuryFormSheet({
  form,
  setForm,
  onClose,
  onSave,
}: {
  form: InjuryFormState;
  setForm: React.Dispatch<
    React.SetStateAction<InjuryFormState>
  >;
  onClose: () => void;
  onSave: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[100000] bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="absolute inset-x-0 bottom-0 max-h-[94dvh] overflow-y-auto rounded-t-3xl border border-border bg-background pb-[calc(env(safe-area-inset-bottom)+24px)]"
        onClick={(
          event,
        ) =>
          event.stopPropagation()
        }
      >
        <header className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-border bg-background/95 px-5 py-4 backdrop-blur-md">
          <div>
            <h2 className="text-xl font-black text-white">
              {form.id
                ? "Modifier la blessure"
                : "Ajouter une blessure"}
            </h2>

            <p className="mt-1 text-xs text-muted-foreground">
              Ces informations servent aux avertissements et aux suggestions.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-border p-2 text-muted-foreground"
          >
            <X size={18} />
          </button>
        </header>

        <div className="space-y-6 p-5">
          <Field label="Zone">
            <div className="relative">
              <select
                value={form.area}
                onChange={(
                  event,
                ) =>
                  setForm(
                    (
                      previous,
                    ) => ({
                      ...previous,
                      area:
                        event.target.value,
                    }),
                  )
                }
                className="w-full appearance-none rounded-xl border border-border bg-card px-3 py-3 pr-10 text-white"
              >
                {BODY_AREAS.map(
                  (area) => (
                    <option
                      key={area}
                      value={area}
                    >
                      {area}
                    </option>
                  ),
                )}
              </select>

              <ChevronDown
                size={18}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
            </div>
          </Field>

          {form.area ===
            "Autre" && (
            <Field label="Nom précis de la zone">
              <input
                type="text"
                value={form.area}
                onChange={(
                  event,
                ) =>
                  setForm(
                    (
                      previous,
                    ) => ({
                      ...previous,
                      area:
                        event.target.value,
                    }),
                  )
                }
                placeholder="Ex. carré des lombes"
                className="w-full rounded-xl border border-border bg-card px-3 py-3 text-white"
              />
            </Field>
          )}

          <Field label="Côté">
            <div className="grid grid-cols-2 gap-2">
              {SIDE_OPTIONS.map(
                (option) => {
                  const selected =
                    form.side ===
                    option.value;

                  return (
                    <button
                      key={
                        option.value
                      }
                      type="button"
                      onClick={() =>
                        setForm(
                          (
                            previous,
                          ) => ({
                            ...previous,
                            side:
                              option.value,
                          }),
                        )
                      }
                      className={cn(
                        "rounded-xl border px-3 py-3 text-sm font-bold",
                        selected
                          ? "border-white bg-white text-black"
                          : "border-border bg-card text-muted-foreground",
                      )}
                    >
                      {
                        option.label
                      }
                    </button>
                  );
                },
              )}
            </div>
          </Field>

          <Field label="Type">
            <div className="relative">
              <select
                value={
                  form.injuryType
                }
                onChange={(
                  event,
                ) =>
                  setForm(
                    (
                      previous,
                    ) => ({
                      ...previous,
                      injuryType:
                        event.target.value,
                    }),
                  )
                }
                className="w-full appearance-none rounded-xl border border-border bg-card px-3 py-3 pr-10 text-white"
              >
                {INJURY_TYPES.map(
                  (injuryType) => (
                    <option
                      key={
                        injuryType
                      }
                      value={
                        injuryType
                      }
                    >
                      {
                        injuryType
                      }
                    </option>
                  ),
                )}
              </select>

              <ChevronDown
                size={18}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
            </div>
          </Field>

          <Field label="Douleur actuelle">
            <div className="rounded-2xl border border-border bg-card p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <span className="text-sm font-bold text-white">
                  Intensité
                </span>

                <span
                  className={cn(
                    "rounded-full border px-3 py-1.5 font-mono text-sm font-black",
                    getPainClass(
                      form.painLevel,
                    ),
                  )}
                >
                  {
                    form.painLevel
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
                  form.painLevel
                }
                onChange={(
                  event,
                ) =>
                  setForm(
                    (
                      previous,
                    ) => ({
                      ...previous,
                      painLevel:
                        Number.parseInt(
                          event.target.value,
                          10,
                        ),
                    }),
                  )
                }
                className="w-full accent-white"
              />

              <div className="mt-2 flex justify-between text-[10px] text-muted-foreground">
                <span>Aucune</span>
                <span>Modérée</span>
                <span>Très forte</span>
              </div>
            </div>
          </Field>

          <Field label="Date de début">
            <input
              type="date"
              value={
                form.startDate
              }
              onChange={(
                event,
              ) =>
                setForm(
                  (
                    previous,
                  ) => ({
                    ...previous,
                    startDate:
                      event.target.value,
                  }),
                )
              }
              className="w-full rounded-xl border border-border bg-card px-3 py-3 text-white"
            />
          </Field>

          <Field label="État">
            <div className="space-y-2">
              {STATUS_OPTIONS.map(
                (option) => {
                  const selected =
                    form.status ===
                    option.value;

                  return (
                    <button
                      key={
                        option.value
                      }
                      type="button"
                      onClick={() =>
                        setForm(
                          (
                            previous,
                          ) => ({
                            ...previous,
                            status:
                              option.value,
                          }),
                        )
                      }
                      className={cn(
                        "flex w-full items-start gap-3 rounded-xl border p-3 text-left",
                        selected
                          ? "border-white bg-white text-black"
                          : "border-border bg-card text-white",
                      )}
                    >
                      <div
                        className={cn(
                          "mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border",
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
                      </div>

                      <div>
                        <p className="text-sm font-black">
                          {
                            option.label
                          }
                        </p>

                        <p
                          className={cn(
                            "mt-0.5 text-xs",
                            selected
                              ? "text-black/60"
                              : "text-muted-foreground",
                          )}
                        >
                          {
                            option.description
                          }
                        </p>
                      </div>
                    </button>
                  );
                },
              )}
            </div>
          </Field>

          <Field label="Note facultative">
            <textarea
              value={form.note}
              onChange={(
                event,
              ) =>
                setForm(
                  (
                    previous,
                  ) => ({
                    ...previous,
                    note:
                      event.target.value,
                  }),
                )
              }
              placeholder="Mouvements douloureux, diagnostic, consignes, évolution…"
              className="min-h-28 w-full resize-none rounded-xl border border-border bg-card p-3 text-sm leading-relaxed text-white"
            />
          </Field>

          <button
            type="button"
            onClick={onSave}
            disabled={
              !form.area.trim() ||
              !form.injuryType.trim() ||
              !form.startDate
            }
            className="w-full rounded-xl bg-white py-4 text-sm font-black text-black disabled:opacity-40"
          >
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Injury card ───────────────────────────────────────────────────────────────

function InjuryCard({
  injury,
  onEdit,
  onDelete,
}: {
  injury: Injury;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const isHealed =
    injury.status ===
    "guerie";

  return (
    <article
      className={cn(
        "rounded-2xl border bg-card p-4",
        isHealed
          ? "border-border opacity-70"
          : injury.status ===
              "amelioration"
            ? "border-yellow-500/30"
            : "border-orange-500/30",
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl border",
            isHealed
              ? "border-success/30 bg-success/10 text-success"
              : "border-orange-500/30 bg-orange-500/10 text-orange-400",
          )}
        >
          {isHealed ? (
            <Check size={20} />
          ) : (
            <AlertTriangle size={20} />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="font-black text-white">
                {injury.area}
              </h2>

              <p className="mt-0.5 text-xs text-muted-foreground">
                {getSideLabel(
                  injury.side,
                )}{" "}
                ·{" "}
                {
                  injury.injuryType
                }
              </p>
            </div>

            <span
              className={cn(
                "rounded-full border px-2.5 py-1 text-[10px] font-black uppercase",
                injury.status ===
                  "active" &&
                  "border-orange-500/30 bg-orange-500/10 text-orange-300",

                injury.status ===
                  "amelioration" &&
                  "border-yellow-500/30 bg-yellow-500/10 text-yellow-300",

                injury.status ===
                  "guerie" &&
                  "border-success/30 bg-success/10 text-success",
              )}
            >
              {getStatusLabel(
                injury.status,
              )}
            </span>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "rounded-full border px-3 py-1.5 font-mono text-xs font-black",
                getPainClass(
                  injury.painLevel,
                ),
              )}
            >
              Douleur{" "}
              {
                injury.painLevel
              }
              /10
            </span>

            <span className="rounded-full border border-border bg-background px-3 py-1.5 text-xs text-muted-foreground">
              Depuis le{" "}
              {formatDate(
                injury.startDate,
              )}
            </span>
          </div>

          {injury.note && (
            <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
              {injury.note}
            </p>
          )}

          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={onEdit}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-border py-2.5 text-xs font-bold text-white"
            >
              <Pencil size={14} />
              Modifier
            </button>

            <button
              type="button"
              onClick={onDelete}
              className="flex items-center justify-center rounded-xl border border-destructive/30 px-4 text-destructive"
              aria-label="Supprimer"
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export function BlessuresPage() {
  const {
    data,
    addInjury,
    updateInjury,
    deleteInjury,
  } = useClimbTrack();

  const [
    form,
    setForm,
  ] =
    useState<InjuryFormState | null>(
      null,
    );

  const sortedInjuries =
    useMemo(
      () =>
        [...data.injuries].sort(
          (
            first,
            second,
          ) => {
            const statusOrder: Record<
              InjuryStatus,
              number
            > = {
              active: 0,
              amelioration: 1,
              guerie: 2,
            };

            const statusDifference =
              statusOrder[
                first.status
              ] -
              statusOrder[
                second.status
              ];

            if (
              statusDifference !==
              0
            ) {
              return statusDifference;
            }

            return (
              new Date(
                `${second.startDate}T12:00:00`,
              ).getTime() -
              new Date(
                `${first.startDate}T12:00:00`,
              ).getTime()
            );
          },
        ),
      [
        data.injuries,
      ],
    );

  const activeCount =
    data.injuries.filter(
      (injury) =>
        injury.status ===
        "active",
    ).length;

  const improvingCount =
    data.injuries.filter(
      (injury) =>
        injury.status ===
        "amelioration",
    ).length;

  function saveForm() {
    if (!form) {
      return;
    }

    const injuryData = {
      area:
        form.area.trim(),
      side:
        form.side,
      injuryType:
        form.injuryType.trim(),
      painLevel:
        form.painLevel,
      startDate:
        form.startDate,
      note:
        form.note.trim() ||
        undefined,
      status:
        form.status,
    };

    if (form.id) {
      updateInjury(
        form.id,
        {
          id: form.id,
          ...injuryData,
        },
      );
    } else {
      addInjury(
        injuryData,
      );
    }

    setForm(null);
  }

  function removeInjury(
    injury: Injury,
  ) {
    const confirmed =
      window.confirm(
        `Supprimer la blessure « ${injury.area} » ?`,
      );

    if (confirmed) {
      deleteInjury(
        injury.id,
      );
    }
  }

  return (
    <div className="min-h-screen bg-background pb-28 pt-safe">
      <header className="sticky top-0 z-10 border-b border-border bg-background/95 px-5 py-6 backdrop-blur-md">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white">
              Santé
            </h1>

            <p className="mt-1 text-sm text-muted-foreground">
              Suis tes blessures et adapte tes entraînements.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              setForm(
                createEmptyForm(),
              )
            }
            className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-white text-black active:scale-95"
            aria-label="Ajouter une blessure"
          >
            <Plus
              size={22}
              strokeWidth={3}
            />
          </button>
        </div>
      </header>

      <main className="space-y-6 p-5">
        <section className="grid grid-cols-2 gap-4">
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 text-orange-400">
              <AlertTriangle
                size={16}
              />

              <span className="text-xs font-black uppercase tracking-wider">
                Actives
              </span>
            </div>

            <p className="mt-2 font-mono text-3xl font-black text-white">
              {activeCount}
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 text-yellow-300">
              <Activity
                size={16}
              />

              <span className="text-xs font-black uppercase tracking-wider">
                Amélioration
              </span>
            </div>

            <p className="mt-2 font-mono text-3xl font-black text-white">
              {improvingCount}
            </p>
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card p-4">
          <div className="flex items-start gap-3">
            <HeartPulse
              size={20}
              className="mt-0.5 flex-shrink-0 text-white"
            />

            <div>
              <h2 className="text-sm font-black text-white">
                Utilisation dans l’application
              </h2>

              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                Les blessures actives ou en amélioration peuvent afficher des avertissements sur les exercices et influencer les suggestions de récupération.
              </p>
            </div>
          </div>
        </section>

        {sortedInjuries.length >
        0 ? (
          <section className="space-y-3">
            {sortedInjuries.map(
              (injury) => (
                <InjuryCard
                  key={
                    injury.id
                  }
                  injury={
                    injury
                  }
                  onEdit={() =>
                    setForm(
                      injuryToForm(
                        injury,
                      ),
                    )
                  }
                  onDelete={() =>
                    removeInjury(
                      injury,
                    )
                  }
                />
              ),
            )}
          </section>
        ) : (
          <section className="rounded-2xl border border-border bg-card py-20 text-center">
            <HeartPulse
              size={42}
              className="mx-auto mb-4 text-muted-foreground/30"
            />

            <p className="font-bold text-muted-foreground">
              Aucune blessure enregistrée.
            </p>

            <p className="mx-auto mt-1 max-w-xs text-sm leading-relaxed text-muted-foreground/70">
              Ajoute une douleur ou une blessure pour recevoir des avertissements plus adaptés.
            </p>
          </section>
        )}
      </main>

      {form && (
        <InjuryFormSheet
          form={form}
          setForm={setForm}
          onClose={() =>
            setForm(null)
          }
          onSave={saveForm}
        />
      )}
    </div>
  );
}