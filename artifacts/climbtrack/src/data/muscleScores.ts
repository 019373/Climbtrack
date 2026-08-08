export type MuscleGroupId =
  | "doigts"
  | "avant-bras"
  | "biceps"
  | "triceps"
  | "epaules"
  | "pectoraux"
  | "dorsaux"
  | "lombaires"
  | "abdominaux"
  | "fessiers"
  | "adducteurs"
  | "ischios"
  | "quadriceps"
  | "mollets"
  | "tibial";

export type MuscleScoreMap =
  Partial<
    Record<
      MuscleGroupId,
      number
    >
  >;

export const MUSCLE_LABELS: Record<
  MuscleGroupId,
  string
> = {
  doigts: "Doigts",
  "avant-bras": "Avant-bras",
  biceps: "Biceps",
  triceps: "Triceps",
  epaules: "Épaules",
  pectoraux: "Pectoraux",
  dorsaux: "Dorsaux",
  lombaires: "Lombaires",
  abdominaux: "Abdominaux",
  fessiers: "Fessiers",
  adducteurs: "Adducteurs",
  ischios: "Ischio-jambiers",
  quadriceps: "Quadriceps",
  mollets: "Mollets",
  tibial: "Tibial antérieur",
};

/**
 * Intensité musculaire approximative de chaque exercice.
 *
 * Échelle :
 * 1 à 3 = faible
 * 4 à 6 = moyenne
 * 7 à 8 = forte
 * 9 à 10 = très forte
 */
export const MUSCLE_SCORES: Record<
  string,
  MuscleScoreMap
> = {
  // ── Doigts et puissance ────────────────────────────────────────────────────

  "suspension-20mm": {
    doigts: 10,
    "avant-bras": 8,
    epaules: 3,
    dorsaux: 2,
  },

  "suspension-slopers": {
    doigts: 9,
    "avant-bras": 8,
    epaules: 4,
    dorsaux: 3,
  },

  "sauts-prise": {
    doigts: 7,
    "avant-bras": 6,
    biceps: 4,
    epaules: 6,
    dorsaux: 5,
    abdominaux: 3,
  },

  "croise-dynamique-19-30": {
    doigts: 9,
    "avant-bras": 8,
    biceps: 5,
    epaules: 7,
    dorsaux: 6,
    abdominaux: 4,
  },

  "lourd-leger": {
    doigts: 4,
    "avant-bras": 5,
    biceps: 9,
    epaules: 5,
    dorsaux: 10,
    abdominaux: 4,
  },

  "pince-disque": {
    doigts: 10,
    "avant-bras": 8,
  },

  "pince-large": {
    doigts: 9,
    "avant-bras": 8,
  },

  // ── Résistance escalade ────────────────────────────────────────────────────

  "repeaters-7-3": {
    doigts: 10,
    "avant-bras": 9,
    epaules: 3,
    dorsaux: 2,
  },

  "repeaters-6-4": {
    doigts: 8,
    "avant-bras": 8,
    epaules: 3,
    dorsaux: 2,
  },

  "blocs-devers": {
    doigts: 8,
    "avant-bras": 8,
    biceps: 6,
    epaules: 7,
    dorsaux: 8,
    abdominaux: 6,
    fessiers: 3,
    quadriceps: 3,
  },

  "traversees-longues": {
    doigts: 7,
    "avant-bras": 8,
    biceps: 5,
    epaules: 5,
    dorsaux: 7,
    abdominaux: 5,
    fessiers: 3,
    quadriceps: 3,
    mollets: 2,
  },

  "tractions-endurance": {
    doigts: 3,
    "avant-bras": 4,
    biceps: 8,
    epaules: 4,
    dorsaux: 9,
    abdominaux: 3,
  },

  "suspension-facile": {
    doigts: 5,
    "avant-bras": 5,
    epaules: 3,
    dorsaux: 2,
  },

  "dead-hang": {
    doigts: 5,
    "avant-bras": 5,
    epaules: 5,
    dorsaux: 4,
  },

  // ── Haut du corps ──────────────────────────────────────────────────────────

  "tractions-lestees": {
    doigts: 4,
    "avant-bras": 5,
    biceps: 10,
    epaules: 5,
    dorsaux: 10,
    abdominaux: 5,
  },

  blocages: {
    doigts: 5,
    "avant-bras": 6,
    biceps: 9,
    epaules: 6,
    dorsaux: 9,
    abdominaux: 4,
  },

  "rowing-haltere": {
    "avant-bras": 4,
    biceps: 7,
    epaules: 4,
    dorsaux: 9,
    lombaires: 4,
  },

  "lat-pulldown": {
    "avant-bras": 3,
    biceps: 7,
    epaules: 7,
    dorsaux: 10,
  },

  facepull: {
    biceps: 2,
    epaules: 8,
    dorsaux: 6,
  },

  "triceps-elastique": {
    triceps: 8,
    epaules: 2,
  },

  "developpe-militaire": {
    triceps: 7,
    epaules: 10,
    pectoraux: 4,
    abdominaux: 4,
    lombaires: 3,
  },

  "developpe-couche": {
    triceps: 8,
    epaules: 6,
    pectoraux: 10,
  },

  dips: {
    triceps: 9,
    epaules: 7,
    pectoraux: 9,
    abdominaux: 3,
  },

  // ── Gainage ────────────────────────────────────────────────────────────────

  "dead-bug": {
    abdominaux: 8,
  },

  planche: {
    abdominaux: 9,
    epaules: 4,
    fessiers: 3,
  },

  "planche-laterale": {
    abdominaux: 9,
    epaules: 4,
    fessiers: 4,
    adducteurs: 3,
  },

  "pallof-press": {
    abdominaux: 9,
    epaules: 3,
    fessiers: 2,
  },

  "releves-jambes": {
    abdominaux: 10,
    dorsaux: 2,
    epaules: 4,
    "avant-bras": 3,
    quadriceps: 3,
  },

  "genoux-suspendus-twist": {
    abdominaux: 10,
    dorsaux: 3,
    epaules: 4,
    "avant-bras": 3,
    adducteurs: 3,
  },

  "rotations-russes": {
    abdominaux: 9,
    lombaires: 3,
  },

  "superman-hold": {
    lombaires: 9,
    dorsaux: 4,
    fessiers: 4,
    ischios: 3,
  },

  "copenhagen-plank": {
    adducteurs: 10,
    abdominaux: 7,
    epaules: 3,
  },

  // ── Mobilité active ────────────────────────────────────────────────────────

  "mobilite-genou-mur": {
    quadriceps: 2,
    fessiers: 2,
    adducteurs: 2,
    abdominaux: 1,
  },

  "pont-talon-sureleve": {
    ischios: 7,
    fessiers: 7,
    mollets: 2,
    abdominaux: 2,
  },

  // ── Jambes ────────────────────────────────────────────────────────────────

  squat: {
    quadriceps: 9,
    fessiers: 8,
    adducteurs: 5,
    ischios: 4,
    lombaires: 4,
    abdominaux: 4,
  },

  "fentes-bulgares": {
    quadriceps: 9,
    fessiers: 9,
    adducteurs: 5,
    ischios: 5,
    mollets: 3,
    abdominaux: 3,
  },

  "sdle-roumain": {
    ischios: 10,
    fessiers: 9,
    lombaires: 7,
    "avant-bras": 4,
    dorsaux: 3,
  },

  "step-up": {
    quadriceps: 8,
    fessiers: 8,
    ischios: 4,
    mollets: 4,
    abdominaux: 3,
  },

  "mollets-debout": {
    mollets: 10,
    "avant-bras": 2,
  },

  "tibialis-raise": {
    tibial: 8,
  },

  "tibialis-charge": {
    tibial: 10,
  },

  // ── Prévention ─────────────────────────────────────────────────────────────

  "rot-ext-epaule": {
    epaules: 5,
  },

  "scapular-pullups": {
    epaules: 6,
    dorsaux: 6,
    "avant-bras": 3,
  },

  "facepull-leger": {
    epaules: 5,
    dorsaux: 4,
  },

  "ext-doigts": {
    doigts: 3,
    "avant-bras": 3,
  },

  "flex-poignet": {
    "avant-bras": 6,
  },

  "ext-poignet": {
    "avant-bras": 6,
  },

  "pronation-supination": {
    "avant-bras": 7,
  },

  "equilibre-jambe": {
    mollets: 3,
    tibial: 3,
    fessiers: 2,
  },
};

/**
 * Retourne les scores d’un exercice.
 * Les exercices personnalisés ou inconnus renvoient un objet vide.
 */
export function getExerciseMuscleScores(
  exerciseId: string,
): MuscleScoreMap {
  return (
    MUSCLE_SCORES[
      exerciseId
    ] ?? {}
  );
}

/**
 * Additionne plusieurs cartes de scores musculaires.
 */
export function combineMuscleScores(
  scoreMaps: MuscleScoreMap[],
): MuscleScoreMap {
  const combined: MuscleScoreMap =
    {};

  scoreMaps.forEach(
    (scores) => {
      Object.entries(
        scores,
      ).forEach(
        ([muscleId, score]) => {
          if (
            typeof score !==
            "number"
          ) {
            return;
          }

          const typedMuscleId =
            muscleId as MuscleGroupId;

          combined[
            typedMuscleId
          ] =
            (
              combined[
                typedMuscleId
              ] ?? 0
            ) +
            score;
        },
      );
    },
  );

  return combined;
}

/**
 * Retourne les muscles les plus sollicités,
 * classés du score le plus élevé au plus faible.
 */
export function getPrimaryMuscles(
  scores: MuscleScoreMap,
  limit = 4,
): {
  id: MuscleGroupId;
  name: string;
  score: number;
}[] {
  return Object.entries(
    scores,
  )
    .filter(
      (
        entry,
      ): entry is [
        MuscleGroupId,
        number,
      ] =>
        typeof entry[1] ===
        "number" &&
        entry[1] > 0,
    )
    .sort(
      (
        first,
        second,
      ) =>
        second[1] -
        first[1],
    )
    .slice(
      0,
      limit,
    )
    .map(
      ([id, score]) => ({
        id,
        name:
          MUSCLE_LABELS[id],
        score,
      }),
    );
}