import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Lock,
  Trophy,
  X,
} from "lucide-react";

import {
  BADGES,
  BADGE_CATEGORIES,
  BADGE_LEVEL_META,
} from "@/data/badges";

import type {
  BadgeDefinition,
  BadgeLevel,
} from "@/data/badges";

import {
  useClimbTrack,
} from "@/context/ClimbTrackContext";

import {
  BadgeHex,
} from "@/components/BadgeHex";

import {
  computeBest,
} from "@/utils/badgeEngine";

import {
  cn,
} from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────────────────
// Niveaux affichés
// ─────────────────────────────────────────────────────────────────────────────

/*
 * Platine n'est volontairement plus affiché.
 *
 * Les anciennes données Platine restent dans
 * la sauvegarde pour ne rien perdre historiquement.
 */
const VISIBLE_LEVEL_ORDER: BadgeLevel[] = [
  "bronze",
  "silver",
  "gold",
  "diamond",
];

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function formatNumber(
  value: number,
): string {
  if (
    !Number.isFinite(
      value,
    )
  ) {
    return "—";
  }

  return Number.isInteger(
    value,
  )
    ? String(
        value,
      )
    : String(
        Math.round(
          value * 100,
        ) / 100,
      ).replace(
        ".",
        ",",
      );
}

function isRegularityCategory(
  category: string,
): boolean {
  const normalized =
    category
      .toLowerCase()
      .trim();

  return (
    normalized.includes(
      "régularité",
    ) ||
    normalized.includes(
      "regularite",
    ) ||
    normalized.includes(
      "regularity",
    )
  );
}

function getVisibleBadges(): BadgeDefinition[] {
  return BADGES.filter(
    (badge) =>
      !isRegularityCategory(
        badge.category,
      ),
  );
}

function getVisibleCategories(): string[] {
  return BADGE_CATEGORIES.filter(
    (category) =>
      !isRegularityCategory(
        category,
      ),
  );
}

function getVisibleBadgeLevels(
  badge: BadgeDefinition,
) {
  return badge.levels
    .filter(
      (levelDefinition) =>
        VISIBLE_LEVEL_ORDER.includes(
          levelDefinition.level,
        ),
    )
    .sort(
      (
        first,
        second,
      ) =>
        VISIBLE_LEVEL_ORDER.indexOf(
          first.level,
        ) -
        VISIBLE_LEVEL_ORDER.indexOf(
          second.level,
        ),
    );
}

function getHighestVisibleLevel(
  badge: BadgeDefinition,
  earnedBadges: ReturnType<
    typeof useClimbTrack
  >["data"]["earnedBadges"],
): BadgeLevel | null {
  const earnedLevels =
    new Set(
      (
        earnedBadges[
          badge.id
        ] ?? []
      ).map(
        (entry) =>
          entry.level,
      ),
    );

  const definedLevels =
    new Set(
      badge.levels.map(
        (levelDefinition) =>
          levelDefinition.level,
      ),
    );

  for (
    let index =
      VISIBLE_LEVEL_ORDER.length -
      1;
    index >=
      0;
    index -=
      1
  ) {
    const level =
      VISIBLE_LEVEL_ORDER[
        index
      ];

    if (
      definedLevels.has(
        level,
      ) &&
      earnedLevels.has(
        level,
      )
    ) {
      return level;
    }
  }

  return null;
}

function getProgressText(
  badge: BadgeDefinition,
  best: number,
): string {
  if (
    best ===
    -Infinity
  ) {
    return "Aucune progression enregistrée";
  }

  if (
    badge.metric ===
    "first"
  ) {
    return "Première séance terminée";
  }

  if (
    badge.metric ===
    "climbing-color"
  ) {
    return "Bloc réussi";
  }

  if (
    badge.metric ===
    "kilter-grade"
  ) {
    const grade =
      badge.levels[0]
        ?.grade;

    return grade !==
      undefined
      ? `V${grade} réussi`
      : "Bloc Kilter réussi";
  }

  if (
    badge.metric ===
    "kilter-angle"
  ) {
    const grade =
      badge.levels[0]
        ?.grade;

    if (
      grade !==
        undefined
    ) {
      return `Meilleure inclinaison réussie en V${grade} : ${formatNumber(
        best,
      )}°`;
    }

    return `Meilleure inclinaison : ${formatNumber(
      best,
    )}°`;
  }

  if (
    badge.metric ===
    "route-grade"
  ) {
    const grade =
      badge.levels[0]
        ?.routeGrade;

    return grade
      ? `Voie ${grade} réussie`
      : "Voie réussie";
  }

  if (
    badge.metric ===
    "dips-reps"
  ) {
    return `${formatNumber(
      best,
    )} répétitions sur au moins 3 séries`;
  }

  const unit =
    badge.unit
      ? ` ${badge.unit}`
      : "";

  return `Record : ${formatNumber(
    best,
  )}${unit}`;
}

function getEarnedDate(
  badgeId: string,
  level: BadgeLevel,
  earnedBadges: ReturnType<
    typeof useClimbTrack
  >["data"]["earnedBadges"],
): string | null {
  const entry =
    (
      earnedBadges[
        badgeId
      ] ?? []
    ).find(
      (earned) =>
        earned.level ===
        level,
    );

  if (
    !entry
  ) {
    return null;
  }

  const date =
    new Date(
      entry.earnedAt,
    );

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return null;
  }

  return date.toLocaleDateString(
    "fr-FR",
    {
      day:
        "2-digit",

      month:
        "long",

      year:
        "numeric",
    },
  );
}

function getLevelLabel(
  badge: BadgeDefinition,
  level: BadgeLevel,
): string {
  if (
    badge.kind ===
    "route"
  ) {
    return level ===
      "diamond"
      ? "En tête"
      : "Moulinette";
  }

  if (
    badge.hideLevelLabel
  ) {
    return "Débloqué";
  }

  return BADGE_LEVEL_META[
    level
  ].label;
}

// ─────────────────────────────────────────────────────────────────────────────
// Modal
// ─────────────────────────────────────────────────────────────────────────────

function BadgeDetailsModal({
  badge,
  onClose,
}: {
  badge: BadgeDefinition;
  onClose: () => void;
}) {
  const {
    data,
  } =
    useClimbTrack();

  const highestLevel =
    getHighestVisibleLevel(
      badge,
      data.earnedBadges,
    );

  const earnedLevels =
    new Set(
      (
        data.earnedBadges[
          badge.id
        ] ?? []
      ).map(
        (entry) =>
          entry.level,
      ),
    );

  const best =
    computeBest(
      badge,
      data.sessionLogs,
    );

  const orderedLevels =
    getVisibleBadgeLevels(
      badge,
    );

  return (
    <div
      className="fixed inset-0 z-[100000] flex items-end overflow-x-hidden bg-black/80 backdrop-blur-sm sm:items-center sm:justify-center"
      onClick={
        onClose
      }
    >
      <div
        className="max-h-[92dvh] w-full overflow-x-hidden overflow-y-auto rounded-t-3xl border border-border bg-background px-5 pb-[calc(env(safe-area-inset-bottom)+24px)] pt-5 sm:max-w-md sm:rounded-3xl"
        onClick={(
          event,
        ) =>
          event.stopPropagation()
        }
      >
        <div className="flex min-w-0 items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-muted-foreground">
              {
                badge.category
              }
            </p>

            <h2 className="mt-1 break-words text-2xl font-black tracking-tight text-white">
              {
                badge.name
              }
            </h2>

            <p className="mt-1 break-words text-sm leading-relaxed text-muted-foreground">
              {
                badge.subtitle
              }
            </p>
          </div>

          <button
            type="button"
            onClick={
              onClose
            }
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-border text-muted-foreground active:scale-90"
            aria-label="Fermer"
          >
            <X
              size={18}
            />
          </button>
        </div>

        <div className="my-6 flex justify-center">
          <BadgeHex
            badge={
              badge
            }
            level={
              highestLevel
            }
            unlocked={
              highestLevel !==
              null
            }
            size="large"
          />
        </div>

        <div className="w-full overflow-hidden rounded-xl border border-border bg-card p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Ton record
          </p>

          <p className="mt-1 break-words text-base font-bold text-white">
            {getProgressText(
              badge,
              best,
            )}
          </p>
        </div>

        <div className="mt-5 space-y-3">
          {orderedLevels.map(
            (
              levelDefinition,
            ) => {
              const unlocked =
                earnedLevels.has(
                  levelDefinition.level,
                );

              const metadata =
                BADGE_LEVEL_META[
                  levelDefinition.level
                ];

              const earnedDate =
                getEarnedDate(
                  badge.id,
                  levelDefinition.level,
                  data.earnedBadges,
                );

              return (
                <div
                  key={
                    levelDefinition.level
                  }
                  className={cn(
                    "w-full overflow-hidden rounded-xl border p-4",

                    unlocked
                      ? "bg-card"
                      : "border-border bg-card/40",
                  )}
                  style={{
                    borderColor:
                      unlocked
                        ? metadata.border
                        : undefined,
                  }}
                >
                  <div className="flex min-w-0 items-start gap-3">
                    <div
                      className={cn(
                        "mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border",

                        !unlocked &&
                          "border-border text-muted-foreground",
                      )}
                      style={{
                        borderColor:
                          unlocked
                            ? metadata.border
                            : undefined,

                        color:
                          unlocked
                            ? metadata.border
                            : undefined,
                      }}
                    >
                      {unlocked ? (
                        <Trophy
                          size={17}
                        />
                      ) : (
                        <Lock
                          size={15}
                        />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex min-w-0 items-start justify-between gap-3">
                        <p
                          className="min-w-0 text-sm font-black uppercase tracking-wider"
                          style={{
                            color:
                              unlocked
                                ? metadata.border
                                : undefined,
                          }}
                        >
                          {getLevelLabel(
                            badge,
                            levelDefinition.level,
                          )}
                        </p>

                        {earnedDate && (
                          <span className="flex-shrink-0 text-right text-[10px] text-muted-foreground">
                            {
                              earnedDate
                            }
                          </span>
                        )}
                      </div>

                      <p className="mt-1 break-words text-sm leading-relaxed text-muted-foreground">
                        {
                          levelDefinition.description
                        }
                      </p>
                    </div>
                  </div>
                </div>
              );
            },
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

export function BadgesPage() {
  const {
    data,
  } =
    useClimbTrack();

  useEffect(
    () => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior:
          "auto",
      });
    },
    [],
  );

  const [
    selectedBadge,
    setSelectedBadge,
  ] =
    useState<BadgeDefinition | null>(
      null,
    );

  const visibleBadges =
    useMemo(
      () =>
        getVisibleBadges(),
      [],
    );

  const visibleCategories =
    useMemo(
      () =>
        getVisibleCategories(),
      [],
    );

  /*
   * Comme dans la version de base :
   * compter les NIVEAUX débloqués,
   * pas simplement le nombre de badges.
   */
  const totalLevelCount =
    useMemo(
      () =>
        visibleBadges.reduce(
          (
            total,
            badge,
          ) =>
            total +
            getVisibleBadgeLevels(
              badge,
            ).length,
          0,
        ),
      [
        visibleBadges,
      ],
    );

  const earnedLevelCount =
    useMemo(
      () =>
        visibleBadges.reduce(
          (
            total,
            badge,
          ) => {
            const validLevels =
              new Set(
                getVisibleBadgeLevels(
                  badge,
                ).map(
                  (
                    levelDefinition,
                  ) =>
                    levelDefinition.level,
                ),
              );

            const earnedForBadge =
              new Set(
                (
                  data.earnedBadges[
                    badge.id
                  ] ?? []
                )
                  .filter(
                    (entry) =>
                      validLevels.has(
                        entry.level,
                      ),
                  )
                  .map(
                    (entry) =>
                      entry.level,
                  ),
              );

            return (
              total +
              earnedForBadge.size
            );
          },
          0,
        ),
      [
        visibleBadges,
        data.earnedBadges,
      ],
    );

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-background pb-24 pt-safe">
      <header className="border-b border-border px-5 py-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-white">
          Badges
        </h1>

        <p className="mt-1 font-mono text-sm text-muted-foreground">
          {
            earnedLevelCount
          }{" "}
          /{" "}
          {
            totalLevelCount
          }{" "}
          niveaux débloqués
        </p>
      </header>

      <main className="w-full space-y-8 overflow-x-hidden px-5 py-6">
        {visibleCategories.map(
          (category) => {
            const categoryBadges =
              visibleBadges.filter(
                (badge) =>
                  badge.category ===
                  category,
              );

            if (
              categoryBadges.length ===
              0
            ) {
              return null;
            }

            return (
              <section
                key={
                  category
                }
                className="w-full overflow-hidden"
              >
                <h2 className="mb-5 text-sm font-black uppercase tracking-[0.14em] text-muted-foreground">
                  {
                    category
                  }
                </h2>

                <div className="grid w-full grid-cols-3 justify-items-center gap-x-2 gap-y-7">
                  {categoryBadges.map(
                    (
                      badge,
                    ) => {
                      const highestLevel =
                        getHighestVisibleLevel(
                          badge,
                          data.earnedBadges,
                        );

                      return (
                        <div
                          key={
                            badge.id
                          }
                          className="min-w-0"
                        >
                          <BadgeHex
                            badge={
                              badge
                            }
                            level={
                              highestLevel
                            }
                            unlocked={
                              highestLevel !==
                              null
                            }
                            size="medium"
                            onClick={() =>
                              setSelectedBadge(
                                badge,
                              )
                            }
                          />
                        </div>
                      );
                    },
                  )}
                </div>
              </section>
            );
          },
        )}
      </main>

      {selectedBadge && (
        <BadgeDetailsModal
          badge={
            selectedBadge
          }
          onClose={() =>
            setSelectedBadge(
              null,
            )
          }
        />
      )}
    </div>
  );
}