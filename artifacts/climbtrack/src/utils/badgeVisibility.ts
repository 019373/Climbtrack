import type { AppData } from "@/context/ClimbTrackContext";
import type { BadgeDefinition } from "@/data/badges";
import { getExerciseById, isExerciseHidden } from "@/utils/exercises";

type VisibilityData = Pick<
  AppData,
  "customExercises" | "exerciseOverrides" | "deletedExerciseIds"
>;

export function isBadgeAvailable(
  badge: BadgeDefinition | undefined,
  data: VisibilityData,
): boolean {
  if (!badge) return false;
  if (!badge.exerciseId) return true;
  if (!getExerciseById(badge.exerciseId, data)) return false;

  // Une réglette correspond à une variante distincte : masquer
  // « Suspension 20 mm » ne doit pas masquer les badges 10, 8, 6 mm.
  const badgeIsHidden =
    data.deletedExerciseIds.includes(badge.id) ||
    data.exerciseOverrides[badge.id]?.hidden === true;
  if (badge.targetGripSizeMm !== undefined) {
    return !badgeIsHidden;
  }

  // Les badges de sloper partagent réellement leur exercice parent.
  // Lorsque cet exercice est masqué, aucun de ses angles n'est disponible.
  return (
    !badgeIsHidden &&
    !data.deletedExerciseIds.includes(badge.exerciseId) &&
    !isExerciseHidden(badge.exerciseId, data)
  );
}
