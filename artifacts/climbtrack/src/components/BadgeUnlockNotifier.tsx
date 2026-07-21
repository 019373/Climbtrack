import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

import { useClimbTrack } from "@/context/ClimbTrackContext";
import {
  BADGE_BY_ID,
  BADGE_LEVEL_META,
  BadgeLevel,
} from "@/data/badges";
import { BadgeHex } from "@/components/BadgeHex";

type ActiveNotification = {
  badgeId: string;
  level: BadgeLevel;
};

export function BadgeUnlockNotifier() {
  const {
    data,
    clearBadgeNotification,
  } = useClimbTrack();

  const [activeNotification, setActiveNotification] =
    useState<ActiveNotification | null>(null);

  const [isVisible, setIsVisible] = useState(false);

  const shownRef = useRef(new Set<string>());
  const closeTimeoutRef =
    useRef<ReturnType<typeof setTimeout> | null>(null);

  const removeTimeoutRef =
    useRef<ReturnType<typeof setTimeout> | null>(null);

  const closeNotification = () => {
    if (!activeNotification) return;

    setIsVisible(false);

    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }

    if (removeTimeoutRef.current) {
      clearTimeout(removeTimeoutRef.current);
    }

    removeTimeoutRef.current = setTimeout(() => {
      clearBadgeNotification(
        activeNotification.badgeId,
        activeNotification.level,
      );

      setActiveNotification(null);
    }, 350);
  };

  useEffect(() => {
    if (activeNotification) return;

    const pending =
      data.pendingBadgeNotifications ?? [];

    const nextNotification = pending.find(
      ({ badgeId, level }) => {
        const key = `${badgeId}-${level}`;

        return !shownRef.current.has(key);
      },
    );

    if (!nextNotification) return;

    const badge =
      BADGE_BY_ID[nextNotification.badgeId];

    if (!badge) {
      clearBadgeNotification(
        nextNotification.badgeId,
        nextNotification.level,
      );

      return;
    }

    const key = `${nextNotification.badgeId}-${nextNotification.level}`;

    shownRef.current.add(key);

    setActiveNotification(nextNotification);

    requestAnimationFrame(() => {
      setIsVisible(true);
    });

    if ("vibrate" in navigator) {
      navigator.vibrate([100, 50, 160]);
    }

    closeTimeoutRef.current = setTimeout(() => {
      setIsVisible(false);

      removeTimeoutRef.current = setTimeout(() => {
        clearBadgeNotification(
          nextNotification.badgeId,
          nextNotification.level,
        );

        setActiveNotification(null);
      }, 350);
    }, 5000);
  }, [
    activeNotification,
    data.pendingBadgeNotifications,
    clearBadgeNotification,
  ]);

  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }

      if (removeTimeoutRef.current) {
        clearTimeout(removeTimeoutRef.current);
      }
    };
  }, []);

  if (!activeNotification) return null;

  const badge =
    BADGE_BY_ID[activeNotification.badgeId];

  if (!badge) return null;

  const levelMeta =
    BADGE_LEVEL_META[activeNotification.level];

  return createPortal(
    <div
      className={`fixed inset-0 z-[200000] flex items-center justify-center overflow-hidden bg-black/90 px-6 transition-opacity duration-300 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
      onClick={closeNotification}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.12),transparent_60%)]" />

      <div
        className={`relative z-10 flex w-full max-w-sm flex-col items-center text-center transition-all duration-500 ${
          isVisible
            ? "translate-y-0 scale-100 opacity-100"
            : "translate-y-8 scale-90 opacity-0"
        }`}
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={closeNotification}
          className="absolute -right-2 -top-10 rounded-full p-2 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
          aria-label="Fermer"
        >
          <X size={24} />
        </button>

        <p className="mb-4 text-sm font-extrabold uppercase tracking-[0.25em] text-white/60">
          Nouveau succès
        </p>

        <div
          className="relative mb-6 rounded-full p-5"
          style={{
            boxShadow: `0 0 70px ${levelMeta.glow}`,
          }}
        >
          <BadgeHex
            icon={badge.icon}
            level={activeNotification.level}
            size={180}
          />
        </div>

        <h2 className="text-3xl font-black tracking-tight text-white">
          {badge.name}
        </h2>

        <p className="mt-2 text-base text-white/60">
          {badge.subtitle}
        </p>

        <div
          className="mt-6 rounded-full px-5 py-2 text-sm font-black uppercase tracking-wider"
          style={{
            backgroundColor: levelMeta.border,
            color: "#000000",
            boxShadow: `0 0 30px ${levelMeta.glow}`,
          }}
        >
          {levelMeta.label}
        </div>

        <p className="mt-8 text-xs text-white/35">
          Appuie sur l’écran pour fermer
        </p>
      </div>
    </div>,
    document.body,
  );
}