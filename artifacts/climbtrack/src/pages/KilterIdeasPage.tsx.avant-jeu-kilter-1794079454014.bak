import {
  useEffect,
  useState,
} from "react";

import {
  ArrowLeft,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";

import {
  useNavigate,
} from "react-router-dom";

import {
  getDefaultFontGradeForV,
  useClimbTrack,
  type KilterIdea,
} from "@/context/ClimbTrackContext";

import {
  cn,
} from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type KilterIdeaFormState = {
  id: string | null;
  name: string;
  grade: number;
  angle: number;
  note: string;
};

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function createEmptyForm(): KilterIdeaFormState {
  return {
    id: null,
    name: "",
    grade: 0,
    angle: 30,
    note: "",
  };
}

function ideaToForm(
  idea: KilterIdea,
): KilterIdeaFormState {
  return {
    id: idea.id,
    name: idea.name,
    grade: idea.grade,
    angle: Math.max(0, Math.min(70, Math.round(idea.angle / 5) * 5)),
    note: idea.note ?? "",
  };
}

function getGradeLabel(
  grade: number,
): string {
  return `V${grade}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

export function KilterIdeasPage() {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, []);

  const {
    data,
    addKilterIdea,
    updateKilterIdea,
    deleteKilterIdea,
  } = useClimbTrack();

  const [
    form,
    setForm,
  ] = useState<KilterIdeaFormState | null>(null);

  const [
    deleteId,
    setDeleteId,
  ] = useState<string | null>(null);

  const sortedIdeas = [
    ...data.kilterIdeas,
  ].sort(
    (a, b) =>
      a.grade - b.grade ||
      a.angle - b.angle ||
      a.name.localeCompare(
        b.name,
        "fr",
      ),
  );

  const openAddForm = () => {
    setForm(
      createEmptyForm(),
    );
  };

  const openEditForm = (
    idea: KilterIdea,
  ) => {
    setForm(
      ideaToForm(idea),
    );
  };

  const closeForm = () => {
    setForm(null);
  };

  const handleSave = () => {
    if (!form) {
      return;
    }

    const name =
      form.name.trim();

    if (!name) {
      return;
    }

    const grade = Math.max(
      0,
      Math.min(
        17,
        Math.round(form.grade),
      ),
    );

    const angle = Math.max(
      0,
      Math.min(
        70,
        Math.round(form.angle / 5) * 5,
      ),
    );

    const idea = {
      name,
      angle,
      grade,
      gradeSystem: "v" as const,
      displayGrade:
        getGradeLabel(grade),
      note:
        form.note.trim() ||
        undefined,
    };

    if (form.id) {
      updateKilterIdea(
        form.id,
        idea,
      );
    } else {
      addKilterIdea(idea);
    }

    setForm(null);
  };

  const handleDelete = (
    id: string,
  ) => {
    deleteKilterIdea(id);
    setDeleteId(null);
  };

  return (
    <div className="min-h-screen pb-20 pt-safe">
      {/* Header */}

      <header className="sticky top-[env(safe-area-inset-top)] z-40 border-b border-border bg-background/95 backdrop-blur-md">
        <div className="flex h-14 items-center gap-3 px-4">
          <button
            type="button"
            onClick={() =>
              navigate(-1)
            }
            className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground active:bg-white/[0.06]"
            aria-label="Retour"
          >
            <ArrowLeft
              size={19}
            />
          </button>

          <div className="min-w-0 flex-1">
            <h1 className="text-base font-black">
              Idées Kilter
            </h1>

            <p className="text-[10px] text-muted-foreground">
              {data.kilterIdeas.length}{" "}
              {data.kilterIdeas.length ===
              1
                ? "bloc enregistré"
                : "blocs enregistrés"}
            </p>
          </div>

          <button
            type="button"
            onClick={
              openAddForm
            }
            className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm active:scale-95"
            aria-label="Ajouter une idée Kilter"
          >
            <Plus
              size={19}
              strokeWidth={2.5}
            />
          </button>
        </div>
      </header>

      {/* Content */}

      <main className="mx-auto w-full max-w-2xl space-y-4 p-4">
        {sortedIdeas.length ===
        0 ? (
          <section className="rounded-2xl border border-dashed border-border bg-card px-5 py-10 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-border bg-background text-muted-foreground">
              <Plus
                size={22}
              />
            </div>

            <h2 className="text-sm font-black">
              Aucune idée Kilter
            </h2>

            <p className="mx-auto mt-1 max-w-xs text-xs leading-relaxed text-muted-foreground">
              Enregistre ici les blocs
              que tu veux essayer plus
              tard.
            </p>

            <button
              type="button"
              onClick={
                openAddForm
              }
              className="mt-5 rounded-xl bg-primary px-4 py-2.5 text-xs font-black text-primary-foreground active:scale-[0.98]"
            >
              Ajouter un bloc
            </button>
          </section>
        ) : (
          <>
            <div className="flex items-center justify-between px-1">
              <p className="text-[11px] font-black uppercase tracking-[0.16em] text-muted-foreground">
                Mes idées
              </p>

              <button
                type="button"
                onClick={
                  openAddForm
                }
                className="flex items-center gap-1.5 text-xs font-bold text-primary"
              >
                <Plus
                  size={14}
                />
                Ajouter
              </button>
            </div>

            <div className="space-y-2">
              {sortedIdeas.map(
                (idea) => {
                  const isDeleting =
                    deleteId ===
                    idea.id;

                  return (
                    <article
                      key={
                        idea.id
                      }
                      className="overflow-hidden rounded-2xl border border-border bg-card"
                    >
                      <div className="flex items-center gap-3 p-3.5">
                        <div className="flex h-12 w-12 flex-shrink-0 flex-col items-center justify-center rounded-xl border border-border bg-background">
                          <span className="text-sm font-black">
                            {idea.displayGrade}
                          </span>

                          <span className="text-[9px] font-bold text-muted-foreground">
                            {idea.angle}°
                          </span>
                        </div>

                        <div className="min-w-0 flex-1">
                          <h3 className="truncate text-sm font-black">
                            {idea.name}
                          </h3>

                          <p className="mt-0.5 text-[11px] text-muted-foreground">
                            {idea.displayGrade} ·{" "}
                            {getDefaultFontGradeForV(
                              idea.grade,
                            )}{" "}
                            · {idea.angle}°
                          </p>

                          {idea.note && (
                            <p className="mt-1 truncate text-[11px] text-white/55">
                              {idea.note}
                            </p>
                          )}
                        </div>

                        <div className="flex flex-shrink-0 items-center gap-1">
                          <button
                            type="button"
                            onClick={() =>
                              openEditForm(
                                idea,
                              )
                            }
                            className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground active:bg-white/[0.06]"
                            aria-label={`Modifier ${idea.name}`}
                          >
                            <Pencil
                              size={16}
                            />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              setDeleteId(
                                idea.id,
                              )
                            }
                            className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground active:bg-destructive/10 active:text-destructive"
                            aria-label={`Supprimer ${idea.name}`}
                          >
                            <Trash2
                              size={16}
                            />
                          </button>
                        </div>
                      </div>

                      {isDeleting && (
                        <div className="border-t border-border bg-destructive/5 px-3.5 py-3">
                          <p className="text-xs font-bold text-white">
                            Supprimer cette idée ?
                          </p>

                          <div className="mt-2 flex gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                setDeleteId(
                                  null,
                                )
                              }
                              className="flex-1 rounded-lg border border-border px-3 py-2 text-xs font-bold text-muted-foreground"
                            >
                              Annuler
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleDelete(
                                  idea.id,
                                )
                              }
                              className="flex-1 rounded-lg bg-destructive px-3 py-2 text-xs font-black text-destructive-foreground"
                            >
                              Supprimer
                            </button>
                          </div>
                        </div>
                      )}
                    </article>
                  );
                },
              )}
            </div>
          </>
        )}
      </main>

      {/* Form */}

      {form && (
        <div className="fixed inset-0 z-[100]">
          <button
            type="button"
            aria-label="Fermer"
            onClick={
              closeForm
            }
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />

          <div className="absolute inset-x-0 bottom-0 max-h-[90vh] overflow-y-auto rounded-t-3xl border-t border-border bg-card pb-[calc(env(safe-area-inset-bottom)+20px)]">
            <div className="mx-auto w-full max-w-2xl">
              <div className="flex items-center gap-3 border-b border-border px-4 py-4">
                <div className="min-w-0 flex-1">
                  <h2 className="text-base font-black">
                    {form.id
                      ? "Modifier l'idée"
                      : "Nouvelle idée Kilter"}
                  </h2>

                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    Garde en mémoire les blocs
                    que tu veux essayer.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={
                    closeForm
                  }
                  className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground active:bg-white/[0.06]"
                  aria-label="Fermer"
                >
                  <X
                    size={18}
                  />
                </button>
              </div>

              <div className="space-y-5 p-4">
                {/* Name */}

                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                    Nom du bloc
                  </label>

                  <input
                    type="text"
                    value={
                      form.name
                    }
                    onChange={(
                      event,
                    ) =>
                      setForm(
                        (
                          current,
                        ) =>
                          current
                            ? {
                                ...current,
                                name: event
                                  .target
                                  .value,
                              }
                            : current,
                      )
                    }
                    placeholder="Ex. Gros dévers rouge"
                    className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none placeholder:text-muted-foreground focus:border-primary"
                  />
                </div>

                {/* Grade */}

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                    Niveau
                  </label>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-xl border border-border bg-background p-3">
                      <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                        Kilter
                      </p>

                      <select
                        value={
                          form.grade
                        }
                        onChange={(
                          event,
                        ) =>
                          setForm(
                            (
                              current,
                            ) =>
                              current
                                ? {
                                    ...current,
                                    grade: Number(
                                      event
                                        .target
                                        .value,
                                    ),
                                  }
                                : current,
                          )
                        }
                        className="mt-1 w-full bg-transparent text-base font-black outline-none"
                      >
                        {Array.from(
                          {
                            length: 18,
                          },
                          (
                            _,
                            index,
                          ) => (
                            <option
                              key={
                                index
                              }
                              value={
                                index
                              }
                            >
                              V
                              {index}
                            </option>
                          ),
                        )}
                      </select>
                    </div>

                    <div className="rounded-xl border border-border bg-background p-3">
                      <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                        Fontainebleau
                      </p>

                      <p className="mt-1 text-base font-black">
                        {
                          getDefaultFontGradeForV(
                            form.grade,
                          )
                        }
                      </p>
                    </div>
                  </div>
                </div>

{/* Angle */}

<div className="space-y-3">
  <div className="flex items-center justify-between">
    <label className="text-xs font-black uppercase tracking-wider text-muted-foreground">
      Inclinaison
    </label>

    <span className="rounded-lg border border-border bg-background px-2.5 py-1 text-sm font-black">
      {form.angle}°
    </span>
  </div>

  <div className="space-y-1">
    <input
      type="range"
      min="0"
      max="70"
      step="5"
      value={form.angle}
      onChange={(event) =>
        setForm((current) =>
          current
            ? {
                ...current,
                angle: Number(event.target.value),
              }
            : current,
        )
      }
      className="m-0 w-full accent-primary"
    />

    <div className="relative mx-2 h-5 text-[9px] font-bold text-muted-foreground">
      {Array.from(
        { length: 15 },
        (_, index) => {
          const angle = index * 5;

          return (
            <span
              key={angle}
              style={{ left: `${(angle / 70) * 100}%` }}
              className={cn(
                "absolute top-0 -translate-x-1/2 flex flex-col items-center",
                form.angle === angle &&
                  "text-white",
              )}
            >
              <span className="mb-0.5 h-1.5 w-px bg-border" />
              {angle}°
            </span>
          );
        },
      )}
    </div>
  </div>

              <p className="text-[10px] leading-relaxed text-muted-foreground">
                Choisis l’inclinaison exacte du Kilter Board. Les inclinaisons
                de 0° à 70° sont disponibles par pas de 5°.
              </p>
              </div>
                                      {/* Note */}

                                      <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                                          Note
                                        </label>

                                        <textarea
                                          value={form.note}
                                          onChange={(event) =>
                                            setForm((current) =>
                                              current
                                                ? {
                                                    ...current,
                                                    note: event.target.value,
                                                  }
                                                : current,
                                            )
                                          }
                                          placeholder="Ex. À essayer quand je suis frais..."
                                          rows={3}
                                          className="w-full resize-none rounded-xl border border-border bg-background px-3 py-3 text-sm outline-none placeholder:text-muted-foreground focus:border-primary"
                                        />
                                      </div>

                                      {/* Actions */}

                                      <div className="flex gap-2 pt-1">
                                        <button
                                          type="button"
                                          onClick={closeForm}
                                          className="flex-1 rounded-xl border border-border px-4 py-3 text-sm font-black text-muted-foreground active:bg-white/[0.06]"
                                        >
                                          Annuler
                                        </button>

                                        <button
                                          type="button"
                                          onClick={handleSave}
                                          className="flex-1 rounded-xl bg-primary px-4 py-3 text-sm font-black text-primary-foreground active:scale-[0.98]"
                                        >
                                          {form.id
                                            ? "Enregistrer"
                                            : "Ajouter l'idée"}
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      }