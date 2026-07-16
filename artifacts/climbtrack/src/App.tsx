import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, Router as WouterRouter } from 'wouter';

import { ClimbTrackProvider } from './context/ClimbTrackContext';
import { BottomNav } from './components/BottomNav';
import { SeancesPage } from './pages/SeancesPage';
import { SessionDetailPage } from './pages/SessionDetailPage';
import { HistoriquePage } from './pages/HistoriquePage';
import { ProgressionPage } from './pages/ProgressionPage';
import { CorpsPage } from './pages/CorpsPage';
import { ReglagesPage } from './pages/ReglagesPage';

const queryClient = new QueryClient();

function Router() {
  return (
    <div className="w-full h-[100dvh] overflow-x-hidden bg-background">
      <Switch>
        <Route path="/" component={SeancesPage} />
        <Route path="/seance/:id" component={SessionDetailPage} />
        <Route path="/historique" component={HistoriquePage} />
        <Route path="/progression" component={ProgressionPage} />
        <Route path="/corps" component={CorpsPage} />
        <Route path="/reglages" component={ReglagesPage} />
        <Route component={NotFound} />
      </Switch>
      <BottomNav />
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
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </ClimbTrackProvider>
    </QueryClientProvider>
  );
}

export default App;
