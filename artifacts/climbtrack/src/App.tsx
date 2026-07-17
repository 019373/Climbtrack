import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, Router as WouterRouter, useLocation } from 'wouter';

import { ClimbTrackProvider } from './context/ClimbTrackContext';
import { BottomNav } from './components/BottomNav';
import { BadgeUnlockNotifier } from './components/BadgeUnlockNotifier';
import { SeancesPage } from './pages/SeancesPage';
import { SessionDetailPage } from './pages/SessionDetailPage';
import { HistoriquePage } from './pages/HistoriquePage';
import { ProgressionPage } from './pages/ProgressionPage';
import { CorpsPage } from './pages/CorpsPage';
import { ReglagesPage } from './pages/ReglagesPage';
import { BadgesPage } from './pages/BadgesPage';

const queryClient = new QueryClient();

/** Routes where the bottom nav should be hidden */
const HIDE_NAV_PATTERNS = [/^\/seance\/.+/];

function Router() {
  const [location] = useLocation();
  const hideNav = HIDE_NAV_PATTERNS.some(p => p.test(location));

  return (
    <div className="w-full h-[100dvh] overflow-x-hidden bg-background">
      <Switch>
        <Route path="/" component={SeancesPage} />
        <Route path="/seance/:id" component={SessionDetailPage} />
        <Route path="/historique" component={HistoriquePage} />
        <Route path="/progression" component={ProgressionPage} />
        <Route path="/badges" component={BadgesPage} />
        <Route path="/corps" component={CorpsPage} />
        <Route path="/reglages" component={ReglagesPage} />
        <Route component={NotFound} />
      </Switch>
      {!hideNav && <BottomNav />}
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ClimbTrackProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
            <Router />
            <BadgeUnlockNotifier />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </ClimbTrackProvider>
    </QueryClientProvider>
  );
}

export default App;
