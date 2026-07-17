import { useEffect, useRef } from 'react';
import { useClimbTrack } from '@/context/ClimbTrackContext';
import { BADGE_BY_ID, BADGE_LEVEL_META } from '@/data/badges';
import { BadgeHex } from '@/components/BadgeHex';
import { useToast } from '@/hooks/use-toast';

/**
 * Renders nothing visually — watches pendingBadgeNotifications and fires toasts.
 * Must be inside ClimbTrackProvider.
 */
export function BadgeUnlockNotifier() {
  const { data, clearBadgeNotification } = useClimbTrack();
  const { toast } = useToast();
  const shownRef = useRef(new Set<string>());

  useEffect(() => {
    const pending = data.pendingBadgeNotifications ?? [];
    if (pending.length === 0) return;

    pending.forEach(({ badgeId, level }) => {
      const key = `${badgeId}-${level}`;
      if (shownRef.current.has(key)) return;
      shownRef.current.add(key);

      const badge = BADGE_BY_ID[badgeId];
      if (!badge) return;

      const meta = BADGE_LEVEL_META[level];

      // Vibrate if available
      if ('vibrate' in navigator) {
        navigator.vibrate([80, 40, 120]);
      }

      toast({
        title: '🎉 Nouveau badge !',
        description: `${badge.name} — ${meta.label}`,
        duration: 5000,
      });

      clearBadgeNotification(badgeId, level);
    });
  }, [data.pendingBadgeNotifications, toast, clearBadgeNotification]);

  return null;
}
