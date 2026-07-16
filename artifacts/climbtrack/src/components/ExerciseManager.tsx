import { useState } from 'react';
import {
  ChevronDown, ChevronRight, Plus, Pencil, Trash2, ArrowUp, ArrowDown,
  RotateCcw, Check, X, FolderPlus,
} from 'lucide-react';
import { useClimbTrack } from '@/context/ClimbTrackContext';
import { ExerciseDef, SESSIONS, TrackingType, ASSISTANCE_OPTIONS } from '@/data/sessions';
import {
  getAllCategories, getAllManagedExercises, getExerciseSessionIds,
  isExerciseHidden, BUILTIN_CATEGORIES, TRACKING_LABELS, TRACKING_TYPES,
} from '@/utils/exercises';
import { useToast } from '@/hooks/use-toast';

/* ── helpers ── */
const BUILTIN_IDS = new Set(
  SESSIONS.flatMap(s => s.exercises.map(e => e.id))
);
const isBuiltin = (id: string) => BUILTIN_IDS.has(id);

type EditState = {
  id: string | null; // null = new
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

const TRACKING_HAS: Record<TrackingType, { reps: boolean; duration: boolean; weight: boolean; assistance: boolean }> = {
  'duration+assistance': { reps: false, duration: true, weight: false, assistance: true },
  'reps':                { reps: true,  duration: false, weight: false, assistance: false },
  'weight':              { reps: false, duration: false, weight: true,  assistance: false },
  'weight+duration':     { reps: false, duration: true,  weight: true,  assistance: false },
  'assistance':          { reps: true,  duration: true,  weight: false, assistance: true },
  'weight+reps':         { reps: true,  duration: false, weight: true,  assistance: false },
  'duration':            { reps: false, duration: true,  weight: false, assistance: false },
  'none':                { reps: false, duration: false, weight: false, assistance: false },
};

function emptyEdit(category = ''): EditState {
  return {
    id: null, name: '', description: '', category,
    tracking: 'reps', sessionIds: [],
    sets: 3, reps: 8, duration: 30, weight: 0, restSeconds: 90, assistance: ASSISTANCE_OPTIONS[5],
    isHangboard: false,
  };
}

function exerciseToEdit(ex: ExerciseDef, data: ReturnType<typeof useClimbTrack>['data']): EditState {
  const sessionIds = getExerciseSessionIds(ex.id, data);
  const def = data.exerciseDefaults[ex.id] ?? ex.defaultValues;
  return {
    id: ex.id,
    name: ex.name,
    description: ex.description,
    category: ex.category,
    tracking: ex.tracking,
    sessionIds,
    sets: def.sets ?? 3,
    reps: def.reps ?? 8,
    duration: def.duration ?? 30,
    weight: def.weight ?? 0,
    restSeconds: def.restSeconds ?? 90,
    assistance: def.assistance ?? ASSISTANCE_OPTIONS[5],
    isHangboard: ex.isHangboard ?? false,
  };
}

/* ── sub-components ── */

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{label}</label>
      {children}
    </div>
  );
}

function Input({ value, onChange, type = 'text', placeholder = '' }: {
  value: string | number; onChange: (v: string) => void; type?: string; placeholder?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-white text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:border-white/40"
    />
  );
}

function Select({ value, onChange, options }: {
  value: string; onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-white/40"
    >
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

/* ── EditForm ── */
function EditForm({
  state, setState, categories, onSave, onCancel,
}: {
  state: EditState;
  setState: React.Dispatch<React.SetStateAction<EditState>>;
  categories: string[];
  onSave: () => void;
  onCancel: () => void;
}) {
  const has = TRACKING_HAS[state.tracking];
  const set = (k: keyof EditState) => (v: string) =>
    setState(prev => ({ ...prev, [k]: v }));
  const setNum = (k: keyof EditState) => (v: string) =>
    setState(prev => ({ ...prev, [k]: Number(v) || 0 }));

  const toggleSession = (sid: string) =>
    setState(prev => ({
      ...prev,
      sessionIds: prev.sessionIds.includes(sid)
        ? prev.sessionIds.filter(s => s !== sid)
        : [...prev.sessionIds, sid],
    }));

  return (
    <div className="bg-background border border-border/60 rounded-xl p-4 space-y-4 mt-1">
      {/* Name */}
      <Field label="Nom">
        <Input value={state.name} onChange={set('name')} placeholder="Nom de l'exercice" />
      </Field>

      {/* Description */}
      <Field label="Description (optionnel)">
        <Input value={state.description} onChange={set('description')} placeholder="Courte description" />
      </Field>

      {/* Category + tracking in 2 cols */}
      <div className="grid grid-cols-2 gap-3">
        <Field label="Catégorie">
          <Select value={state.category} onChange={set('category')}
            options={categories.map(c => ({ value: c, label: c }))} />
        </Field>
        <Field label="Type de suivi">
          <Select value={state.tracking} onChange={v => setState(p => ({ ...p, tracking: v as TrackingType }))}
            options={TRACKING_TYPES.map(t => ({ value: t, label: TRACKING_LABELS[t] }))} />
        </Field>
      </div>

      {/* Defaults */}
      <div className="grid grid-cols-2 gap-3">
        <Field label="Séries">
          <Input type="number" value={state.sets} onChange={setNum('sets')} />
        </Field>
        <Field label="Repos (s)">
          <Input type="number" value={state.restSeconds} onChange={setNum('restSeconds')} />
        </Field>
        {has.reps && (
          <Field label="Répétitions">
            <Input type="number" value={state.reps} onChange={setNum('reps')} />
          </Field>
        )}
        {has.duration && (
          <Field label="Durée (s)">
            <Input type="number" value={state.duration} onChange={setNum('duration')} />
          </Field>
        )}
        {has.weight && (
          <Field label="Charge (kg)">
            <Input type="number" value={state.weight} onChange={setNum('weight')} />
          </Field>
        )}
        {has.assistance && (
          <div className="col-span-2">
            <Field label="Assistance par défaut">
              <Select value={state.assistance} onChange={set('assistance')}
                options={ASSISTANCE_OPTIONS.map(a => ({ value: a, label: a }))} />
            </Field>
          </div>
        )}
      </div>

      {/* Sessions */}
      <Field label="Apparaît dans les séances">
        <div className="space-y-1.5 pt-1">
          {SESSIONS.map(s => (
            <label key={s.id} className="flex items-center gap-2.5 cursor-pointer py-1">
              <div
                className={`w-5 h-5 rounded flex items-center justify-center border flex-shrink-0 transition-colors ${
                  state.sessionIds.includes(s.id)
                    ? 'bg-white border-white'
                    : 'border-border bg-transparent'
                }`}
                onClick={() => toggleSession(s.id)}
              >
                {state.sessionIds.includes(s.id) && <Check size={12} className="text-black" />}
              </div>
              <span className="text-sm text-white">{s.name}</span>
            </label>
          ))}
        </div>
      </Field>

      {/* Actions */}
      <div className="flex gap-3 pt-1">
        <button
          onClick={onCancel}
          className="flex-1 py-3 rounded-xl border border-border text-muted-foreground text-sm font-medium hover:bg-white/5 transition-colors"
        >
          Annuler
        </button>
        <button
          onClick={onSave}
          disabled={!state.name.trim()}
          className="flex-1 py-3 rounded-xl bg-white text-black text-sm font-bold hover:bg-white/90 transition-colors disabled:opacity-40"
        >
          Enregistrer
        </button>
      </div>
    </div>
  );
}

/* ── ExerciseManager (main export) ── */
export function ExerciseManager() {
  const {
    data,
    addExercise, deleteExercise, restoreExercise,
    updateExerciseOverride, updateExerciseDefault,
    setExerciseCategoryOrder,
    addCategory, renameCategory, deleteCategory,
  } = useClimbTrack();
  const { toast } = useToast();

  const categories = getAllCategories(data);
  const allExercises = getAllManagedExercises(data);
  const overrides = data.exerciseOverrides ?? {};

  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [editState, setEditState] = useState<EditState | null>(null);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [newCategoryInput, setNewCategoryInput] = useState('');
  const [renameCategoryInput, setRenameCategoryInput] = useState('');
  const [showNewCatInput, setShowNewCatInput] = useState(false);

  /* ── Helpers ── */

  const toggleCollapse = (cat: string) =>
    setCollapsed(p => ({ ...p, [cat]: !p[cat] }));

  const exercisesByCategory = (cat: string) => {
    const ordered = data.exerciseCategoryOrder?.[cat];
    const exs = allExercises.filter(e => e.category === cat);
    if (!ordered || ordered.length === 0) return exs;
    return [
      ...ordered.map(id => exs.find(e => e.id === id)).filter(Boolean) as ExerciseDef[],
      ...exs.filter(e => !ordered.includes(e.id)),
    ];
  };

  const moveExercise = (cat: string, id: string, dir: -1 | 1) => {
    const exs = exercisesByCategory(cat);
    const idx = exs.findIndex(e => e.id === id);
    if (idx === -1) return;
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= exs.length) return;
    const newOrder = exs.map(e => e.id);
    [newOrder[idx], newOrder[newIdx]] = [newOrder[newIdx], newOrder[idx]];
    setExerciseCategoryOrder(cat, newOrder);
  };

  /* ── Save (create or update) ── */
  const handleSave = () => {
    if (!editState || !editState.name.trim()) return;
    const defaults = {
      sets: editState.sets,
      restSeconds: editState.restSeconds,
      ...(TRACKING_HAS[editState.tracking].reps && { reps: editState.reps }),
      ...(TRACKING_HAS[editState.tracking].duration && { duration: editState.duration }),
      ...(TRACKING_HAS[editState.tracking].weight && { weight: editState.weight }),
      ...(TRACKING_HAS[editState.tracking].assistance && { assistance: editState.assistance }),
    };

    if (editState.id === null) {
      // New exercise
      addExercise({
        name: editState.name.trim(),
        description: editState.description.trim(),
        category: editState.category,
        tracking: editState.tracking,
        defaultValues: defaults,
        sessionIds: editState.sessionIds,
        isHangboard: editState.isHangboard,
        ...(editState.isHangboard && { assistanceOptions: ASSISTANCE_OPTIONS }),
      });
      toast({ title: 'Exercice ajouté', description: editState.name.trim() });
    } else {
      // Update existing
      updateExerciseOverride(editState.id, {
        name: editState.name.trim(),
        description: editState.description.trim(),
        category: editState.category,
        tracking: editState.tracking,
        sessionIds: editState.sessionIds,
      });
      updateExerciseDefault(editState.id, defaults);
      toast({ title: 'Exercice mis à jour', description: editState.name.trim() });
    }
    setEditState(null);
  };

  /* ── Delete ── */
  const handleDelete = (ex: ExerciseDef) => {
    const msg = isBuiltin(ex.id)
      ? `Masquer "${ex.name}" de toutes les séances ? L'historique est conservé.`
      : `Supprimer "${ex.name}" de toutes les séances ? L'historique est conservé.`;
    if (!window.confirm(msg)) return;
    deleteExercise(ex.id);
    toast({ title: 'Exercice masqué', description: 'Données historiques conservées.' });
    if (editState?.id === ex.id) setEditState(null);
  };

  /* ── Category management ── */
  const handleAddCategory = () => {
    const name = newCategoryInput.trim();
    if (!name || categories.includes(name)) return;
    addCategory(name);
    setNewCategoryInput('');
    setShowNewCatInput(false);
    toast({ title: 'Catégorie créée', description: name });
  };

  const handleRenameCategory = (oldName: string) => {
    const newName = renameCategoryInput.trim();
    if (!newName || newName === oldName || categories.includes(newName)) return;
    renameCategory(oldName, newName);
    setEditingCategory(null);
    setRenameCategoryInput('');
    toast({ title: 'Catégorie renommée' });
  };

  const handleDeleteCategory = (name: string) => {
    const isCustom = !BUILTIN_CATEGORIES.includes(name);
    const exsInCat = allExercises.filter(e => e.category === name && !isExerciseHidden(e.id, data));
    if (exsInCat.length > 0 && !isCustom) {
      toast({ variant: 'destructive', title: 'Impossible', description: 'Réassignez d\'abord les exercices de cette catégorie.' });
      return;
    }
    const fallback = categories.find(c => c !== name) ?? 'Musculation';
    const msg = exsInCat.length > 0
      ? `Supprimer "${name}" ? Les ${exsInCat.length} exercice(s) seront déplacés vers "${fallback}".`
      : `Supprimer la catégorie "${name}" ?`;
    if (!window.confirm(msg)) return;
    deleteCategory(name, fallback);
    setEditingCategory(null);
    toast({ title: 'Catégorie supprimée' });
  };

  /* ── Render ── */
  return (
    <div className="space-y-4">

      {/* New category button */}
      {showNewCatInput ? (
        <div className="flex gap-2">
          <input
            autoFocus
            value={newCategoryInput}
            onChange={e => setNewCategoryInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleAddCategory(); if (e.key === 'Escape') setShowNewCatInput(false); }}
            placeholder="Nom de la catégorie"
            className="flex-1 bg-card border border-border rounded-lg px-3 py-2.5 text-white text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:border-white/40"
          />
          <button onClick={handleAddCategory} className="p-2.5 rounded-lg bg-white text-black hover:bg-white/90"><Check size={18} /></button>
          <button onClick={() => setShowNewCatInput(false)} className="p-2.5 rounded-lg border border-border text-muted-foreground hover:bg-white/5"><X size={18} /></button>
        </div>
      ) : (
        <button
          onClick={() => setShowNewCatInput(true)}
          className="w-full flex items-center justify-center gap-2 py-3 border border-dashed border-border rounded-xl text-muted-foreground text-sm hover:border-white/30 hover:text-white transition-colors"
        >
          <FolderPlus size={16} />
          Nouvelle catégorie
        </button>
      )}

      {/* Categories */}
      {categories.map(cat => {
        const exs = exercisesByCategory(cat);
        const visibleExs = exs.filter(e => !isExerciseHidden(e.id, data));
        const hiddenExs = exs.filter(e => isExerciseHidden(e.id, data));
        const isOpen = !collapsed[cat];
        const isCustomCat = !BUILTIN_CATEGORIES.includes(cat);

        return (
          <div key={cat} className="bg-card border border-border rounded-xl overflow-hidden">

            {/* Category header */}
            <div className="flex items-center px-4 py-3 gap-2">
              <button
                onClick={() => toggleCollapse(cat)}
                className="flex items-center gap-2 flex-1 min-w-0 text-left"
              >
                {isOpen ? <ChevronDown size={16} className="text-muted-foreground flex-shrink-0" /> : <ChevronRight size={16} className="text-muted-foreground flex-shrink-0" />}
                {editingCategory === cat ? (
                  <input
                    autoFocus
                    value={renameCategoryInput}
                    onChange={e => setRenameCategoryInput(e.target.value)}
                    onKeyDown={e => {
                      e.stopPropagation();
                      if (e.key === 'Enter') handleRenameCategory(cat);
                      if (e.key === 'Escape') setEditingCategory(null);
                    }}
                    onClick={e => e.stopPropagation()}
                    className="flex-1 bg-transparent border-b border-white/40 text-white text-sm font-bold focus:outline-none"
                  />
                ) : (
                  <span className="font-bold text-sm text-white uppercase tracking-wide truncate">{cat}</span>
                )}
                <span className="text-xs text-muted-foreground ml-1 flex-shrink-0">({visibleExs.length})</span>
              </button>

              {/* Category actions */}
              <div className="flex gap-1 flex-shrink-0">
                {editingCategory === cat ? (
                  <>
                    <button onClick={() => handleRenameCategory(cat)} className="p-1.5 rounded-lg hover:bg-white/10 text-white"><Check size={14} /></button>
                    <button onClick={() => setEditingCategory(null)} className="p-1.5 rounded-lg hover:bg-white/10 text-muted-foreground"><X size={14} /></button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => { setEditingCategory(cat); setRenameCategoryInput(cat); }}
                      className="p-1.5 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-white transition-colors"
                    ><Pencil size={14} /></button>
                    {isCustomCat && (
                      <button
                        onClick={() => handleDeleteCategory(cat)}
                        className="p-1.5 rounded-lg hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors"
                      ><Trash2 size={14} /></button>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Exercise list */}
            {isOpen && (
              <div className="border-t border-border divide-y divide-border/50">
                {visibleExs.map((ex, idx) => {
                  const isEditing = editState?.id === ex.id;
                  return (
                    <div key={ex.id}>
                      {/* Exercise row */}
                      <div className="flex items-center gap-2 px-4 py-3">
                        {/* Reorder */}
                        <div className="flex flex-col gap-0.5 flex-shrink-0">
                          <button
                            onClick={() => moveExercise(cat, ex.id, -1)}
                            disabled={idx === 0}
                            className="p-0.5 rounded text-muted-foreground hover:text-white disabled:opacity-20 disabled:pointer-events-none transition-colors"
                          ><ArrowUp size={14} /></button>
                          <button
                            onClick={() => moveExercise(cat, ex.id, 1)}
                            disabled={idx === visibleExs.length - 1}
                            className="p-0.5 rounded text-muted-foreground hover:text-white disabled:opacity-20 disabled:pointer-events-none transition-colors"
                          ><ArrowDown size={14} /></button>
                        </div>

                        {/* Name */}
                        <span className="flex-1 text-sm text-white min-w-0 truncate">{ex.name}</span>

                        {/* Actions */}
                        <div className="flex gap-1 flex-shrink-0">
                          {overrides[ex.id] && (
                            <button
                              onClick={() => toast({ title: 'Restaurer', description: 'Pour restaurer les valeurs d\'origine, utilisez "Rétablir les valeurs par défaut" dans les réglages.' })}
                              className="p-1.5 rounded-lg hover:bg-white/10 text-muted-foreground/50 hover:text-muted-foreground transition-colors"
                              title="Modifié"
                            ><RotateCcw size={13} /></button>
                          )}
                          <button
                            onClick={() => {
                              if (isEditing) { setEditState(null); return; }
                              setEditState(exerciseToEdit(ex, data));
                            }}
                            className={`p-1.5 rounded-lg hover:bg-white/10 transition-colors ${isEditing ? 'text-white bg-white/10' : 'text-muted-foreground hover:text-white'}`}
                          ><Pencil size={15} /></button>
                          <button
                            onClick={() => handleDelete(ex)}
                            className="p-1.5 rounded-lg hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors"
                          ><Trash2 size={15} /></button>
                        </div>
                      </div>

                      {/* Inline edit form */}
                      {isEditing && editState && (
                        <div className="px-4 pb-4">
                          <EditForm
                            state={editState}
                            setState={setEditState as React.Dispatch<React.SetStateAction<EditState>>}
                            categories={categories}
                            onSave={handleSave}
                            onCancel={() => setEditState(null)}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Hidden exercises (collapsed) */}
                {hiddenExs.length > 0 && (
                  <div className="px-4 py-2">
                    <p className="text-xs text-muted-foreground/50 mb-2">Masqués ({hiddenExs.length})</p>
                    {hiddenExs.map(ex => (
                      <div key={ex.id} className="flex items-center gap-2 py-1.5">
                        <span className="flex-1 text-xs text-muted-foreground/50 line-through truncate">{ex.name}</span>
                        <button
                          onClick={() => { restoreExercise(ex.id); toast({ title: 'Exercice restauré', description: ex.name }); }}
                          className="text-xs text-muted-foreground hover:text-white px-2 py-1 rounded border border-border/50 hover:border-white/30 transition-colors"
                        >
                          Restaurer
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add exercise to this category */}
                {editState?.id === null && editState.category === cat ? (
                  <div className="px-4 pb-4 pt-1">
                    <EditForm
                      state={editState}
                      setState={setEditState as React.Dispatch<React.SetStateAction<EditState>>}
                      categories={categories}
                      onSave={handleSave}
                      onCancel={() => setEditState(null)}
                    />
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setEditState(emptyEdit(cat));
                    }}
                    className="w-full flex items-center gap-2 px-4 py-3 text-sm text-muted-foreground hover:text-white hover:bg-white/5 transition-colors"
                  >
                    <Plus size={15} />
                    Ajouter un exercice
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
