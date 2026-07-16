import { useState, useEffect } from 'react';
import { Play, RotateCcw, SkipForward } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RestTimerProps {
  recommendedSeconds: number;
}

export function RestTimer({ recommendedSeconds }: RestTimerProps) {
  const [isActive, setIsActive] = useState(false);
  const [secondsElapsed, setSecondsElapsed] = useState(0);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isActive) {
      interval = setInterval(() => {
        setSecondsElapsed(sec => sec + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive]);

  const toggle = () => setIsActive(!isActive);
  
  const reset = () => {
    setIsActive(false);
    setSecondsElapsed(0);
  };

  const formatTime = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const isComplete = secondsElapsed >= recommendedSeconds;

  return (
    <div className="bg-[#1a1a1a] rounded-md p-4 border border-[#2a2a2a] flex flex-col gap-3 mt-2">
      <div className="flex justify-between items-center">
        <div>
          <h4 className="text-sm font-semibold text-white tracking-wide">
            REPOS RECOMMANDÉ : {Math.floor(recommendedSeconds / 60)} MIN {recommendedSeconds % 60 !== 0 ? `${recommendedSeconds % 60}s` : ''}
          </h4>
          <p className="text-xs text-muted-foreground mt-1">
            {isActive && !isComplete && "Récupération en cours..."}
            {isComplete && <span className="text-success font-medium">Repos conseillé atteint.</span>}
            {!isActive && secondsElapsed === 0 && "Prêt pour la suite ?"}
          </p>
        </div>
        <div className={cn("text-3xl font-mono tracking-tighter tabular-nums", isComplete ? "text-success" : "text-white")}>
          {formatTime(secondsElapsed)}
        </div>
      </div>
      
      <div className="flex gap-2 mt-1">
        <button
          onClick={toggle}
          className="flex-1 bg-white text-black py-2 rounded font-medium text-sm flex items-center justify-center gap-2 hover:bg-white/90 active:scale-[0.98] transition-transform"
        >
          {isActive ? 'Pause' : (secondsElapsed === 0 ? 'Démarrer' : 'Reprendre')}
        </button>
        
        <button
          onClick={reset}
          className="px-4 bg-[#2a2a2a] text-white py-2 rounded text-sm hover:bg-[#333] active:scale-[0.98] transition-all"
        >
          <RotateCcw size={16} />
        </button>
      </div>
    </div>
  );
}