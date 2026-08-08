import {
  formatDistanceToNow,
} from "date-fns";

import {
  fr,
} from "date-fns/locale";

import {
  ChevronRight,
} from "lucide-react";

import {
  useClimbTrack,
} from "@/context/ClimbTrackContext";

import type {
  SessionDef,
} from "@/data/sessions";

import {
  getExercisesForSession,
} from "@/utils/exercises";

interface SessionCardProps {
  session: SessionDef;
  onClick: () => void;
}

function getSessionTimestamp(
  date: string,
  completedAt?: string,
): number {
  if (completedAt) {
    const timestamp =
      new Date(
        completedAt,
      ).getTime();

    if (
      !Number.isNaN(
        timestamp,
      )
    ) {
      return timestamp;
    }
  }

  return new Date(
    `${date}T12:00:00`,
  ).getTime();
}

export function SessionCard({
  session,
  onClick,
}: SessionCardProps) {
  const {
    data,
  } = useClimbTrack();

  const logs =
    data.sessionLogs
      .filter(
        (log) =>
          log.sessionId ===
          session.id,
      )
      .sort(
        (
          first,
          second,
        ) =>
          getSessionTimestamp(
            second.date,
            second.completedAt,
          ) -
          getSessionTimestamp(
            first.date,
            first.completedAt,
          ),
      );

  const lastPerformed =
    logs[0] ?? null;

  const timeAgo =
    lastPerformed
      ? formatDistanceToNow(
          new Date(
            getSessionTimestamp(
              lastPerformed.date,
              lastPerformed.completedAt,
            ),
          ),
          {
            addSuffix: true,
            locale: fr,
          },
        )
      : "Jamais réalisée";

  const visibleExerciseCount =
    getExercisesForSession(
      session.id,
      data,
    ).length;

  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative flex w-full cursor-pointer flex-col gap-2 overflow-hidden rounded-xl border border-card-border bg-card p-5 text-left transition-transform active:scale-[0.98]"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-bold leading-tight tracking-tight text-white">
            {session.name}
          </h3>

          <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
            {session.moment}
          </p>
        </div>

        <div className="flex flex-shrink-0 items-center gap-2">
          <span className="whitespace-nowrap rounded bg-border px-2 py-1 font-mono text-xs text-muted-foreground">
            {visibleExerciseCount} ex.
          </span>

          <ChevronRight
            size={18}
            className="text-muted-foreground transition-transform group-active:translate-x-0.5"
          />
        </div>
      </div>

      <div className="mt-2 flex items-center justify-between border-t border-border pt-3">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {lastPerformed
            ? `Dernière : ${timeAgo}`
            : timeAgo}
        </span>
      </div>
    </button>
  );
}