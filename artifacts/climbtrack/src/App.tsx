import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";

import {
  ClimbTrackProvider,
} from "@/context/ClimbTrackContext";

import {
  BadgeUnlockNotifier,
} from "@/components/BadgeUnlockNotifier";

import {
  BottomNav,
} from "@/components/BottomNav";

import {
  BadgesPage,
} from "@/pages/BadgesPage";

import {
  BlessuresPage,
} from "@/pages/BlessuresPage";

import {
  CorpsPage,
} from "@/pages/CorpsPage";

import {
  HistoriquePage,
} from "@/pages/HistoriquePage";

import {
  ProgressionPage,
} from "@/pages/ProgressionPage";

import {
  ReglagesPage,
} from "@/pages/ReglagesPage";

import {
  SeancesPage,
} from "@/pages/SeancesPage";

import {
  SessionDetailPage,
} from "@/pages/SessionDetailPage";

import {
  KilterIdeasPage,
} from "@/pages/KilterIdeasPage";
import { KilterLocalGamePage } from "@/pages/KilterLocalGamePage";

// ─────────────────────────────────────────────────────────────────────────────
// Router
// ─────────────────────────────────────────────────────────────────────────────

function getRouterBasename(): string {
  const baseUrl =
    import.meta.env.BASE_URL ||
    "/";

  if (
    baseUrl === "/"
  ) {
    return "/";
  }

  return baseUrl.replace(
    /\/+$/,
    "",
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Layout
// ─────────────────────────────────────────────────────────────────────────────

function AppLayout() {
  const location =
    useLocation();

  const hideBottomNav =
    location.pathname.startsWith("/seance/") ||
    location.pathname === "/jeu-kilter" ||
    location.pathname.startsWith("/jeu-kilter/");

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Routes>
        <Route
          path="/"
          element={
            <Navigate
              to="/seances"
              replace
            />
          }
        />

        <Route
          path="/seances"
          element={
            <SeancesPage />
          }
        />

        <Route
          path="/seance/:sessionId"
          element={
            <SessionDetailPage />
          }
        />

        <Route
          path="/historique"
          element={
            <HistoriquePage />
          }
        />

        <Route
          path="/progression"
          element={
            <ProgressionPage />
          }
        />

        <Route
          path="/badges"
          element={
            <BadgesPage />
          }
        />

        <Route
          path="/corps"
          element={
            <CorpsPage />
          }
        />

        <Route
          path="/reglages"
          element={
            <ReglagesPage />
          }
        />

        <Route
          path="/blessures"
          element={
            <BlessuresPage />
          }
        />

        <Route path="/jeu-kilter" element={<KilterLocalGamePage />} />

        <Route
          path="/kilter"
          element={
            <KilterIdeasPage />
          }
        />

        <Route
          path="*"
          element={
            <Navigate
              to="/seances"
              replace
            />
          }
        />
      </Routes>

      {!hideBottomNav && (
        <BottomNav />
      )}

      <BadgeUnlockNotifier />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// App
// ─────────────────────────────────────────────────────────────────────────────

export default function App() {
  const routerBasename =
    getRouterBasename();

  return (
    <ClimbTrackProvider>
      <BrowserRouter
        basename={
          routerBasename
        }
      >
        <AppLayout />
      </BrowserRouter>
    </ClimbTrackProvider>
  );
}