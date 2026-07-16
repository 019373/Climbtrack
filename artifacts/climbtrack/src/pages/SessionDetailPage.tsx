import { useState, useEffect, useRef } from "react";
import { useRoute, useLocation } from "wouter";
import { ChevronLeft } from "lucide-react";
import { SESSIONS, SessionDef } from "@/data/sessions";
import { useClimbTrack, ExerciseLog, SessionLog } from "@/context/ClimbTrackContext";
import { ExerciseRow } from "@/components/ExerciseRow";
import { MUSCLE_SCORES } from "@/data/muscleScores";
import { getSessionExercises } from "@/utils/exercises";
import type { ExerciseDef } from "@/data/sessions";

export function SessionDetailPage() {
  const [match, params] = useRoute("/seance/:id");
  const [, setLocation] = useLocation();
  const { data, addSessionLog, updateExerciseDefault } = useClimbTrack();

  const [sessionDef, setSessionDef] = useState<SessionDef | null>(null);
  const [sessionExercises, setSessionExercises] = useState<ExerciseDef[]>([]);
  const [logs, setLogs] = useState<Record<string, ExerciseLog>>({});
  const [painAreas, setPainAreas] = useState<Record<string, number>>({});
  const [note, setNote] = useState("");

  // Keep a ref to data so the init effect can read it without being a dep
  const dataRef = useRef(data);
  dataRef.current = data;

  // Initialize only when the session changes (not on every data update)
  useEffect(() => {
    if (!match || !params?.id) return;
    const def = SESSIONS.find(s => s.id === params.id);
    if (!def) { setLocation("/"); return; }

    setSessionDef(def);
    const exercises = getSessionExercises(params.id, dataRef.current);
    setSessionExercises(exercises);

    const initialLogs: Record<string, ExerciseLog> = {};
    exercises.forEach(ex => {
      const defaults = dataRef.current.exerciseDefaults[ex.id] ?? ex.defaultValues;
      initialLogs[ex.id] = {
        exerciseId: ex.id,
        completed: false,
        sets: defaults.sets,
        reps: defaults.reps,
        duration: defaults.duration,
        weight: defaults.weight,
        assistance: defaults.assistance,
      };
    });
    setLogs(initialLogs);
  }, [match, params?.id, setLocation]);

  if (!sessionDef) return null;

  const handleLogChange = (exId: string, updatedLog: ExerciseLog) =>
    setLogs(prev => ({ ...prev, [exId]: updatedLog }));

  const handleFinish = () => {
    const today = new Date().toISOString().split('T')[0];
    const newSessionLog: SessionLog = {
      id: crypto.randomUUID(),
      date: today,
      sessionId: sessionDef.id,
      exerciseLogs: Object.values(logs),
      note: note.trim() || undefined,
      pain: Object.keys(painAreas).length > 0 ? painAreas : undefined,
    };
    addSessionLog(newSessionLog);
    setLocation("/");
  };

  const getPainWarning = (exId: string) => {
    const scores = MUSCLE_SCORES[exId];
    if (!scores) return false;
    if (painAreas['Doigts'] > 3 && scores['doigts'] >= 3) return true;
    if ((painAreas['Épaule droite'] > 3 || painAreas['Épaule gauche'] > 3) && scores['épaules'] >= 3) return true;
    return false;
  };

  const PAIN_SLIDERS = [
    'Doigts', 'Poignet droit', 'Poignet gauche',
    'Coude droit', 'Coude gauche', 'Épaule droite', 'Épaule gauche',
  ];

  return (
    <div className="min-h-screen bg-background pb-32">
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-md border-b border-border pt-safe">
        <div className="flex items-center px-4 py-4 gap-3">
          <button onClick={() => setLocation("/")} className="p-2 -ml-2 rounded-full hover:bg-white/10 active:scale-95 transition-all">
            <ChevronLeft size={24} className="text-white" />
          </button>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white leading-tight">{sessionDef.name}</h1>
          </div>
        </div>
      </header>

      <main className="p-4 space-y-4">
        {sessionExercises.map(ex => (
          <ExerciseRow
            key={ex.id}
            exercise={ex}
            defaults={data.exerciseDefaults[ex.id] ?? ex.defaultValues}
            log={logs[ex.id]}
            onChange={(l) => handleLogChange(ex.id, l)}
            onUpdateDefault={(defs) => updateExerciseDefault(ex.id, defs)}
            isPainful={getPainWarning(ex.id)}
          />
        ))}

        {sessionExercises.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <p className="text-sm">Aucun exercice dans cette séance.</p>
            <p className="text-xs mt-1">Ajoutez-en depuis Réglages → Gérer les exercices.</p>
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-border">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Douleurs & Gênes (Optionnel)</h3>
          <div className="bg-card border border-border rounded-xl p-4 space-y-4">
            {PAIN_SLIDERS.map(area => (
              <div key={area} className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground w-1/3">{area}</span>
                <input
                  type="range" min="0" max="10"
                  value={painAreas[area] || 0}
                  onChange={(e) => setPainAreas(prev => ({ ...prev, [area]: parseInt(e.target.value) }))}
                  className="flex-1 accent-white"
                />
                <span className="text-xs font-mono w-4 text-right">{painAreas[area] || 0}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Note</h3>
          <textarea
            className="w-full bg-card border border-border rounded-xl p-4 text-white placeholder:text-muted-foreground/50 resize-none min-h-[100px]"
            placeholder="Comment s'est passée la séance ?"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/90 backdrop-blur-md border-t border-border pb-safe">
        <button
          onClick={handleFinish}
          className="w-full bg-white text-black font-bold py-4 rounded-xl text-lg hover:bg-white/90 active:scale-[0.98] transition-all"
        >
          Terminer la séance
        </button>
      </div>
    </div>
  );
}
