import { useState } from "react";
import { createPortal } from "react-dom";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { X } from "lucide-react";

import { useClimbTrack } from "@/context/ClimbTrackContext";
import {
  BADGES,
  BADGE_CATEGORIES,
  BADGE_LEVEL_META,
} from "@/data/badges";
import {
  computeBest,
  getHighestLevel,
} from "@/utils/badgeEngine";
import { BadgeHex } from "@/components/BadgeHex";

export function BadgesPage() {
  const { data } = useClimbTrack();

  const [selectedBadgeId, setSelectedBadgeId] =
    useState<string | null>(null);

  const selectedBadge = selectedBadgeId
    ? BADGES.find((badge) => badge.id === selectedBadgeId) ?? null
    : null;

  const totalLevels = BADGES.reduce(
    (total, badge) => total + badge.levels.length,
    0,
  );

  const earnedLevels = Object.values(
    data.earnedBadges ?? {},
  ).reduce(
    (total, entries) => total + entries.length,
    0,
  );

  const progress =
    totalLevels > 0
      ? Math.round((earnedLevels / totalLevels) * 100)
      : 0;

  return (
    <div className="min-h-screen bg-background pb-24 pt-safe">
      {/* En-tête */}
      <header className="sticky top-0 z-10 border-b border-border bg-background/95 px-5 py-6 backdrop-blur-md">
        <h1 className="text-3xl font-extrabold tracking-tight text-white">
          Badges
        </h1>

        <p className="mt-1 text-sm font-medium text-muted-foreground">
          {earnedLevels} / {totalLevels} niveaux débloqués
        </p>
      </header>

      <main className="space-y-8 p-5">
        {/* Progression générale */}
        <div className="space-y-2">
          <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-white transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex justify-between font-mono text-xs text-muted-foreground">
            <span>{earnedLevels} débloqués</span>

            <span>
              {Math.max(0, totalLevels - earnedLevels)} restants
            </span>
          </div>
        </div>

        {/* Catégories */}
        {BADGE_CATEGORIES.map((category) => {
          const categoryBadges = BADGES.filter(
            (badge) => badge.category === category,
          );

          return (
            <section key={category} className="space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                {category}
              </h2>

              <div className="grid grid-cols-3 gap-x-3 gap-y-6">
                {categoryBadges.map((badge) => {
                  const highestLevel = getHighestLevel(
                    badge.id,
                    data.earnedBadges ?? {},
                  );

                  return (
                    <button
                      key={badge.id}
                      type="button"
                      onClick={() => setSelectedBadgeId(badge.id)}
                      className="flex min-w-0 flex-col items-center gap-2"
                    >
                      <div className="relative">
                        <BadgeHex
                          icon={badge.icon}
                          level={highestLevel}
                          size={96}
                        />

                        {highestLevel && (
                          <div
                            className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full px-1.5 py-0.5 text-[9px] font-bold"
                            style={{
                              backgroundColor:
                                BADGE_LEVEL_META[highestLevel]
                                  .border,
                              color: "#000000",
                            }}
                          >
                            {BADGE_LEVEL_META[
                              highestLevel
                            ].label.toUpperCase()}
                          </div>
                        )}
                      </div>

                      <span
                        className={`mt-1 text-center text-[11px] font-semibold leading-tight ${
                          highestLevel
                            ? "text-white"
                            : "text-muted-foreground/50"
                        }`}
                      >
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

      {/* Fiche du badge placée directement dans document.body */}
      {selectedBadge &&
        createPortal(
          <div
            className="fixed inset-0 z-[99999] bg-background"
            onClick={() => setSelectedBadgeId(null)}
          >
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

            <div
              className="relative z-[100000] flex h-[100dvh] w-full flex-col overflow-hidden bg-background pt-safe"
              onClick={(event) => event.stopPropagation()}
            >
              {/* En-tête fixe */}
              <div className="flex flex-shrink-0 items-center justify-between gap-3 border-b border-border px-5 py-4">
                <div className="flex min-w-0 items-center gap-4">
                  <BadgeHex
                    icon={selectedBadge.icon}
                    level={getHighestLevel(
                      selectedBadge.id,
                      data.earnedBadges ?? {},
                    )}
                    size={72}
                  />

                  <div className="min-w-0">
                    <h3 className="text-xl font-extrabold text-white">
                      {selectedBadge.name}
                    </h3>

                    <p className="text-sm text-muted-foreground">
                      {selectedBadge.subtitle}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedBadgeId(null)}
                  className="flex-shrink-0 rounded-full p-2 hover:bg-white/10"
                  aria-label="Fermer"
                >
                  <X
                    size={22}
                    className="text-muted-foreground"
                  />
                </button>
              </div>

              {/* Contenu défilable */}
              <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5 pb-16">
                {/* Record actuel */}
                {(() => {
                  const best = computeBest(
                    selectedBadge,
                    data.sessionLogs,
                  );

                  if (best === -Infinity) return null;

                  let recordText = "";

                  if (
                    best === 1 &&
                    selectedBadge.metric === "first"
                  ) {
                    recordText = "✓ Réalisé";
                  } else {
                    const roundedBest =
                      Math.round(best * 10) / 10;

                    recordText = `${roundedBest}${
                      selectedBadge.unit
                        ? ` ${selectedBadge.unit}`
                        : ""
                    }`;
                  }

                  return (
                    <div className="rounded-xl border border-border bg-card px-4 py-3">
                      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Ton record
                      </span>

                      <p className="mt-1 font-mono text-2xl font-bold text-white">
                        {recordText}
                      </p>
                    </div>
                  );
                })()}

                {/* Tous les objectifs */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Objectifs
                  </h4>

                  {selectedBadge.levels.map(
                    (levelDefinition) => {
                      const earnedEntry = (
                        data.earnedBadges?.[
                          selectedBadge.id
                        ] ?? []
                      ).find(
                        (entry) =>
                          entry.level ===
                          levelDefinition.level,
                      );

                      const metadata =
                        BADGE_LEVEL_META[
                          levelDefinition.level
                        ];

                      return (
                        <div
                          key={levelDefinition.level}
                          className={`flex items-center gap-3 rounded-xl border p-4 ${
                            earnedEntry
                              ? "border-white/15 bg-white/5"
                              : "border-border bg-card/30"
                          }`}
                        >
                          <div
                            className="h-4 w-4 flex-shrink-0 rounded-full"
                            style={{
                              backgroundColor: earnedEntry
                                ? metadata.border
                                : "#333333",
                            }}
                          />

                          <div className="min-w-0 flex-1">
                            <p
                              className={`text-sm font-semibold ${
                                earnedEntry
                                  ? "text-white"
                                  : "text-muted-foreground"
                              }`}
                            >
                              {levelDefinition.description}
                            </p>

                            {earnedEntry ? (
                              <p className="mt-1 text-xs text-muted-foreground">
                                Débloqué le{" "}
                                {format(
                                  parseISO(
                                    earnedEntry.earnedAt,
                                  ),
                                  "d MMMM yyyy",
                                  { locale: fr },
                                )}
                              </p>
                            ) : (
                              <p className="mt-1 text-xs text-muted-foreground/60">
                                Pas encore débloqué
                              </p>
                            )}
                          </div>

                          <span
                            className="flex-shrink-0 rounded-full border px-2 py-1 text-[10px] font-bold"
                            style={{
                              color: earnedEntry
                                ? "#000000"
                                : metadata.border,
                              backgroundColor: earnedEntry
                                ? metadata.border
                                : "transparent",
                              borderColor: metadata.border,
                            }}
                          >
                            {metadata.label.toUpperCase()}
                          </span>
                        </div>
                      );
                    },
                  )}
                </div>

                <div className="h-4" />
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}