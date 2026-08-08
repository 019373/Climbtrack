import {
  NavLink,
} from "react-router-dom";

import {
  Calendar,
  Dumbbell,
  Settings,
  TrendingUp,
  Trophy,
  User,
} from "lucide-react";

import {
  cn,
} from "@/lib/utils";

const NAV_ITEMS = [
  {
    path: "/seances",
    icon: Dumbbell,
    label: "Séances",
  },
  {
    path: "/historique",
    icon: Calendar,
    label: "Historique",
  },
  {
    path: "/progression",
    icon: TrendingUp,
    label: "Progrès",
  },
  {
    path: "/badges",
    icon: Trophy,
    label: "Badges",
  },
  {
    path: "/corps",
    icon: User,
    label: "Corps",
  },
  {
    path: "/reglages",
    icon: Settings,
    label: "Réglages",
  },
];

export function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/95 backdrop-blur-md">
      <ul className="flex h-14 items-end justify-around pb-1">
        {NAV_ITEMS.map(
          (item) => {
            const Icon =
              item.icon;

            return (
              <li
                key={
                  item.path
                }
                className="h-full flex-1"
              >
                <NavLink
                  to={
                    item.path
                  }
                  className={({
                    isActive,
                  }) =>
                    cn(
                      "flex h-full w-full flex-col items-center justify-end gap-[3px] pb-0.5 transition-colors",
                      isActive
                        ? "text-primary"
                        : "text-muted-foreground hover:text-primary/70",
                    )
                  }
                >
                  {({
                    isActive,
                  }) => (
                    <>
                      <Icon
                        size={20}
                        strokeWidth={
                          isActive
                            ? 2.5
                            : 2
                        }
                      />

                      <span className="text-[9px] font-medium leading-none">
                        {
                          item.label
                        }
                      </span>
                    </>
                  )}
                </NavLink>
              </li>
            );
          },
        )}
      </ul>

      <div
        style={{
          height:
            "env(safe-area-inset-bottom, 6px)",
        }}
      />
    </nav>
  );
}