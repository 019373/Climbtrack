import { useState } from 'react';
import { Check, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ExerciseDef, ASSISTANCE_OPTIONS } from '@/data/sessions';
import { ExerciseDefaults, ExerciseLog, useClimbTrack } from '@/context/ClimbTrackContext';
import { RestTimer } from './RestTimer';

interface ExerciseRowProps {
  exercise: ExerciseDef;
  defaults: ExerciseDefaults;
  log: ExerciseLog;
  onChange: (log: ExerciseLog) => void;
  onUpdateDefault: (defs: Partial<ExerciseDefaults>) => void;
  isPainful?: boolean;
}

export function ExerciseRow({ exercise, defaults, log, onChange, onUpdateDefault, isPainful }: ExerciseRowProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleCheck = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange({ ...log, completed: !log.completed });
  };

  const handleContainerClick = () => {
    setIsExpanded(!isExpanded);
  };

  const updateLog = (field: keyof ExerciseLog, value: any) => {
    onChange({ ...log, [field]: value });
    onUpdateDefault({ [field]: value });
  };

  // Build the summary string for default view
  const getSummary = () => {
    const parts = [];
    if (defaults.sets) parts.push(`${defaults.sets} séries`);
    if (defaults.reps) parts.push(`${defaults.reps} reps`);
    if (defaults.duration) parts.push(`${defaults.duration}s`);
    if (defaults.weight) parts.push(`${defaults.weight}kg`);
    if (defaults.assistance) parts.push(defaults.assistance.split(',')[0]); // Shorten assistance
    return parts.join(' • ');
  };

  return (
    <div className={cn(
      "border border-border rounded-xl bg-card overflow-hidden transition-all",
      log.completed ? "border-success/50 bg-success/5" : ""
    )}>
      {/* Header Row */}
      <div 
        className="p-4 flex items-start gap-4 cursor-pointer"
        onClick={handleContainerClick}
      >
        <button 
          onClick={toggleCheck}
          className={cn(
            "mt-0.5 flex-shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center transition-colors",
            log.completed 
              ? "bg-success border-success text-black" 
              : "border-muted-foreground/40 text-transparent"
          )}
        >
          <Check size={16} strokeWidth={3} />
        </button>
        
        <div className="flex-1">
          <div className="flex justify-between items-start gap-2">
            <h4 className={cn("font-bold text-[15px] leading-snug", log.completed && "text-white/80")}>
              {exercise.name}
            </h4>
            {isPainful && (
              <AlertTriangle size={16} className="text-destructive flex-shrink-0 mt-0.5" />
            )}
          </div>
          
          <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
            {exercise.description}
          </p>
          
          <div className="mt-2 text-xs font-mono text-muted-foreground">
            {getSummary()}
          </div>
        </div>

        <div className="text-muted-foreground">
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
      </div>

      {/* Expanded Edit Panel */}
      {isExpanded && (
        <div className="p-4 pt-0 border-t border-border bg-[#151515]">
          <div className="grid grid-cols-2 gap-4 py-4">
            
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Séries réalisées</label>
              <input 
                type="number" 
                min="0"
                className="w-full bg-background border border-border rounded p-2 text-white font-mono"
                value={log.sets}
                onChange={(e) => updateLog('sets', parseInt(e.target.value) || 0)}
              />
            </div>

            {(exercise.tracking === 'reps' || exercise.tracking === 'weight+reps') && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Répétitions</label>
                <input 
                  type="number" 
                  min="0"
                  className="w-full bg-background border border-border rounded p-2 text-white font-mono"
                  value={log.reps || ''}
                  onChange={(e) => updateLog('reps', parseInt(e.target.value) || 0)}
                  placeholder={defaults.reps?.toString()}
                />
              </div>
            )}

            {(exercise.tracking === 'duration' || exercise.tracking === 'duration+assistance' || exercise.tracking === 'weight+duration') && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Durée (s)</label>
                <input 
                  type="number" 
                  min="0"
                  className="w-full bg-background border border-border rounded p-2 text-white font-mono"
                  value={log.duration || ''}
                  onChange={(e) => updateLog('duration', parseInt(e.target.value) || 0)}
                  placeholder={defaults.duration?.toString()}
                />
              </div>
            )}

            {(exercise.tracking === 'weight' || exercise.tracking === 'weight+reps' || exercise.tracking === 'weight+duration') && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Charge (kg)</label>
                <input 
                  type="number" 
                  step="0.5"
                  className="w-full bg-background border border-border rounded p-2 text-white font-mono"
                  value={log.weight ?? ''}
                  onChange={(e) => updateLog('weight', parseFloat(e.target.value) || 0)}
                  placeholder={defaults.weight?.toString()}
                />
              </div>
            )}

          </div>

          {(exercise.tracking === 'assistance' || exercise.tracking === 'duration+assistance') && (
            <div className="space-y-1.5 mb-4">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Assistance</label>
              <select 
                className="w-full bg-background border border-border rounded p-2 text-white text-sm"
                value={log.assistance || ''}
                onChange={(e) => updateLog('assistance', e.target.value)}
              >
                {ASSISTANCE_OPTIONS.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
          )}

          {defaults.restSeconds > 0 && (
            <RestTimer recommendedSeconds={defaults.restSeconds} />
          )}
        </div>
      )}
    </div>
  );
}