import {
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import { createPortal } from "react-dom";
import {
  ChevronDown,
  ChevronRight,
  Plus,
  Pencil,
  Trash2,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  Check,
  X,
  FolderPlus,
} from "lucide-react";
import { useClimbTrack } from "@/context/ClimbTrackContext";
import {
  ExerciseDef,
  SESSIONS,
  TrackingType,
  ASSISTANCE_OPTIONS,
} from "@/data/sessions";
import {
  getAllCategories,
  getAllManagedExercises,
  getExerciseSessionIds,
  isExerciseHidden,
  BUILTIN_CATEGORIES,
  TRACKING_LABELS,
  TRACKING_TYPES,
} from "@/utils/exercises";
import { useToast } from "@/hooks/use-toast";

/* ── Helpers ─────────────────────────────────────────────────────────────── */

const BUILTIN_IDS = new Set(
  SESSIONS.flatMap((session) =>
    session.exercises.map((exercise) => exercise.id),
  ),
);

const isBuiltin = (id: string) => BUILTIN_IDS.has(id);

type EditState = {
  id: string | null;
  name: string;
  description: string;
  category: string;
  tracking: TrackingType;
  sessionIds: string[];
  sets: number;
  reps: number;
  duration: number;
  weight: number;
  restSeconds: number;
  assistance: string;
  isHangboard: boolean;
};

const TRACKING_HAS: Record<
  TrackingType,
  {
    reps: boolean;
    duration: boolean;
    weight: boolean;
    assistance: boolean;
  }
> = {
  "duration+assistance": {
    reps: false,
    duration: true,
    weight: false,
    assistance: true,
  },
  reps: {
    reps: true,
    duration: false,
    weight: false,
    assistance: false,
  },
  weight: {
    reps: false,
    duration: false,
    weight: true,
    assistance: false,
  },
  "weight+duration": {
    reps: false,
    duration: true,
    weight: true,
    assistance: false,
  },
  assistance: {
    reps: true,
    duration: true,
    weight: false,
    assistance: true,
  },
  "weight+reps": {
    reps: true,
    duration: false,
    weight: true,
    assistance: false,
  },
  duration: {
    reps: false,
    duration: true,
    weight: false,
    assistance: false,
  },
  none: {
    reps: false,
    duration: false,
    weight: false,
    assistance: false,
  },
};

function emptyEdit(category = ""): EditState {
  return {
    id: null,
    name: "",
    description: "",
    category,
    tracking: "reps",
    sessionIds: [],
    sets: 3,
    reps: 8,
    duration: 30,
    weight: 0,
    restSeconds: 90,
    assistance: ASSISTANCE_OPTIONS[5],
    isHangboard: false,
  };
}

function exerciseToEdit(
  exercise: ExerciseDef,
  data: ReturnType<typeof useClimbTrack>["data"],
): EditState {
  const sessionIds = getExerciseSessionIds(exercise.id, data);

  const defaults =
    data.exerciseDefaults[exercise.id] ??
    exercise.defaultValues;

  return {
    id: exercise.id,
    name: exercise.name,
    description: exercise.description,
    category: exercise.category,
    tracking: exercise.tracking,
    sessionIds,
    sets: defaults.sets ?? 3,
    reps: defaults.reps ?? 8,
    duration: defaults.duration ?? 30,
    weight: defaults.weight ?? 0,
    restSeconds: defaults.restSeconds ?? 90,
    assistance:
      defaults.assistance ?? ASSISTANCE_OPTIONS[5],
    isHangboard: exercise.isHangboard ?? false,
  };
}

/* ── Champs ──────────────────────────────────────────────────────────────── */

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </label>

      {children}
    </div>
  );
}

function Input({
  value,
  onChange,
  type = "text",
  placeholder = "",
  min,
  step,
}: {
  value: string | number;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  min?: number;
  step?: number;
}) {
  return (
    <input
      type={type}
      value={value}
      min={min}
      step={step}
      onChange={(event) =>
        onChange(event.target.value)
      }
      placeholder={placeholder}
      className="w-full rounded-lg border border-border bg-card px-3 py-3 text-sm text-white placeholder:text-muted-foreground/50 focus:border-white/40 focus:outline-none"
    />
  );
}

function Select({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  options: {
    value: string;
    label: string;
  }[];
}) {
  return (
    <select
      value={value}
      onChange={(event) =>
        onChange(event.target.value)
      }
      className="w-full rounded-lg border border-border bg-card px-3 py-3 text-sm text-white focus:border-white/40 focus:outline-none"
    >
      {options.map((option) => (
        <option
          key={option.value}
          value={option.value}
        >
          {option.label}
        </option>
      ))}
    </select>
  );
}

/* ── Fenêtre de création/modification ────────────────────────────────────── */

function ExerciseEditSheet({
  state,
  setState,
  categories,
  onSave,
  onCancel,
}: {
  state: EditState;
  setState: Dispatch<SetStateAction<EditState>>;
  categories: string[];
  onSave: () => void;
  onCancel: () => void;
}) {
  const trackingFields = TRACKING_HAS[state.tracking];

  const setText =
    (key: keyof EditState) => (value: string) => {
      setState((previous) => ({
        ...previous,
        [key]: value,
      }));
    };

  const setNumber =
    (key: keyof EditState) => (value: string) => {
      const parsedValue = Number(value);

      setState((previous) => ({
        ...previous,
        [key]: Number.isFinite(parsedValue)
          ? parsedValue
          : 0,
      }));
    };

  const toggleSession = (sessionId: string) => {
    setState((previous) => ({
      ...previous,
      sessionIds: previous.sessionIds.includes(
        sessionId,
      )
        ? previous.sessionIds.filter(
            (id) => id !== sessionId,
          )
        : [...previous.sessionIds, sessionId],
    }));
  };

  return (
    <div
      className="fixed inset-0 z-[99999] bg-background"
      onClick={onCancel}
    >
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

      <div
        className="relative z-[100000] flex h-[100dvh] w-full flex-col overflow-hidden bg-background pt-safe"
        onClick={(event) =>
          event.stopPropagation()
        }
      >
        {/* En-tête fixe */}
        <div className="flex flex-shrink-0 items-center justify-between gap-3 border-b border-border px-5 py-4">
          <div className="min-w-0">
            <h3 className="text-lg font-extrabold text-white">
              {state.id === null
                ? "Nouvel exercice"
                : "Modifier l’exercice"}
            </h3>

            <p className="mt-0.5 text-xs text-muted-foreground">
              Configure le suivi et les séances de
              l’exercice.
            </p>
          </div>

          <button
            type="button"
            onClick={onCancel}
            className="flex-shrink-0 rounded-full p-2 hover:bg-white/10"
            aria-label="Fermer"
          >
            <X
              size={20}
              className="text-muted-foreground"
            />
          </button>
        </div>

        {/* Contenu défilable */}
        <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5 pb-32">
          <Field label="Nom">
            <Input
              value={state.name}
              onChange={setText("name")}
              placeholder="Nom de l’exercice"
            />
          </Field>

          <Field label="Description facultative">
            <Input
              value={state.description}
              onChange={setText("description")}
              placeholder="Courte description"
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Catégorie">
              <Select
                value={state.category}
                onChange={setText("category")}
                options={categories.map(
                  (category) => ({
                    value: category,
                    label: category,
                  }),
                )}
              />
            </Field>

            <Field label="Type de suivi">
              <Select
                value={state.tracking}
                onChange={(value) =>
                  setState((previous) => ({
                    ...previous,
                    tracking:
                      value as TrackingType,
                  }))
                }
                options={TRACKING_TYPES.map(
                  (trackingType) => ({
                    value: trackingType,
                    label:
                      TRACKING_LABELS[
                        trackingType
                      ],
                  }),
                )}
              />
            </Field>
          </div>

          <div className="rounded-xl border border-border bg-card/40 p-4">
            <h4 className="mb-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Valeurs par défaut
            </h4>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Séries">
                <Input
                  type="number"
                  min={1}
                  value={state.sets}
                  onChange={setNumber("sets")}
                />
              </Field>

              <Field label="Repos (secondes)">
                <Input
                  type="number"
                  min={0}
                  value={state.restSeconds}
                  onChange={setNumber(
                    "restSeconds",
                  )}
                />
              </Field>

              {trackingFields.reps && (
                <Field label="Répétitions">
                  <Input
                    type="number"
                    min={0}
                    value={state.reps}
                    onChange={setNumber("reps")}
                  />
                </Field>
              )}

              {trackingFields.duration && (
                <Field label="Durée (secondes)">
                  <Input
                    type="number"
                    min={0}
                    value={state.duration}
                    onChange={setNumber(
                      "duration",
                    )}
                  />
                </Field>
              )}

              {trackingFields.weight && (
                <Field label="Charge (kg)">
                  <Input
                    type="number"
                    min={0}
                    step={0.5}
                    value={state.weight}
                    onChange={setNumber(
                      "weight",
                    )}
                  />
                </Field>
              )}

              {trackingFields.assistance && (
                <div className="col-span-2">
                  <Field label="Assistance par défaut">
                    <Select
                      value={state.assistance}
                      onChange={setText(
                        "assistance",
                      )}
                      options={ASSISTANCE_OPTIONS.map(
                        (assistance) => ({
                          value: assistance,
                          label: assistance,
                        }),
                      )}
                    />
                  </Field>
                </div>
              )}
            </div>
          </div>

          <Field label="Apparaît dans les séances">
            <div className="space-y-2 pt-1">
              {SESSIONS.map((session) => {
                const selected =
                  state.sessionIds.includes(
                    session.id,
                  );

                return (
                  <button
                    key={session.id}
                    type="button"
                    onClick={() =>
                      toggleSession(session.id)
                    }
                    className="flex w-full items-center gap-3 rounded-xl border border-border bg-card px-3 py-3 text-left"
                  >
                    <div
                      className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded border transition-colors ${
                        selected
                          ? "border-white bg-white"
                          : "border-border bg-transparent"
                      }`}
                    >
                      {selected && (
                        <Check
                          size={12}
                          className="text-black"
                        />
                      )}
                    </div>

                    <span className="text-sm text-white">
                      {session.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </Field>
        </div>

        {/* Boutons fixes au-dessus du bas d’écran */}
        <div className="flex flex-shrink-0 gap-3 border-t border-border bg-background px-5 py-4 pb-[calc(env(safe-area-inset-bottom)+16px)]">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-xl border border-border py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-white/5"
          >
            Annuler
          </button>

          <button
            type="button"
            onClick={onSave}
            disabled={
              !state.name.trim() ||
              !state.category.trim()
            }
            className="flex-1 rounded-xl bg-white py-3 text-sm font-bold text-black transition-colors hover:bg-white/90 disabled:opacity-40"
          >
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Gestionnaire principal ──────────────────────────────────────────────── */

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
  } = useClimbTrack();

  const { toast } = useToast();

  const categories = getAllCategories(data);
  const allExercises =
    getAllManagedExercises(data);
  const overrides =
    data.exerciseOverrides ?? {};

  const [collapsed, setCollapsed] = useState<
    Record<string, boolean>
  >({});

  const [editState, setEditState] =
    useState<EditState | null>(null);

  const [
    editingCategory,
    setEditingCategory,
  ] = useState<string | null>(null);

  const [
    newCategoryInput,
    setNewCategoryInput,
  ] = useState("");

  const [
    renameCategoryInput,
    setRenameCategoryInput,
  ] = useState("");

  const [
    showNewCategoryInput,
    setShowNewCategoryInput,
  ] = useState(false);

  const toggleCollapse = (category: string) => {
    setCollapsed((previous) => ({
      ...previous,
      [category]: !previous[category],
    }));
  };

  const exercisesByCategory = (
    category: string,
  ) => {
    const orderedIds =
      data.exerciseCategoryOrder?.[category];

    const exercises = allExercises.filter(
      (exercise) =>
        exercise.category === category,
    );

    if (
      !orderedIds ||
      orderedIds.length === 0
    ) {
      return exercises;
    }

    const orderedExercises = orderedIds
      .map((id) =>
        exercises.find(
          (exercise) =>
            exercise.id === id,
        ),
      )
      .filter(
        (
          exercise,
        ): exercise is ExerciseDef =>
          exercise !== undefined,
      );

    const remainingExercises =
      exercises.filter(
        (exercise) =>
          !orderedIds.includes(exercise.id),
      );

    return [
      ...orderedExercises,
      ...remainingExercises,
    ];
  };

  const moveExercise = (
    category: string,
    exerciseId: string,
    direction: -1 | 1,
  ) => {
    const exercises =
      exercisesByCategory(category);

    const currentIndex =
      exercises.findIndex(
        (exercise) =>
          exercise.id === exerciseId,
      );

    if (currentIndex === -1) return;

    const newIndex =
      currentIndex + direction;

    if (
      newIndex < 0 ||
      newIndex >= exercises.length
    ) {
      return;
    }

    const newOrder = exercises.map(
      (exercise) => exercise.id,
    );

    [
      newOrder[currentIndex],
      newOrder[newIndex],
    ] = [
      newOrder[newIndex],
      newOrder[currentIndex],
    ];

    setExerciseCategoryOrder(
      category,
      newOrder,
    );
  };

  const handleSave = () => {
    if (
      !editState ||
      !editState.name.trim()
    ) {
      return;
    }

    const trackingFields =
      TRACKING_HAS[editState.tracking];

    const defaults = {
      sets: editState.sets,
      restSeconds:
        editState.restSeconds,

      ...(trackingFields.reps && {
        reps: editState.reps,
      }),

      ...(trackingFields.duration && {
        duration: editState.duration,
      }),

      ...(trackingFields.weight && {
        weight: editState.weight,
      }),

      ...(trackingFields.assistance && {
        assistance:
          editState.assistance,
      }),
    };

    if (editState.id === null) {
      addExercise({
        name: editState.name.trim(),
        description:
          editState.description.trim(),
        category: editState.category,
        tracking: editState.tracking,
        defaultValues: defaults,
        sessionIds: editState.sessionIds,
        isHangboard:
          editState.isHangboard,

        ...(editState.isHangboard && {
          assistanceOptions:
            ASSISTANCE_OPTIONS,
        }),
      });

      toast({
        title: "Exercice ajouté",
        description:
          editState.name.trim(),
      });
    } else {
      updateExerciseOverride(
        editState.id,
        {
          name: editState.name.trim(),
          description:
            editState.description.trim(),
          category:
            editState.category,
          tracking:
            editState.tracking,
          sessionIds:
            editState.sessionIds,
        },
      );

      updateExerciseDefault(
        editState.id,
        defaults,
      );

      toast({
        title: "Exercice mis à jour",
        description:
          editState.name.trim(),
      });
    }

    setEditState(null);
  };

  const handleDelete = (
    exercise: ExerciseDef,
  ) => {
    const message = isBuiltin(exercise.id)
      ? `Masquer « ${exercise.name} » de toutes les séances ? L’historique sera conservé.`
      : `Supprimer « ${exercise.name} » de toutes les séances ? L’historique sera conservé.`;

    if (!window.confirm(message)) return;

    deleteExercise(exercise.id);

    toast({
      title: "Exercice masqué",
      description:
        "Les données historiques sont conservées.",
    });

    if (
      editState?.id === exercise.id
    ) {
      setEditState(null);
    }
  };

  const handleAddCategory = () => {
    const name =
      newCategoryInput.trim();

    if (
      !name ||
      categories.includes(name)
    ) {
      return;
    }

    addCategory(name);
    setNewCategoryInput("");
    setShowNewCategoryInput(false);

    toast({
      title: "Catégorie créée",
      description: name,
    });
  };

  const handleRenameCategory = (
    oldName: string,
  ) => {
    const newName =
      renameCategoryInput.trim();

    if (
      !newName ||
      newName === oldName ||
      categories.includes(newName)
    ) {
      return;
    }

    renameCategory(oldName, newName);
    setEditingCategory(null);
    setRenameCategoryInput("");

    toast({
      title: "Catégorie renommée",
    });
  };

  const handleDeleteCategory = (
    categoryName: string,
  ) => {
    const customCategory =
      !BUILTIN_CATEGORIES.includes(
        categoryName,
      );

    const exercisesInCategory =
      allExercises.filter(
        (exercise) =>
          exercise.category ===
            categoryName &&
          !isExerciseHidden(
            exercise.id,
            data,
          ),
      );

    if (
      exercisesInCategory.length > 0 &&
      !customCategory
    ) {
      toast({
        variant: "destructive",
        title: "Impossible",
        description:
          "Réassigne d’abord les exercices de cette catégorie.",
      });

      return;
    }

    const fallbackCategory =
      categories.find(
        (category) =>
          category !== categoryName,
      ) ?? "Musculation";

    const message =
      exercisesInCategory.length > 0
        ? `Supprimer « ${categoryName} » ? Les ${exercisesInCategory.length} exercice(s) seront déplacés vers « ${fallbackCategory} ».`
        : `Supprimer la catégorie « ${categoryName} » ?`;

    if (!window.confirm(message)) {
      return;
    }

    deleteCategory(
      categoryName,
      fallbackCategory,
    );

    setEditingCategory(null);

    toast({
      title: "Catégorie supprimée",
    });
  };

  return (
    <>
      <div className="space-y-4">
        {/* Nouvelle catégorie */}
        {showNewCategoryInput ? (
          <div className="flex gap-2">
            <input
              autoFocus
              value={newCategoryInput}
              onChange={(event) =>
                setNewCategoryInput(
                  event.target.value,
                )
              }
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  handleAddCategory();
                }

                if (
                  event.key === "Escape"
                ) {
                  setShowNewCategoryInput(
                    false,
                  );
                }
              }}
              placeholder="Nom de la catégorie"
              className="min-w-0 flex-1 rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-white placeholder:text-muted-foreground/50 focus:border-white/40 focus:outline-none"
            />

            <button
              type="button"
              onClick={handleAddCategory}
              className="rounded-lg bg-white p-2.5 text-black hover:bg-white/90"
            >
              <Check size={18} />
            </button>

            <button
              type="button"
              onClick={() =>
                setShowNewCategoryInput(
                  false,
                )
              }
              className="rounded-lg border border-border p-2.5 text-muted-foreground hover:bg-white/5"
            >
              <X size={18} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() =>
              setShowNewCategoryInput(true)
            }
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border py-3 text-sm text-muted-foreground transition-colors hover:border-white/30 hover:text-white"
          >
            <FolderPlus size={16} />
            Nouvelle catégorie
          </button>
        )}

        {/* Catégories */}
        {categories.map((category) => {
          const exercises =
            exercisesByCategory(category);

          const visibleExercises =
            exercises.filter(
              (exercise) =>
                !isExerciseHidden(
                  exercise.id,
                  data,
                ),
            );

          const hiddenExercises =
            exercises.filter((exercise) =>
              isExerciseHidden(
                exercise.id,
                data,
              ),
            );

          const isOpen =
            !collapsed[category];

          const isCustomCategory =
            !BUILTIN_CATEGORIES.includes(
              category,
            );

          return (
            <div
              key={category}
              className="overflow-hidden rounded-xl border border-border bg-card"
            >
              {/* En-tête catégorie */}
              <div className="flex items-center gap-2 px-4 py-3">
                <button
                  type="button"
                  onClick={() =>
                    toggleCollapse(category)
                  }
                  className="flex min-w-0 flex-1 items-center gap-2 text-left"
                >
                  {isOpen ? (
                    <ChevronDown
                      size={16}
                      className="flex-shrink-0 text-muted-foreground"
                    />
                  ) : (
                    <ChevronRight
                      size={16}
                      className="flex-shrink-0 text-muted-foreground"
                    />
                  )}

                  {editingCategory ===
                  category ? (
                    <input
                      autoFocus
                      value={
                        renameCategoryInput
                      }
                      onChange={(event) =>
                        setRenameCategoryInput(
                          event.target.value,
                        )
                      }
                      onKeyDown={(event) => {
                        event.stopPropagation();

                        if (
                          event.key ===
                          "Enter"
                        ) {
                          handleRenameCategory(
                            category,
                          );
                        }

                        if (
                          event.key ===
                          "Escape"
                        ) {
                          setEditingCategory(
                            null,
                          );
                        }
                      }}
                      onClick={(event) =>
                        event.stopPropagation()
                      }
                      className="min-w-0 flex-1 border-b border-white/40 bg-transparent text-sm font-bold text-white focus:outline-none"
                    />
                  ) : (
                    <span className="truncate text-sm font-bold uppercase tracking-wide text-white">
                      {category}
                    </span>
                  )}

                  <span className="ml-1 flex-shrink-0 text-xs text-muted-foreground">
                    ({visibleExercises.length})
                  </span>
                </button>

                <div className="flex flex-shrink-0 gap-1">
                  {editingCategory ===
                  category ? (
                    <>
                      <button
                        type="button"
                        onClick={() =>
                          handleRenameCategory(
                            category,
                          )
                        }
                        className="rounded-lg p-1.5 text-white hover:bg-white/10"
                      >
                        <Check size={14} />
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setEditingCategory(
                            null,
                          )
                        }
                        className="rounded-lg p-1.5 text-muted-foreground hover:bg-white/10"
                      >
                        <X size={14} />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingCategory(
                            category,
                          );

                          setRenameCategoryInput(
                            category,
                          );
                        }}
                        className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-white/10 hover:text-white"
                      >
                        <Pencil size={14} />
                      </button>

                      {isCustomCategory && (
                        <button
                          type="button"
                          onClick={() =>
                            handleDeleteCategory(
                              category,
                            )
                          }
                          className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-destructive/20 hover:text-destructive"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Liste des exercices */}
              {isOpen && (
                <div className="divide-y divide-border/50 border-t border-border">
                  {visibleExercises.map(
                    (exercise, index) => (
                      <div
                        key={exercise.id}
                        className="flex items-center gap-2 px-4 py-3"
                      >
                        <div className="flex flex-shrink-0 flex-col gap-0.5">
                          <button
                            type="button"
                            onClick={() =>
                              moveExercise(
                                category,
                                exercise.id,
                                -1,
                              )
                            }
                            disabled={index === 0}
                            className="rounded p-0.5 text-muted-foreground transition-colors hover:text-white disabled:pointer-events-none disabled:opacity-20"
                          >
                            <ArrowUp size={14} />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              moveExercise(
                                category,
                                exercise.id,
                                1,
                              )
                            }
                            disabled={
                              index ===
                              visibleExercises.length -
                                1
                            }
                            className="rounded p-0.5 text-muted-foreground transition-colors hover:text-white disabled:pointer-events-none disabled:opacity-20"
                          >
                            <ArrowDown
                              size={14}
                            />
                          </button>
                        </div>

                        <span className="min-w-0 flex-1 truncate text-sm text-white">
                          {exercise.name}
                        </span>

                        <div className="flex flex-shrink-0 gap-1">
                          {overrides[
                            exercise.id
                          ] && (
                            <button
                              type="button"
                              onClick={() =>
                                toast({
                                  title:
                                    "Exercice modifié",
                                  description:
                                    "Les valeurs d’origine peuvent être restaurées depuis les réglages.",
                                })
                              }
                              className="rounded-lg p-1.5 text-muted-foreground/50 transition-colors hover:bg-white/10 hover:text-muted-foreground"
                              title="Modifié"
                            >
                              <RotateCcw
                                size={13}
                              />
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() =>
                              setEditState(
                                exerciseToEdit(
                                  exercise,
                                  data,
                                ),
                              )
                            }
                            className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-white/10 hover:text-white"
                            aria-label={`Modifier ${exercise.name}`}
                          >
                            <Pencil size={15} />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(
                                exercise,
                              )
                            }
                            className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-destructive/20 hover:text-destructive"
                            aria-label={`Supprimer ${exercise.name}`}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    ),
                  )}

                  {/* Exercices masqués */}
                  {hiddenExercises.length >
                    0 && (
                    <div className="px-4 py-3">
                      <p className="mb-2 text-xs text-muted-foreground/50">
                        Masqués (
                        {hiddenExercises.length})
                      </p>

                      {hiddenExercises.map(
                        (exercise) => (
                          <div
                            key={exercise.id}
                            className="flex items-center gap-2 py-1.5"
                          >
                            <span className="min-w-0 flex-1 truncate text-xs text-muted-foreground/50 line-through">
                              {exercise.name}
                            </span>

                            <button
                              type="button"
                              onClick={() => {
                                restoreExercise(
                                  exercise.id,
                                );

                                toast({
                                  title:
                                    "Exercice restauré",
                                  description:
                                    exercise.name,
                                });
                              }}
                              className="rounded border border-border/50 px-2 py-1 text-xs text-muted-foreground transition-colors hover:border-white/30 hover:text-white"
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
                        emptyEdit(category),
                      )
                    }
                    className="flex w-full items-center gap-2 px-4 py-3 text-sm text-muted-foreground transition-colors hover:bg-white/5 hover:text-white"
                  >
                    <Plus size={15} />
                    Ajouter un exercice
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Portal : la fenêtre est placée directement dans le body */}
      {editState &&
        createPortal(
          <ExerciseEditSheet
            state={editState}
            setState={
              setEditState as Dispatch<
                SetStateAction<EditState>
              >
            }
            categories={categories}
            onSave={handleSave}
            onCancel={() =>
              setEditState(null)
            }
          />,
          document.body,
        )}
    </>
  );
}