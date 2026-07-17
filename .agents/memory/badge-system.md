---
name: Badge system design
description: Architecture du système de badges ClimbTrack (fichiers, moteur, stockage, niveaux)
---

## Fichiers clés
- `src/data/badges.ts` — définitions des badges, seuils par niveau, `BadgeDef`, `BADGE_LEVEL_META`
- `src/utils/badgeEngine.ts` — `computeBest()`, `getUnlockedLevels()`, `findNewlyUnlocked()`, `evaluateAllBadges()`
- `src/components/BadgeHex.tsx` — hexagone SVG avec illustrations par badge (registry `ILLUSTRATIONS`)
- `src/pages/BadgesPage.tsx` — page avec grille 3 colonnes, bottom sheet détail
- `src/components/BadgeUnlockNotifier.tsx` — global toast + vibration sur déverrouillage

## Stockage (AppData)
- `earnedBadges: Record<string, EarnedBadgeEntry[]>` — badgeId → [{level, earnedAt}]
- `pendingBadgeNotifications: PendingBadgeNotification[]` — consommés par BadgeUnlockNotifier

## Règle cumulative
- `computeBest()` renvoie la valeur numérique maximale (ex. max weight ever logged)
- Un niveau est déverrouillé si `best >= threshold`
- Tous les niveaux dont le threshold ≤ best sont déverrouillés simultanément
- `findNewlyUnlocked()` compare le résultat courant vs `earnedBadges` pour trouver les nouveaux

## Métriques supportées
- `weight`, `duration`, `reps` → max parmi les logs completed
- `first` → threshold=1, earned si au moins 1 log completed
- `no-assistance-duration` → max duration parmi logs avec assistance ∈ ['Sans assistance', 'Lesté']
- `assistance-min` → index max d'assistance atteint (6=Lesté, 5=Sans assistance, etc.)
- `records` → count de PRs battus via `countAllTimeRecords()` (itère les logs chronologiques)

**Why:** Le calcul est stateless — on re-évalue tout à chaque addSessionLog/deleteSessionLog/updateSessionLog.

## Badges actuels (16 badges, 61 niveaux)
Force doigts: suspension-20mm, dead-hang, pince-disque, repeaters, sauts (bronze only), lourd-léger
Tractions: tractions-lestées
Musculation: développé-militaire, rowing, face-pull
Gainage: planche, planche-latérale
Jambes: squat, fentes-bulgares, mollets
Global: progression-générale
