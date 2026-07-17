---
name: ClimbTrack stack
description: Architecture et conventions de l'app ClimbTrack
---

## Stack
- React + Vite + Tailwind CSS + Wouter (routing)
- VitePWA, Recharts, date-fns, lucide-react
- Tout en localStorage (`climbtrack_data`)
- Thème noir monochrome strict, interface en français

## Structure artifacts/climbtrack/src/
- `context/ClimbTrackContext.tsx` — état global AppData + toutes les actions
- `data/sessions.ts` — 7 sessions avec ~40 exercices, types ExerciseDef/SessionDef
- `data/badges.ts` — 16 badges, 61 niveaux, définitions des seuils
- `utils/exercises.ts` — helpers getSessionExercises, getAllCategories, applyOverride
- `utils/badgeEngine.ts` — évaluation des badges
- `pages/` — SeancesPage, SessionDetailPage, HistoriquePage, ProgressionPage, CorpsPage, ReglagesPage, BadgesPage
- `components/BottomNav.tsx` — 6 onglets (Séances/Historique/Progrès/Badges/Corps/Réglages)
- `components/ExerciseManager.tsx` — gestion complète des exercices dans Réglages
- `components/BadgeHex.tsx` — hexagone SVG avec 16 illustrations

## Navigation
- BottomNav masqué sur `/seance/:id` (App.tsx line ~16: HIDE_NAV_PATTERNS)
- 6 onglets : Séances `/`, Historique `/historique`, Progrès `/progression`, Badges `/badges`, Corps `/corps`, Réglages `/reglages`

## Conventions importantes
- Sessions: `getSessionExercises(sessionId, data)` dans utils/exercises.ts (respecte les overrides)
- ExerciseDef.id = identifiant stable (ex: 'suspension-20mm', 'tractions-lestees')
- SessionLog.date = 'YYYY-MM-DD'
- Badge évaluation dans addSessionLog/deleteSessionLog/updateSessionLog du context
