import { Link, useLocation } from "wouter";
import { Dumbbell, Calendar, TrendingUp, User, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { path: "/", icon: Dumbbell, label: "Séances" },
  { path: "/historique", icon: Calendar, label: "Historique" },
  { path: "/progression", icon: TrendingUp, label: "Progression" },
  { path: "/corps", icon: User, label: "Corps" },
  { path: "/reglages", icon: Settings, label: "Réglages" },
];

export function BottomNav() {
  const [location] = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md border-t border-border">
      {/* Icon row — sits above the safe area */}
      <ul className="flex items-end justify-around h-14 pb-1">
        {NAV_ITEMS.map((item) => {
          const isActive = location === item.path;
          const Icon = item.icon;
          return (
            <li key={item.path} className="flex-1">
              <Link
                href={item.path}
                className={cn(
                  "flex flex-col items-center justify-end w-full h-full pb-1 space-y-1 transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground hover:text-primary/70"
                )}
              >
                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[10px] font-medium leading-none">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
      {/* Safe area spacer — keeps the bar above the home indicator */}
      <div style={{ height: "env(safe-area-inset-bottom, 6px)" }} />
    </nav>
  );
}
