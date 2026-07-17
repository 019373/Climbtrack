import { useState } from 'react';
import { useClimbTrack } from '@/context/ClimbTrackContext';
import { BADGES, BADGE_CATEGORIES, BADGE_LEVEL_META, BADGE_LEVELS, BadgeLevel } from '@/data/badges';
import { getHighestLevel, computeBest } from '@/utils/badgeEngine';
import { BadgeHex } from '@/components/BadgeHex';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { X } from 'lucide-react';

function levelIndex(l: BadgeLevel | null) {
  if (!l) return -1;
  return BADGE_LEVELS.indexOf(l);
}

export function BadgesPage() {
  const { data } = useClimbTrack();
  const [selectedBadgeId, setSelectedBadgeId] = useState<string | null>(null);

  const totalBadges = BADGES.reduce((acc, b) => acc + b.levels.length, 0);
  const earnedCount = Object.values(data.earnedBadges ?? {}).reduce((acc, entries) => acc + entries.length, 0);

  const selectedBadge = selectedBadgeId ? BADGES.find(b => b.id === selectedBadgeId) : null;

  return (
    <div className="min-h-screen bg-background pb-24 pt-safe">
      <header className="px-5 py-6 bg-background/95 backdrop-blur-md sticky top-0 z-10 border-b border-border">
        <h1 className="text-3xl font-extrabold tracking-tight text-white">Badges</h1>
        <p className="text-muted-foreground mt-1 text-sm font-medium">
          {earnedCount} / {totalBadges} niveaux débloqués
        </p>
      </header>

      <main className="p-5 space-y-8">

        {/* Progress bar */}
        <div className="space-y-2">
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-700"
              style={{ width: `${Math.round((earnedCount / totalBadges) * 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground font-mono">
            <span>{earnedCount} débloqués</span>
            <span>{totalBadges - earnedCount} restants</span>
          </div>
        </div>

        {/* Badge categories */}
        {BADGE_CATEGORIES.map(cat => {
          const catBadges = BADGES.filter(b => b.category === cat);
          return (
            <section key={cat} className="space-y-3">
              <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{cat}</h2>

              <div className="grid grid-cols-3 gap-4">
                {catBadges.map(badge => {
                  const highestLevel = getHighestLevel(badge.id, data.earnedBadges ?? {});
                  const isLocked = highestLevel === null;

                  return (
                    <button
                      key={badge.id}
                      onClick={() => setSelectedBadgeId(badge.id)}
                      className="flex flex-col items-center gap-2 group"
                    >
                      <div className="relative">
                        <BadgeHex icon={badge.icon} level={highestLevel} size={88} />
                        {/* Level pip */}
                        {highestLevel && (
                          <div
                            className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded-full text-[9px] font-bold tracking-wide"
                            style={{ backgroundColor: BADGE_LEVEL_META[highestLevel].border, color: '#000' }}
                          >
                            {BADGE_LEVEL_META[highestLevel].label.toUpperCase()}
                          </div>
                        )}
                      </div>
                      <span className={`text-[11px] font-semibold text-center leading-tight mt-1 ${isLocked ? 'text-muted-foreground/50' : 'text-white'}`}>
                        {badge.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>
          );
        })}
      </main>

      {/* Badge detail sheet */}
      {selectedBadge && (
        <div
          className="fixed inset-0 z-50 flex items-end"
          onClick={() => setSelectedBadgeId(null)}
        >
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <div
            className="relative w-full bg-background border-t border-border rounded-t-3xl p-6 pb-safe space-y-5"
            onClick={e => e.stopPropagation()}
          >
            {/* Close */}
            <button
              onClick={() => setSelectedBadgeId(null)}
              className="absolute top-4 right-5 p-2 rounded-full hover:bg-white/10"
            >
              <X size={20} className="text-muted-foreground" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-4">
              <BadgeHex
                icon={selectedBadge.icon}
                level={getHighestLevel(selectedBadge.id, data.earnedBadges ?? {})}
                size={72}
              />
              <div>
                <h3 className="text-xl font-extrabold text-white">{selectedBadge.name}</h3>
                <p className="text-sm text-muted-foreground">{selectedBadge.subtitle}</p>
              </div>
            </div>

            {/* Current best */}
            {selectedBadge.exerciseId && (() => {
              const best = computeBest(selectedBadge, data.sessionLogs);
              if (best === -Infinity) return null;
              return (
                <div className="bg-card border border-border rounded-xl px-4 py-3">
                  <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Ton record</span>
                  <p className="text-2xl font-bold font-mono text-white mt-0.5">
                    {best === 1 && selectedBadge.metric === 'first' ? '✓ Réalisé' :
                     best === 1 && selectedBadge.metric === 'no-assistance-duration' ? '✓ Sans assistance' :
                     `${Math.round(best * 10) / 10}${selectedBadge.unit ? ' ' + selectedBadge.unit : ''}`}
                  </p>
                </div>
              );
            })()}

            {/* Levels */}
            <div className="space-y-2">
              {selectedBadge.levels.map(levelDef => {
                const earned = (data.earnedBadges?.[selectedBadge.id] ?? []).find(e => e.level === levelDef.level);
                const meta = BADGE_LEVEL_META[levelDef.level];
                return (
                  <div
                    key={levelDef.level}
                    className={`flex items-center gap-3 p-3 rounded-xl border ${earned ? 'border-white/10 bg-white/5' : 'border-border bg-transparent'}`}
                  >
                    {/* Level dot */}
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: earned ? meta.border : '#333' }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold ${earned ? 'text-white' : 'text-muted-foreground/50'}`}>
                        {levelDef.description}
                      </p>
                      {earned && (
                        <p className="text-xs text-muted-foreground/70 mt-0.5">
                          Débloqué le {format(parseISO(earned.earnedAt), 'd MMMM yyyy', { locale: fr })}
                        </p>
                      )}
                    </div>
                    <span
                      className="text-[10px] font-bold tracking-wide px-2 py-0.5 rounded-full"
                      style={{
                        color: earned ? '#000' : '#666',
                        backgroundColor: earned ? meta.border : 'transparent',
                        border: earned ? 'none' : '1px solid #333',
                      }}
                    >
                      {meta.label.toUpperCase()}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
