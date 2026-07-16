import { SESSIONS, SessionDef } from "@/data/sessions";
import { useClimbTrack } from "@/context/ClimbTrackContext";
import { formatDistanceToNow, parseISO } from "date-fns";
import { fr } from "date-fns/locale";

interface SessionCardProps {
  session: SessionDef;
  onClick: () => void;
}

export function SessionCard({ session, onClick }: SessionCardProps) {
  const { data } = useClimbTrack();
  
  // Find last time this session was completed
  const logs = data.sessionLogs
    .filter(log => log.sessionId === session.id)
    .sort((a, b) => b.date.localeCompare(a.date));
    
  const lastPerformed = logs.length > 0 ? logs[0].date : null;
  const timeAgo = lastPerformed 
    ? formatDistanceToNow(parseISO(lastPerformed), { addSuffix: true, locale: fr })
    : "Jamais réalisée";

  return (
    <div 
      onClick={onClick}
      className="bg-card border border-card-border rounded-xl p-5 cursor-pointer active:scale-[0.98] transition-transform flex flex-col gap-2 relative overflow-hidden group"
    >
      <div className="flex justify-between items-start gap-4">
        <h3 className="text-lg font-bold leading-tight tracking-tight">{session.name}</h3>
        <span className="text-xs font-mono bg-border px-2 py-1 rounded text-muted-foreground whitespace-nowrap">
          {session.exercises.length} ex.
        </span>
      </div>
      
      <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
        {session.moment}
      </p>
      
      <div className="mt-2 pt-3 border-t border-border flex justify-between items-center">
        <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
          {lastPerformed ? `Dernière: ${timeAgo}` : timeAgo}
        </span>
      </div>
    </div>
  );
}