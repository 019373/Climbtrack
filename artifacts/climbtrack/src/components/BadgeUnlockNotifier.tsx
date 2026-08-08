import {
  useEffect,
  useState,
} from "react";

import {
  Sparkles,
  X,
} from "lucide-react";

import {
  BADGE_BY_ID,
  BADGE_LEVEL_META,
} from "@/data/badges";

import {
  useClimbTrack,
} from "@/context/ClimbTrackContext";

import {
  BadgeHex,
} from "@/components/BadgeHex";

export function BadgeUnlockNotifier() {
  const {
    data,
    clearBadgeNotification,
  } = useClimbTrack();

  const [
    isVisible,
    setIsVisible,
  ] = useState(false);

  const notification =
    data.pendingBadgeNotifications[0];

  const badge =
    notification
      ? BADGE_BY_ID[
          notification.badgeId
        ]
      : undefined;

  const levelMeta =
    notification
      ? BADGE_LEVEL_META[
          notification.level
        ]
      : undefined;

  useEffect(() => {
    if (
      notification &&
      badge
    ) {
      const timer =
        window.setTimeout(
          () => {
            setIsVisible(
              true,
            );
          },
          150,
        );

      return () =>
        window.clearTimeout(
          timer,
        );
    }

    setIsVisible(
      false,
    );
  }, [
    notification?.badgeId,
    notification?.level,
    badge,
  ]);

  if (
    !notification ||
    !badge ||
    !levelMeta
  ) {
    return null;
  }

  const levelDefinition =
    badge.levels.find(
      (definition) =>
        definition.level ===
        notification.level,
    );

  const routeLabel =
    badge.kind === "route"
      ? notification.level ===
        "diamond"
        ? "Réussie en tête"
        : "Réussie en moulinette ou en tête"
      : null;

  function closeNotification() {
    setIsVisible(
      false,
    );

    window.setTimeout(
      () => {
        clearBadgeNotification(
          notification.badgeId,
          notification.level,
        );
      },
      220,
    );
  }

  return (
    <div
      className={`fixed inset-0 z-[100000] flex items-center justify-center bg-black/80 px-5 backdrop-blur-sm transition-opacity duration-200 ${
        isVisible
          ? "opacity-100"
          : "pointer-events-none opacity-0"
      }`}
      onClick={
        closeNotification
      }
    >
      <div
        className={`relative w-full max-w-sm overflow-hidden rounded-3xl border border-white/15 bg-[#101010] p-6 text-center shadow-2xl transition-all duration-300 ${
          isVisible
            ? "translate-y-0 scale-100"
            : "translate-y-5 scale-95"
        }`}
        onClick={(
          event,
        ) =>
          event.stopPropagation()
        }
      >
        <button
          type="button"
          onClick={
            closeNotification
          }
          className="absolute right-4 top-4 z-10 rounded-full border border-border bg-background/70 p-2 text-muted-foreground transition-colors hover:text-white"
          aria-label="Fermer"
        >
          <X
            size={18}
          />
        </button>

        <div className="pointer-events-none absolute -left-12 -top-12 h-36 w-36 rounded-full bg-white/5 blur-2xl" />

        <div className="pointer-events-none absolute -bottom-14 -right-12 h-40 w-40 rounded-full bg-white/5 blur-3xl" />

        <div className="relative">
          <div className="mb-3 flex items-center justify-center gap-2 text-xs font-black uppercase tracking-[0.22em] text-white">
            <Sparkles
              size={15}
            />

            Nouveau badge
          </div>

          <div className="flex justify-center py-3">
            <BadgeHex
              badge={
                badge
              }
              level={
                notification.level
              }
              unlocked
              size="large"
            />
          </div>

          <h2 className="mt-2 text-2xl font-black tracking-tight text-white">
            {badge.name}
          </h2>

          <p
            className="mt-1 text-sm font-black uppercase tracking-[0.16em]"
            style={{
              color:
                levelMeta.border,
            }}
          >
            {badge.kind ===
            "route"
              ? notification.level ===
                "diamond"
                ? "En tête"
                : "Moulinette"
              : badge.hideLevelLabel
                ? "Débloqué"
                : levelMeta.label}
          </p>

          <p className="mx-auto mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
            {routeLabel ??
              levelDefinition?.description ??
              badge.subtitle}
          </p>

          <button
            type="button"
            onClick={
              closeNotification
            }
            className="mt-6 w-full rounded-xl bg-white py-3.5 text-sm font-black text-black transition-transform active:scale-[0.98]"
          >
            Continuer
          </button>
        </div>
      </div>
    </div>
  );
}