import { useState } from "react";
import { useClimbTrack, SessionLog } from "@/context/ClimbTrackContext";
import { SESSIONS } from "@/data/sessions";
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, subMonths, addMonths } from "date-fns";
import { fr } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export function HistoriquePage() {
  const { data } = useClimbTrack();
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth)
  });

  const getLogsForDate = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return data.sessionLogs.filter(log => log.date === dateStr);
  };

  const getSessionName = (id: string) => {
    return SESSIONS.find(s => s.id === id)?.name || "Séance inconnue";
  };

  const getStats = () => {
    const today = new Date();
    // last 7 days
    const last7Days = data.sessionLogs.filter(l => {
      const d = parseISO(l.date);
      const diffTime = Math.abs(today.getTime() - d.getTime());
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) <= 7;
    });

    const fingers = data.sessionLogs.filter(l => l.sessionId === 's1-force-doigts' || l.sessionId === 's2-resistance');
    const legs = data.sessionLogs.filter(l => l.sessionId === 's6-jambes');

    const daysSince = (logs: SessionLog[]) => {
      if (logs.length === 0) return "—";
      const last = parseISO(logs.sort((a, b) => b.date.localeCompare(a.date))[0].date);
      const diff = Math.floor((today.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
      return diff === 0 ? "Aujourd'hui" : `${diff}j`;
    };

    return {
      weekCount: last7Days.length,
      lastFingers: daysSince(fingers),
      lastLegs: daysSince(legs)
    };
  };

  const stats = getStats();

  return (
    <div className="min-h-screen bg-background pb-24 pt-safe">
      <header className="px-5 py-6 bg-background/95 backdrop-blur-md sticky top-0 z-10 border-b border-border">
        <h1 className="text-3xl font-extrabold tracking-tight text-white">Historique</h1>
      </header>

      <main className="p-5 space-y-6">
        
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-card border border-border rounded-xl p-3 text-center">
            <div className="text-2xl font-bold font-mono">{stats.weekCount}</div>
            <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mt-1">7 derniers jours</div>
          </div>
          <div className="bg-card border border-border rounded-xl p-3 text-center">
            <div className="text-2xl font-bold font-mono">{stats.lastFingers}</div>
            <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mt-1">Derniers doigts</div>
          </div>
          <div className="bg-card border border-border rounded-xl p-3 text-center">
            <div className="text-2xl font-bold font-mono">{stats.lastLegs}</div>
            <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mt-1">Dernières jambes</div>
          </div>
        </div>

        {/* Calendar Block */}
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
            {/* Empty slots for start of month */}
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
          
          {data.sessionLogs
            .filter(log => parseISO(log.date).getMonth() === currentMonth.getMonth() && parseISO(log.date).getFullYear() === currentMonth.getFullYear())
            .sort((a, b) => b.date.localeCompare(a.date))
            .map(log => {
              const completedCount = log.exerciseLogs.filter(e => e.completed).length;
              return (
                <div key={log.id} className="flex gap-4 group">
                  <div className="flex flex-col items-center">
                    <div className="text-xs font-bold w-12 text-center text-muted-foreground uppercase">
                      {format(parseISO(log.date), "dd MMM", { locale: fr })}
                    </div>
                    <div className="w-px h-full bg-border mt-2 group-last:hidden" />
                  </div>
                  
                  <div className="flex-1 bg-card border border-border rounded-xl p-4 mb-4">
                    <h4 className="font-bold text-white mb-1">{getSessionName(log.sessionId)}</h4>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
                      <Check size={12} className="text-success" />
                      {completedCount} / {log.exerciseLogs.length} exercices
                    </div>
                    {log.note && (
                      <p className="text-sm text-white/80 mt-3 pl-3 border-l-2 border-border italic">
                        "{log.note}"
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
            
            {data.sessionLogs.filter(log => parseISO(log.date).getMonth() === currentMonth.getMonth()).length === 0 && (
              <div className="text-center py-10 text-muted-foreground text-sm">
                Aucune séance enregistrée ce mois-ci.
              </div>
            )}
        </div>

      </main>
    </div>
  );
}