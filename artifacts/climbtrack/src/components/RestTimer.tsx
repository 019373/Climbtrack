import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  Pause,
  Play,
  RotateCcw,
} from "lucide-react";

import {
  cn,
} from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface RestTimerProps {
  recommendedSeconds: number;

  timerId?: string;
}

type StoredTimerState = {
  endTimestamp: number | null;

  remainingSeconds: number;

  recommendedSeconds: number;

  hasStarted: boolean;

  isActive: boolean;
};

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function formatTime(
  totalSeconds: number,
): string {
  const safeSeconds =
    Math.max(
      0,
      Math.floor(
        totalSeconds,
      ),
    );

  const minutes =
    Math.floor(
      safeSeconds / 60,
    );

  const seconds =
    safeSeconds %
    60;

  return `${minutes}:${seconds
    .toString()
    .padStart(
      2,
      "0",
    )}`;
}

function formatRecommendedTime(
  totalSeconds: number,
): string {
  const safeSeconds =
    Math.max(
      0,
      Math.round(
        totalSeconds,
      ),
    );

  const minutes =
    Math.floor(
      safeSeconds / 60,
    );

  const seconds =
    safeSeconds %
    60;

  if (
    minutes > 0 &&
    seconds > 0
  ) {
    return `${minutes} min ${seconds} s`;
  }

  if (
    minutes > 0
  ) {
    return `${minutes} min`;
  }

  return `${seconds} s`;
}

function getRemainingSeconds(
  endTimestamp: number,
): number {
  return Math.max(
    0,
    Math.ceil(
      (
        endTimestamp -
        Date.now()
      ) /
        1000,
    ),
  );
}

function getStorageKey(
  timerId: string,
): string {
  return `climbtrack-rest-timer-${timerId}`;
}

function readStoredTimer(
  storageKey: string,
  recommendedSeconds: number,
): StoredTimerState | null {
  try {
    const raw =
      sessionStorage.getItem(
        storageKey,
      );

    if (
      !raw
    ) {
      return null;
    }

    const parsed =
      JSON.parse(
        raw,
      ) as Partial<StoredTimerState>;

    const hasStarted =
      parsed.hasStarted ===
      true;

    const isActive =
      parsed.isActive ===
      true;

    const endTimestamp =
      typeof parsed.endTimestamp ===
        "number" &&
      Number.isFinite(
        parsed.endTimestamp,
      )
        ? parsed.endTimestamp
        : null;

    const storedRemaining =
      typeof parsed.remainingSeconds ===
        "number" &&
      Number.isFinite(
        parsed.remainingSeconds,
      )
        ? Math.max(
            0,
            parsed.remainingSeconds,
          )
        : recommendedSeconds;

    let remainingSeconds =
      storedRemaining;

    let finalIsActive =
      isActive;

    let finalEndTimestamp =
      endTimestamp;

    if (
      isActive &&
      endTimestamp !==
        null
    ) {
      remainingSeconds =
        getRemainingSeconds(
          endTimestamp,
        );

      if (
        remainingSeconds <=
        0
      ) {
        finalIsActive =
          false;

        finalEndTimestamp =
          null;
      }
    }

    return {
      endTimestamp:
        finalEndTimestamp,

      remainingSeconds,

      recommendedSeconds:
        typeof parsed.recommendedSeconds ===
          "number"
          ? parsed.recommendedSeconds
          : recommendedSeconds,

      hasStarted,

      isActive:
        finalIsActive,
    };
  } catch {
    return null;
  }
}

function writeStoredTimer(
  storageKey: string,
  state: StoredTimerState,
) {
  try {
    sessionStorage.setItem(
      storageKey,
      JSON.stringify(
        state,
      ),
    );
  } catch {
    // Le chrono reste utilisable même sans stockage.
  }
}

function removeStoredTimer(
  storageKey: string,
) {
  try {
    sessionStorage.removeItem(
      storageKey,
    );
  } catch {
    // Rien à faire.
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function RestTimer({
  recommendedSeconds,
  timerId = "default",
}: RestTimerProps) {
  const storageKey =
    useMemo(
      () =>
        getStorageKey(
          timerId,
        ),
      [
        timerId,
      ],
    );

  const initialState =
    useMemo(
      () =>
        readStoredTimer(
          storageKey,
          recommendedSeconds,
        ),
      [
        storageKey,
        recommendedSeconds,
      ],
    );

  const [
    isActive,
    setIsActive,
  ] =
    useState(
      initialState?.isActive ??
      false,
    );

  const [
    remainingSeconds,
    setRemainingSeconds,
  ] =
    useState(
      initialState?.remainingSeconds ??
      recommendedSeconds,
    );

  const [
    hasStarted,
    setHasStarted,
  ] =
    useState(
      initialState?.hasStarted ??
      false,
    );

  const endTimestampRef =
    useRef<number | null>(
      initialState?.endTimestamp ??
      null,
    );

  const completionHandledRef =
    useRef(
      initialState?.hasStarted ===
        true &&
      initialState.remainingSeconds <=
        0,
    );

  // ───────────────────────────────────────────────────────────────────────────
  // Completion
  // ───────────────────────────────────────────────────────────────────────────

  const completeTimer =
    useCallback(
      () => {
        endTimestampRef.current =
          null;

        setRemainingSeconds(
          0,
        );

        setIsActive(
          false,
        );

        setHasStarted(
          true,
        );

        writeStoredTimer(
          storageKey,
          {
            endTimestamp:
              null,

            remainingSeconds:
              0,

            recommendedSeconds,

            hasStarted:
              true,

            isActive:
              false,
          },
        );

        if (
          !completionHandledRef.current
        ) {
          completionHandledRef.current =
            true;

          if (
            typeof navigator !==
              "undefined" &&
            "vibrate" in navigator
          ) {
            navigator.vibrate([
              150,
              80,
              200,
            ]);
          }
        }
      },
      [
        storageKey,
        recommendedSeconds,
      ],
    );

  // ───────────────────────────────────────────────────────────────────────────
  // Refresh
  // ───────────────────────────────────────────────────────────────────────────

  const refreshTimer =
    useCallback(
      () => {
        const endTimestamp =
          endTimestampRef.current;

        if (
          !isActive ||
          endTimestamp ===
            null
        ) {
          return;
        }

        const remaining =
          getRemainingSeconds(
            endTimestamp,
          );

        if (
          remaining <=
          0
        ) {
          completeTimer();

          return;
        }

        setRemainingSeconds(
          remaining,
        );
      },
      [
        isActive,
        completeTimer,
      ],
    );

  // ───────────────────────────────────────────────────────────────────────────
  // Active timer loop
  // ───────────────────────────────────────────────────────────────────────────

  useEffect(
    () => {
      if (
        !isActive
      ) {
        return;
      }

      refreshTimer();

      const interval =
        window.setInterval(
          refreshTimer,
          250,
        );

      function handleVisibilityChange() {
        if (
          document.visibilityState ===
          "visible"
        ) {
          refreshTimer();
        }
      }

      function handleWindowFocus() {
        refreshTimer();
      }

      function handlePageShow() {
        refreshTimer();
      }

      document.addEventListener(
        "visibilitychange",
        handleVisibilityChange,
      );

      window.addEventListener(
        "focus",
        handleWindowFocus,
      );

      window.addEventListener(
        "pageshow",
        handlePageShow,
      );

      return () => {
        window.clearInterval(
          interval,
        );

        document.removeEventListener(
          "visibilitychange",
          handleVisibilityChange,
        );

        window.removeEventListener(
          "focus",
          handleWindowFocus,
        );

        window.removeEventListener(
          "pageshow",
          handlePageShow,
        );
      };
    },
    [
      isActive,
      refreshTimer,
    ],
  );

  // ───────────────────────────────────────────────────────────────────────────
  // Recommended duration change
  // ───────────────────────────────────────────────────────────────────────────

  useEffect(
    () => {
      if (
        hasStarted
      ) {
        return;
      }

      setRemainingSeconds(
        recommendedSeconds,
      );

      endTimestampRef.current =
        null;

      writeStoredTimer(
        storageKey,
        {
          endTimestamp:
            null,

          remainingSeconds:
            recommendedSeconds,

          recommendedSeconds,

          hasStarted:
            false,

          isActive:
            false,
        },
      );
    },
    [
      recommendedSeconds,
      hasStarted,
      storageKey,
    ],
  );

  // ───────────────────────────────────────────────────────────────────────────
  // Restore when timerId changes
  // ───────────────────────────────────────────────────────────────────────────

  useEffect(
    () => {
      const stored =
        readStoredTimer(
          storageKey,
          recommendedSeconds,
        );

      if (
        !stored
      ) {
        endTimestampRef.current =
          null;

        setRemainingSeconds(
          recommendedSeconds,
        );

        setIsActive(
          false,
        );

        setHasStarted(
          false,
        );

        completionHandledRef.current =
          false;

        return;
      }

      endTimestampRef.current =
        stored.endTimestamp;

      setRemainingSeconds(
        stored.remainingSeconds,
      );

      setIsActive(
        stored.isActive,
      );

      setHasStarted(
        stored.hasStarted,
      );

      completionHandledRef.current =
        stored.hasStarted &&
        stored.remainingSeconds <=
          0;
    },
    [
      storageKey,
      recommendedSeconds,
    ],
  );

  // ───────────────────────────────────────────────────────────────────────────
  // Controls
  // ───────────────────────────────────────────────────────────────────────────

  function startTimer() {
    const duration =
      remainingSeconds >
      0
        ? remainingSeconds
        : recommendedSeconds;

    const endTimestamp =
      Date.now() +
      duration *
        1000;

    endTimestampRef.current =
      endTimestamp;

    completionHandledRef.current =
      false;

    setRemainingSeconds(
      duration,
    );

    setHasStarted(
      true,
    );

    setIsActive(
      true,
    );

    writeStoredTimer(
      storageKey,
      {
        endTimestamp,

        remainingSeconds:
          duration,

        recommendedSeconds,

        hasStarted:
          true,

        isActive:
          true,
      },
    );
  }

  function pauseTimer() {
    const endTimestamp =
      endTimestampRef.current;

    const remaining =
      endTimestamp !==
      null
        ? getRemainingSeconds(
            endTimestamp,
          )
        : remainingSeconds;

    endTimestampRef.current =
      null;

    setRemainingSeconds(
      remaining,
    );

    setIsActive(
      false,
    );

    setHasStarted(
      true,
    );

    writeStoredTimer(
      storageKey,
      {
        endTimestamp:
          null,

        remainingSeconds:
          remaining,

        recommendedSeconds,

        hasStarted:
          true,

        isActive:
          false,
      },
    );
  }

  function toggleTimer() {
    if (
      isActive
    ) {
      pauseTimer();

      return;
    }

    startTimer();
  }

  function resetTimer() {
    endTimestampRef.current =
      null;

    completionHandledRef.current =
      false;

    setIsActive(
      false,
    );

    setHasStarted(
      false,
    );

    setRemainingSeconds(
      recommendedSeconds,
    );

    removeStoredTimer(
      storageKey,
    );
  }

  // ───────────────────────────────────────────────────────────────────────────
  // Derived values
  // ───────────────────────────────────────────────────────────────────────────

  const isComplete =
    hasStarted &&
    remainingSeconds <=
      0;

  const elapsedSeconds =
    Math.max(
      0,
      recommendedSeconds -
        remainingSeconds,
    );

  const progress =
    recommendedSeconds >
    0
      ? Math.min(
          100,
          Math.max(
            0,
            (
              elapsedSeconds /
              recommendedSeconds
            ) *
              100,
          ),
        )
      : 100;

  // ───────────────────────────────────────────────────────────────────────────
  // UI
  // ───────────────────────────────────────────────────────────────────────────

  return (
    <div className="mt-2 flex flex-col gap-3 rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h4 className="text-sm font-semibold uppercase tracking-wide text-white">
            Repos recommandé :{" "}
            {formatRecommendedTime(
              recommendedSeconds,
            )}
          </h4>

          <p className="mt-1 text-xs text-muted-foreground">
            {isActive &&
              !isComplete &&
              "Récupération en cours…"}

            {!isActive &&
              hasStarted &&
              !isComplete &&
              "Chrono en pause."}

            {isComplete && (
              <span className="font-medium text-success">
                Repos conseillé atteint.
              </span>
            )}

            {!hasStarted &&
              "Prêt pour la prochaine série ?"}
          </p>
        </div>

        <div
          className={cn(
            "shrink-0 font-mono text-3xl tabular-nums tracking-tighter",

            isComplete
              ? "text-success"
              : "text-white",
          )}
        >
          {formatTime(
            remainingSeconds,
          )}
        </div>
      </div>

      <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
        <div
          className={cn(
            "h-full rounded-full transition-[width] duration-300",

            isComplete
              ? "bg-success"
              : "bg-white",
          )}
          style={{
            width:
              `${progress}%`,
          }}
        />
      </div>

      <div className="mt-1 flex gap-2">
        <button
          type="button"
          onClick={
            toggleTimer
          }
          disabled={
            isComplete
          }
          className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-white py-2.5 text-sm font-bold text-black transition-transform active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isActive ? (
            <>
              <Pause
                size={16}
              />

              Pause
            </>
          ) : (
            <>
              <Play
                size={16}
              />

              {!hasStarted
                ? "Démarrer"
                : isComplete
                  ? "Terminé"
                  : "Reprendre"}
            </>
          )}
        </button>

        <button
          type="button"
          onClick={
            resetTimer
          }
          className="rounded-lg bg-[#2a2a2a] px-4 py-2.5 text-white transition-all active:scale-[0.98]"
          aria-label="Réinitialiser le chrono"
        >
          <RotateCcw
            size={16}
          />
        </button>
      </div>
    </div>
  );
}