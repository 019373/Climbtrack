import { useState } from "react";
import { useClimbTrack, SessionLog, ExerciseLog } from "@/context/ClimbTrackContext";
import { SESSIONS } from "@/data/sessions";
import { getAllManagedExercises } from "@/utils/exercises";
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, subMonths, addMonths } from "date-fns";
import { fr } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Check, Pencil, Trash2, X, Save } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

// ── SessionEditModal ───────────────────────────────────────────────────────────

function SessionEditModal({
  log,
  onClose,
  onSave,
  onDelete,
}: {
  log: SessionLog;
  onClose: () => void;
  onSave: (updated: SessionLog) => void;
  onDelete: () => void;
}) {
  const { data } = useClimbTrack();
  const allExercises = getAllManagedExercises(data);

  const [note, setNote] = useState(log.note ?? "");
  const [exerciseLogs, setExerciseLogs] = useState<ExerciseLog[]>(log.exerciseLogs.map(e => ({ ...e })));

  const getExName = (id: string) => {
    const ex = allExercises.find(e => e.id === id);
    if (ex) return ex.name;
    // Fallback: search in SESSIONS
    for (const s of SESSIONS) {
      const found = s.exercises.find(e => e.id === id);
      if (found) return found.name;
    }
    return id;
  };

  const toggleCompleted = (idx: number) => {
    setExerciseLogs(prev => prev.map((el, i) =>
      i === idx ? { ...el, completed: !el.completed } : el
    ));
  };

  const handleSave = () => {
    onSave({ ...log, note: note.trim() || undefined, exerciseLogs });
  };

  const completedCount = exerciseLogs.filter(e => e.completed).length;

  return (
    <div className="fixed inset-0 z-50 flex items-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative w-full bg-background border-t border-border rounded-t-3xl flex flex-col max-h-[85vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
          <div className="w-10 h-1 bg-white/20 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-border flex-shrink-0">
          <div>
            <h3 className="font-bold text-white text-base">
              {SESSIONS.find(s => s.id === log.sessionId)?.name ?? "Séance"}
            </h3>
            <p className="text-xs text-muted-foreground">
              {format(parseISO(log.date), "EEEE d MMMM yyyy", { locale: fr })}
              {" · "}{completedCount}/{exerciseLogs.length} exercices
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10">
            <X size={18} className="text-muted-foreground" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4">

          {/* Exercise completion toggles */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Exercices</h4>
            <div className="bg-card border border-border rounded-xl divide-y divide-border/50">
              {exerciseLogs.map((el, idx) => (
                <button
                  key={el.exerciseId + idx}
                  onClick={() => toggleCompleted(idx)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors"
                >
                  <div className={cn(
                    "w-5 h-5 rounded border flex-shrink-0 flex items-center justify-center transition-colors",
                    el.completed
                      ? "bg-white border-white"
                      : "bg-transparent border-border"
                  )}>
                    {el.completed && <Check size={12} className="text-black" />}
                  </div>
                  <span className={cn(
                    "text-sm text-left flex-1",
                    el.completed ? "text-white" : "text-muted-foreground line-through"
                  )}>
                    {getExName(el.exerciseId)}
                  </span>
                  {/* Show key value */}
                  <span className="text-xs text-muted-foreground font-mono flex-shrink-0">
                    {el.weight != null && el.weight > 0 ? `${el.weight}kg` :
                     el.duration != null && el.duration > 0 ? `${el.duration}s` :
                     el.reps != null && el.reps > 0 ? `×${el.reps}` : ""}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Note */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Note</h4>
            <textarea
              className="w-full bg-card border border-border rounded-xl p-4 text-white placeholder:text-muted-foreground/50 resize-none min-h-[80px] focus:outline-none focus:border-white/40"
              placeholder="Ajouter une note..."
              value={note}
              onChange={e => setNote(e.target.value)}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="px-5 py-4 border-t border-border flex gap-3 flex-shrink-0">
          <button
            onClick={onDelete}
            className="flex items-center gap-2 px-4 py-3 rounded-xl border border-destructive/40 text-destructive hover:bg-destructive/10 transition-colors text-sm font-medium"
          >
            <Trash2 size={16} />
            Supprimer
          </button>
          <button
            onClick={handleSave}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-white text-black font-bold text-sm hover:bg-white/90 transition-colors"
          >
            <Save size={16} />
            Enregistrer
          </button>
        </div>
        <div style={{ height: "env(safe-area-inset-bottom, 16px)" }} />
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export function HistoriquePage() {
  const { data, deleteSessionLog, updateSessionLog } = useClimbTrack();
  const { toast } = useToast();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [editingLog, setEditingLog] = useState<SessionLog | null>(null);

  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth)
  });

  const getLogsForDate = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return data.sessionLogs.filter(log => log.date === dateStr);
  };

  const getSessionName = (id: string) =>
    SESSIONS.find(s => s.id === id)?.name ?? "Séance";

  const getStats = () => {
    const today = new Date();
    const last7Days = data.sessionLogs.filter(l => {
      const d = parseISO(l.date);
      return Math.ceil(Math.abs(today.getTime() - d.getTime()) / 86400000) <= 7;
    });
    const fingers = data.sessionLogs.filter(l =>
      l.sessionId === 's1-force-doigts' || l.sessionId === 's2-resistance'
    );
    const legs = data.sessionLogs.filter(l => l.sessionId === 's6-jambes');
    const daysSince = (logs: SessionLog[]) => {
      if (logs.length === 0) return "—";
      const last = parseISO([...logs].sort((a, b) => b.date.localeCompare(a.date))[0].date);
      const diff = Math.floor((today.getTime() - last.getTime()) / 86400000);
      return diff === 0 ? "Auj." : `${diff}j`;
    };
    return { weekCount: last7Days.length, lastFingers: daysSince(fingers), lastLegs: daysSince(legs) };
  };

  const stats = getStats();

  const handleSaveEdit = (updated: SessionLog) => {
    updateSessionLog(updated.id, updated);
    setEditingLog(null);
    toast({ title: "Séance mise à jour" });
  };

  const handleDelete = (id: string) => {
    if (!window.confirm("Supprimer cette séance ? Cette action est irréversible.")) return;
    deleteSessionLog(id);
    setEditingLog(null);
    toast({ title: "Séance supprimée" });
  };

  const monthLogs = data.sessionLogs
    .filter(log =>
      parseISO(log.date).getMonth() === currentMonth.getMonth() &&
      parseISO(log.date).getFullYear() === currentMonth.getFullYear()
    )
    .sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="min-h-screen bg-background pb-24 pt-safe">
      <header className="px-5 py-6 bg-background/95 backdrop-blur-md sticky top-0 z-10 border-b border-border">
        <h1 className="text-3xl font-extrabold tracking-tight text-white">Historique</h1>
      </header>

      <main className="p-5 space-y-6">

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: stats.weekCount, label: "7 derniers jours" },
            { value: stats.lastFingers, label: "Derniers doigts" },
            { value: stats.lastLegs, label: "Dernières jambes" },
          ].map(s => (
            <div key={s.label} className="bg-card border border-border rounded-xl p-3 text-center">
              <div className="text-2xl font-bold font-mono">{s.value}</div>
              <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Calendar */}
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex justify-between items-center mb-4">
            <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-1 text-muted-foreground hover:text-white">
              <ChevronLeft size={20} />
            </button>
            <h2 className="text-sm font-bold uppercase tracking-widest">
              {format(currentMonth, "MMMM yyyy", { locale: fr })}
            </h2>
            <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-1 text-muted-foreground hover:text-white">
              <ChevronRight size={20} />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, i) => (
              <div key={i} className="text-[10px] text-muted-foreground font-bold">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: (startOfMonth(currentMonth).getDay() + 6) % 7 }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square" />
            ))}
            {daysInMonth.map((date) => {
              const logs = getLogsForDate(date);
              const isToday = isSameDay(date, new Date());
              return (
                <div
                  key={date.toISOString()}
                  className={cn(
                    "aspect-square rounded-full flex flex-col items-center justify-center relative",
                    isToday ? "bg-white/10" : ""
                  )}
                >
                  <span className={cn("text-sm font-mono", logs.length > 0 ? "text-white" : "text-muted-foreground")}>
                    {format(date, "d")}
                  </span>
                  {logs.length > 0 && (
                    <div className="w-1.5 h-1.5 rounded-full bg-white absolute bottom-1" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Feed */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Ce mois-ci</h3>

          {monthLogs.map(log => {
            const completedCount = log.exerciseLogs.filter(e => e.completed).length;
            return (
              <div key={log.id} className="flex gap-4 group">
                <div className="flex flex-col items-center">
                  <div className="text-xs font-bold w-12 text-center text-muted-foreground uppercase">
                    {format(parseISO(log.date), "dd MMM", { locale: fr })}
                  </div>
                  <div className="w-px h-full bg-border mt-2 group-last:hidden" />
                </div>

                <div className="flex-1 bg-card border border-border rounded-xl p-4 mb-4 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-bold text-white text-sm leading-tight flex-1">{getSessionName(log.sessionId)}</h4>
                    {/* Edit button */}
                    <button
                      onClick={() => setEditingLog(log)}
                      className="p-1.5 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-white transition-colors flex-shrink-0"
                    >
                      <Pencil size={15} />
                    </button>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono mt-1">
                    <Check size={12} className="text-green-400" />
                    {completedCount} / {log.exerciseLogs.length} exercices
                  </div>
                  {log.note && (
                    <p className="text-sm text-white/80 mt-2 pl-3 border-l-2 border-border italic">
                      "{log.note}"
                    </p>
                  )}
                </div>
              </div>
            );
          })}

          {monthLogs.length === 0 && (
            <div className="text-center py-10 text-muted-foreground text-sm">
              Aucune séance enregistrée ce mois-ci.
            </div>
          )}
        </div>
      </main>

      {/* Edit modal */}
      {editingLog && (
        <SessionEditModal
          log={editingLog}
          onClose={() => setEditingLog(null)}
          onSave={handleSaveEdit}
          onDelete={() => handleDelete(editingLog.id)}
        />
      )}
    </div>
  );
}
