import { useState, useMemo } from "react";
import { SESSIONS, ExerciseDef } from "@/data/sessions";
import { useClimbTrack, ExerciseLog } from "@/context/ClimbTrackContext";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { ChevronDown, Info, ArrowUpRight, Activity } from "lucide-react";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";

export function ProgressionPage() {
  const { data } = useClimbTrack();
  const [selectedExId, setSelectedExId] = useState<string>("suspension-20mm");

  // Flatten all exercises for the dropdown
  const allExercises = useMemo(() => {
    const list: ExerciseDef[] = [];
    SESSIONS.forEach(s => {
      s.exercises.forEach(e => {
        if (!list.find(x => x.id === e.id)) list.push(e);
      });
    });
    return list;
  }, []);

  const selectedEx = allExercises.find(e => e.id === selectedExId);

  // Extract timeline data for the selected exercise
  const chartData = useMemo(() => {
    const points: any[] = [];
    
    // Sort logs chronologically (oldest to newest)
    const sortedSessions = [...data.sessionLogs].sort((a, b) => a.date.localeCompare(b.date));
    
    sortedSessions.forEach(session => {
      const exLog = session.exerciseLogs.find(e => e.exerciseId === selectedExId && e.completed);
      if (exLog) {
        let value = 0;
        // Determine the primary metric to chart
        if (selectedEx?.tracking.includes('weight')) value = exLog.weight || 0;
        else if (selectedEx?.tracking.includes('duration')) value = exLog.duration || 0;
        else if (selectedEx?.tracking === 'reps') value = exLog.reps || 0;
        else if (selectedEx?.tracking === 'assistance') {
          value = exLog.reps || 0;
        }

        points.push({
          date: session.date,
          dateFormatted: format(parseISO(session.date), "dd MMM", { locale: fr }),
          value: value,
          assistance: exLog.assistance,
          completed: exLog.completed,
          sets: exLog.sets
        });
      }
    });

    return points;
  }, [data.sessionLogs, selectedExId, selectedEx]);

  const maxVal = chartData.length > 0 ? Math.max(...chartData.map(d => d.value)) : 0;
  const latestVal = chartData.length > 0 ? chartData[chartData.length - 1].value : 0;

  // Progression analysis
  const getProgressionState = () => {
    if (chartData.length < 2) return null;
    
    const last = chartData[chartData.length - 1];
    const prev = chartData[chartData.length - 2];
    
    // Simplistic progression check: if value hasn't increased in last 4 sessions, plateau.
    if (chartData.length >= 4) {
      const last4 = chartData.slice(-4);
      const isStable = last4.every(d => d.value === last.value);
      if (isStable) return 'plateau';
    }

    // Check 2 consecutive successful sessions (same value, fully completed sets)
    if (last.value === prev.value && last.value > 0) {
      return 'ready';
    }
    
    return null;
  };

  const progState = getProgressionState();

  return (
    <div className="min-h-screen bg-background pb-24 pt-safe">
      <header className="px-5 py-6 bg-background/95 backdrop-blur-md sticky top-0 z-10 border-b border-border">
        <h1 className="text-3xl font-extrabold tracking-tight text-white">Progression</h1>
      </header>

      <main className="p-5 space-y-6">
        
        {/* Selector */}
        <div className="relative">
          <select 
            value={selectedExId}
            onChange={(e) => setSelectedExId(e.target.value)}
            className="w-full appearance-none bg-card border border-border rounded-xl p-4 pr-10 text-white font-bold outline-none"
          >
            {SESSIONS.map(s => (
              <optgroup key={s.id} label={s.name}>
                {s.exercises.filter(e => e.tracking !== 'none').map(e => (
                  <option key={e.id} value={e.id}>{e.name}</option>
                ))}
              </optgroup>
            ))}
          </select>
          <ChevronDown size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        </div>

        {chartData.length > 0 ? (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-card border border-border rounded-xl p-4">
                <div className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">Dernière perf</div>
                <div className="text-2xl font-bold font-mono">
                  {latestVal} 
                  <span className="text-sm text-muted-foreground ml-1">
                    {selectedEx?.tracking.includes('weight') ? 'kg' : selectedEx?.tracking.includes('duration') ? 's' : 'reps'}
                  </span>
                </div>
              </div>
              <div className="bg-card border border-border rounded-xl p-4">
                <div className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">Record perso</div>
                <div className="text-2xl font-bold font-mono">
                  {maxVal}
                  <span className="text-sm text-muted-foreground ml-1">
                    {selectedEx?.tracking.includes('weight') ? 'kg' : selectedEx?.tracking.includes('duration') ? 's' : 'reps'}
                  </span>
                </div>
              </div>
            </div>

            {progState === 'ready' && (
              <div className="bg-[#151515] border border-border p-4 rounded-xl flex items-start gap-3">
                <ArrowUpRight className="text-white flex-shrink-0 mt-0.5" size={20} />
                <div>
                  <p className="text-sm text-white font-bold mb-1">Progression suggérée</p>
                  <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                    2 séances réussies avec cette charge. Il est temps d'augmenter légèrement la difficulté.
                  </p>
                  <div className="flex gap-2">
                    <button className="flex-1 bg-white text-black py-2 rounded font-bold text-xs">Accepter</button>
                    <button className="flex-1 border border-border py-2 rounded font-bold text-xs text-muted-foreground hover:text-white">Garder</button>
                  </div>
                </div>
              </div>
            )}

            {progState === 'plateau' && (
              <div className="bg-[#151515] border border-border p-4 rounded-xl flex items-start gap-3">
                <Activity className="text-muted-foreground flex-shrink-0 mt-0.5" size={20} />
                <div>
                  <p className="text-sm text-white font-bold mb-1">Progression stable</p>
                  <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                    Progression stable depuis plusieurs séances. Que souhaites-tu faire ?
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="border border-border px-3 py-1.5 rounded text-[10px] uppercase font-bold text-muted-foreground cursor-pointer hover:text-white">Conserver</span>
                    <span className="border border-border px-3 py-1.5 rounded text-[10px] uppercase font-bold text-muted-foreground cursor-pointer hover:text-white">Augmenter repos</span>
                    <span className="border border-border px-3 py-1.5 rounded text-[10px] uppercase font-bold text-muted-foreground cursor-pointer hover:text-white">Réduire volume</span>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-card border border-border rounded-xl p-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" vertical={false} />
                  <XAxis 
                    dataKey="dateFormatted" 
                    stroke="#888" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false}
                    dy={10}
                  />
                  <YAxis 
                    stroke="#888" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false}
                    dx={-10}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#fff" 
                    strokeWidth={3}
                    dot={{ r: 4, fill: '#000', stroke: '#fff', strokeWidth: 2 }}
                    activeDot={{ r: 6, fill: '#fff' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {selectedEx?.tracking === 'assistance' || selectedEx?.tracking === 'duration+assistance' ? (
              <div className="bg-[#151515] border border-border p-4 rounded-xl flex items-start gap-3">
                <Info className="text-muted-foreground flex-shrink-0 mt-0.5" size={20} />
                <p className="text-sm text-muted-foreground leading-relaxed">
                  L'assistance principale pour cet exercice est : <strong className="text-white">{chartData[chartData.length - 1].assistance}</strong>. Essaie de réduire l'assistance avant d'augmenter le temps.
                </p>
              </div>
            ) : null}
          </>
        ) : (
          <div className="text-center py-20 bg-card border border-border rounded-xl">
            <Activity size={40} className="mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground font-medium">Aucune donnée pour cet exercice.</p>
            <p className="text-sm text-muted-foreground/70 mt-1">Réalise l'exercice pour voir ta courbe.</p>
          </div>
        )}

      </main>
    </div>
  );
}