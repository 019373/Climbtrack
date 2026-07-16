import { useClimbTrack } from "@/context/ClimbTrackContext";
import { MUSCLE_SCORES, ALL_MUSCLES } from "@/data/muscleScores";
import { useMemo, useState } from "react";
import { format, parseISO, subDays } from "date-fns";
import { cn } from "@/lib/utils";
import { BodyMapSVG } from "@/components/BodyMapSVG";

export function CorpsPage() {
  const { data } = useClimbTrack();
  const [timeFilter, setTimeFilter] = useState<'7' | '30' | 'all'>('7');

  const muscleAccumulation = useMemo(() => {
    const scores: Record<string, number> = {};
    ALL_MUSCLES.forEach(m => scores[m] = 0);

    const now = new Date();
    
    // Filter sessions by timeframe and EXCLUDE session 7
    const validSessions = data.sessionLogs.filter(session => {
      if (session.sessionId === 's7-prevention') return false;
      
      const sessionDate = parseISO(session.date);
      if (timeFilter === '7') {
        return sessionDate >= subDays(now, 7);
      } else if (timeFilter === '30') {
        return sessionDate >= subDays(now, 30);
      }
      return true;
    });

    // Accumulate scores
    validSessions.forEach(session => {
      session.exerciseLogs.forEach(log => {
        if (log.completed && MUSCLE_SCORES[log.exerciseId]) {
          const exScores = MUSCLE_SCORES[log.exerciseId];
          Object.entries(exScores).forEach(([muscle, score]) => {
            scores[muscle] += score;
          });
        }
      });
    });

    return scores;
  }, [data.sessionLogs, timeFilter]);

  const maxScore = Math.max(1, ...Object.values(muscleAccumulation));

  // Determine under-worked muscles
  const leastWorked = Object.entries(muscleAccumulation)
    .sort((a, b) => a[1] - b[1])
    .filter(([_, score]) => score < maxScore * 0.3) // bottom 30%
    .slice(0, 3)
    .map(([m]) => m);

  return (
    <div className="min-h-screen bg-background pb-24 pt-safe">
      <header className="px-5 py-6 bg-background/95 backdrop-blur-md sticky top-0 z-10 border-b border-border">
        <h1 className="text-3xl font-extrabold tracking-tight text-white">Corps</h1>
      </header>

      <main className="p-5 space-y-6">
        
        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
          {[
            { id: '7', label: '7 derniers jours' },
            { id: '30', label: '30 derniers jours' },
            { id: 'all', label: 'Depuis le début' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setTimeFilter(f.id as any)}
              className={cn(
                "px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors border",
                timeFilter === f.id 
                  ? "bg-white text-black border-white" 
                  : "bg-transparent text-muted-foreground border-border hover:border-muted-foreground/50"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Visual Map */}
        <div className="bg-card border border-border rounded-xl p-8 flex justify-center">
          <BodyMapSVG scores={muscleAccumulation} maxScore={maxScore} />
        </div>

        {/* Suggestion */}
        {leastWorked.length > 0 && maxScore > 5 && (
          <div className="bg-[#151515] border border-border p-4 rounded-xl">
            <h3 className="text-sm font-bold text-white mb-2">Recommandation</h3>
            <p className="text-sm text-muted-foreground">
              Pour mieux équilibrer ta période récente, tu pourrais privilégier : <strong className="text-white">{leastWorked.join(', ')}</strong>.
            </p>
          </div>
        )}

        {/* Bar Chart */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Répartition de l'effort</h3>
          
          <div className="space-y-2">
            {Object.entries(muscleAccumulation)
              .sort((a, b) => b[1] - a[1])
              .filter(([_, score]) => score > 0)
              .map(([muscle, score]) => (
                <div key={muscle} className="flex items-center gap-3">
                  <div className="w-24 text-xs font-medium text-right capitalize text-muted-foreground">{muscle}</div>
                  <div className="flex-1 h-3 bg-card rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-white rounded-full"
                      style={{ width: `${(score / maxScore) * 100}%` }}
                    />
                  </div>
                  <div className="w-8 text-xs font-mono text-white text-right">{score}</div>
                </div>
              ))}
              
            {Object.values(muscleAccumulation).every(s => s === 0) && (
              <div className="text-center py-4 text-sm text-muted-foreground">
                Aucune donnée pour cette période.
              </div>
            )}
          </div>
        </div>

      </main>
    </div>
  );
}